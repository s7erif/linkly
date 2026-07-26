# Phase 1 Runtime Performance Audit

Date: 2026-07-26

Status: Complete — evidence collection only. No performance optimization was implemented.

## 1. Executive Summary

The application's direct interactions are responsive and visually stable, but production response time is dominated by remote database round trips, Prisma query amplification, and a broad Workspace client boundary.

The strongest evidence is that slow mutations have tiny payloads. Appearance autosave sends 583 bytes and receives 93 decoded bytes, yet takes 1.65–1.88 seconds. Publish sends 374 bytes and receives about 33 KB decoded, yet takes 3.83 seconds. PostgreSQL operations consistently cost roughly 82–125 ms, so sequential query count—not transfer size—is the dominant constraint.

Workspace cold LCP was 2.259 seconds: 761 ms TTFB plus a larger 1.498 second render delay. Public-profile cold LCP was 1.960 seconds, with 1.874 seconds (95.6%) in TTFB. Section, theme, and publish interactions remained within good INP: 139 ms, 130 ms, and 38 ms. CLS was effectively zero.

Theme selection did create sustained background work: 37.2% renderer-main-thread utilization over 13.3 seconds, 1,442 animation-frame callbacks, and 1,784 microtask runs. This is a slower-device and battery risk despite good lab INP.

The top architectural bottlenecks are:

1. Publish hydrates a large card graph inside one interactive transaction, serializing relation queries.
2. Autosave uses ten transaction round trips and resolves the same admin role twice.
3. Workspace load uses 18 queries, including duplicate settings reads and `IN (NULL)` queries.
4. Public caching is partial: warm TTFB remains 812 ms.
5. Workspace loads approximately 1.28 MB decoded JavaScript and waits 1.498 seconds in post-TTFB rendering.

Method: production Next.js build, Chrome DevTools MCP, Chrome 150 headless, 1440×900, 1× CPU, no network throttling, remote PostgreSQL. Results are lab evidence, not CrUX field data. The customer card picker required an unavailable customer credential, so real card switching used the supported admin-authorized Workspace path. Production React did not expose component commit data; exact React render counts are therefore not claimed.

Raw traces and the heap snapshot remain under `/tmp/phase1-*` and are intentionally not committed.

## 2. Measured Metrics

| Flow | LCP | TTFB | Render delay | INP | CLS | Server/network timing |
|---|---:|---:|---:|---:|---:|---|
| Workspace cold | 2,259 ms | 761 ms | 1,498 ms | Load only | 0.0013; summary 0.00 | Response end 1,572 ms; DOM interactive 1,592 ms |
| Card switch, warm admin navigation | 849 ms | 211 ms | 639 ms | Navigation | 0.00 | Response end 717 ms; DOM interactive 771 ms |
| Identity → Design | N/A | N/A | N/A | 139 ms | 0.00 | 20 ms input, 56 ms processing, 64 ms presentation |
| Theme selection | N/A | N/A | N/A | 130 ms | 0.00 | Autosave completes separately in 1.65–1.88 s |
| Publish click | N/A | N/A | N/A | 38 ms | 0.00 | 2,499 ms to first byte; 3,829 ms total |
| Public profile cold | 1,960 ms | 1,874 ms | 87 ms | Load only | 0.00 | TTFB is 95.6% of LCP |
| Public profile warm app cache | 883 ms | 812 ms | 71 ms | Load only | 0.00 | Still issues one 104 ms settings query |

Workspace cold loaded 32 resources: 520,618 encoded bytes and 1,756,334 decoded bytes, including approximately 1.28 MB JavaScript and 447 KB CSS. Second-card Workspace loaded 30 resources and 1,730,424 decoded bytes. Public profile loaded 17 resources and 1,103,304 decoded bytes.

| Flow | Main-thread busy | Utilization | Long tasks | Longest task |
|---|---:|---:|---:|---:|
| Workspace cold | 817.5 ms | 17.2% | 0 | 41.4 ms |
| Section switch | 469.2 ms | 14.3% | 1 | 65.6 ms |
| Theme + autosave | 4,935.7 ms | 37.2% | 1 | 54.7 ms |
| Public cold | 307.5 ms | 14.2% | 0 | 33.7 ms |
| Public warm | 168.5 ms | 15.7% | 0 | 26.5 ms |
| Card switch | 586.5 ms | 8.5% | 0 | 44.8 ms |

Workspace used about 8.04 MiB JavaScript heap/262 DOM nodes in the first capture and 8.68 MiB/421 nodes on the second card. Public profile used 4.11 MiB/61 nodes. A single heap snapshot cannot establish a leak; no memory-leak claim is made.

Hydration evidence: Workspace response ended at 1,572 ms, DOM interactive occurred at 1,592 ms, FCP at 1,732 ms, and LCP at 2,259 ms. No hydration error was observed. Exact React hydration completion was unavailable.

## 3. Database Findings

### DB-1 — Remote latency multiplied by sequential chains

- **Evidence:** PostgreSQL operations cost 82–125 ms; Workspace uses 18 queries, autosave 10 statements, publish approximately 19.
- **Root cause:** The application is chatty relative to application-to-database latency.
- **Affected files:** `src/repositories/card.repository.ts`, `src/repositories/prisma-unit-of-work.ts`, `src/repositories/platform-management.repository.ts`, deployment topology.
- **Estimated impact:** Critical; dominates autosave and much of publish.
- **Recommended optimization:** Reduce round trips first, then verify regional proximity/pooling and enforce query budgets.
- **Expected improvement:** Removing 6–12 sequential trips should save roughly 600–1,200 ms per mutation.

### DB-2 — Publish serializes aggregate reads inside a transaction

- **Evidence:** Relation reads queue on one active transaction client; `pg` emitted an active-query warning. Publish took 2.50 s to first byte and 3.83 s total.
- **Root cause:** A complete editor graph is loaded inside an interactive transaction; code concurrency cannot parallelize one connection.
- **Affected files:** `src/use-cases/admin-card-management.ts`, `src/repositories/card.repository.ts`, `src/repositories/prisma-unit-of-work.ts`.
- **Estimated impact:** Critical; also increases transaction/lock duration.
- **Recommended optimization:** Read only authorization/current-status fields, update minimally, audit with the resolved actor, and avoid graph rehydration.
- **Expected improvement:** Publish should reach 0.9–1.5 s, a projected 60–75% reduction.

### DB-3 — Workspace aggregate uses 18 round trips

- **Evidence:** Card, profile, blocks, block media, sections, buttons, links, media, subscription, customer, plan, features, auth, and settings arrive in dependency waves.
- **Root cause:** A general DTO is assembled through many relation queries rather than a bounded Workspace projection.
- **Affected files:** `src/use-cases/admin-workspace.ts`, `src/repositories/card.repository.ts`, `src/repositories/platform-management.repository.ts`, `src/lib/composition-root.ts`.
- **Estimated impact:** High; raises TTFB and tail variance.
- **Recommended optimization:** Add a purpose-built projection, batch compatible relations, skip absent branches, and cache settings separately.
- **Expected improvement:** Six to eight queries should save roughly 400–900 ms.

### DB-4 — Empty relations still hit PostgreSQL

- **Evidence:** Customer, Plan, and PlanFeature use `IN (NULL)`; admin reads query Order with a null ID.
- **Root cause:** Empty identifier sets reach Prisma instead of short-circuiting.
- **Affected files:** `src/repositories/card.repository.ts`, `src/repositories/platform-management.repository.ts`.
- **Estimated impact:** Medium; each empty read costs one remote trip.
- **Recommended optimization:** Return empty relations at repository boundaries when IDs are absent.
- **Expected improvement:** Roughly 90–300 ms on affected reads.

## 4. Prisma Findings

### PRISMA-1 — Relation decomposition causes query fan-out

- **Evidence:** One card graph requires separate profile, block, block-media, section, button, link, card-media, and media-asset reads.
- **Root cause:** General editor projections are reused by narrow operations. This is amplification, not a classic list-row N+1.
- **Affected files:** `src/repositories/card.repository.ts`, repository contracts, `src/use-cases/admin-workspace.ts`, `src/use-cases/admin-card-management.ts`.
- **Estimated impact:** High on reads; critical in transactions.
- **Recommended optimization:** Separate Workspace, public, publication, and autosave Prisma projections.
- **Expected improvement:** 30–70% lower server time by flow.

### PRISMA-2 — Autosave resolves admin role twice

- **Evidence:** Ten statements include `AdminUser → AdminUserRole → AdminRole` twice, before update and audit.
- **Root cause:** Authorization and audit attribution independently resolve one actor.
- **Affected files:** Appearance PUT route, `src/repositories/platform-management.repository.ts`, authorization use cases, `src/lib/composition-root.ts`.
- **Estimated impact:** Critical; six of ten trips are authorization reads.
- **Recommended optimization:** Resolve actor/permission once and pass typed context to update/audit.
- **Expected improvement:** Autosave from 1.65–1.88 s to about 450–750 ms (55–75%).

### PRISMA-3 — Mutations re-read more data than responses need

- **Evidence:** Publish reads the graph, updates, then re-reads card/profile before audit/commit.
- **Root cause:** Repository mutations reconstruct general DTOs instead of mutation-specific results.
- **Affected files:** `src/use-cases/admin-card-management.ts`, `src/repositories/card.repository.ts`, repository contracts.
- **Estimated impact:** High; lengthens transactions and materializes unused objects.
- **Recommended optimization:** Return only ID, slug, status, visibility, and timestamps, then invalidate targeted tags.
- **Expected improvement:** Several round trips and hundreds of milliseconds removed.

## 5. React Findings

### REACT-1 — Workspace LCP is dominated by post-response rendering

- **Evidence:** 2,259 ms LCP comprises 761 ms TTFB and 1,498 ms render delay; LCP is text.
- **Root cause:** Store preparation, hydration, editor/preview mounting, and inspector rendering settle before LCP.
- **Affected files:** `src/components/workspace/workspace-page-content.tsx`, Workspace shell, `src/store/use-card-editor-store.ts`, preview/inspector trees.
- **Estimated impact:** High; main content arrives ~1.5 s after first byte.
- **Recommended optimization:** Profile React commits, isolate subscriptions, preserve stable editor/preview shells, and defer nonessential tools.
- **Expected improvement:** 500–900 ms less render delay; target LCP 1.4–1.8 s.

### REACT-2 — Theme selection causes sustained work

- **Evidence:** 4,935.7 ms main-thread time, 1,442 animation frames, 1,784 microtasks, 544 style updates, and one 54.7 ms task; INP remains 130 ms.
- **Root cause:** Theme state fans out through inspector, store, preview, and motion. Exact component attribution awaits React Profiler data.
- **Affected files:** `src/components/workspace/inspector/theme-gallery.tsx`, `design-studio.tsx`, `src/components/workspace/shared/inspector-card.tsx`, preview renderer, `src/store/use-card-editor-store.ts`.
- **Estimated impact:** High on slow CPUs/battery.
- **Recommended optimization:** After commit profiling, narrow Zustand selectors, separate preview-derived state, memoize renderer inputs, and stop completed decoration motion.
- **Expected improvement:** Utilization below 15% and fewer than half the callbacks.

### REACT-3 — Section switch is good but has one long task

- **Evidence:** INP 139 ms with one 65.6 ms task; processing plus presentation is 120 ms.
- **Root cause:** Design inspector mount concentrates render/layout work.
- **Affected files:** Workspace navigation and Design inspector panels.
- **Estimated impact:** Medium; good now, limited low-end headroom.
- **Recommended optimization:** Lazy-load inspector-only editors and preserve opened subtrees when justified.
- **Expected improvement:** Interaction below 100 ms and no task above 50 ms.

### REACT-4 — Render-count evidence gap

- **Evidence:** Production React exposes no component commits in the Chrome trace.
- **Root cause:** No profiling build/Profiler instrumentation.
- **Affected files:** Profiling configuration and major Workspace boundaries.
- **Estimated impact:** Evidence gap, not a confirmed defect.
- **Recommended optimization:** Profile hydration, section/theme changes, autosave states, and card switch before memoization.
- **Expected improvement:** Prevents blind optimization and ties changes to measured commits.

## 6. Next.js Findings

### NEXT-1 — Public route remains server-bound after a cache hit

- **Evidence:** Cold TTFB 1,874 ms; warm TTFB 812 ms while only one 104 ms settings query appears. Render delay is 71–87 ms.
- **Root cause:** Cached card data helps, but uncached settings and dynamic route/cache/serialization work remain critical.
- **Affected files:** Public App Router page, `src/use-cases/read-public-card.ts`, `src/repositories/card.repository.ts`, settings reader.
- **Estimated impact:** High; nearly all public LCP is server waiting.
- **Recommended optimization:** Cache a complete public render DTO by slug with card/settings tags.
- **Expected improvement:** Warm TTFB 150–300 ms; miss TTFB 300–600 ms.

### NEXT-2 — Workspace client boundary is broad

- **Evidence:** 1,498 ms render delay, 19 scripts, and about 1.28 MB decoded JavaScript.
- **Root cause:** Editor, preview, toolbar, inspectors, theme, QR, and publication tools enter one initial client surface.
- **Affected files:** `src/app/workspace/page.tsx`, `src/components/workspace/workspace-page-content.tsx`, Workspace shell/inspector/preview/publish modules.
- **Estimated impact:** High cold, medium warm.
- **Recommended optimization:** Keep static shell server-rendered; lazy-load inspector sections, QR/export, media, and detailed publish tools behind Suspense.
- **Expected improvement:** 30–50% less initial JS and several hundred milliseconds less hydration work.

### NEXT-3 — Prefetch/revalidation repeats RSC traffic

- **Evidence:** Three speculative Workspace RSC requests include duplicate slug requests and one 108 ms abort. Admin actions trigger repeated waves for seven destinations.
- **Root cause:** Broad default Link prefetch combines with action refresh/revalidation.
- **Affected files:** Admin authenticated navigation, Workspace links, admin-card action/revalidation.
- **Estimated impact:** Medium locally, higher with bandwidth/concurrency.
- **Recommended optimization:** Intent-based prefetch and targeted tag/path invalidation.
- **Expected improvement:** Remove duplicate Workspace requests and roughly 10–20 requests from the observed action sequence.

### NEXT-4 — Streaming does not offset mutation latency

- **Evidence:** Publish waits 2,499 ms for response start and streams another ~1,330 ms.
- **Root cause:** Transaction plus broad revalidation/render work precedes and extends RSC output.
- **Affected files:** Admin card action/page, `src/use-cases/admin-card-management.ts`, revalidation calls.
- **Estimated impact:** High; feedback is immediate but authoritative completion is slow.
- **Recommended optimization:** Minimize mutation result and target invalidation while retaining safe optimistic feedback.
- **Expected improvement:** Authoritative completion below 1.5 s.

## 7. Cache Findings

### CACHE-1 — Public cache boundary is incomplete

- **Evidence:** LCP improves from 1,960 ms cold to 883 ms warm, but warm TTFB remains 812 ms and still queries settings.
- **Root cause:** Card data and renderer configuration do not share one cached public model.
- **Affected files:** `src/use-cases/read-public-card.ts`, card/settings repositories, public page.
- **Estimated impact:** High.
- **Recommended optimization:** Cache complete public DTO with card, slug, theme/settings, and publication tags.
- **Expected improvement:** 500–1,500 ms less public TTFB depending on state.

### CACHE-2 — Identical settings reads miss repeatedly

- **Evidence:** Workspace reads settings twice; admin publication rendering repeats identical ~100 ms Setting queries, sometimes concurrently.
- **Root cause:** Consumers resolve settings without request memoization/shared cache.
- **Affected files:** `src/repositories/platform-management.repository.ts`, settings services, `src/lib/composition-root.ts`.
- **Estimated impact:** Medium per request, high across traffic.
- **Recommended optimization:** Typed cached settings reader with request memoization and tag invalidation.
- **Expected improvement:** ~100 ms on Workspace and several hundred milliseconds on some admin flows.

### CACHE-3 — Cache ownership is undocumented

- **Evidence:** Disabling browser cache still gives a warm server-data result, proving a separate Next application cache.
- **Root cause:** Browser, route, data, and settings caches have independent ownership.
- **Affected files:** Public cache config, read service, mutation invalidation, performance docs.
- **Estimated impact:** Medium operational/staleness risk.
- **Recommended optimization:** Document key, lifetime, owner, invalidation event, and stale tolerance.
- **Expected improvement:** Predictable TTFB and fewer accidental misses without publication regressions.

## 8. Network Findings

### NET-1 — Autosave is server-bound

- **Evidence:** 583-byte request, 93-byte decoded response, 1,878.5 ms browser duration; separate server pass 1,651 ms.
- **Root cause:** Ten transaction trips and duplicate authorization.
- **Affected files:** Appearance route, authorization, card repository, audit repository.
- **Estimated impact:** Critical for editor feel.
- **Recommended optimization:** Preserve payload/debounce semantics and reduce server/database work.
- **Expected improvement:** 0.9–1.3 s faster autosave.

### NET-2 — Publish is server-bound

- **Evidence:** 374-byte request, ~8.3 KB encoded/~33.3 KB decoded response, 3,829 ms total.
- **Root cause:** Transaction plus broad refresh/revalidation.
- **Affected files:** Admin card action, publication use case, invalidation code.
- **Estimated impact:** Critical.
- **Recommended optimization:** Optimize mutation/invalidation graph, not compression.
- **Expected improvement:** 2–3 s faster completion.

### NET-3 — Duplicate/speculative RSC is avoidable

- **Evidence:** Duplicate/aborted Workspace RSC and repeated admin route waves.
- **Root cause:** Default prefetch and broad revalidation.
- **Affected files:** Admin navigation, Workspace links, action revalidation.
- **Estimated impact:** Medium; higher on mobile/concurrency.
- **Recommended optimization:** Intent-based prefetch and targeted invalidation.
- **Expected improvement:** Lower bandwidth, request count, and query pressure.

### NET-4 — Workspace initial bundle is large

- **Evidence:** 1.76 MB decoded across 32 resources; ~1.28 MB JS/~447 KB CSS. Public profile uses roughly half the Workspace heap.
- **Root cause:** Many editor capabilities enter the initial graph.
- **Affected files:** Workspace client boundaries, inspector/theme/QR/media/publish tools, shared styles.
- **Estimated impact:** Medium in lab, high on mobile.
- **Recommended optimization:** Attribute chunks, split infrequent tools, and audit global CSS.
- **Expected improvement:** Approximately 400–650 KB less decoded JavaScript.

No image bottleneck was established; Workspace LCP was text.

## 9. Ranked Bottlenecks

| Rank | Severity | Bottleneck | Evidence | User impact |
|---:|---|---|---|---|
| 1 | Critical | Publish reads serialized in transaction | ~19 statements; 2.50 s first byte; 3.83 s total | Publish completes late |
| 2 | Critical | Autosave duplicate auth/10 trips | 1.65–1.88 s for 583 bytes | Save state lags |
| 3 | High | Workspace query amplification | 18 queries including empty relations | Slow/variable cold load |
| 4 | High | Incomplete public cache | Cold TTFB 1.874 s; warm 812 ms | Public waits on server |
| 5 | High | Workspace render/hydration delay | 1.498 s; ~1.28 MB JS | Editor appears late |
| 6 | High | Theme/preview state fan-out | 37.2% CPU; 1,442 frames; 1,784 microtasks | Low-end/battery risk |
| 7 | Medium | Repeated settings misses | Duplicate ~100 ms queries | Cross-route latency |
| 8 | Medium | Broad RSC prefetch/revalidation | Duplicate/aborted and repeated waves | Background load |
| 9 | Medium | Large client surface | 1.76 MB decoded; 19 scripts | Mobile hydration cost |
| 10 | Low | Section long task | 65.6 ms; INP still 139 ms | Limited headroom |

CLS and direct INP are not current bottlenecks; protect them with budgets.

## 10. Prioritized Optimization Roadmap

No roadmap item has been implemented.

### P0 — Database and mutations

1. Create operation-specific Prisma projections.
2. Resolve authorization once and pass a typed actor to audit.
3. Reduce publish to minimal status read/update/audit.
4. Short-circuit empty relations.
5. Budgets: autosave ≤4 trips, publish ≤6, Workspace ≤8.

Target: autosave below 750 ms and publish below 1.5 s.

### P1 — Public/settings caching

1. Cache complete public DTO by slug/card tag.
2. Memoize/cache global settings.
3. Invalidate only affected card, slug, public, and settings tags.
4. Document ownership/staleness.

Target: warm public TTFB below 300 ms.

### P1 — Workspace rendering

1. Run React Profiler before memoization.
2. Identify Zustand/provider fan-out.
3. Preserve stable editor/preview boundaries.
4. Lazy-load inspectors, themes, QR/export, media, and detail panels.
5. Stop completed decorative animations.

Target: Workspace LCP 1.4–1.8 s, lower theme CPU, INP below 200 ms.

### P1 — Next.js navigation/streaming

1. Intent-based admin prefetch.
2. Remove duplicate Workspace RSC prefetch.
3. Target tags/paths after mutations.
4. Stream stable Workspace shell with tools behind Suspense.

### P2 — Bundle and observability

1. Attribute and split Workspace chunks; remove duplicate critical CSS.
2. Verify responsive images after server/cache work.
3. Record TTFB, server render, mutation duration, query count, and p50/p95/p99.
4. Add production-like performance budgets.

Target: 30–50% less initial Workspace JavaScript and regression protection.

Compatibility guardrails: preserve autosave coalescing/failure recovery, publication correctness/cache invalidation, Workspace state/card switching, Theme Engine and marketplace extension points, admin authorization/audit, API contracts, strict TypeScript, readability, and Server Component preference.

Approval is required before Phase 2 implementation begins.

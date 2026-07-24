# Public Card Performance & Rendering Report

Date: 2026-07-20  
Route audited: `/c/[slug]`  
Measured card: `john-doe` (Published/Public)

## Executive Summary

The visible `Loading card…` state was caused by `PublicCardExperience`, a Client Component that rendered before hydration and fetched `/card/[slug]` in `useEffect`. It was not caused by `ReadPublicCard`, `DefaultTheme`, or a route-level Suspense boundary.

The public route now executes the existing `ReadPublicCard` use case on the server and passes its `PublicCardDTO` directly to the existing `DefaultTheme`. Normal requests receive the rendered card in the first HTML response. The client fetch, duplicated runtime validation, loading text, and second HTTP request were removed.

Published-card reads are cached in Next's server data cache for one hour and tagged by slug. Successful card writes expire the matching tag with blocking revalidation. Slug changes expire the aggregate tag because both the former and new lookup keys must be removed.

## Root Cause

### Before

1. `/c/[slug]` rendered `PublicCardExperience` without card data.
2. `PublicCardExperience` initially rendered `Loading card…`.
3. Only after JavaScript hydration did `useEffect` call `/card/[slug]`.
4. The browser parsed and validated JSON, converted dates, updated state, and rendered `DefaultTheme`.

This duplicated the read: `generateMetadata` queried on the server while the page queried again from the browser.

### Audit conclusion

- Client-side fetch: **root cause**.
- Suspense fallback: not the original cause.
- `loading.tsx`: none existed on `/c/[slug]` before this task.
- Streaming: not the original cause. A route skeleton was evaluated during implementation, but measurement showed it put a fallback in the first response chunk. It was removed so normal requests wait for complete card HTML.

## Rendering Strategy

Before:

`Server shell → Client Component → hydration → GET /card/[slug] → DTO validation → state update → DefaultTheme`

After:

`Server route → cached ReadPublicCard → PublicCardDTO → DefaultTheme → rendered HTML`

`generateMetadata` and the page share a React request cache, preventing duplicate reads during one render. The canonical use case, DTO, renderer, and repository contracts did not change.

## Cache Strategy

### Server data cache

- Key: public-card read plus normalized slug.
- Freshness: 3,600 seconds.
- Tags: `public-cards` and `public-card:<slug>`.
- Warm requests reuse the serialized `PublicCardDTO`, bypassing the remote database read.

### Invalidation

Successful public-card mutations use a transport-level mutation handler. It delegates to the existing application use case and invalidates only after the write succeeds.

- Profile, appearance, settings, sections, buttons, social links, blocks, Publish, Unpublish, and Restore expire `public-card:<result.slug>`.
- Slug mutation expires `public-cards`, ensuring the old slug cannot survive.
- Failed writes do not invalidate.
- `{ expire: 0 }` provides blocking revalidation: the next visitor waits for fresh state rather than receiving stale content.

Therefore Save on a published card is immediately visible; Save while Draft remains private and the following Publish invalidates; Unpublish invalidates before its response completes and the next read rejects the card.

### HTTP response cache

The JSON compatibility endpoint uses `Cache-Control: public, max-age=0, must-revalidate`. Provider-specific CDN storage remains disabled. This avoids an independent cache that application tags cannot purge after Unpublish. Fast warm reads come from the explicitly invalidated server data cache.

## Measurements

Measurements used the local production build (`next start`) against configured development PostgreSQL. Times are wall-clock observations.

| Measurement | Before/intermediate | Final |
|---|---:|---:|
| Cold TTFB | 216.9 ms to streamed fallback | 1,609.6 ms to complete card HTML |
| Cold response complete | 1,466.9 ms | 1,615.2 ms |
| Warm TTFB | 24.2 ms | 26.4 ms |
| Warm response complete | 26.8 ms | 29.3 ms |
| HTML size | streamed: 20,558 B | 16,796 B cold; 16,753 B warm |

The final cold TTFB intentionally waits for the remote database and full render instead of quickly painting a loader. Warm requests deliver the complete card in roughly 29 ms.

### Database/read pipeline

The uncached JSON endpoint was sampled five times. It includes route parsing, `ReadPublicCard`, repository relations, DTO mapping, logging, and JSON serialization:

- Cold process/read: 1,137 ms.
- Warm server durations: 288 ms, 291 ms, 307 ms, and 381 ms.
- Warm client TTFB range: 295–389 ms.

An isolated Prisma benchmark was not valid because the generated Prisma 7 WASM runtime would not initialize outside Next. No misleading query-only figure is claimed; production route timings are the reliable figures for this environment.

### Renderer and hydration

- The 29.3 ms warm full response is an upper bound for cache lookup, metadata/page work, renderer execution, and local transfer combined.
- A renderer-only CLI benchmark was not valid because CSS Modules require the Next compiler; the renderer was not mocked merely to produce a favorable number.
- Content-ready hydration dependency: **0 ms**. Card content is in server HTML, so hydration no longer determines when visitors can see it.
- Browser hydration CPU was not available from the command-line harness. Capture it with production RUM; it no longer gates content readiness.

## Verification Matrix

| Scenario | Result | Evidence |
|---|---|---|
| Cold published request | PASS | HTTP 200; complete card HTML; no raw loading text |
| Warm published request | PASS | HTTP 200; complete response in 29.3 ms |
| Unpublished card | PASS | reader requires exactly Published + Public; lifecycle tests pass |
| Publish after save | PASS | save mutations and publication mutation invalidate after success |
| Unpublish invalidation | PASS | blocking tag expiry before response |
| Slug change | PASS | aggregate tag expires old and new lookup entries |
| Failed mutation | PASS | test confirms no invalidation |

## UX Improvements

- Removed visitor-facing raw loading text.
- Removed hydration-gated card rendering.
- Removed the duplicate client request and date/DTO conversion path.
- Server HTML now contains meaningful content for no-JavaScript clients, crawlers, link previews, and slow devices.
- Heavy block lazy-loading and renderer boundaries remain unchanged.

## Quality Results

- TypeScript: PASS.
- ESLint: PASS with zero errors; pre-existing unrelated warnings remain.
- Tests: PASS, 59/59.
- Architecture check: PASS.
- Production build: PASS on Next.js 16.2.6 and Prisma 7.8.0.

## Remaining Performance Work

- Cold reads are dominated by the remote database/read pipeline. Evaluate region colocation, pooling, and production tracing with real traffic.
- Existing renderer image elements produce LCP warnings. Image optimization was not changed because the renderer is frozen for this task.
- Capture Core Web Vitals and browser hydration CPU through RUM; curl cannot measure LCP, INP, or client main-thread work.

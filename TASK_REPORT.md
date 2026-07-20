# Task Report — Sprint 4 Public Experience

## Outcome

Implemented the first canonical public card experience, one isolated default theme, a validated appearance model, an instant live preview, and secure appearance persistence through the application layer.

## Modified files

- `src/types/appearance.ts` — typed appearance contract.
- `src/validation/appearance.ts`, `src/validation/use-cases.ts`, `src/validation/index.ts` — validation, defaults, and write input.
- `src/dto/card.dto.ts` — adds validated appearance to public DTOs.
- `src/use-cases/read-public-card.ts`, `src/services/card.service.ts` — explicitly map stored theme configuration to appearance.
- `src/use-cases/update-card-appearance.ts`, `src/use-cases/index.ts` — authorized transactional save use case.
- `src/repositories/contracts.ts`, `src/repositories/card.repository.ts`, `src/repositories/editor-session.repository.ts`, `src/repositories/index.ts` — domain ports and transaction-scoped persistence/query implementation.
- `src/lib/composition-root.ts` — composes the new use case.
- `src/app/cards/[id]/appearance/route.ts` — thin save transport.
- `src/components/themes/DefaultTheme.tsx`, `default-theme.module.css` — sole canonical theme.
- `src/features/public-card/*`, `src/app/c/[slug]/page.tsx` — public endpoint consumer and page.
- `src/features/appearance/*`, `src/app/appearance/[slug]/page.tsx` — controls and live preview.
- `scripts/check-architecture.mjs` — theme isolation enforcement.
- `docs/SPRINT_4_ARCHITECTURE.md` — architecture addendum.
- `SPRINT_4_REVIEW.md` — sprint compliance review.

## Risks

See `SPRINT_4_REVIEW.md`. Principal risks are the `/c` route compromise, client-side initial fetch, missing media resolution, and the intentional dependency on an already-issued editor session.

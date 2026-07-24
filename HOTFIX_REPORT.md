# Activation Flow Hotfix Report

## Root cause

The Workspace component used the public slug reader. Public reads correctly exclude Draft/Private cards, while Order approval intentionally creates Draft/Private cards for customer setup. The resulting null repository result was converted to `Card not found` by `ReadPublicCard`.

## Fix

- Preserve the existing `/workspace?slug=...` URL.
- Store a session-tab slug-to-card-ID association when activation succeeds.
- Resolve the stored card-scoped EditorSession before loading Workspace data.
- Validate the session token and require `EditorSession.cardId` to equal the requested Card ID.
- Read the existing editor Card by ID, without publication filters.
- Verify the loaded Card slug equals the Workspace URL slug.
- Reuse one canonical mapper to return the unchanged `PublicCardDTO` renderer contract.
- Retain the access-code gate for missing or expired browser sessions.

## Files modified

- `src/features/appearance/AppearanceEditor.tsx` — removed the public-card fetch from Workspace initialization and loads through the card-scoped session flow.
- `src/features/appearance/workspace-session-client.ts` — stores/resolves the slug-to-card association, reuses card-scoped session tokens, and verifies slug/card ownership.
- `src/features/appearance/actions.ts` — server boundary for the authorized Workspace read.
- `src/features/customer-access/AccessCodeEntry.tsx` — stores the verified Card ID with the returned slug before navigation.
- `src/use-cases/read-workspace-card.ts` — validates EditorSession ownership and reads the editor Card by ID.
- `src/use-cases/card-mappers.ts` — shared renderer-safe DTO mapping.
- `src/use-cases/read-public-card.ts` — reuses the shared mapper; public selection rules are unchanged.
- `src/use-cases/index.ts` — exports the Workspace read use case.
- `src/validation/use-cases.ts` — validates card ID and session-token input.
- `src/lib/composition-root.ts` — composes the authorized Workspace reader.
- `tests/workspace-session-client.test.ts` — regression coverage for Draft/Private Order Card loading.
- `tests/workspace-card-read.test.ts` — application authorization and cross-card rejection coverage.
- `tests/activation-flow.test.ts` — integrated Create Order through customer edit regression flow.
- `ACTIVATION_FLOW_AUDIT.md`, `HOTFIX_REPORT.md`, `TASK_REPORT.md` — audit and completion evidence.

## Why the fix preserves the architecture

- No Prisma access was added outside repositories.
- No repository contract or implementation was changed.
- No DTO contract was changed.
- No Order, Card, AccessCode, or EditorSession schema was changed.
- The existing Unit of Work remains the transaction boundary.
- Public Card selection remains Published plus Public/Unlisted.
- Workspace remains slug-routed and uses the same renderer DTO and DefaultTheme.
- Session authorization remains in the application layer, consistent with existing profile and appearance update use cases.
- The plaintext session token remains browser-tab scoped; only its hash is persisted.

## End-to-end verification

An integrated application test executes:

CreateOrder → ApproveOrder → CreateCustomer → CreateCard → GenerateInitialAccessCode → CreateEditorSession → ReadWorkspaceCard → UpdateCardProfile.

It proves that the generated AccessCode and EditorSession retain the Order Card ID, the Workspace slug equals the created Card slug, a Draft/Private Card opens successfully through its session, and an edit succeeds. Cross-card session use is rejected before the Card read.

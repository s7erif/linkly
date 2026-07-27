# Task Report — Phone Button Validation Bug Fix

## Outcome

Fixed a validation bug where creating a Phone button returned HTTP 400 `VALIDATION_ERROR` with no actionable diagnostics. The root cause was a client-server validation mismatch: the client-side `validateLink()` prepended `https://` only for validation (false positive for raw numbers), while the server-side `destination` Zod validator required a valid URL with a recognised protocol.

---

## Root Cause

**The PHONE link type had no `urlPrefix`** in `src/features/links/link-registry.ts:94`, so the client form never prepended `tel:` to raw phone numbers.

### Complete Request Lifecycle Trace

| Step | File:Line | Behaviour |
|------|-----------|-----------|
| 1 | `link-registry.ts:94` | PHONE has `urlPrefix: undefined` — `tel:` never auto-prepended |
| 2 | `links-editor.tsx:252-256` | `handleSave()`: `def.urlPrefix` is undefined → raw number passes through unchanged |
| 3 | `links-editor.tsx:83` | Client `validateLink()`: `new URL("https://01153914912")` → **succeeds** (digits are valid hostnames) — **false positive** |
| 4 | `use-card-editor-store.ts:703` | Request body sent: `{ url: "01153914912" }` — raw number, no protocol |
| 5 | `card-builder.ts:11` | Server `destination` validator: `new URL("01153914912")` → **throws** `TypeError` (no protocol) |
| 6 | `request.ts:13` | Zod error stored in `details.fields` but **never logged** — only generic "Request validation failed" |

### Exact Validation Rule

**`src/validation/card-builder.ts` line 11**: `const url = new URL(value)` inside the `destination` Zod `.refine()`. A bare phone number like `"01153914912"` has no URL protocol, so `new URL()` throws `TypeError`, and the refine returns `false`.

---

## Files Modified

### 1. `src/lib/phone.ts` — **NEW FILE**

Phone number normalization utility.

- `normalizePhoneForUrl(raw)`: strips spaces/dashes/parentheses/dots, applies Egyptian country-code heuristic (`01…` → `+2…`), validates 7–15 digits, returns `"tel:+…"` URL or `null`
- `isPlausiblePhone(raw)`: lightweight check, returns boolean

### 2. `src/features/links/link-registry.ts`

Added `urlPrefix: "tel:"` to the PHONE link type definition.

**Why:** The form's `handleSave()` uses `def.urlPrefix` to auto-prepend protocol prefixes. Without it, phone numbers were sent as raw digits.

### 3. `src/components/workspace/inspector/links-editor.tsx`

- **Import** `normalizePhoneForUrl` from `@/lib/phone`
- **`validateLink()`**: Updated to use `normalizePhoneForUrl` for phone numbers instead of the `new URL("https://" + …)` fallback that caused false positives
- **`handleSave()`**: Added phone-specific branch — when `initial.type === "PHONE"`, calls `normalizePhoneForUrl()` to strip formatting and prepend `tel:`

### 4. `src/validation/card-builder.ts`

- **Import** `normalizePhoneForUrl` from `@/lib/phone`
- **`destination` validator**: Added `.transform()` before `.refine()` that:
  - Normalises `tel:` URLs (strips formatting characters)
  - Converts raw plausible phone numbers to `tel:` URLs (defence in depth)

### 5. `src/transport/http/request.ts`

**`parseJsonBody()`**: Added structured validation-failure logging. Now logs:
- `path` — the failing field path
- `code` — the Zod error code
- `message` — the validation message
- `field` — the last path segment
- `body` — truncated request body (≤500 chars)

### 6. `src/use-cases/shared.ts`

**`parseUseCaseInput()`**: Same structured validation-failure logging as above. Uses log key `usecase.validation.failed`.

### 7. `tests/phone-validation.test.ts` — **NEW FILE** (34 tests)

| Section | Tests |
|---------|-------|
| `normalizePhoneForUrl` — valid | 8 |
| `normalizePhoneForUrl` — invalid | 11 |
| `isPlausiblePhone` | 2 |
| `createCardButtonSchema` — valid phones | 4 |
| `createCardButtonSchema` — normalisation | 3 |
| `createCardButtonSchema` — rejects dangerous | 5 |

---

## Normalisation Logic

```
User enters:  (011) 539-14912
     ↓ strip formatting [\s\-().]
     01153914912
     ↓ Egyptian local heuristic (01XXXXXXXXX → +201XXXXXXXXX)
     +201153914912
     ↓ validate: /^\+?\d{7,15}$/
     ✓
     ↓ prepend tel:
     tel:+201153914912
```

---

## Validation Logging Improvements

### Before
```
[handleRoute] AppError: { code: "VALIDATION_ERROR", message: "Request validation failed", statusCode: 400 }
```
No visibility into which field failed or why.

### After
```json
{
  "level": "warn",
  "message": "request.validation.failed",
  "issues": [
    {
      "path": "url",
      "field": "url",
      "code": "custom",
      "message": "Enter a valid web, email, telephone, or SMS URL"
    }
  ],
  "body": "{\"id\":\"...\",\"url\":\"01153914912\",\"type\":\"PHONE\",...}"
}
```

---

## Verification

### Valid formats (all pass)

| Input | Normalised |
|-------|-----------|
| `01153914912` | `tel:+201153914912` |
| `+201153914912` | `tel:+201153914912` |
| `201153914912` | `tel:+201153914912` |
| `+44 20 1234 5678` | `tel:+442012345678` |
| `+1 (555) 123-4567` | `tel:+15551234567` |

### Invalid formats (all rejected)

`abc`, `123`, `++++`, `javascript:alert(1)`, `<script>`, `data:`, `file://`, `ftp://`

### Test Suite

- 29 test files, 154 tests — all passing (0 regressions)
- 34 new phone-validation tests

---

## Risks

- **Low risk.** The `.transform()` in the `destination` validator normalises stored phone URLs. Existing buttons stored as `tel:+1234567890` are unaffected — `normalizePhoneForUrl` only changes formatted numbers.
- **No schema changes.** No database migration needed.
- **No API changes.** Route handlers, DTOs, and repository interfaces unchanged.
- **Backward compatible.** All existing button types (WEBSITE, EMAIL, etc.) pass through the transform unchanged.

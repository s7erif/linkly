# Environment Configuration Audit

## Result

The `POST /editor/session` failure was caused by `ACCESS_CODE_HMAC_KEY` being absent from active local environment files. HMAC validation itself was correct and remains intact.

A secure development value has been generated in ignored `.env.local`. The value is 32 random bytes encoded as 64 hexadecimal characters and is intentionally not included in this report.

## Verification matrix

| Check | Before | Resolution |
|---|---|---|
| Runtime expectation | `getAccessCodeService()` and `getAccessCodeUseCases()` read `getEnvironment().ACCESS_CODE_HMAC_KEY` and throw when absent. | Unchanged; this is the required security boundary. |
| Environment validation | Declared as `z.string().min(32).optional()`, allowing configuration validation to pass before composition failed. | Now required with `z.string().min(32)`. |
| Documentation | README did not list the key. | Added to the required-variable table with purpose and generation command. |
| `.env.example` | Included a placeholder and 32-byte note. | Retained and strengthened with required status, a 64-hex-character placeholder, generation command, and stability warning. |
| `.env` | Key absent. | Left unchanged. Next.js loads `.env.local` with higher priority for local development. |
| `.env.local` | Key absent. | Added a generated development-only value without printing it. |
| Secret tracking | `.env` and `.env.local` match the repository's `.env*` ignore rule; `.env.example` is explicitly tracked. | Confirmed. |

## Where the key is used

### Central validation

`src/lib/env.ts` validates the environment. `ACCESS_CODE_HMAC_KEY` must contain at least 32 characters. The HMAC factory additionally enforces at least 32 encoded bytes, which is the authoritative cryptographic check.

### Composition root

`src/lib/composition-root.ts` consumes the key in two existing factories:

- `getAccessCodeService()` constructs the access-code service hasher.
- `getAccessCodeUseCases()` constructs the hasher used by access-code generation, verification, and editor-session creation.

The reported stack trace comes from `getAccessCodeUseCases()` because `POST /editor/session` composes `CreateEditorSession` through this factory.

### Cryptographic implementation

`src/services/credential-security.service.ts` imports the secret into Web Crypto as an HMAC-SHA-256 key. Access codes are hashed with this keyed function; plaintext access codes are not stored.

## Security assessment

- No fallback or bypass was added.
- No secret was committed to `.env.example`, README, or audit documents.
- The generated value was written only to ignored `.env.local`.
- The key must remain stable. Replacing it changes every access-code HMAC result and makes previously issued codes unverifiable unless they are regenerated under the new key.
- Production must use an independently generated secret supplied through the deployment platform, never the local development value.

## Verification performed

- Local key existence: PASS; 64 characters, value not displayed.
- Central environment validation: PASS.
- TypeScript: PASS.
- Tests: PASS, 22/22.
- Architecture check: PASS.
- Production build: PASS and detected `.env.local`/`.env`.

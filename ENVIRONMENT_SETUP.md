# Environment Setup

## Local development

1. Copy the tracked template if local environment files do not yet exist:

   ```bash
   cp .env.example .env.local
   ```

2. Generate an access-code HMAC key:

   ```bash
   openssl rand -hex 32
   ```

3. Set the result in `.env.local`:

   ```dotenv
   ACCESS_CODE_HMAC_KEY="<64-character-random-hex-value>"
   ```

4. Keep the same key while using the same development database. Restart the Next.js process after changing environment variables.

5. Validate the setup:

   ```bash
   npm run typecheck
   npm run build
   ```

This workspace already has a generated development value in `.env.local`. Do not replace it unless local access codes can also be regenerated.

## Production and preview deployments

Create a separate random key for every isolated environment and store it in that platform's encrypted secret/environment-variable facility:

```bash
openssl rand -hex 32
```

Configure `ACCESS_CODE_HMAC_KEY` before starting or building the application. Never copy the development value into production and never place a real key in `.env.example`, source control, build logs, screenshots, or support tickets.

When multiple application instances share one database, every instance must receive the same HMAC key. A mismatched instance will reject otherwise valid access codes.

## Rotation policy

`ACCESS_CODE_HMAC_KEY` is not an ordinary disposable session secret. Existing `AccessCode.codeHash` values were derived from it and cannot be verified with a replacement key.

Before rotation:

1. Plan regeneration or controlled re-issuance of all active access codes.
2. Coordinate deployment so every instance changes consistently.
3. Revoke or rotate old access-code records according to the approved access-code lifecycle.
4. Do not retain plaintext codes to simplify rotation.

The current schema has no key-version field or multi-key verification mechanism. Adding either would be an architecture/security change and is outside this environment repair.

## Variable reference

| Variable | Required | Constraint | Purpose |
|---|---:|---|---|
| `ACCESS_CODE_HMAC_KEY` | Yes | At least 32 bytes; recommended 32 random bytes encoded as 64 hex characters | HMAC-SHA-256 hashing of access codes |
| `DATABASE_URL` | Yes | Non-empty PostgreSQL URL | Application database connection |
| `DIRECT_URL` | No | Non-empty PostgreSQL URL when supplied | Direct migration connection |
| `LOG_LEVEL` | No | `debug`, `info`, `warn`, or `error` | Structured logging threshold |

Legacy NextAuth variables remain documented in `.env.example` and README, but they do not replace or authorize the OI access-code HMAC key.

## Troubleshooting

### “ACCESS_CODE_HMAC_KEY is required”

- Confirm the variable exists in the environment visible to the running process.
- Restart the development server after editing `.env.local`.
- Ensure the value is not blank and is at least 32 bytes.

### Access code is rejected after adding a key

The card's stored hash may have been produced using a different key. Restore the correct environment key or use the approved access-code regeneration flow. Do not weaken HMAC verification and do not compare plaintext codes.

### One server accepts a code and another rejects it

The instances likely have different HMAC keys. Configure the same secret for all instances connected to the same database and restart them safely.

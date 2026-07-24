# Sprint 27 — Supabase Storage Report

## Provider implementation

Added `SupabaseStorageProvider` implementing the existing `StorageProvider` contract. It supports server-side upload, delete, public URL generation, and signed URL generation through Supabase Storage REST APIs.

## Environment configuration

Added typed configuration fields:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

The service-role key is read only by the server composition root and is never exposed to client components.

## Upload and delete flow

MediaService remains the only upload boundary. The composition root selects Supabase when all credentials are configured and retains LocalStorageProvider only for development fallback. Deletes continue through MediaService and the provider boundary.

## MediaAsset integration

Existing storage key, public URL, MIME type, byte size, checksum, and dimension fields remain unchanged. The provider returns the storage key and public URL consumed by MediaService.

## Security review

Storage paths are normalized to remove leading separators and traversal segments. Upload validation remains in MediaService. Supabase credentials are server-only.

## Performance review

Uploads use the existing byte pipeline and direct server-to-Supabase request. A future streaming adapter can implement the same provider interface without changing MediaService or UI.

## Verification

- TypeScript: passed.
- Prisma validation: passed.
- Existing architecture boundaries preserved.

## Production readiness

Configure the three Supabase environment variables in production. Without them, development continues using the existing local provider; production deployment should fail configuration validation or explicitly prohibit the fallback.

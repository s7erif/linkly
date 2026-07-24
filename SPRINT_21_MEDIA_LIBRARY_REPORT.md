# Sprint 21 — Media Library Report

## Architecture

Added a dedicated Media DTO, validation layer, repository, service, provider boundary, and Admin module. Upload flow is UI → MediaService → MediaRepository → StorageProvider. UI components do not upload directly.

## Storage abstraction

The existing `StorageProvider` interface is used for random storage keys, provider-neutral put/delete operations, and future Supabase, S3, R2, or Local implementations.

## Media entity

Extended `MediaAsset` with original filename, extension, public URL, caption, tags, folder, creator, soft-delete metadata, and indexes. Added nested `MediaFolder` and `MediaUsage` entities. Existing card media relations remain compatible.

## Usage tracking

`MediaUsage` uniquely records entity type, entity ID, and field, enabling delete protection and usage inspection across Website, Card, Workspace, and future Blog modules.

## Security

Uploads validate safe image MIME types, extensions, filename characters, and a 10 MB size limit. Storage keys are random UUID-based paths. SVG is explicitly constrained to the supported image MIME set; executable uploads are not accepted.

## Performance

Media listing supports pagination, search, folder and MIME filters, soft-delete filtering, and indexed lookups. The Admin library uses lazy-ready grid primitives; thumbnail processing is intentionally deferred.

## Future CDN and image processing readiness

`publicUrl`, dimensions, checksum, and provider keys support cache headers, versioning, CDN URLs, and future resize/WebP/AVIF processors without changing DTO boundaries.

## Verification

- Prisma schema validation: passed.
- Prisma client generation: passed.
- TypeScript: passed.
- Existing tests and architecture checks remain compatible.
- Production build should be rerun with the deployment database migration applied.

## Out of scope

Workers, resizing, thumbnails, video, OCR, AI tagging, QR/NFC, payments, and Blog remain excluded.

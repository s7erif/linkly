# Media Upload Pipeline Audit

## Write path

Checkout file picker → `POST /api/upload` → `mediaService.upload` → `MediaUploadSchema` validation → configured StorageProvider → `PrismaMediaRepository.create` → `MediaAsset`.

The upload path was already persisting MediaAsset records and returning `mediaAssetId`; it was not a storage-only path.

## Root cause

The missing files were caused by read paths, not upload persistence:

1. Admin Media Library rendered a static placeholder and never called `mediaService.list`.
2. Admin Order Details read model did not select `Order.paymentSubmissions.paymentProofAsset`.
3. Payment proof therefore existed in the database but was not projected into Order Details.

## Fixes

- Admin Media Library now reads paginated persisted MediaAssets through MediaService and displays file metadata and public previews.
- Admin Order Details now selects payment submissions and their linked MediaAsset, exposing proof metadata and preview/download links.
- Existing MediaService, StorageProvider, and PaymentService boundaries remain unchanged.

## Storage verification

When Supabase credentials are configured, the composition root selects SupabaseStorageProvider; otherwise development uses the existing local provider. Both return a storage key and public URL before MediaAsset persistence.

## Folder behavior

Payment proofs currently upload without a folder assignment, so they appear as unfiled library assets. The nullable folder relationship remains available for future customer/admin folder selection.

## No duplicate uploads

No new upload endpoint or duplicate persistence path was added. The existing upload request creates one MediaAsset and the existing PaymentSubmission references its ID.

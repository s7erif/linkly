# Media Upload Pipeline Root Cause

## Trace

`CreateCardFlow` uploads to `/api/upload` → the route calls `mediaService.upload` → MediaService validates, stores through StorageProvider, creates a `MediaAsset` through `PrismaMediaRepository`, and returns `mediaAssetId`/`publicUrl`. Payment submission then stores that ID as `paymentProofAssetId`.

## Exact break

The database write was present. The visibility failure was caused by two read-side gaps:

- Admin Media Library was previously a static placeholder rather than a MediaRepository query.
- Admin Folders was also static, and uploads supplied no folder ID, leaving every asset unfiled.
- Order Details previously omitted `paymentSubmissions.paymentProofAsset` from its read select.

## Fix

- Media Library reads persisted MediaAssets through MediaService.
- Uploads now ensure and assign the persisted `Payment Proofs` folder.
- Folders page reads persisted MediaFolder records.
- Order Details selects PaymentSubmission and its linked MediaAsset, including public URL and file metadata.

## Duplicate prevention

No second upload endpoint or duplicate MediaAsset write was introduced. The existing single upload path remains authoritative; folder creation uses find-before-create and payment references continue using the returned MediaAsset ID.

## Result

Supabase/local storage object, MediaAsset, PaymentSubmission reference, MediaFolder assignment, Media Library listing, folder listing, and Order Details proof preview now use the same persisted record chain.

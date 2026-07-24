# Sprint 26 — Checkout Payment Flow Report

## Checkout flow changes

The checkout stepper now exposes four stages:

1. Your details
2. Choose plan
3. Payment
4. Review & submit

## Payment step

Added payment method selection for InstaPay and Mobile Wallet, sender name, sender phone, reference number, and proof selection fields. Payment fields are validated before advancing to review.

## Order submission

The existing order action now accepts payment data and submits a pending PaymentSubmission through the existing PaymentService after creating the pending Order. Payment approval is not triggered.

## UX and accessibility

The existing stepper, responsive order layout, disabled pending state, labels, and validation messaging are preserved.

## Production readiness note

The current upload transport does not expose a MediaAsset-ID-returning customer upload flow. The proof field currently captures the selected file value but must be connected to the Media Library upload service before production use. Dynamic CMS payment instructions and real upload progress are also pending integration.

## Verification

- TypeScript: passed.
- Existing backend architecture remains unchanged.
- Full production verification should be rerun after MediaAsset upload transport integration.

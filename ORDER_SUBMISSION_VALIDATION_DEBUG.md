# Order Submission Validation Debug

## Execution path

`Submit order` → `submit()` in `CreateCardFlow` → `submitCardOrder()` server action → `createOrder.execute()` → `parseUseCaseInput(createOrderSchema, input)`.

## Root cause

`createOrderSchema` is strict and accepts only order fields. The frontend server action passed payment fields (`paymentMethod`, sender data, reference, proof asset ID, amount, currency) into `CreateOrder`, so Zod rejected the payload as an invalid use-case input.

## Fix

The server action now destructures payment-only fields before calling `CreateOrder`. It passes the remaining order payload to the strict order schema, then creates the `PaymentSubmission` with the payment fields.

## Error diagnostics

Validation errors now include each failing field and message instead of returning only `Invalid use-case input`.

## Preserved behavior

Plan ID, customer information, billing interval, package, and quantity still go through the original CreateOrder validation. Payment proof remains linked through `paymentProofAssetId` in the subsequent PaymentService call.

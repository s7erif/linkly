# Sprint 22 — Manual Billing Report

## Architecture

Added PaymentSubmission and Invoice domain entities, DTOs, validation, repository, service, Billing Admin routes, and provider-neutral payment boundaries. UI remains free of Prisma and business logic.

## Payment workflow

Payment submissions validate payment method, amount, currency, sender data, reference number, proof asset ID, and notes. Duplicate references are prevented per order. Approval and rejection are explicit application-service operations.

## Transaction flow

The new payment service is designed to compose with the existing UnitOfWork approval flow. Payment approval is the single event boundary for order payment state, invoice generation, subscription activation, access-code issuance, notifications, and audit entries.

## Invoice generation

Invoice DTOs and schema preserve immutable order financial snapshots, totals, currency, issue time, status, and future PDF path. PDF generation and provider delivery remain replaceable extension points.

## Email automation and activation

Existing Notification Service and Access Code services remain the source of truth. Future orchestration can subscribe to PaymentApproved without coupling provider implementations.

## Future Stripe/Paymob compatibility

Manual payment methods are explicit domain values, while future gateways can publish the same PaymentApproved event and reuse invoice, subscription, access-code, notification, and audit handlers.

## Verification

- Prisma validation and client generation passed.
- TypeScript passed.
- Existing tests and architecture checks remain compatible.
- Billing routes compile in the production build.

## Scope

No Stripe, Paymob, refunds, recurring billing, webhooks, tax engines, accounting integrations, or background workers were implemented.

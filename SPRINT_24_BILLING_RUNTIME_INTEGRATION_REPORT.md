# Sprint 24 — Billing Runtime Integration Report

## Runtime audit

The repository currently contains the dispatcher and `registerBillingListeners` contract, but it does not contain concrete runtime implementations for the requested listeners. The only available listener file accepts injected callbacks; it does not create invoices, generate PDFs, activate subscriptions, create billing notifications, dispatch billing emails, write billing audit/timeline entries, or update billing projections.

## Existing implementations

- Payment approval and idempotency: present through `ApprovePaymentAndActivate`.
- Payment and retry repositories: present.
- Notification Service and Resend provider: present for existing welcome/order/card templates only.
- Subscription and access-code application services: present for the existing order approval flow.
- Event dispatcher: present and registration is deduplicated.

## Missing runtime dependencies

No concrete `InvoiceService`, invoice repository, PDF provider, billing email templates, billing notification repository/service, timeline service, billing audit listener, or customer/admin billing projection service exists in the current repository. The existing `Invoice` model has no PDF metadata beyond `pdfPath`, and no runtime composition-root registration wires billing listeners.

## Safety decision

The full Sprint 24 Definition of Done cannot be truthfully marked complete without inventing providers or bypassing the existing architecture. No placeholder success behavior was added, and no billing state is falsely reported as activated.

## Verification

- TypeScript: passed.
- Prisma validation/client generation: passed.
- Existing tests: 16 files / 60 tests passed.
- Architecture check: passed.

## Required next implementation slice

Add the missing invoice repository/service, PDF storage provider, billing notification templates, timeline/audit repository operations, billing read models, and composition-root wiring. Once those existing-boundary implementations exist, `registerBillingListeners` can be connected without introducing new architecture.

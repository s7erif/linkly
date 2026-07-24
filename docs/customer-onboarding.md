# Customer authentication and onboarding

Status: canonical
Updated: 2026-07-23

## Supported journeys

The customer product has exactly three onboarding journeys.

### A. Website (digital) registration

```text
/create-card  (single unified entry; /register and /customer/register redirect here)
  -> register account (email + password), choose plan + billing (Monthly/Yearly)
  -> manual bank transfer + upload receipt -> submit
  -> PENDING Order carrying a scrypt-hashed password (plaintext never persisted) + PENDING PaymentSubmission
  -> admin approves -> one ApproveOrder transaction creates Customer, CustomerAccount (from stored hash),
     OWNER WorkspaceMembership, Card, Access Code, and Subscription
  -> /customer/login (email + password) -> customer session -> /workspace -> Builder
```

The login account and Workspace are created only at admin approval, so a submitted (pending) registration cannot sign in until it is approved. The card-payment option is shown in the UI but disabled with a "Coming Soon" badge; only manual bank transfer is accepted.

### B. NFC activation

```text
/a/{token}
  -> validate AVAILABLE or RESERVED inventory
  -> register, sign in, or continue an existing customer session
  -> one activation transaction creates or reuses Customer/Workspace/OWNER membership,
     creates Card/AccessCode/EditorSession, assigns the NFC card, and marks it ACTIVATED
  -> client stores the issued card-scoped EditorSession
  -> /workspace?slug={slug} Card Builder
```

No Workspace index or empty state occurs between activation and the Builder. A failed transaction returns an error on the activation screen and performs no redirect.

### C. Returning customer

```text
/customer/login
  -> customer session
  -> /workspace
  -> one Card: issue a fresh owned Card EditorSession and open Builder
  -> multiple Cards: show selector, issue a fresh owned Card EditorSession, open Builder
  -> zero Cards: show the Website-registration Welcome screen
```

## Authentication

Customer sessions use a high-entropy random token. Only its SHA-256 hash is stored. Cookies are HTTP-only, SameSite=Lax, Secure in production, and have either a one-day or Remember Me lifetime. Logout revokes the server session before deleting the cookie.

Customer login is separate from Platform Admin authentication. Authenticated customers are redirected away from customer login and recovery pages.

## Workspace and editor authorization

Every customer has one active OWNER Workspace. Builder entry never trusts a client-provided Workspace or Customer identifier. The customer session resolves the account and active membership server-side. A fresh EditorSession is issued only when the requested Card belongs to the resolved Customer and Workspace.

Normal digital-card creation is idempotent for a zero-card Workspace. It creates the Card aggregate, profile, canonical sections, Access Code, primary-Card relationship, and EditorSession in one transaction. A repeated request opens the existing first Card instead of creating a duplicate.

## Password recovery

Forgot-password requests always return the same response to prevent account enumeration. A one-hour, single-use hashed token is emailed using the existing email provider. Reset atomically consumes the token, updates the scrypt password hash and salt, and revokes all previous customer sessions.

## Activation and username security

Activation tokens are normalized and validated, claims are guarded by an atomic conditional update, and only AVAILABLE/RESERVED unowned cards can be claimed. Status transition to ACTIVATED consumes activation capability while retaining the NFC URL as a permanent public-profile resolver. Username validation is lowercase, case-insensitive through normalization, globally unique through Card slug constraints, format-restricted, and reserved-name aware.

Customer and activation actions use bounded per-origin request throttling. Workspace resolution requires an active OWNER membership in a non-archived Workspace. Repository mutations bind the Card, NFC inventory record, Customer, and Workspace together inside the activation transaction.

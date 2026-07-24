# OI Platform - Comprehensive Architecture & Business Logic Audit Report

**Audit Date:** 2026-07-23  
**Auditor:** Claude (Staff Software Architect)  
**Scope:** Full architecture, business logic, security, flows, database, and code audit  
**Audit Type:** Pre-Production Production-Ready Review

---

## Executive Summary

This comprehensive audit identified **34 issues** across architecture, business logic, security, and data flow. The system has fundamental misalignments with the specified business rules, particularly around subscription management, customer type handling, and user flows.

**CRITICAL FINDINGS:** The current implementation does not match the specified business requirements for Digital vs. Product customers, subscription lifecycle, and login redirect behavior.

### Severity Breakdown
- **CRITICAL:** 8 issues
- **HIGH:** 12 issues
- **MEDIUM:** 10 issues
- **LOW:** 4 issues

---

## CRITICAL ISSUES

### Issue #1: Subscription Status Mismatch
**Severity:** CRITICAL  
**Files:** `prisma/schema.prisma`, `src/use-cases/subscription-platform.ts`  
**Business Rule Violation:** Subscription Status enumeration

**Current Implementation:**
```prisma
enum SubscriptionStatus {
  PENDING_PAYMENT
  TRIAL
  TRIALING
  ACTIVE
  PAST_DUE
  GRACE_PERIOD
  SUSPENDED
  PAUSED
  CANCELED
  EXPIRED
  ARCHIVED
}
```

**Required Behavior:**
- Only `PENDING_APPROVAL`, `ACTIVE`, `EXPIRED` statuses

**Why It Is Incorrect:**
- The system uses `PENDING_PAYMENT` instead of `PENDING_APPROVAL`
- Contains unnecessary statuses (`TRIAL`, `TRIALING`, `PAST_DUE`, `GRACE_PERIOD`, `PAUSED`, `ARCHIVED`)
- Business rules explicitly state: "There is ONLY ONE subscription plan" with Monthly/Yearly choice
- Complexity will cause confusion in subscription management

**Business Impact:**
- Digital customers will see incorrect subscription statuses
- Admin approval workflow doesn't align with status transitions
- Renewal flow cannot work correctly

**Technical Impact:**
- Order approval creates subscriptions with wrong initial status
- Status checks throughout the codebase will fail
- Migration required for existing data

**Recommended Fix:**
1. Create migration to consolidate statuses to `PENDING_APPROVAL`, `ACTIVE`, `EXPIRED`
2. Update `SubscriptionStatus` enum in schema
3. Update all status checks in `subscription-platform.ts`
4. Update `manual-subscription-lifecycle.service.ts` to use new statuses
5. Update `approve-order.ts` to set `PENDING_APPROVAL` instead of `PENDING_PAYMENT`

**Files Involved:**
- `prisma/schema.prisma`
- `src/use-cases/subscription-platform.ts`
- `src/use-cases/approve-order.ts`
- `src/services/manual-subscription-lifecycle.service.ts`
- `src/repositories/subscription-lifecycle.repository.ts`

---

### Issue #2: Missing Subscription-Based Login Redirects
**Severity:** CRITICAL  
**Files:** `src/app/customer/login/page.tsx`, `src/app/workspace/page.tsx`  
**Business Rule Violation:** Login behavior based on subscription status

**Current Implementation:**
```typescript
// src/app/customer/login/page.tsx
export default async function Page() {
  const session = (await cookies()).get("oi_customer_session")?.value;
  if (session && await getActivationService().accountForSession(session))
    redirect("/workspace");  // ← No subscription check
  return <CustomerAuthShell>...</CustomerAuthShell>;
}
```

**Required Behavior:**
```
Login
↓
If Subscription Status == PENDING_APPROVAL
↓
Redirect to "Subscription Under Review" page

If Subscription Status == ACTIVE
↓
Redirect to Welcome Page → Workspace

If Subscription Status == EXPIRED
↓
Redirect to "Subscription Expired" page → Renew Flow
```

**Why It Is Incorrect:**
- No subscription status check after login
- Direct redirect to workspace regardless of subscription state
- Pending customers can access workspace before approval
- Expired customers cannot see renewal options

**Business Impact:**
- Pending customers access workspace before approval
- Expired customers have no clear renewal path
- Violates business rule for subscription-based access control

**Technical Impact:**
- Authorization bypass for pending/expired subscriptions
- No subscription enforcement at login boundary

**Recommended Fix:**
```typescript
// Create subscription-aware login redirect
export default async function Page() {
  const session = (await cookies()).get("oi_customer_session")?.value;
  if (!session) return <CustomerAuthShell>...</CustomerAuthShell>;
  
  const account = await getActivationService().accountForSession(session);
  if (!account) return <CustomerAuthShell>...</CustomerAuthShell>;
  
  // Check subscription status
  const subscription = await getSubscriptionForAccount(account.id);
  if (!subscription || subscription.status === 'PENDING_APPROVAL') {
    redirect("/subscription-pending");
  }
  
  if (subscription.status === 'EXPIRED') {
    redirect("/subscription-expired");
  }
  
  if (subscription.status === 'ACTIVE') {
    redirect("/welcome");
  }
  
  redirect("/workspace");
}
```

**Files Involved:**
- `src/app/customer/login/page.tsx`
- `src/app/subscription-pending/page.tsx` (NEW)
- `src/app/subscription-expired/page.tsx` (NEW)
- `src/app/welcome/page.tsx` (NEW)
- `src/use-cases/subscription-platform.ts`

---

### Issue #3: Username Required During NFC Activation
**Severity:** CRITICAL  
**Files:** `src/features/activation/ActivationExperience.tsx`, `src/features/activation/actions.ts`  
**Business Rule Violation:** Username generation timing

**Current Implementation:**
```typescript
// Username is REQUIRED during activation
<Input
  label="Username"
  name="username"
  placeholder="sherif-osman"
  required  // ← Required field
  value={username}
/>
```

**Required Behavior:**
```
"Public usernames are NOT selected during registration."
"Public usernames are NOT selected during NFC activation."

After entering Workspace:
↓
Generate Public Link
↓
Choose Username (OPTIONAL)
```

**Why It Is Incorrect:**
- Username is required during NFC activation
- Username should be OPTIONAL and created AFTER workspace entry
- Violates the "username is OPTIONAL" rule
- Forces username selection at wrong point in flow

**Business Impact:**
- Poor user experience (forced to choose username during activation)
- Blocks activation completion
- Doesn't match specified user journey

**Technical Impact:**
- Activation flow more complex than necessary
- Creates friction in NFC onboarding

**Recommended Fix:**
```typescript
// Make username optional during activation
<Input
  label="Username (Optional)"
  name="username"
  placeholder="Choose later in workspace"
  required={false}  // ← Make optional
  value={username}
  helper="You can create your public link later in the workspace"
/>

// Skip username in activation if not provided
// Username generation should be in workspace:
// Workspace → Generate Public Link → Choose Username
```

**Files Involved:**
- `src/features/activation/ActivationExperience.tsx`
- `src/features/activation/actions.ts`
- `src/services/activation.service.ts`
- `src/app/workspace/page.tsx` (Add username generation UI)

---

### Issue #4: Digital Customer Registration Missing Order Flow
**Severity:** CRITICAL  
**Files:** `src/app/customer/register/page.tsx`, `src/features/customer-onboarding/actions.ts`  
**Business Rule Violation:** Digital customer registration flow

**Current Implementation:**
```typescript
// src/app/customer/register/page.tsx
export default async function Page() {
  // Direct registration, no order/subscription flow
  return <CustomerAuthShell mode="register">...</CustomerAuthShell>;
}
```

**Required Behavior:**
```
Landing
↓
Registration Wizard
↓
Create Account
↓
Choose Billing (Monthly OR Yearly)
↓
Payment
↓
Receipt Upload
↓
Pending Approval
↓
Admin Approval
↓
Subscription ACTIVE
```

**Why It Is Incorrect:**
- Customer registration doesn't create an order
- No payment/proof upload step
- No admin approval for digital customers
- No subscription creation during registration
- Direct workspace access without subscription

**Business Impact:**
- Digital customers bypass the intended order flow
- No payment collection for digital subscriptions
- No approval workflow for new digital customers
- Revenue leakage (customers get free access)

**Technical Impact:**
- Database inconsistency (accounts without orders/subscriptions)
- Missing business logic for digital customer acquisition

**Recommended Fix:**
1. Create digital customer registration wizard:
   - Step 1: Account creation
   - Step 2: Billing interval selection (Monthly/Yearly)
   - Step 3: Payment proof upload
   - Step 4: Order confirmation with pending status
2. Route to order creation instead of direct workspace
3. Wait for admin approval before activation
4. Create subscription upon order approval

**Files Involved:**
- `src/app/customer/register/page.tsx` (NEW wizard flow)
- `src/features/digital-onboarding/` (NEW module)
- `src/use-cases/create-order.ts`
- `src/use-cases/approve-order.ts`

---

### Issue #5: Multiple Plans Displayed Instead of Single Plan
**Severity:** CRITICAL  
**Files:** `src/app/create-card/page.tsx`, `src/features/card-order/CreateCardFlow.tsx`  
**Business Rule Violation:** "There is ONLY ONE subscription plan"

**Current Implementation:**
```typescript
// Multiple plans displayed
function CreateCardFlow({ plans, currency }: { plans: readonly PlanDTO[] }) {
  return (
    <div className={styles.planGrid}>
      {plans.map(plan => (
        <button key={plan.id}>
          <h3>{plan.name}</h3>
          <p>{plan.description}</p>
        </button>
      ))}
    </div>
  );
}
```

**Required Behavior:**
```
"There is ONLY ONE subscription plan."
"The ONLY choice is: Monthly OR Yearly"
```

**Why It Is Incorrect:**
- Displays multiple plans from database
- Shows plan selection when only billing interval should be selectable
- Confusing product offering vs. billing frequency
- Violates business rule specification

**Business Impact:**
- Customer confusion about plan offerings
- Support burden from plan misunderstanding
- Incorrect product positioning

**Technical Impact:**
- Unnecessary complexity in order flow
- Database stores multiple plans that shouldn't exist

**Recommended Fix:**
```typescript
// Simplify to billing interval selection only
function CreateCardFlow({ plans }: { plans: readonly PlanDTO[] }) {
  // Get first (and only) plan
  const plan = plans[0];
  if (!plan) return <PlansUnavailable />;
  
  return (
    <div>
      <h2>Digital Business Card Subscription</h2>
      <p>Choose your billing frequency:</p>
      
      <BillingIntervalSelector
        monthlyPrice={plan.monthlyMinor}
        yearlyPrice={plan.yearlyMinor}
        currency={plan.currency}
      />
    </div>
  );
}
```

**Files Involved:**
- `src/app/create-card/page.tsx`
- `src/features/card-order/CreateCardFlow.tsx`
- Database migration to consolidate to single plan

---

### Issue #6: Subscription Expiration Not Checked at Runtime
**Severity:** CRITICAL  
**Files:** `src/app/workspace/page.tsx`, `src/use-cases/editor-authorization.ts`  
**Business Rule Violation:** "Subscription expiration must happen automatically"

**Current Implementation:**
```typescript
// No runtime subscription expiration check
export default async function WorkspacePage() {
  const session = (await cookies()).get("oi_customer_session")?.value;
  const account = session ? await getActivationService().accountForSession(session) : null;
  if (!account?.workspace) redirect("/customer/login");
  
  // No subscription check here!
  return <AppearanceEditor />;
}
```

**Required Behavior:**
```
"Subscription expiration must happen automatically by comparing today's date with expiresAt."
"Admin should NEVER manually expire subscriptions."
```

**Why It Is Incorrect:**
- No runtime check of `expiresAt` date
- Only cron job checks expiration (daily)
- Users can access workspace past expiration
- No automatic enforcement at request time

**Business Impact:**
- Expired customers continue to access workspace
- Service delivery after expiration
- Revenue leakage from expired access
- Manual intervention required

**Technical Impact:**
- Authorization bypass for expired subscriptions
- Security vulnerability (access after entitlement ends)
- Compliance issue (GDPR/data access after termination)

**Recommended Fix:**
```typescript
// Add runtime expiration check everywhere
function checkSubscription(subscription: Subscription | null, now: Date) {
  if (!subscription) throw new UnauthorizedError("No subscription found");
  
  if (subscription.expiresAt && subscription.expiresAt <= now) {
    // Auto-expire at runtime
    await expireSubscription(subscription.id);
    throw new ForbiddenError("Subscription expired. Please renew to continue.");
  }
  
  if (subscription.status !== 'ACTIVE') {
    throw new ForbiddenError(`Subscription is ${subscription.status.toLowerCase()}`);
  }
}

// Use in workspace, editor, and all customer-facing endpoints
export default async function WorkspacePage() {
  const account = await getAuthenticatedAccount();
  const subscription = await getActiveSubscription(account.id);
  checkSubscription(subscription, new Date());
  return <AppearanceEditor />;
}
```

**Files Involved:**
- `src/app/workspace/page.tsx`
- `src/use-cases/editor-authorization.ts`
- `src/lib/subscription-checks.ts` (NEW)
- All workspace and editor entry points

---

### Issue #7: NFC Card Link Behavior Not Implemented
**Severity:** CRITICAL  
**Files:** `src/app/a/[token]/page.tsx`, `src/services/activation.service.ts`  
**Business Rule Violation:** NFC link behavior after public profile creation

**Current Implementation:**
```typescript
// Activation redirects to workspace, not profile
export default async function ShortActivationPage({ params }: { params: Promise<{ token: string }> }) {
  const card = await service.validate(token);
  if (card.status === "ACTIVATED" && card.workspaceSlug) {
    redirect(buildProfileUrl(card.workspaceSlug));  // ← Already redirects correctly
  }
  return <ActivationExperience />;
}
```

**Required Behavior:**
```
Before generating Public URL:
NFC card → domain.com/activate/ABC123

After Public URL generation (domain.com/sherif):
NFC card → domain.com/sherif (automatically)
```

**Why It Is Incorrect:**
- The NFC card link behavior is unclear from code
- No verification that NFC chips are reprogrammed
- No documented process for updating NFC links
- Current redirect only works for initial activation

**Business Impact:**
- NFC cards don't automatically point to public profiles
- Customers confused about NFC behavior
- Support burden from NFC link questions
- Product doesn't work as specified

**Technical Impact:**
- Missing NFC link update functionality
- Database doesn't track NFC link state
- No API for NFC reprogramming

**Recommended Fix:**
```prisma
// Add NFC link state tracking
model NfcCard {
  // ... existing fields
  publicProfileSlug  String?   // @username
  linkUpdatedAt       DateTime? // When NFC was last updated
  linkStatus          NfcLinkStatus @default(ACTIVATION_URL);
}

enum NfcLinkStatus {
  ACTIVATION_URL  // Points to /a/{token}
  PUBLIC_PROFILE  // Points to /@{username}
}

// Add service method
async function updateNfcCardLink(cardId: string, username: string) {
  await db.nfcCard.update({
    where: { cardId },
    data: {
      publicProfileSlug: username,
      linkUpdatedAt: new Date(),
      linkStatus: 'PUBLIC_PROFILE'
    }
  });
  
  // Trigger NFC reprogramming via integration
  await notifyNfcReprogramming(cardId, buildProfileUrl(username));
}
```

**Files Involved:**
- `prisma/schema.prisma`
- `src/services/nfc-card.service.ts`
- `src/services/activation.service.ts`
- NFC reprogramming integration (NEW)

---

### Issue #8: Digital Customer Can't Have Subscription After NFC Activation
**Severity:** CRITICAL  
**Files:** `src/services/activation.service.ts`, database schema  
**Business Rule Violation:** "Do NOT support one account owning both Digital Subscription AND Product Activation"

**Current Implementation:**
```typescript
// System doesn't prevent mixed account types
const account = await this.repository.findAccountByEmail(value.email);
if (!account) {
  // Creates account regardless of type
  return this.activate(...);
}
```

**Required Behavior:**
```
"If someone wants both, they create another account."
```

**Why It Is Incorrect:**
- No validation to prevent mixed account types
- One account could have both NFC activation and subscription
- Database schema doesn't track account type
- No enforcement of separation

**Business Impact:**
- Accounts could have both product and subscription
- Confusing billing and entitlements
- Support complexity from mixed accounts
- Violates "simple system" principle

**Technical Impact:**
- Entitlement logic becomes complex
- Account type ambiguity in code
- Database constraint missing

**Recommended Fix:**
```prisma
// Add account type tracking
model CustomerAccount {
  id       String @id @default(uuid())
  email    String @unique
  accountType CustomerAccountType @default(DIGITAL);
  
  // ...
}

enum CustomerAccountType {
  DIGITAL  // Subscription customer
  PRODUCT  // NFC customer
}

// Add validation
async function validateAccountType(accountId: string, newType: CustomerAccountType) {
  const existing = await db.customerAccount.findUnique({ where: { id: accountId } });
  if (existing && existing.accountType !== newType) {
    throw new ConflictError(
      "Account type mismatch. Please create a separate account for this purchase."
    );
  }
}
```

**Files Involved:**
- `prisma/schema.prisma`
- `src/repositories/activation.repository.ts`
- `src/services/activation.service.ts`
- `src/use-cases/approve-order.ts`

---

## HIGH SEVERITY ISSUES

### Issue #9: No Welcome Page After Login
**Severity:** HIGH  
**Files:** `src/app/customer/login/page.tsx`  
**Business Rule Violation:** Login should redirect to Welcome Page

**Current Implementation:**
```typescript
if (session && await getActivationService().accountForSession(session))
  redirect("/workspace");  // ← No welcome page
```

**Required Behavior:**
```
If Subscription Status == ACTIVE
↓
Welcome Page
↓
Workspace
```

**Why It Is Incorrect:**
- Missing Welcome page in the flow
- Direct to workspace without onboarding
- Poor user experience for new customers

**Recommended Fix:**
Create Welcome page at `/welcome` that shows:
- Welcome message
- Quick start guide
- Link to workspace
- Only shown after first login

**Files Involved:**
- `src/app/welcome/page.tsx` (NEW)
- `src/app/customer/login/page.tsx`

---

### Issue #10: Renew Flow Not Implemented
**Severity:** HIGH  
**Files:** Renewal flow missing  
**Business Rule Violation:** Renew flow requirements

**Required Behavior:**
```
Renew
↓
Payment
↓
Receipt Upload
↓
Pending Approval
↓
Admin Approval
↓
ACTIVE
↓
New expiration date
```

**Why It Is Incorrect:**
- No renew flow exists in the codebase
- Expired customers cannot renew subscription
- No renewal order creation
- No renewal-specific approval workflow

**Business Impact:**
- Cannot convert expired customers back to active
- Revenue loss from renewals
- Poor customer experience

**Recommended Fix:**
Create renewal flow that:
1. Creates new order linked to existing subscription
2. Extends expiration upon approval
3. Doesn't create new account/workspace
4. Updates `renewedAt` timestamp

**Files Involved:**
- `src/app/renew/page.tsx` (NEW)
- `src/use-cases/renew-subscription.ts` (NEW)
- `src/use-cases/approve-order.ts` (extend for renewals)

---

### Issue #11: No Workspace Access Validation for Subscription Status
**Severity:** HIGH  
**Files:** `src/app/workspace/page.tsx`, workspace routes  
**Business Rule Violation:** Subscription-based workspace access

**Current Implementation:**
```typescript
export default async function WorkspacePage() {
  const session = (await cookies()).get("oi_customer_session")?.value;
  const account = session ? await getActivationService().accountForSession(session) : null;
  if (!account?.workspace) redirect("/customer/login");
  
  // No subscription check!
  return <main>...</main>;
}
```

**Why It Is Incorrect:**
- No subscription validation before workspace access
- Pending customers can access workspace
- Expired customers can access workspace
- No enforcement of subscription-based access

**Recommended Fix:**
```typescript
export default async function WorkspacePage() {
  const account = await getAuthenticatedAccount();
  const subscription = await getSubscription(account.workspaceId);
  
  if (!subscription || subscription.status !== 'ACTIVE') {
    redirect("/subscription-required");
  }
  
  if (subscription.expiresAt && subscription.expiresAt <= new Date()) {
    redirect("/subscription-expired");
  }
  
  return <main>...</main>;
}
```

**Files Involved:**
- `src/app/workspace/page.tsx`
- All workspace routes
- `src/middleware.ts` (or equivalent)

---

### Issue #12: Product Customer Should Not Have Subscription
**Severity:** HIGH  
**Files:** `src/use-cases/approve-order.ts`  
**Business Rule Violation:** Product customers have lifetime access

**Current Implementation:**
```typescript
const subscription = order.planId && order.billingInterval && this.createSubscription
  ? await this.createSubscription.executeIn(repositories, {...})
  : undefined;
```

**Why It Is Incorrect:**
- Creates subscription for NFC orders too
- Product customers should NOT have subscriptions
- Should have lifetime access without expiration

**Recommended Fix:**
```typescript
// Only create subscription for DIGITAL orders
const isDigitalOnly = order.package === 'DIGITAL';
const subscription = isDigitalOnly && order.planId && order.billingInterval
  ? await this.createSubscription.executeIn(repositories, {...})
  : undefined;

// NFC/DIGITAL_NFC customers skip subscription
// They get lifetime access through the card itself
```

**Files Involved:**
- `src/use-cases/approve-order.ts`
- `src/use-cases/create-order.ts`

---

### Issue #13: No Separation Between Digital and Product Customer Types
**Severity:** HIGH  
**Files:** Database schema, activation flow  
**Business Rule Violation:** Two distinct customer types

**Current Implementation:**
- Single Customer type
- No way to distinguish Digital from Product customers
- Same account flow for both types

**Required Behavior:**
```
1) DIGITAL CUSTOMER - Has subscription, expires
2) PRODUCT CUSTOMER (NFC) - Lifetime access, no subscription
```

**Recommended Fix:**
```prisma
model Customer {
  id       String @id @default(uuid())
  customerType CustomerType @default(DIGITAL);
  
  // ...
}

enum CustomerType {
  DIGITAL  // Subscription-based
  PRODUCT  // NFC-based, lifetime
}
```

**Files Involved:**
- `prisma/schema.prisma`
- All customer creation flows
- Authentication and authorization checks

---

### Issue #14: Shared Login Implementation Issues
**Severity:** HIGH  
**Files:** `src/features/customer-auth/actions.ts`, `src/features/activation/actions.ts`  
**Business Rule Violation:** "Login is shared by ALL customers"

**Current Implementation:**
- Two separate login flows (customer-auth vs activation)
- Different authentication mechanisms
- Confusing login options

**Why It Is Incorrect:**
- Login is not truly shared
- Customers have multiple login paths
- Confusing user experience

**Recommended Fix:**
Unify login to single endpoint that handles both types:
- Check if account exists
- If yes, authenticate and redirect based on customer type
- If no, redirect to registration

**Files Involved:**
- `src/app/login/page.tsx` (unified)
- `src/app/customer/login/page.tsx` (remove)
- Consolidate authentication logic

---

### Issue #15: Workspace Welcome State Shows Incorrectly
**Severity:** HIGH  
**Files:** `src/app/workspace/page.tsx`  
**Business Rule Violation:** Workspace welcome behavior

**Current Implementation:**
```typescript
const cards = account.workspace.cards ?? [];
return (
  <main>
    {cards.length
      ? <WorkspaceCardLauncher cards={cards} />
      : <WorkspaceWelcome displayName={displayName} />}
  </main>
);
```

**Why It Is Incorrect:**
- Shows welcome for all customers with no cards
- Digital customers need different onboarding than NFC
- No subscription status consideration

**Recommended Fix:**
Show different states based on:
1. Customer type (Digital vs Product)
2. Subscription status
3. Card count
4. Onboarding completion

**Files Involved:**
- `src/app/workspace/page.tsx`
- `src/features/customer-onboarding/`

---

### Issue #16: No Validation That Digital Customer Has Subscription
**Severity:** HIGH  
**Files:** Multiple entry points  
**Business Rule Violation:** Digital customers require active subscription

**Why It Is Incorrect:**
- Digital customers can access without subscription
- No enforcement of subscription requirement
- Violates business model

**Recommended Fix:**
Add subscription check middleware for all customer-facing routes.

**Files Involved:**
- All workspace and builder routes
- `src/middleware.ts` (or equivalent)

---

### Issue #17: Order Approval Creates Multiple Cards Without Type Consideration
**Severity:** HIGH  
**Files:** `src/use-cases/approve-order.ts`  
**Business Rule Violation:** Card creation per order type

**Current Implementation:**
```typescript
for (let index = 0; index < order.quantity; index++) {
  cards.push(await this.createCard.executeIn(repositories, {...}));
}
```

**Why It Is Incorrect:**
- Creates multiple cards for all order types
- NFC cards should come from inventory, not be created
- Should validate against available NFC inventory

**Recommended Fix:**
```typescript
if (order.package === 'DIGITAL_NFC') {
  // Validate NFC inventory availability
  const availableNfc = await repositories.nfc.countAvailable();
  if (availableNfc < order.quantity) {
    throw new ValidationError(`Only ${availableNfc} NFC cards available`);
  }
  
  // Link to existing NFC cards, not create new ones
  for (let index = 0; index < order.quantity; index++) {
    const nfcCard = await repositories.nfc.reserveNext();
    await linkCardToNfc(nfcCard.id, card.id);
  }
} else {
  // DIGITAL orders create virtual cards only
  for (let index = 0; index < order.quantity; index++) {
    cards.push(await this.createCard.executeIn(repositories, {...}));
  }
}
```

**Files Involved:**
- `src/use-cases/approve-order.ts`
- `src/repositories/nfc-card.repository.ts`

---

### Issue #18: No Public URL Generation in Workspace
**Severity:** HIGH  
**Files:** `src/app/workspace/page.tsx`  
**Business Rule Violation:** Username generation after workspace entry

**Required Behavior:**
```
Workspace
↓
Generate Public Link
↓
Choose Username (OPTIONAL)
↓
Check Availability
↓
Generate Public URL
```

**Why It Is Incorrect:**
- No "Generate Public Link" action in workspace
- Username required during activation only
- Can't create or change username later
- Missing business rule implementation

**Recommended Fix:**
Add username management to workspace:
1. "Generate Public Link" button/section
2. Username availability check
3. Optional username creation
4. Update NFC card link after creation

**Files Involved:**
- `src/app/workspace/page.tsx`
- `src/features/username-management/` (NEW)
- `src/use-cases/change-username.ts` (NEW)

---

### Issue #19: Admin Authentication Security Issues
**Severity:** HIGH  
**Files:** `src/lib/auth.js`  
**Security Vulnerability:** Weak authentication

**Current Implementation:**
```javascript
async authorize(credentials) {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin";
  
  if (credentials.username === adminUser && 
      credentials.password === adminPass) {
    return { id: user.id, name: user.name, email: user.email };
  }
  return null;
}
```

**Why It Is Incorrect:**
- Plain text password comparison
- Default credentials "admin"/"admin"
- No password hashing
- No rate limiting
- No account lockout

**Recommended Fix:**
```javascript
import bcrypt from 'bcrypt';

async authorize(credentials) {
  const adminHash = await getAdminPasswordHash();
  const isValid = await bcrypt.compare(credentials.password, adminHash);
  
  if (!isValid) {
    await trackFailedLogin(credentials.username);
    if (await shouldLockout(credentials.username)) {
      await lockoutAccount(credentials.username);
    }
    return null;
  }
  
  return { id: user.id, name: user.name, email: user.email };
}
```

**Files Involved:**
- `src/lib/auth.js`
- Add admin password hashing

---

### Issue #20: No CSRF Protection on Server Actions
**Severity:** HIGH  
**Files:** All server actions  
**Security Vulnerability:** Missing CSRF protection

**Current Implementation:**
```typescript
"use server";
export async function approveOrderAction(orderId: string) {
  const email = await authorizeAdmin();
  // No CSRF validation
  const result = await getOrderMutationUseCases().approveOrder.execute({ orderId });
  // ...
}
```

**Why It Is Incorrect:**
- No CSRF tokens validated
- Vulnerable to cross-site request forgery
- Server actions are POST endpoints without CSRF protection

**Recommended Fix:**
Implement CSRF token validation for all server actions.

**Files Involved:**
- All server action files
- `src/lib/csrf.ts` (NEW)

---

## MEDIUM SEVERITY ISSUES

### Issue #21: No Rate Limiting on Access Code Verification
**Severity:** MEDIUM  
**Files:** `src/use-cases/verify-access-code.ts`, `src/use-cases/create-editor-session.ts`

**Why It Is Incorrect:**
- No rate limiting on access code verification
- Could allow brute force attacks
- Only activation flow has rate limiting

**Recommended Fix:**
Implement IP-based and account-based rate limiting.

---

### Issue #22: In-Memory Rate Limiting Not Persistent
**Severity:** MEDIUM  
**Files:** `src/features/activation/actions.ts`, `src/features/customer-auth/actions.ts`

**Why It Is Incorrect:**
```typescript
const attempts = new Map<string, { count: number; resetAt: number }>();
```
- Lost on server restart
- Not distributed across instances
- Can be bypassed

**Recommended Fix:**
Use Redis or database-backed rate limiting.

---

### Issue #23: Session Token Exposure in Responses
**Severity:** MEDIUM  
**Files:** `src/features/customer-access/actions.ts`

**Why It Is Incorrect:**
```typescript
export type CustomerAccessResult = {
  token: string;  // Exposed in response
  expiresAt: string;
}
```

**Recommended Fix:**
Use HTTP-only cookies instead of returning tokens in responses.

---

### Issue #24: No Centralized Authorization Middleware
**Severity:** MEDIUM  
**Files:** Route handlers

**Why It Is Incorrect:**
- Each route implements own authorization
- Error-prone and inconsistent
- No centralized policy

**Recommended Fix:**
Implement middleware-based authorization.

---

### Issue #25: File Upload Validation Insufficient
**Severity:** MEDIUM  
**Files:** `src/app/api/upload/route.js`

**Why It Is Incorrect:**
- Only checks content-type header
- No magic byte verification
- No dimension validation

**Recommended Fix:**
Add proper file validation using magic bytes and image processing.

---

### Issue #26: Weak Default Secrets
**Severity:** MEDIUM  
**Files:** `src/lib/auth.js`, `.env.example`

**Why It Is Incorrect:**
```javascript
secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only"
```

**Recommended Fix:**
Throw error if secret not configured in production.

---

### Issue #27: No Account Lockout After Failed Attempts
**Severity:** MEDIUM  
**Files:** `src/lib/auth.js`

**Why It Is Incorrect:**
- No lockout mechanism for admin login
- Infinite brute force attempts possible

**Recommended Fix:**
Implement account lockout after N failed attempts.

---

### Issue #28: Path Traversal Protection Insufficient
**Severity:** MEDIUM  
**Files:** `src/services/supabase-storage.provider.ts`

**Why It Is Incorrect:**
```typescript
const safe = input.key.replace(/^\/+/, "").replace(/\.\./g, "");
```
- Doesn't handle URL-encoded variants
- Doesn't use whitelist approach

**Recommended Fix:**
Implement comprehensive path sanitization.

---

### Issue #29: Information Disclosure in Error Messages
**Severity:** MEDIUM  
**Files:** Various

**Why It Is Incorrect:**
Some error messages reveal internal state.

**Recommended Fix:**
Use generic error messages externally.

---

### Issue #30: Missing Security Headers
**Severity:** MEDIUM  
**Files:** `next.config.js`

**Why It Is Incorrect:**
No CSP, X-Frame-Options, etc.

**Recommended Fix:**
Add security headers configuration.

---

## LOW SEVERITY ISSUES

### Issue #31: No Audit Trail for Customer Actions
**Severity:** LOW  
**Files:** Customer-facing actions

**Why It Is Incorrect:**
- No audit logging for customer actions
- Only admin actions are audited

**Recommended Fix:**
Add audit logging for critical customer actions.

---

### Issue #32: No Request ID Tracing
**Severity:** LOW  
**Files:** API routes

**Why It Is Incorrect:**
- Limited request tracing
- Difficult debugging

**Recommended Fix:**
Enhance request ID propagation.

---

### Issue #33: Error Handling Inconsistent
**Severity:** LOW  
**Files:** Various

**Why It Is Incorrect:**
- Different error handling patterns
- Inconsistent error responses

**Recommended Fix:**
Standardize error handling.

---

### Issue #34: No Performance Monitoring
**Severity:** LOW  
**Files:** Application-wide

**Why It Is Incorrect:**
- No performance metrics
- No monitoring in place

**Recommended Fix:**
Add performance monitoring.

---

## ARCHITECTURAL ISSUES

### Architecture Misalignment

**Issue:** Current architecture doesn't support Digital vs. Product customer differentiation

**Current:**
```
Customer → Workspace → Cards
```

**Required:**
```
Customer (Type: DIGITAL/PRODUCT)
  ↓
DIGITAL: Order → Approval → Subscription → Workspace
PRODUCT: Activation → Lifetime → Workspace
```

**Recommendation:**
Re-architect customer creation flows to support two distinct paths.

---

### Database Schema Issues

**Issue:** Schema doesn't enforce business rules at database level

**Missing Constraints:**
1. Customer type enforcement
2. Subscription required for Digital customers
3. NFC inventory validation
4. Username uniqueness with proper rules

**Recommendation:**
Add constraints and triggers to enforce business rules.

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Critical Business Rules (Must Complete First)

- [ ] Fix subscription status enum to use PENDING_APPROVAL, ACTIVE, EXPIRED
- [ ] Implement subscription-based login redirects
- [ ] Make username optional during activation
- [ ] Create digital customer order/subscription flow
- [ ] Implement single plan with billing interval selection
- [ ] Add runtime subscription expiration checks
- [ ] Implement NFC link update behavior
- [ ] Add account type tracking (DIGITAL vs PRODUCT)

### Phase 2: Authorization & Access Control

- [ ] Implement centralized authorization middleware
- [ ] Add subscription checks to workspace entry
- [ ] Create Welcome page flow
- [ ] Implement renew flow
- [ ] Add CSRF protection
- [ ] Fix admin authentication

### Phase 3: Security Enhancements

- [ ] Implement rate limiting
- [ ] Add file upload validation
- [ ] Implement session token security
- [ ] Add account lockout
- [ ] Implement security headers

### Phase 4: User Experience

- [ ] Create username management in workspace
- [ ] Implement public URL generation flow
- [ ] Create subscription pending/expired pages
- [ ] Add onboarding flows

### Phase 5: Data Integrity

- [ ] Add database constraints
- [ ] Implement audit logging
- [ ] Add request tracing
- [ ] Implement error handling standardization

---

## DEPENDENCY MAP

```
Phase 1 (Critical Business Rules)
├── Fix subscription status
│   └── Blocks: All subscription-dependent code
├── Implement login redirects
│   └── Blocks: Welcome page, workspace access
├── Make username optional
│   └── Blocks: Activation flow
└── Create digital order flow
    └── Blocks: Digital customer acquisition

Phase 2 (Authorization)
├── Centralized middleware
│   └── Blocks: All protected routes
├── Subscription checks
│   └── Blocks: Workspace access
└── CSRF protection
    └── Blocks: Server actions

Phase 3 (Security)
├── Rate limiting
│   └── Independent (can run parallel)
├── File upload validation
│   └── Independent
└── Admin authentication
    └── Independent

Phase 4 (UX)
├── Username management
│   └── Requires: Phase 1 complete
├── Public URL generation
│   └── Requires: Phase 1 complete
└── Pending/expired pages
    └── Requires: Phase 2 complete

Phase 5 (Data Integrity)
├── Database constraints
│   └── Requires: Phase 1 complete
└── Audit logging
    └── Independent
```

---

## RECOMMENDED EXECUTION ORDER

1. **Week 1:** Critical business rules (Phase 1)
   - Database migration for subscription status
   - Fix login redirects
   - Update activation flow

2. **Week 2:** Authorization layer (Phase 2)
   - Implement middleware
   - Add subscription checks
   - CSRF protection

3. **Week 3:** Security (Phase 3)
   - All security enhancements

4. **Week 4:** User experience (Phase 4)
   - All UX improvements

5. **Week 5:** Data integrity (Phase 5)
   - All data integrity improvements

---

## ARCHITECTURAL RISKS

### Critical Risks (Must Resolve Before New Features)

1. **Business Logic Mismatch**
   - Current implementation doesn't match business rules
   - Risk: Building features on wrong foundation

2. **Subscription Foundation Weak**
   - Subscription model doesn't support required behavior
   - Risk: Cannot support business model

3. **Authorization Scattered**
   - No centralized authorization
   - Risk: Security vulnerabilities, inconsistent behavior

### High Risks

1. **Database Schema Misalignment**
   - Schema doesn't enforce business rules
   - Risk: Data integrity issues

2. **Security Vulnerabilities**
   - Multiple security issues identified
   - Risk: Compromised system

---

## CONCLUSION

The current implementation has **significant misalignment** with the specified business rules. The system requires substantial refactoring to match requirements:

1. **Subscription model** needs complete redesign
2. **Customer flows** need separation (Digital vs. Product)
3. **Authorization** needs centralization
4. **Security** needs enhancement

**Recommendation:** Complete Phase 1 (Critical Business Rules) before adding any new features. The current foundation will cause increasing technical debt if business rule misalignments are not addressed.

**Overall Assessment:** NOT PRODUCTION READY in current state due to critical business logic violations and security vulnerabilities.

---

*This audit was conducted on 2026-07-23 and covers the codebase as of that date.*

# OI Platform - Comprehensive Security Audit Report

**Audit Date:** 2026-07-23  
**Auditor:** Claude (Opus 4.8)  
**Scope:** Full codebase security review

---

## Executive Summary

This security audit identified **12 security vulnerabilities** across the OI Platform codebase, including **3 CRITICAL** and **3 HIGH** severity issues that require immediate attention. The most significant concerns involve weak admin authentication, missing CSRF protection, and inadequate rate limiting.

### Severity Breakdown
- **CRITICAL:** 3 issues
- **HIGH:** 3 issues  
- **MEDIUM:** 4 issues
- **LOW:** 2 issues

---

## Critical Severity Issues

### 1. Weak Admin Authentication System
**File:** `src/lib/auth.js`  
**Severity:** CRITICAL  
**CWE:** CWE-522 (Insufficiently Protected Credentials)

**Description:**
The admin authentication system has multiple fundamental security flaws:

```javascript
async authorize(credentials) {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin";
  
  if (credentials.username === adminUser && credentials.password === adminPass) {
    return { id: user.id, name: user.name, email: user.email };
  }
  return null;
}
```

**Issues:**
- Admin credentials stored in environment variables as plain text
- No password hashing - direct string comparison
- Default fallback to "admin"/"admin" credentials for development
- No rate limiting on login attempts
- No account lockout mechanism
- No password complexity requirements

**Impact:** An attacker who gains access to the server environment or discovers default credentials can obtain full administrative access to the platform.

**Recommendation:**
```javascript
// 1. Implement proper password hashing
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(credentials.password, 12);
const isValid = await bcrypt.compare(adminHashedPassword, hashedPassword);

// 2. Add rate limiting (e.g., 5 attempts per 15 minutes)
// 3. Add account lockout after 10 failed attempts
// 4. Remove default credentials fallback
// 5. Implement password complexity requirements
```

---

### 2. No Rate Limiting on Access Code Verification
**Files:** 
- `src/use-cases/verify-access-code.ts`
- `src/use-cases/create-editor-session.ts`

**Severity:** CRITICAL  
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Description:**
The access code verification endpoints have no rate limiting mechanisms:

```typescript
export class VerifyAccessCode {
  async execute(input: VerifyAccessCodeInput): Promise<VerifiedAccessCodeDTO> {
    const data = parseUseCaseInput(verifyAccessCodeSchema, input);
    const hash = await this.hasher.hash(data.code);
    // No rate limiting check here
    const accessCode = await accessCodes.findByHash(hash);
    // ...
  }
}
```

While the activation flow has in-memory rate limiting (`activationAttempts` Map), the main access code verification does not. This could allow:
- Brute force attacks on 26-character access codes
- Dictionary attacks against the HMAC verification
- DoS attacks through repeated verification attempts

**Impact:** Attackers could attempt to brute force access codes, potentially gaining unauthorized access to customer cards.

**Recommendation:**
```typescript
// 1. Implement distributed rate limiting (Redis-based)
// 2. Add IP-based rate limiting (10 attempts per minute)
// 3. Add card-based rate limiting (5 failed attempts locks card for 1 hour)
// 4. Log all failed attempts for monitoring
// 5. Implement CAPTCHA after 3 failed attempts
```

---

### 3. Missing CSRF Protection
**Files:** All server actions in `src/features/`  
**Severity:** CRITICAL  
**CWE:** CWE-352 (Cross-Site Request Forgery)

**Description:**
Server actions throughout the application lack CSRF protection:

```typescript
"use server";
export async function approveOrderAction(orderId: string) {
  const email = await authorizeAdmin();
  // No CSRF token validation
  const result = await getOrderMutationUseCases().approveOrder.execute({ orderId });
  // ...
}
```

No CSRF tokens are validated on any server actions, including:
- Order approval/cancellation
- Subscription management
- Plan operations
- Card mutations
- Access code generation

**Impact:** Attackers could trick authenticated users into performing unwanted actions through malicious websites or links.

**Recommendation:**
```typescript
// 1. Implement CSRF token generation and validation
import { CSRF } from '@/lib/csrf';

export async function approveOrderAction(orderId: string, csrfToken: string) {
  if (!CSRF.validate(csrfToken)) {
    throw new ForbiddenError("Invalid CSRF token");
  }
  // ... rest of action
}

// 2. Use Next.js built-in CSRF protection if available
// 3. Implement SameSite cookie attribute
// 4. Consider using double-submit cookie pattern
```

---

## High Severity Issues

### 4. In-Memory Rate Limiting (Not Persistent)
**File:** `src/features/activation/actions.ts`  
**Severity:** HIGH  
**CWE:** CWE-298 (Improper Validation of Integrity Check Value)

**Description:**
The activation rate limiting uses an in-memory Map:

```typescript
const activationAttempts = new Map<string, { count: number; resetAt: number }>();
```

**Issues:**
- Not persistent across server restarts
- Not distributed across multiple server instances
- Lost on deployment/restart
- Can be bypassed by rotating through different IPs

**Impact:** Rate limiting can be bypassed, allowing brute force attacks on activation tokens.

**Recommendation:**
```typescript
// Use Redis or database-backed rate limiting
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'activation_limit',
  points: 12,
  duration: 900, // 15 minutes
});
```

---

### 5. Session Token Exposure in Responses
**Files:**
- `src/features/customer-access/actions.ts`
- `src/use-cases/create-editor-session.ts`

**Severity:** HIGH  
**CWE:** CWE-200 (Exposure of Sensitive Information)

**Description:**
Editor session tokens are returned in API responses:

```typescript
export type CustomerAccessResult = {
  ok: true;
  cardId: string;
  slug: string;
  token: string;  // ← Exposed in response
  expiresAt: string;
}
```

**Issues:**
- Tokens visible in browser developer tools
- Stored in browser memory
- Can be accessed by malicious JavaScript
- Logged in server logs
- Potential for token leakage through Referer headers

**Impact:** Session tokens could be stolen through XSS attacks or browser extensions.

**Recommendation:**
```typescript
// Use HTTP-only cookies instead
cookies().set('editor_session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  expires: expiresAt,
  path: '/workspace',
});

// Remove token from response body
export type CustomerAccessResult = {
  ok: true;
  cardId: string;
  slug: string;
  // token removed - use cookie instead
}
```

---

### 6. No Centralized Authorization Middleware
**Files:** All route handlers  
**Severity:** HIGH  
**CWE:** CWE-306 (Missing Authentication for Critical Function)

**Description:**
Each route and server action implements its own authorization:

```typescript
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  // No middleware-based authorization
  return handlePublicCardMutationRoute(request, async () => {
    // Manual authorization in each handler
    const authorization = await getWorkspaceAdminAuthorization();
    // ...
  });
}
```

**Issues:**
- Error-prone manual implementation
- No centralized policy enforcement
- Easy to forget authorization checks
- No audit trail of authorization decisions
- Difficult to review security posture

**Impact:** Authorization checks could be missed, leading to unauthorized access.

**Recommendation:**
```typescript
// src/middleware.ts
export function authMiddleware() {
  return async (request: Request) => {
    const session = await getSession(request);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Continue to handler
  };
}

// Apply to protected routes
export const config = {
  matcher: '/admin/:path*',
};
```

---

## Medium Severity Issues

### 7. Insufficient File Upload Validation
**File:** `src/app/api/upload/route.js`  
**Severity:** MEDIUM  
**CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)

**Description:**
File upload validation only checks content-type header:

```javascript
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
if (!allowed.has(file.type)) {
  return NextResponse.json({ message: "Only JPG, PNG, and WEBP files are supported" }, { status: 415 });
}
```

**Issues:**
- Content-type header can be spoofed
- No magic byte verification
- No image dimension validation
- No virus/malware scanning
- No file content sanitization
- 10 MB limit might be too large for some contexts

**Impact:** Malicious files could be uploaded disguised as images, potentially leading to:
- Stored XSS attacks
- Server-side exploitation
- Storage exhaustion

**Recommendation:**
```javascript
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

// 1. Verify file by magic bytes
const buffer = await file.arrayBuffer();
const fileType = await fileTypeFromBuffer(buffer);
if (!['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)) {
  throw new Error('Invalid file type');
}

// 2. Validate image dimensions
const metadata = await sharp(buffer).metadata();
if (metadata.width > 4096 || metadata.height > 4096) {
  throw new Error('Image too large');
}

// 3. Sanitize/optimize image
const optimized = await sharp(buffer)
  .resize(2048, 2048, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

---

### 8. Weak Default Secrets
**File:** `src/lib/auth.js`  
**Severity:** MEDIUM  
**CWE:** CWE-1240 (Use of a Weak Password)

**Description:**
NextAuth secret has weak default:

```javascript
secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only"
```

**Issues:**
- Predictable fallback secret in production
- Session tokens could be forged
- JWT signatures could be compromised

**Impact:** Session hijacking and privilege escalation if fallback is used in production.

**Recommendation:**
```javascript
// Throw error if not configured
const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new ConfigurationError(
    "NEXTAUTH_SECRET must be set in production"
  );
}
if (secret.length < 32) {
  throw new ConfigurationError(
    "NEXTAUTH_SECRET must be at least 32 characters"
  );
}
```

---

### 9. No Account Lockout After Failed Attempts
**File:** `src/lib/auth.js`  
**Severity:** MEDIUM  
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Description:**
No account lockout mechanism for failed admin login attempts.

**Impact:** Brute force attacks against admin accounts can proceed indefinitely.

**Recommendation:**
```typescript
// Implement account lockout
const failedAttempts = new Map<string, { count: number; lockedUntil: Date }>();

async function checkAccountLockout(email: string) {
  const attempts = failedAttempts.get(email);
  if (attempts && attempts.lockedUntil > Date.now()) {
    throw new ForbiddenError("Account locked. Try again later.");
  }
}
```

---

### 10. Path Traversal Protection Insufficient
**File:** `src/services/supabase-storage.provider.ts`  
**Severity:** MEDIUM  
**CWE:** CWE-22 (Improper Limitation of a Pathname to a Restricted Directory)

**Description:**
Path sanitization is insufficient:

```typescript
const safe = input.key.replace(/^\/+/, "").replace(/\.\./g, "");
```

**Issues:**
- Only removes `..` sequences
- Doesn't handle URL-encoded variants (`%2e%2e`)
- Doesn't handle Unicode variations
- Doesn't validate against a whitelist

**Impact:** Potential path traversal attacks in storage operations.

**Recommendation:**
```typescript
import { normalize, join } from 'path';

function sanitizePath(key: string): string {
  // Decode URL encoding first
  const decoded = decodeURIComponent(key);
  
  // Normalize path
  const normalized = normalize(decoded).replace(/^\.+/, '');
  
  // Validate against whitelist
  if (!/^[a-zA-Z0-9/_-]+$/.test(normalized)) {
    throw new Error('Invalid path');
  }
  
  // Ensure it doesn't escape base directory
  const resolved = join('/uploads', normalized);
  if (!resolved.startsWith('/uploads/')) {
    throw new Error('Path traversal detected');
  }
  
  return normalized;
}
```

---

## Low Severity Issues

### 11. Information Disclosure in Error Messages
**Files:** Various  
**Severity:** LOW  
**CWE:** CWE-209 (Information Exposure Through Error Messages)

**Description:**
Some error messages reveal internal state:

```typescript
throw new Error("Platform repository is not configured");
```

**Impact:** Could reveal system architecture to attackers.

**Recommendation:**
Use generic error messages externally, log details internally.

---

### 12. Missing Security Headers
**File:** Next.js configuration  
**Severity:** LOW  
**CWE:** CWE-693 (Protection Mechanism Failure)

**Description:**
No security headers configured:

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy

**Recommendation:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        },
      ],
    }];
  },
};
```

---

## Positive Security Findings

The following security practices were observed and are commendable:

1. **Strong Access Code Generation**: Uses `crypto.getRandomValues()` for cryptographically secure random access codes
2. **Proper HMAC Hashing**: Access codes are hashed using HMAC-SHA256 with a 32-byte minimum key
3. **Session Token Security**: Editor session tokens use SHA-256 hashing and are 64-character hex strings
4. **Input Validation**: Comprehensive Zod schemas throughout the application
5. **SQL Injection Protection**: Prisma ORM prevents SQL injection through parameterized queries
6. **Secure Credential Storage**: Customer passwords use proper salt and hash storage
7. **Error Handling**: 500 errors properly masked in HTTP responses
8. **Audit Logging**: Admin actions are logged with actor identification

---

## Recommendations Summary

### Immediate Actions (Critical)
1. Implement proper password hashing for admin authentication
2. Add rate limiting to all authentication endpoints
3. Implement CSRF protection for all server actions

### Short-term Actions (High)
4. Migrate to persistent rate limiting (Redis)
5. Move session tokens to HTTP-only cookies
6. Implement centralized authorization middleware

### Medium-term Actions (Medium)
7. Enhance file upload validation with magic byte checking
8. Remove default secrets and enforce configuration
9. Implement account lockout mechanism

### Long-term Actions (Low)
10. Implement comprehensive security headers
11. Add CSP policies
12. Enhance error message sanitization

---

## Testing Recommendations

1. **Penetration Testing**: Conduct regular penetration tests focusing on:
   - Authentication bypasses
   - CSRF vulnerabilities
   - Rate limiting effectiveness

2. **Code Review**: Implement mandatory security code review for:
   - All authentication changes
   - New server actions
   - File upload handling

3. **Dependency Scanning**: Regular scans for:
   - Known vulnerabilities (npm audit)
   - Outdated dependencies
   - License compliance

4. **Security Monitoring**: Implement monitoring for:
   - Failed authentication attempts
   - Rate limiting triggers
   - Unusual admin actions

---

## Conclusion

The OI Platform has a solid foundation with good use of modern security practices (HMAC hashing, Zod validation, Prisma ORM). However, critical vulnerabilities in admin authentication, missing CSRF protection, and inadequate rate limiting require immediate attention.

The layered architecture and use of repository patterns provide a good foundation for implementing the recommended security improvements.

**Overall Risk Level: HIGH** - Due to critical vulnerabilities in authentication and authorization mechanisms.

---

*This audit was conducted on 2026-07-23 and covers the codebase as of that date. Regular security audits should be conducted as the platform evolves.*

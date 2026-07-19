# CODING_STANDARDS.md

# Coding Standards

Version: 1.0

---

# General

Use TypeScript.

Avoid any.

Prefer explicit types.

---

# Naming

Components

PascalCase

Example

CustomerCard.tsx

Hooks

useSomething

Example

useCustomers.ts

Utilities

camelCase

Example

generateSlug.ts

Constants

UPPER_CASE

---

# Components

Keep components small.

One responsibility.

Maximum recommended length

200 lines.

Extract reusable parts.

---

# Functions

Keep functions focused.

Prefer pure functions.

Avoid side effects.

---

# API

Always validate input.

Never trust client data.

Return consistent JSON.

---

# Database

Never write raw SQL unless necessary.

Use Prisma.

Safe migrations only.

---

# Error Handling

Never ignore errors.

Return meaningful messages.

Log unexpected failures.

---

# Imports

External packages

↓

Internal modules

↓

Relative imports

---

# Comments

Explain WHY.

Avoid explaining obvious code.

---

# Performance

Lazy load where possible.

Memoize only when needed.

Avoid unnecessary renders.

---

# Accessibility

Semantic HTML.

Keyboard support.

ARIA labels.

---

# Git

Small commits.

Clear messages.

One feature per commit.

---

# Documentation

Every architecture change updates docs.

Never leave docs outdated.

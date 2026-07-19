# ARCHITECTURE.md

# OI Cards Architecture

Version: 1.0

---

# Overview

OI Cards follows a layered architecture.

UI

↓

Business Logic

↓

API

↓

Prisma ORM

↓

PostgreSQL

Each layer has one responsibility.

---

# Project Structure

app/

components/

lib/

hooks/

prisma/

public/

docs/

---

# Responsibilities

## app/

Contains

- Pages
- Layouts
- API Routes

No reusable UI.

---

## components/

Reusable UI components.

Examples

- Button
- Card
- Dialog
- Avatar
- QR
- Theme Components

---

## lib/

Business logic

Examples

- slug generation
- analytics
- authentication
- helpers
- validation

---

## hooks/

Reusable React hooks.

---

## prisma/

Database schema

Migrations

Seed

---

## docs/

Project documentation.

---

# Architecture Rules

Business logic never belongs inside UI components.

Database access only through Prisma.

API routes should remain thin.

Validation before database operations.

No duplicated logic.

---

# Data Flow

Browser

↓

React Component

↓

API Route

↓

Validation

↓

Business Logic

↓

Prisma

↓

Database

---

# Folder Standards

components/

UI only

lib/

Logic only

app/api/

HTTP only

---

# Reusability

Every reusable feature belongs in components or lib.

Never duplicate code.

---

# Future Expansion

Version 2

- Multi-company
- Multi-tenant
- Team accounts
- Plugin system

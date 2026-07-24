# OI PLATFORM v1
## Product Specification

Version: 1.0
Status: Approved
Owner: Product Architecture

---

# Vision

OI Platform enables professionals and businesses to own, manage, and share a modern digital identity using NFC, QR codes, and a customizable public profile.

OI is not a website builder.

OI is not only a digital business card.

OI is a Digital Identity Platform.

---

# Product Goals

The platform should allow a customer to:

- Order a digital card
- Receive an NFC-enabled card
- Activate it securely
- Edit their digital identity
- Share it instantly
- Measure engagement

The platform should allow administrators to operate the entire business from one dashboard.

---

# User Roles

## Visitor

A visitor has never purchased a card.

Can:

- Browse landing page
- View pricing
- Order a card
- View public cards

Cannot:

- Edit
- Access Workspace
- Access Admin

---

## Customer

Owns one or more cards.

Can:

- Access Workspace
- Edit profile
- Edit appearance
- Manage links
- Publish changes

Cannot:

- Access Admin
- Manage platform

---

## Administrator

Operates the platform.

Can:

- Manage customers
- Fulfill orders
- Issue cards
- Generate access codes
- View analytics
- Manage platform settings

Does not use Workspace as the normal editing interface.

---

# Product Surfaces

There are exactly three user experiences.

## Public Website

/

Marketing only.

Purpose:

Sell the product.

---

## Customer Workspace

/workspace

Purpose:

Manage owned cards.

---

## Public Card

/c/[slug]

Purpose:

Share identity.

---

## Admin Platform

/admin

Purpose:

Operate the business.

---

# Navigation

## Public

/

Features

Pricing

How It Works

FAQ

Create New Card

Access Your Workspace

---

## Customer

Workspace

Appearance

Profile

Social Links

Media

Publishing

---

## Admin

Dashboard

Orders

Customers

Cards

Issued Cards

Analytics

Settings

---

# Product Lifecycle

Visitor

↓

Create Order

↓

Pending Review

↓

Approved

↓

Customer Created

↓

Card Created

↓

Access Code Issued

↓

Card Printed

↓

Delivered

↓

Activated

↓

Workspace Access

↓

Published

↓

Active

↓

Suspended (optional)

↓

Archived (optional)

---

# Card Lifecycle

Draft

↓

Configured

↓

Issued

↓

Activated

↓

Published

↓

Active

↓

Archived

---

# Access Code Lifecycle

Generated

↓

Issued

↓

Used

↓

Expired

↓

Revoked

---

# Order Lifecycle

Draft

↓

Submitted

↓

Pending

↓

Approved

↓

Fulfilled

↓

Completed

↓

Cancelled

---

# Security Principles

Plaintext access codes are never stored.

Workspace always requires authorization.

Public pages never expose private data.

Administrator authentication is isolated from customer authentication.

Customers cannot access administration routes.

Visitors cannot access Workspace.

---

# Architecture Principles

Domain Layer owns business rules.

Repositories only persist data.

Use Cases execute commands.

Query layer reads data.

Renderer consumes DTOs only.

Themes never access the database.

Workspace never imports Admin code.

Admin never imports Workspace UI.

---

# Business Principles

Every purchased card belongs to exactly one customer.

Every customer may own multiple cards.

Every card has exactly one active public slug.

Every issued access code belongs to one card.

Only one active editor session per device is required.

Publishing never requires administrator approval after activation.

---

# Future Modules

Orders

Payments

Subscriptions

Teams

Organizations

Media Library

Analytics

Notifications

Audit Logs

API

White Label

---

# Definition of Done

A feature is complete only if:

- Domain rules exist
- Use cases exist
- Authorization exists
- UI exists
- Tests pass
- Architecture rules remain intact
- Documentation updated

---

# Non Goals (v1)

Marketplace

Chat

CRM

Email marketing

AI assistant

Multi-tenancy

These may arrive in future versions but are intentionally excluded from v1.

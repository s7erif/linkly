# PROJECT_SPEC.md

# OI Cards Platform

Version: 1.0

Status: Planning

Author: Sherif Osman

---

# Project Vision

OI Cards is a modern Digital NFC Business Card Platform.

The platform enables businesses to create, manage, and publish unlimited digital business cards for customers.

Each NFC card links to a beautiful, responsive public profile that works on any device.

The platform is designed for companies that sell NFC cards and need a professional management dashboard.

---

# Main Objectives

- Modern UI
- Fast Performance
- Mobile First
- NFC Ready
- QR Code Support
- Unlimited Customers
- Beautiful Templates
- White Label Ready
- Easy Administration

---

# Target Users

Current Version

- Small Businesses
- Marketing Agencies
- Print Shops
- NFC Card Sellers
- Personal Branding Services

Future Versions

- Large Companies
- Teams
- Organizations
- Multi-Tenant SaaS

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js API Routes

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- NextAuth

## Deployment

- Vercel
- Self Hosted

---

# User Roles

## Version 1

Only one role exists.

### Admin

The administrator owns the dashboard.

Permissions

- Login
- Create Customers
- Edit Customers
- Delete Customers
- Disable Customers
- Manage Themes
- Manage Company Settings
- View Analytics

No customer login exists in Version 1.

---

# Customer

Each customer owns exactly one digital business card.

Customer Information

- Full Name
- Job Title
- Company
- Bio
- Phone
- WhatsApp
- Email
- Website
- Address
- Profile Image
- Cover Image
- Theme
- Public URL
- QR Code

---

# Public Business Card

Each customer has a public page.

Example

/c/dr-mostafa

The page contains

- Profile Photo
- Cover Image
- Name
- Job Title
- Company
- Bio
- Contact Buttons
- Social Links
- QR Code
- Share Button
- Save Contact (vCard)
- Powered By Footer

---

# Dashboard

The dashboard includes:

## Overview

- Total Customers
- Active Cards
- Disabled Cards
- Total Views
- QR Scans
- Recent Activity

---

## Customers

Functions

- Add Customer
- Edit Customer
- Delete Customer
- Disable Customer
- Duplicate Customer
- Search Customers
- Copy Public Link
- Download QR
- Preview Card

---

## Themes

Manage available templates.

Default Themes

- Medical
- Corporate
- Business
- Developer
- Photographer

Future Themes

- Restaurant
- Lawyer
- Beauty
- Real Estate
- Fitness
- Education

---

## Analytics

Per Customer

- Total Views
- QR Scans
- Link Clicks
- Last Visit

---

## Company Settings

- Company Name
- Logo
- Website
- WhatsApp
- Facebook
- Instagram
- Footer Text
- Brand Colors

---

# Public Features

Every public page supports

- Call
- WhatsApp
- Email
- Website
- Google Maps
- Share
- Save Contact
- QR Code

---

# Theme Requirements

Every theme must

- Support Mobile
- Support Desktop
- Support Arabic
- Support English
- Support Dark Mode
- Support Light Mode

Themes should use reusable React components.

No custom HTML editing.

---

# Branding

Every public page displays

- Company Logo
- Powered by OI Cards
- Company Website

Branding should be configurable.

---

# Performance Goals

Lighthouse

Performance ≥ 95

Accessibility ≥ 95

SEO ≥ 95

Best Practices ≥ 95

---

# Security

- NextAuth Authentication
- Prisma Validation
- Zod Validation
- CSRF Protection
- XSS Protection
- Rate Limiting
- Secure API Design

---

# Future Roadmap

Version 2

- Multiple Companies
- Team Members
- Roles & Permissions
- Booking System
- Gallery
- Videos
- PDF Attachments
- Contact Forms
- CRM Integration
- Google Reviews
- Lead Collection

---

# Coding Standards

- TypeScript Strict Mode
- Reusable Components
- Server Components by Default
- Client Components Only When Necessary
- Clean Folder Structure
- Feature-Based Organization
- Modular Architecture
- Strong Typing
- Minimal Code Duplication

---

# Development Workflow

Every feature should follow this workflow

1. Planning
2. Database
3. API
4. UI
5. Testing
6. Documentation
7. Review
8. Commit

No feature should skip any step.

---

# Project Phases

✅ Phase 1

Project Cleanup

⬜ Phase 2

Database Refactor

⬜ Phase 3

Dashboard Refactor

⬜ Phase 4

Customer Management

⬜ Phase 5

Public Business Card

⬜ Phase 6

Themes

⬜ Phase 7

Analytics

⬜ Phase 8

Branding

⬜ Phase 9

Testing & Deployment

---

# Definition of Done

The project is considered complete when

- Admin can manage unlimited customers.
- Every customer has a unique public page.
- Every customer has a QR Code.
- Every customer supports Save Contact.
- Dashboard is fully responsive.
- Analytics are working.
- Themes are configurable.
- Branding is configurable.
- The application is production ready.

---

# AI Development Rules

Any AI assistant working on this project must

- Read all files in the `/docs` directory before making changes.
- Never modify unrelated files.
- Never redesign existing UI without approval.
- Never create breaking database migrations.
- Update documentation after architecture changes.
- Generate a task report after every completed task.
- Stop after each task and wait for approval before continuing.

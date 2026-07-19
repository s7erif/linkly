# API_SPEC.md

# OI Cards API Specification

Version: 1.0

Status: Planning

---

# API Principles

All APIs must:

- Return JSON
- Use proper HTTP status codes
- Validate input
- Use Prisma ORM
- Never expose sensitive data
- Use authentication where required
- Return consistent response format

Standard Response

Success

{
  "success": true,
  "data": {}
}

Error

{
  "success": false,
  "message": "Error message"
}

---

# Authentication

Authentication

Managed بواسطة NextAuth.

Protected Routes

/dashboard/*
/api/admin/*
/api/customers/*
/api/settings/*
/api/themes/*

Public Routes

/c/[slug]
/api/public/*
/api/qr/*
/api/vcard/*

---

# Customers API

## Get All Customers

GET

/api/customers

Authentication

Required

Returns

- Customer list
- Pagination
- Total count

---

## Get Customer

GET

/api/customers/:id

Authentication

Required

Returns

Customer details.

---

## Create Customer

POST

/api/customers

Authentication

Required

Body

- name
- title
- company
- bio
- phone
- whatsapp
- email
- website
- address
- avatar
- coverImage
- templateId

Rules

- Generate slug
- Generate urlHash
- Create default analytics

---

## Update Customer

PUT

/api/customers/:id

Authentication

Required

Updates customer data.

---

## Delete Customer

DELETE

/api/customers/:id

Authentication

Required

Cascade delete

- SocialLinks
- Analytics

---

## Toggle Active

PATCH

/api/customers/:id/status

Authentication

Required

Updates

isActive

---

# Social Links API

## List

GET

/api/customers/:id/social-links

---

## Create

POST

/api/customers/:id/social-links

Body

- platform
- url
- order

---

## Update

PUT

/api/social-links/:id

---

## Delete

DELETE

/api/social-links/:id

---

## Reorder

PATCH

/api/customers/:id/social-links/order

Body

[
 { id, order }
]

---

# Public API

## Get Public Card

GET

/api/public/:slug

Authentication

Not Required

Returns

Public customer information.

Hidden

- userId
- internal IDs
- admin data

---

## Record View

POST

/api/public/:slug/view

Purpose

Increase pageViews.

---

## Record QR Scan

POST

/api/public/:slug/qr

Purpose

Increase qrScans.

---

## Record Link Click

POST

/api/public/:slug/click

Body

- platform

Purpose

Increase linkClicks.

---

# QR API

## Generate QR

GET

/api/qr/:slug

Returns

PNG

Future

SVG

---

## Download QR

GET

/api/qr/:slug/download

---

# vCard API

## Generate Contact

GET

/api/vcard/:slug

Returns

.vcf file

Contains

- Name
- Company
- Phone
- Email
- Website
- Address

---

# Analytics API

## Dashboard Analytics

GET

/api/analytics

Authentication

Required

Returns

- Total Views
- QR Scans
- Link Clicks
- Active Cards

---

## Customer Analytics

GET

/api/analytics/:customerId

Authentication

Required

Returns

- Views
- QR Scans
- Link Clicks
- Last Visit

---

# Themes API

## List Themes

GET

/api/themes

---

## Get Theme

GET

/api/themes/:id

---

## Update Theme

PUT

/api/themes/:id

Authentication

Required

Admin only.

---

# Company Settings API

## Get Settings

GET

/api/settings

Authentication

Required

---

## Update Settings

PUT

/api/settings

Authentication

Required

Body

- companyName
- logo
- footer
- website
- whatsapp
- facebook
- instagram
- primaryColor
- secondaryColor

---

# Upload API

## Upload Image

POST

/api/upload

Authentication

Required

Supported

- JPG
- PNG
- WEBP
- SVG

Maximum Size

5 MB

Returns

Image URL

---

# Validation

Every endpoint must use

- Zod validation
- Prisma validation
- TypeScript types

---

# Error Codes

200 OK

201 Created

204 Deleted

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Security

- Rate limiting
- Input validation
- CSRF protection
- XSS prevention
- SQL Injection protection (via Prisma)
- Authentication checks
- Authorization checks

---

# API Versioning

Current Version

v1

Future

/api/v2

Breaking changes must only be introduced in a new API version.

---

# Development Rules

Every new API endpoint must:

- Have input validation.
- Return the standard response format.
- Be fully typed.
- Be documented here.
- Be tested before merging.

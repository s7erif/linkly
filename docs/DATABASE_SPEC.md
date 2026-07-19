# DATABASE_SPEC.md

# OI Cards Database Specification

Version: 1.0

---

# Overview

The database is designed for a Digital NFC Business Card Platform.

One administrator manages many customer cards.

Each BusinessCard represents one customer.

No customer authentication exists in Version 1.

---

# Models

## User

Purpose:

Dashboard administrator.

Relationships

User

↓

Many BusinessCards

Fields

- id
- name
- email
- image
- password (if used)
- createdAt
- updatedAt

Rules

- One admin can own unlimited BusinessCards.
- Authentication handled by NextAuth.

---

## BusinessCard

Purpose

Represents one NFC digital business card.

Relationships

Belongs to one User.

Has many SocialLinks.

Has many Analytics records.

Fields

- id
- userId

Identity

- slug (unique)
- urlHash (immutable)

Personal

- name
- title
- company
- bio

Contact

- phone
- whatsapp
- email
- website
- address

Media

- avatar
- coverImage

Appearance

- templateId

Status

- isActive

Dates

- createdAt
- updatedAt

Rules

- slug must be unique.
- urlHash never changes.
- slug may change.
- isActive controls public visibility.

---

## SocialLink

Purpose

Stores one social/contact link.

Relationship

Belongs to one BusinessCard.

Fields

- id
- businessCardId
- platform
- url
- order
- createdAt

Platforms

- phone
- whatsapp
- email
- website
- facebook
- instagram
- linkedin
- github
- youtube
- tiktok
- telegram
- snapchat
- x

Rules

Unlimited links.

Ordered by "order".

---

## Analytics

Purpose

Stores visits and interactions.

Fields

- id
- businessCardId

Counters

- pageViews
- qrScans
- linkClicks

Dates

- lastVisit
- createdAt

Rules

Analytics never affects BusinessCard data.

---

# Relationships

User

↓

BusinessCard

↓

SocialLinks

↓

Analytics

---

# URL Strategy

Internal

urlHash

Never changes.

Public

slug

May change.

Example

Internal

ab92fk31

Public

dr-mostafa

---

# Delete Policy

Deleting a BusinessCard deletes

- SocialLinks
- Analytics

Cascade delete.

Deleting a User deletes

- BusinessCards
- SocialLinks
- Analytics

Cascade delete.

---

# Indexes

BusinessCard.slug

Unique

BusinessCard.urlHash

Unique

SocialLink.businessCardId

Indexed

Analytics.businessCardId

Indexed

---

# Future Models

Version 2

- Theme
- Company
- Team
- Role
- Booking
- Gallery
- Lead
- Form
- Review
- File

No implementation in Version 1.

---

# Database Principles

- No duplicated data.
- Normalize relations.
- Preserve data integrity.
- Safe migrations only.
- No destructive migrations without approval.

# UI_SPEC.md

# OI Cards UI Specification

Version: 1.0

Status: Planning

---

# UI Principles

The interface must be

- Modern
- Clean
- Responsive
- Mobile First
- Fast
- Accessible
- Consistent

---

# Design Language

Style

- Minimal
- Professional
- Soft Shadows
- Rounded Corners
- Smooth Animations

Border Radius

12px–16px

Spacing

8px Grid System

Icons

Lucide Icons

Animations

Framer Motion (optional)

---

# Layout

Desktop

---------------------------------------

Sidebar

Main Content

---------------------------------------

Mobile

Header

↓

Content

↓

Bottom Navigation (Future)

---

# Dashboard Pages

## Login

Components

- Logo
- Welcome Text
- Email
- Password
- Login Button

---

## Dashboard Home

Widgets

- Total Customers
- Active Cards
- Disabled Cards
- Total Views
- QR Scans

Recent Activity

Quick Actions

---

## Customers

Table Columns

- Avatar
- Name
- Company
- Phone
- Status
- Views
- Last Updated
- Actions

Actions

- View
- Edit
- Delete
- Disable
- Copy Link
- Download QR

Features

- Search
- Filters
- Pagination
- Bulk Selection (Future)

---

## Create Customer

Sections

### Basic Information

- Name
- Job Title
- Company
- Bio

---

### Contact

- Phone
- WhatsApp
- Email
- Website
- Address

---

### Images

- Profile Image
- Cover Image

---

### Theme

- Theme Selector

---

### Social Links

Dynamic List

Add

Remove

Reorder

---

### Publish

- Active Switch

Buttons

- Save
- Cancel

---

## Edit Customer

Same layout as Create Customer.

---

## Themes

Cards Grid

Each card shows

- Preview
- Name
- Description
- Use Theme

---

## Analytics

Cards

- Views
- QR
- Clicks

Charts

- Daily Views
- Weekly Views
- Monthly Views

Table

Recent Visits

---

## Company Settings

Sections

General

- Company Name
- Logo

Brand

- Primary Color
- Secondary Color

Footer

- Footer Text

Social

- Website
- Facebook
- Instagram
- WhatsApp

---

# Public Card

Layout

Top

Cover Image

↓

Avatar

↓

Name

↓

Job Title

↓

Company

↓

Bio

↓

Contact Buttons

↓

Social Links

↓

QR Code

↓

Share Button

↓

Save Contact

↓

Powered By

---

# Contact Buttons

Priority

1. Phone

2. WhatsApp

3. Email

4. Website

5. Maps

Buttons

Large

Rounded

Icon + Label

---

# Social Links

Grid

or

Vertical List

Platforms

- Facebook
- Instagram
- LinkedIn
- GitHub
- YouTube
- TikTok
- Telegram
- X
- Snapchat

---

# QR Section

Contains

QR Image

Buttons

- Download
- Share

---

# Save Contact

Button

Downloads

VCF File

---

# Empty States

Every page should display

- Illustration
- Message
- Action Button

Example

"No customers yet"

Button

Create Customer

---

# Loading States

Use

- Skeletons
- Spinner

Never show empty white pages.

---

# Error States

Display

- Friendly Message
- Retry Button

---

# Modals

Used for

- Delete Confirmation
- Disable Confirmation
- QR Preview

---

# Notifications

Toast Messages

Success

Error

Warning

Info

---

# Colors

Primary

Configurable

Secondary

Configurable

Danger

Red

Success

Green

Warning

Orange

Info

Blue

---

# Typography

Headings

Bold

Body

Regular

Buttons

Medium

---

# Responsive Rules

Desktop

>=1024px

Tablet

768–1023px

Mobile

<=767px

---

# Accessibility

All buttons

Accessible labels

Keyboard Navigation

Required

Focus States

Visible

Color Contrast

WCAG AA

---

# Performance

Lazy Loading

Images

Required

Dynamic Imports

Preferred

Optimize Assets

Required

---

# Future UI

Version 2

- Dark Mode Switch
- Theme Marketplace
- Drag & Drop Builder
- Custom Sections
- AI Assistant
- Multi-language Dashboard

---

# Development Rules

Every new component must

- Be reusable
- Be responsive
- Be typed
- Support loading state
- Support error state
- Follow project design language

Never duplicate components.

Prefer composition over duplication.

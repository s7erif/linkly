# THEMES_SPEC.md

# OI Cards Theme Specification

Version: 1.0

Status: Planning

---

# Purpose

This document defines how themes should be built.

Every theme must follow the same architecture.

Only the visual appearance changes.

Business logic never changes.

---

# Theme Principles

Every theme must be

- Responsive
- Mobile First
- Accessible
- Fast
- Reusable
- RTL Ready
- LTR Ready

---

# Shared Components

Every theme uses the same data.

The layout may change.

Shared data includes

- Cover Image
- Avatar
- Name
- Job Title
- Company
- Bio
- Contact Buttons
- Social Links
- QR Code
- Save Contact
- Share Button
- Powered By

---

# Theme Structure

Each theme should contain

/components/themes/

medical/

corporate/

business/

developer/

photographer/

Every folder contains

- Theme.tsx
- Header.tsx
- ContactButtons.tsx
- SocialLinks.tsx
- Footer.tsx

Optional

- Hero.tsx
- About.tsx
- Gallery.tsx

---

# Theme Interface

Every theme must receive exactly the same props.

Example

ThemeProps

- businessCard
- socialLinks
- analytics (optional)
- settings

No theme should fetch its own data.

---

# Required Sections

Every theme must include

Header

↓

Profile

↓

Contact Buttons

↓

Social Links

↓

QR Code

↓

Share

↓

Save Contact

↓

Footer

---

# Contact Buttons

Always display

Phone

WhatsApp

Email

Website

Maps (if available)

Buttons

Large

Rounded

Icon + Label

---

# Social Links

Supported platforms

- Facebook
- Instagram
- LinkedIn
- GitHub
- X
- YouTube
- TikTok
- Telegram
- Snapchat

Rules

Hide empty links.

Keep display order.

---

# QR Section

Contains

QR Image

Actions

- Download
- Share

---

# Save Contact

Exports

VCF

Contains

- Name
- Phone
- Email
- Company
- Website
- Address

---

# Theme Configuration

Each theme supports

- Primary Color
- Secondary Color
- Background Color
- Surface Color
- Text Color
- Button Style
- Border Radius

No hardcoded colors.

---

# Theme Variants

Each theme supports

Light

Dark

Auto (Future)

---

# Typography

Headings

Bold

Body

Regular

Buttons

Medium

Readable on mobile.

---

# Images

Avatar

Square

Recommended

512x512

Cover

16:9

Recommended

1600x900

Lazy loading required.

---

# Medical Theme

Audience

Doctors

Clinics

Hospitals

Style

- Clean
- White
- Blue
- Trustworthy
- Professional

Optional Sections

- Clinic Hours
- Specialization
- Google Maps
- Appointment Button (Future)

---

# Corporate Theme

Audience

Companies

Managers

Sales

Style

- Elegant
- Professional
- Structured

Focus

Brand identity.

---

# Business Theme

Audience

Entrepreneurs

Small Businesses

Freelancers

Style

- Friendly
- Modern
- Conversion-focused

---

# Developer Theme

Audience

Software Engineers

Cybersecurity

Designers

Features

GitHub

Portfolio

LinkedIn

Resume Button

Projects

---

# Photographer Theme

Audience

Photographers

Videographers

Creators

Features

Gallery

Instagram

Portfolio

Booking Button (Future)

---

# Future Themes

Version 2

- Restaurant
- Lawyer
- Beauty Salon
- Gym
- Real Estate
- Teacher
- Consultant
- Artist

---

# Theme Rules

Themes must

- Never duplicate business logic.
- Never fetch API data.
- Never modify database data.
- Only render UI.

---

# Component Rules

Reusable components

Preferred

Examples

Button

Card

Avatar

Badge

QR

Section

Divider

---

# Animations

Allowed

- Fade
- Slide
- Scale

Avoid

Heavy animations.

---

# Performance

Target

Lighthouse

Performance ≥95

Accessibility ≥95

SEO ≥95

Best Practices ≥95

---

# Accessibility

Keyboard Navigation

Required

Focus States

Required

ARIA Labels

Required

Color Contrast

WCAG AA

---

# Future Features

Version 2

- Theme Marketplace
- Theme Import/Export
- Premium Themes
- Live Theme Builder
- Custom CSS (Admin Only)

---

# Development Rules

Every new theme must

- Reuse existing components.
- Follow ThemeProps.
- Support mobile first.
- Support Arabic and English.
- Pass accessibility checks.
- Pass Lighthouse targets.
- Be documented before implementation.

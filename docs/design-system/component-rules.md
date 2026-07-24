# OI Platform — Component Rules

Version: 1.0

---

# Purpose

This document defines how every UI component should be designed and used across the OI Platform.

The goal is consistency.

Every component should behave predictably.

Never invent new component patterns when an existing one already solves the problem.

---

# Design Philosophy

Components should be:

- Reusable
- Predictable
- Minimal
- Accessible
- Consistent

Every component belongs to the Design System.

No page-specific UI unless absolutely necessary.

---

# Component Hierarchy

Components are divided into four levels.

## Level 1

Primitives

Examples

Button

Input

Badge

Avatar

Checkbox

Switch

Icon

Spinner

Divider

These are never aware of business logic.

---

## Level 2

Composed Components

Examples

Search Bar

Table Toolbar

Metric Card

Customer Row

Navigation Item

Empty State

Skeleton

Confirmation Dialog

These combine primitives.

---

## Level 3

Feature Components

Examples

Customer Table

Subscription Panel

Workspace Preview

Order Timeline

Quick Actions

Business Health

Feature components understand business concepts.

---

## Level 4

Page Sections

Examples

Dashboard Hero

Customer Toolbar

Analytics Section

Orders Section

Settings Groups

These organize multiple Feature Components.

---

# Buttons

Every page should have:

One Primary Button.

Optional Secondary Buttons.

Ghost Buttons for low-priority actions.

Never use more than one competing Primary Button.

---

## Primary Button

Purpose:

Main action.

Examples

Add Customer

Create Workspace

Save

Checkout

Should immediately attract attention.

---

## Secondary Button

Purpose:

Supporting action.

Examples

Export

Import

Preview

Duplicate

Should never compete with Primary.

---

## Ghost Button

Purpose:

Low priority actions.

Examples

Copy

Open

Share

View

---

## Destructive Button

Reserved only for dangerous actions.

Examples

Delete

Cancel Subscription

Reset Workspace

Always require confirmation.

---

# Inputs

Inputs should:

Use labels.

Not rely on placeholders.

Have visible focus.

Display errors below the field.

Never overload with helper text.

---

# Search

Every management page has one primary search.

Search always appears above the Data Grid.

Never hide search inside menus.

---

# Filter Chips

Preferred over large dropdowns.

Good for:

Status

Plan

Category

Renewal

Type

Should support:

Selected

Hover

Disabled

---

# Cards

Cards group related information.

Cards should never become containers for entire pages.

Preferred structure:

Card

↓

Header

↓

Body

↓

Optional Footer

Avoid nesting multiple cards.

---

# KPI Cards

Used only for meaningful metrics.

Every KPI includes:

Icon

Title

Value

Context

Optional Trend

Never show empty KPI cards.

If data is unavailable:

Hide the KPI.

---

# Data Grid

The Data Grid is the most important component in management pages.

Rules

Flat surface.

Comfortable rows.

Minimal borders.

Strong hover.

Consistent spacing.

Semantic badges.

Never place excessive buttons inside rows.

---

# Row Actions

Preferred:

Overflow Menu

Alternative:

Right Drawer

Avoid:

Five inline buttons.

---

# Drawers

Drawers are preferred for quick management.

Suitable for:

Customer

Order

Workspace

Card

Subscription

Keep editing inside Drawers whenever practical.

---

# Tables

Tables should prioritize readability.

Always include:

Hover

Selection

Sorting

Pagination

Responsive stacking

Never use glass.

---

# Badges

Badges communicate state.

Never use badges as decoration.

Examples

Active

Expired

Pending

Monthly

Yearly

Cancelled

Success

Warning

Danger

Neutral

Only semantic colors.

---

# Avatars

Always show:

Initials

Or image.

Keep sizes consistent.

Never distort images.

---

# Icons

Icons support meaning.

Never replace labels.

Keep consistent stroke width.

---

# Dialogs

Dialogs are for:

Confirmation

Short Forms

Warnings

Never place large workflows inside dialogs.

---

# Wizards

Use Wizards when:

The task contains multiple logical steps.

Examples

Create Customer

Checkout

Workspace Setup

Never create Wizards for one-page forms.

---

# Empty States

Every Empty State contains:

Illustration

Title

Explanation

Primary Action

Optional Secondary Action

Always encourage the next step.

---

# Skeletons

Every major page should have dedicated Skeletons.

Skeletons must resemble the final layout.

Avoid generic placeholders.

---

# Tooltips

Use only when necessary.

Never explain obvious UI.

Keep under one sentence.

---

# Notifications

Toast

Success

Info

Warning

Dialog

Dangerous actions

Never interrupt users unnecessarily.

---

# Loading

Prefer:

Skeleton

↓

Optimistic Update

↓

Spinner

Large blocking spinners should be avoided.

---

# Forms

Single-column whenever possible.

Group related fields.

Avoid extremely long forms.

Break long workflows into steps.

---

# Sections

Every section should answer one question.

Avoid mixing unrelated content.

One purpose per section.

---

# Mobile Rules

Collapse filters.

Stack table rows.

Move actions into menus.

Keep primary action visible.

---

# Desktop Rules

Maximize productivity.

Use horizontal space.

Reduce scrolling.

Prioritize content.

---

# Component Quality Checklist

Every new component must satisfy:

✓ Accessible

✓ Responsive

✓ Keyboard Friendly

✓ Dark Mode

✓ Light Mode

✓ Reduced Motion

✓ Design Tokens

✓ No hardcoded colors

✓ No duplicated styles

✓ Reusable

✓ Proper loading state

✓ Proper empty state

✓ Error state

✓ Success state

---

# Anti Patterns

Never:

✗ Glass tables

✗ Nested cards

✗ More than one Primary Button

✗ Huge empty Hero sections

✗ Decorative colors

✗ Random shadows

✗ Page-specific buttons

✗ Deep component nesting

✗ Unlabeled icons

✗ Hidden primary actions

✗ Huge forms without grouping

---

# OI Component Standard

Every component should feel:

Simple enough to understand in seconds.

Powerful enough for professional workflows.

Beautiful enough to represent the OI Platform.

Consistency is always more valuable than uniqueness.

When in doubt:

Reuse.

Do not reinvent.

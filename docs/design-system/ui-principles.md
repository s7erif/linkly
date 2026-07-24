# OI Platform — UI Principles

Version: 1.0

---

# Purpose

This document defines how interfaces should behave across the OI Platform.

The goal is consistency.

Every page should feel like it belongs to the same product.

When multiple UI solutions are possible, follow these principles instead of inventing new patterns.

---

# Core Philosophy

The interface should prioritize:

1. Speed
2. Clarity
3. Predictability
4. Consistency

Users should never have to guess where something is.

The same action should always look and behave the same way.

---

# Page Types

Every page belongs to one category.

Never mix patterns unnecessarily.

---

## Dashboard Pages

Purpose:

Understand the business.

Typical content:

- Hero
- KPI Cards
- Analytics
- Recent Activity
- Insights
- Alerts

Dashboards answer:

"What is happening?"

---

## Management Pages

Purpose:

Manage large collections of data.

Examples:

Customers

Orders

Products

Cards

Subscriptions

Workspaces

Primary focus:

Search

↓

Filters

↓

Data Grid

↓

Bulk Actions

↓

Details Drawer

The table is always the most important element.

---

## Detail Pages

Purpose:

Manage one entity.

Examples:

Customer Profile

Order Details

Workspace

Subscription

Should contain:

Overview

Tabs

Timeline

Actions

Related Data

---

## Settings Pages

Purpose:

Configure the system.

Prefer grouped settings.

Never create long forms without sections.

---

# Hero Rules

Heroes introduce pages.

They should not dominate them.

Dashboard:

Large Hero.

Management:

Compact Hero.

Settings:

Usually no Hero.

Never waste vertical space.

---

# KPI Rules

Only display KPIs when they help decision making.

Do NOT display empty KPI cards.

Avoid placeholder statistics.

If metrics are unavailable:

Hide them.

Or replace with compact summaries.

---

# Search

Every management page should have one primary search.

Search should always appear above the table.

Never hide search inside menus.

Search should cover:

Name

ID

Email

Workspace

Activation Code

Other important identifiers.

---

# Filters

Filters reduce results.

Search finds results.

Never confuse the two.

Prefer filter chips.

Avoid deep filter forms.

Important filters remain visible.

Advanced filters may collapse.

---

# Data Grid

The Data Grid is the primary management interface.

Rules:

Large width.

Comfortable row height.

Readable typography.

Consistent spacing.

Strong hover state.

Minimal decoration.

Always support:

Sorting

Pagination

Selection

Responsive layout

---

# Row Actions

Do not place many buttons inside rows.

Preferred:

Overflow Menu

or

Right Drawer

Rows should stay clean.

---

# Bulk Actions

Appear only after rows are selected.

Never show bulk actions permanently.

---

# Drawers

Drawers are preferred over separate pages.

Use Drawers when:

Viewing details

Quick editing

Previewing data

Managing a single item

Avoid navigation whenever possible.

---

# Full Pages

Use a dedicated page only when:

The workflow is complex.

Many sections exist.

Long forms are required.

Heavy editing is required.

---

# Modals

Use Modals only for:

Confirmation

Small forms

Warnings

Short tasks

Never build entire workflows inside Modals.

---

# Wizards

Use Wizards when:

Creating Customers

Creating Workspaces

Checkout

Multi-step onboarding

Never use Wizards for one-step forms.

---

# Tabs

Use Tabs only when content naturally separates.

Examples:

Overview

Orders

Subscription

Activity

Workspace

Do not create excessive tabs.

Prefer 3–6 tabs.

---

# Forms

Forms should feel lightweight.

Prefer:

Single-column layouts

Logical grouping

Clear labels

Minimal helper text

Avoid unnecessary validation noise.

---

# Buttons

Every screen should have:

One Primary Action.

Optional Secondary Actions.

Unlimited Ghost Actions.

Avoid multiple competing primary buttons.

---

# Empty States

Every empty state should answer:

Why is this empty?

What should I do next?

Include:

Illustration

Explanation

Primary Action

Optional Secondary Action

---

# Loading

Prefer Skeletons.

Skeletons should match final layout.

Avoid large loading spinners.

---

# Notifications

Use Toasts for:

Success

Info

Warnings

Do not interrupt users unnecessarily.

Critical actions may use Dialogs.

---

# Confirmations

Require confirmation only for:

Delete

Cancel Subscription

Reset Data

Permanent Actions

Do not confirm harmless actions.

---

# Icons

Icons support labels.

Never replace labels.

Keep icon size consistent.

---

# Navigation

Users should always know:

Where they are.

Where they came from.

How to return.

Navigation should feel predictable.

---

# Mobile

Never hide functionality.

Reorganize it.

Tables may stack.

Filters may collapse.

Actions may move into menus.

---

# Desktop

Desktop should maximize productivity.

Use available width.

Reduce unnecessary scrolling.

---

# Accessibility

Always support:

Keyboard navigation

Visible focus

Semantic HTML

Screen readers

Reduced Motion

High Contrast

Accessibility is not optional.

---

# Performance

Avoid unnecessary rendering.

Prefer Server Components.

Avoid duplicated data fetching.

Avoid layout shifts.

Keep interactions responsive.

---

# UX Rules

Always:

✓ Reduce clicks

✓ Reduce scrolling

✓ Reduce confusion

✓ Keep layouts predictable

✓ Use familiar interaction patterns

✓ Prioritize content over decoration

✓ Keep primary actions obvious

Never:

✗ Hide important actions

✗ Use nested modals

✗ Overuse drawers

✗ Create inconsistent layouts

✗ Introduce new UI patterns without justification

✗ Sacrifice usability for aesthetics

---

# OI Interaction Philosophy

The interface should disappear.

Users should focus on their work.

Not on learning the interface.

Every interaction should feel natural.

Every page should feel familiar.

Every workflow should reduce effort.

Consistency is more valuable than creativity.

If a new design is beautiful but less usable, choose usability.

The best interface is the one users stop noticing.

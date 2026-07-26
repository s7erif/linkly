# Tapp Workspace V2 — UX Review & Approved Improvements

**Status:** Approved for Implementation
**Date:** 2026-07-25
**Type:** UX Improvements (architectural preservation)

---

## Executive Summary

Approved UX improvements that preserve the existing query-based routing architecture (`/workspace?slug=`) while fixing critical user experience issues.

**Scope:** Minimal file changes, no route restructuring, architectural preservation.

---

## Approved Implementation List

### 1. Fix Browser History

**Current issue:** `router.replace()` destroys history stack

**Fix:** Change to `router.push()` for user-initiated navigation

**Files to modify:**
- `src/components/workspace/inspector/card-selector.tsx`
- `src/components/workspace/workspace-card-selector.tsx`

**Change:**
```typescript
// Before
router.replace(buildWorkspaceBuilderPath(slug));

// After
router.push(buildWorkspaceBuilderPath(slug));
```

---

### 2. Add Unsaved-Changes Guard

**Current issue:** No warning before losing unsaved work

**Fix:** Add confirmation dialog before navigation when dirty

**Files to create:**
- `src/components/workspace/unsaved-changes-dialog.tsx`

**Files to modify:**
- `src/components/workspace/inspector/card-selector.tsx`
- `src/components/workspace/workspace-card-selector.tsx`

**Implementation:**
- Check `useCardEditorStore((s) => s.saveState === "dirty")` before navigation
- Show dialog if dirty
- Only navigate if user confirms discard

---

### 3. Add "← All Cards" Breadcrumb

**Current issue:** No way to return to card list from editor

**Fix:** Add breadcrumb in sidebar when editing a card

**Files to modify:**
- `src/components/workspace/shell/sidebar.tsx`

**Implementation:**
- Show "← All Cards" button above card selector when slug exists
- Clicking navigates to `/workspace` (no slug)
- Uses `router.push()` for history

---

### 4. Unify Card Selector Behavior

**Current issue:** Two selectors with different session handling

**Fix:** Both selectors use same session creation logic

**Files to modify:**
- `src/components/workspace/inspector/card-selector.tsx`

**Implementation:**
- Sidebar selector also calls `openCustomerCardAction()` → `storeEditorSession()`
- No direct `router.push()` without session check
- Consistent behavior with center canvas selector

---

### 5. Improve Loading, Empty, and Error States

**Current issue:** Generic states without clear messaging

**Fix:** Enhance state components with better messaging

**Files to modify:**
- `src/components/workspace/preview/preview-states.tsx`
- `src/components/workspace/empty-workspace.tsx`
- `src/components/workspace/save-announcer.tsx`

**Implementation:**
- Clearer messaging for empty workspace
- Better loading indicators
- Friendly error messages with retry options

---

### 6. Improve Save Feedback

**Current issue:** Save status is subtle, auto-save isn't visible

**Fix:** Clear save status indication in toolbar

**Files to modify:**
- `src/components/workspace/shell/toolbar.tsx`
- `src/components/workspace/save-announcer.tsx`

**Implementation:**
- Prominent save status badge
- "Saving..." → "Saved" → "Unsaved" states
- Error state with retry
- Timestamp on last save

---

## What is NOT Changing

- Query-based routing: `/workspace?slug=` remains
- No route restructuring or dynamic routes
- No backend changes
- No architectural refactoring
- No 500ms auto-save (manual save only)
- Existing URL structure preserved

---

## Implementation Order

1. **Loading/Empty/Error States** — No dependencies
2. **Save Feedback** — No dependencies
3. **Browser History Fix** — Simple router.push change
4. **Unsaved-Changes Guard** — Depends on save state
5. **Breadcrumb** — Depends on router
6. **Unify Card Selectors** — Depends on guard

---

## File Change Summary

**New files:**
- `src/components/workspace/unsaved-changes-dialog.tsx`

**Modified files:**
- `src/components/workspace/shell/toolbar.tsx`
- `src/components/workspace/shell/sidebar.tsx`
- `src/components/workspace/inspector/card-selector.tsx`
- `src/components/workspace/workspace-card-selector.tsx`
- `src/components/workspace/preview/preview-states.tsx`
- `src/components/workspace/empty-workspace.tsx`
- `src/components/workspace/save-announcer.tsx`

**Total: 1 new, 7 modified**

---

*End of Approved UX Review*

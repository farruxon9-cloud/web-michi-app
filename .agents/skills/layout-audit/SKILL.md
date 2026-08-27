---
name: layout-audit
description: Design system layout and CSS invariants validator protocol for MichiApp. Use to audit and verify that floating dock clearance, 14px side margins, 24px/20px border radii, scroll restoration, and zero component-mount scrollIntoView rules (Rules 18-23) are strictly followed across all components.
---

# 📐 Layout & CSS Invariants Audit Skill (`layout-audit`)

This skill documents the automated layout and design system verification protocol for MichiApp.

## 📋 Core Layout Invariants Checked

1. **Rule 18 (Floating Bottom Nav Standard):**
   - Margin: `left: var(--screen-margin-x, 14px)` and `width: calc(100% - 28px)`.
   - Radius: `border-radius: 24px`.
   - Stacking: `z-index: 300`.
   - Height: `72px` with `bottom: 12px` (total top edge at `84px`).

2. **Rule 20 (Design System Token & Radius Uniformity):**
   - Bento Action Cards: `border-radius: 24px; border: 1px solid var(--glass-border);`.
   - Bento Content Cards: `border-radius: 20px; border: 1px solid var(--glass-border);`.
   - CSS Variables: All colors use `:root` CSS tokens (`var(--primary)`, `var(--glass-border)`). No hardcoded hex values.

3. **Rule 22 (No Component-Mount `scrollIntoView` Invariant):**
   - Zero `targetEl.scrollIntoView()` calls on inner child tabs or cards upon mount or selection.
   - Inner overflow containers use `container.scrollTo({ left: offset })` for horizontal tab scrolling.

4. **Rule 23 (Floating Dock Clearance & Exact Scroll Restoration):**
   - Sub-Page Spacer: All sub-page content lists (`.profile-menu`, `.notif-list`) include `<div style={{ height: '84px', minHeight: '84px', width: '100%', flexShrink: 0 }} />` so bottom cards (e.g. Sound Settings) sit with an exact 14px mathematical symmetry gap above `BottomNav`.
   - Exact Scroll Restoration: Main Profile scroll position is saved into `savedMainScroll` and restored upon returning (`handleBackToMain`).

## 🛠️ Automated Execution Command

Run the layout validator anytime or at session start/closing:

```bash
node scripts/validate_layout.mjs
```

Or run the complete health check suite:

```bash
node scripts/health_check.mjs
```

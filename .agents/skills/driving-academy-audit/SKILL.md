---
name: driving-academy-audit
description: Dedicated Page Skill for MichiApp Driving Academy (教習所) page. Covers school catalog grid, search/filtering, detail modal view, floating sticky apply CTA, 14px side margins, and application submit workflow.
---

# 🎓 Driving Academy Page Audit Skill (`driving-academy-audit`)

This skill defines the complete visual structure, spacing invariants, interactive buttons, and state mechanics for the **Driving Academy (教習所)** page and detail views.

## 📐 1. Visual Layout & Spacing Standards
- **Outer Container:** `.academy-container` (`padding: 16px 14px 120px 14px`).
- **School Cards:** `.school-card { border-radius: 20px; border: 1px solid var(--glass-border); padding: 16px; margin-bottom: 14px; }`.
- **Side Margins:** Exact `14px` left/right margins (`width: calc(100% - 28px)`).
- **Floating Sticky Action Bar:** `.school-sticky-actions` (`position: fixed; bottom: 96px; left: 14px; right: 14px; border-radius: 24px; z-index: 250;`).

## 🔘 2. Button & Action Registry
- **Category Filter Tabs:** All, Truck, Bus, Taxi, Foreign License Conversion (`gaimen`).
- **School Detail Card Click:** Opens `.school-detail-modal`.
- **Apply School Button (`handleApplySchool`):** Triggers application flow and updates state `appliedSchools`.
- **Call School Direct Button:** Initiates native `tel:` protocol.
- **Bookmark School Button:** Saves school ID to `bookmarkManager`.

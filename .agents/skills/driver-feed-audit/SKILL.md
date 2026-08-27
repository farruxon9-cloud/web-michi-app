---
name: driver-feed-audit
description: Dedicated Page Skill for MichiApp Driver Feed & Job Listings. Covers job card grid, salary range filters, application status badges, and company verification modals.
---

# 🚚 Driver Feed & Jobs Audit Skill (`driver-feed-audit`)

This skill defines the complete visual structure, job filters, application modals, and button interactions for **Driver Feed (求人)**.

## 📐 1. Visual Layout Standards
- **Outer Feed Container:** `.feed-container` (`padding: 16px 14px 120px 14px`).
- **Job Bento Cards:** `.job-card { border-radius: 20px; border: 1px solid var(--glass-border); padding: 16px; margin-bottom: 14px; }`.
- **Salary & Benefit Badges:** `.benefit-chip { border-radius: var(--radius-full); font-size: 12px; padding: 4px 10px; }`.

## 🔘 2. Button & Action Registry
- **Job Category Filter:** Long-haul truck (長距離), Delivery (配送), Bus (バス), Taxi (タクシー).
- **Apply Job Button (`handleApplyJob`):** Opens 1-click application modal with user resume data.
- **Save Job Bookmark:** Toggles bookmark status in `bookmarkManager`.

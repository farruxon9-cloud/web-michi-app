# Jobs Feed Components Architectural Rules, Dimensions & Specification Index

This document serves as the master index for the modular components of the Jobs Feed Page (`DriverFeed.jsx`). Each component has its own dedicated rules and layout geometry specification document inside `src/components/jobs/rules/`.

---

## 📐 General Jobs Feed Layout Geometry & Global Norms

1. **Outer Viewport Margins**:
   - `.feed-container` padding: `6px 14px 0 14px` side margins on mobile, centered at `max-width: 820px` on desktop.
2. **Vertical Card Spacing Gap**:
   - Job cards apply `margin-bottom: 12px` (Rule 13 layout token).
3. **Bottom Clearance Spacer (Rule 12/27)**:
   - Jobs Feed applies an exact **`92px` clearance spacer** (`<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so job cards scroll cleanly above the floating `BottomNav` bar (`bottom: 12px + 72px = 84px`).

---

## 📁 Component-Specific Specification Index

| # | Component Name | Source File | Dedicated Rules & Specs File | Layout Geometry & Main Invariant |
|---|---|---|---|---|
| **01** | **JobFeedSearchHeader** | [`JobFeedSearchHeader.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/JobFeedSearchHeader.jsx) | [`01_JobFeedSearchHeader.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/01_JobFeedSearchHeader.md) | `position: relative`, search input `44px` height, clear search button, active filter chips. |
| **02** | **JobCardHorizontal** | [`JobCardHorizontal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/JobCardHorizontal.jsx) | [`02_JobCardHorizontal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/02_JobCardHorizontal.md) | Min height `156px`, image `100x100px`, salary `#FF9500`, bookmark `stopPropagation`. |
| **03** | **JobDetailModal** | [`JobDetailModal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/JobDetailModal.jsx) | [`03_JobDetailModal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/03_JobDetailModal.md) | `z-index: 99999`, action bar `position: relative` (non-pinned), call button at far-right end. |
| **04** | **TownworkFilterDrawer** | [`TownworkFilterDrawer.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/TownworkFilterDrawer.jsx) | [`04_TownworkFilterDrawer.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/04_TownworkFilterDrawer.md) | 3-tab drawer, pinned back button `40x40px`, `78px` filter clearance spacer, floating search CTA button (`bottom: 96px`). |
| **04a** | **JobFilterLocationSection** | [`JobFilterLocationSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/filters/JobFilterLocationSection.jsx) | [`04a_JobFilterLocationSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/04a_JobFilterLocationSection.md) | Location filter section, prefecture banner (`linear-gradient(#0A84FF, #5E5CE6)`), single-language labels. |
| **04b** | **JobFilterCategorySection** | [`JobFilterCategorySection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/filters/JobFilterCategorySection.jsx) | [`04b_JobFilterCategorySection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/04b_JobFilterCategorySection.md) | Job categories accordion grid (`repeat(2, 1fr)`), sub-categories checkbox list with indent. |
| **04c** | **JobFilterConditionsSection** | [`JobFilterConditionsSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/filters/JobFilterConditionsSection.jsx) | [`04c_JobFilterConditionsSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/04c_JobFilterConditionsSection.md) | Salary option 2-column grid, employment type pills, special features welfare pills. |
| **04d** | **JobFilterFloatingCTA** | [`JobFilterFloatingCTA.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/filters/JobFilterFloatingCTA.jsx) | [`04d_JobFilterFloatingCTA.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/04d_JobFilterFloatingCTA.md) | Floating search CTA dock (`bottom: 96px`), `78px` clearance spacer invariant. |
| **05** | **JobSkeletonCard** | [`JobSkeletonCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/JobSkeletonCard.jsx) | [`05_JobSkeletonCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/jobs/rules/05_JobSkeletonCard.md) | Height `156px` matching real card layout, shimmer 1.5s loop. |

---

## 🚫 Critical Multi-Component Error Prevention Rules

1. **Non-Pinned Action Bar Invariant (Rule 16)**:
   - Job detail action bar MUST NOT be pinned sticky to the bottom of the screen. It MUST remain in normal document flow (`position: relative; margin-top: 24px; margin-bottom: 24px;`).
2. **Far-Right Call Button**:
   - Phone call CTA (`📞 電話する`) MUST sit at the far-right end of the action row.
3. **92px Clearance Spacer**:
   - The end of the jobs list MUST render an exact `92px` clearance spacer to prevent cards from being hidden under the floating `BottomNav`.

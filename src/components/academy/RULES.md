# Driving Academy Components Architectural Rules, Dimensions & Specification Index

This document serves as the master index for the modular components of the Driving Academy Page (`DrivingAcademy.jsx`). Each component has its own dedicated rules and layout geometry specification document inside `src/components/academy/rules/`.

---

## 📐 General Driving Academy Layout Geometry & Global Norms

1. **Outer Viewport Margins**:
   - `.feed-container` padding: `0 14px 0 14px` side margins on mobile, centered at `max-width: 820px` on desktop.
2. **Vertical Card Spacing Gap**:
   - School cards apply `margin-bottom: 12px` (Rule 13 layout token).
3. **Bottom Clearance Spacer**:
   - Driving Academy applies an exact **`92px` clearance spacer** (`<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so school cards scroll cleanly above the floating `BottomNav` bar (`bottom: 12px + 72px = 84px`).

---

## 📁 Component-Specific Specification Index

| # | Component Name | Source File | Dedicated Rules & Specs File | Layout Geometry & Main Invariant |
|---|---|---|---|---|
| **01** | **SchoolCardHorizontal** | [`SchoolCardHorizontal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/SchoolCardHorizontal.jsx) | [`01_SchoolCardHorizontal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/01_SchoolCardHorizontal.md) | Horizontal card layout, image `100x100px`, price green `#30D158`, pill buttons (`38px` height, radius `20px`), `stopPropagation`. |
| **02** | **AcademySearchHeader** | [`AcademySearchHeader.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/AcademySearchHeader.jsx) | [`02_AcademySearchHeader.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/02_AcademySearchHeader.md) | Search input `44px` height, filter button glow, active filter chips with count summarizing. |
| **03** | **SchoolDetailModal** | [`SchoolDetailModal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/SchoolDetailModal.jsx) | [`03_SchoolDetailModal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/03_SchoolDetailModal.md) | Full detail page view, cover image `240px`, `-32px` body overlap, desktop 2-column grid (`grid-template-columns: 1fr 300px`), non-pinned action bar. |
| **04** | **AcademyFilterDrawer** | [`AcademyFilterDrawer.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/AcademyFilterDrawer.jsx) | [`04_AcademyFilterDrawer.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04_AcademyFilterDrawer.md) | Inline filter drawer, 3-tab header, pinned back button `40x40px`, `160px` clearance spacer, floating search CTA button (`bottom: 96px`). |
| **04a** | **AcademyFilterLocationSection** | [`AcademyFilterLocationSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterLocationSection.jsx) | [`04a_AcademyFilterLocationSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04a_AcademyFilterLocationSection.md) | Location filter section, prefecture header banner, cities/wards checkboxes with accordion indent. |
| **04b** | **AcademyFilterStationsSection** | [`AcademyFilterStationsSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterStationsSection.jsx) | [`04b_AcademyFilterStationsSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04b_AcademyFilterStationsSection.md) | Train stations & lines section, colored line badges, station multi-select checkboxes. |
| **04c** | **AcademyFilterCoursesSection** | [`AcademyFilterCoursesSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterCoursesSection.jsx) | [`04c_AcademyFilterCoursesSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04c_AcademyFilterCoursesSection.md) | License course pills (Futsu, Oogata, Chugata, etc.) with icon badges. |
| **04d** | **AcademyFilterStylesSection** | [`AcademyFilterStylesSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterStylesSection.jsx) | [`04d_AcademyFilterStylesSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04d_AcademyFilterStylesSection.md) | Training style pills (Tsugaku, Gashuku, ShortTerm, OnlineTheory). |
| **04e** | **AcademyFilterLangsSection** | [`AcademyFilterLangsSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterLangsSection.jsx) | [`04e_AcademyFilterLangsSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04e_AcademyFilterLangsSection.md) | Instruction language 2-column grid (UZ, JP, EN, RU). |
| **04f** | **AcademyFilterPriceSection** | [`AcademyFilterPriceSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterPriceSection.jsx) | [`04f_AcademyFilterPriceSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04f_AcademyFilterPriceSection.md) | Price range 2-column grid (`under250k`, `250k_300k`, `300k_350k`, `over350k`). |
| **04g** | **AcademyFilterFeaturesSection** | [`AcademyFilterFeaturesSection.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterFeaturesSection.jsx) | [`04g_AcademyFilterFeaturesSection.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04g_AcademyFilterFeaturesSection.md) | Feature & perks pills (shuttle bus, dormitory, education subsidy, shoukai, etc.). |
| **04h** | **AcademyFilterFloatingCTA** | [`AcademyFilterFloatingCTA.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/filters/AcademyFilterFloatingCTA.jsx) | [`04h_AcademyFilterFloatingCTA.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/academy/rules/04h_AcademyFilterFloatingCTA.md) | Floating search CTA button dock (`bottom: 96px`), `160px` clearance spacer invariant. |

---

## 🚫 Critical Multi-Component Error Prevention Rules

1. **Non-Pinned Modal Action Bar**:
   - Modal action buttons inside `.school-detail-right-col` MUST NOT be fixed sticky to the bottom of the screen. They MUST remain in natural document flow.
2. **92px List Clearance Spacer**:
   - The end of the driving academy schools list MUST render an exact `92px` clearance spacer so cards scroll cleanly past the floating `BottomNav`.
3. **160px Filter Clearance Spacer**:
   - The end of the filter options list in `AcademyFilterDrawer` MUST render an exact `160px` clearance spacer so items don't get covered by the `bottom: 96px` floating CTA search dock.

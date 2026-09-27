# Company Home Components Architectural Rules, Dimensions & Specification Index

This document serves as the master index for the modular components of the Company Home Page (`CompanyHome.jsx`). Each component has its own dedicated rules and layout geometry specification document inside `src/components/company/rules/`.

---

## 📐 General Company Layout Geometry & Global Norms

1. **Outer Viewport Margins**:
   - `.feed-container` padding: `6px 14px 0 14px` side margins on mobile, `max-width: 820px` on desktop.
2. **Bottom Clearance Spacer**:
   - Company Home applies an exact **`92px` clearance spacer** (`<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so postings scroll cleanly above the floating `BottomNav`.

---

## 📁 Component-Specific Specification Index

| # | Component Name | Source File | Dedicated Rules & Specs File | Layout Geometry & Main Invariant |
|---|---|---|---|---|
| **01** | **CompanyHeader** | [`CompanyHeader.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/CompanyHeader.jsx) | [`01_CompanyHeader.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/rules/01_CompanyHeader.md) | Company logo `44x44px`, verified badge, tab switcher, "+ E'lon joylash" button (`border-radius: 20px`). |
| **02** | **CompanyJobCard** | [`CompanyJobCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/CompanyJobCard.jsx) | [`02_CompanyJobCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/rules/02_CompanyJobCard.md) | Job posting card, salary `#FF9500`, applicant count pill, edit and delete buttons with `stopPropagation`. |
| **03** | **CompanySchoolCard** | [`CompanySchoolCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/CompanySchoolCard.jsx) | [`03_CompanySchoolCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/rules/03_CompanySchoolCard.md) | Academy posting card, price green `#30D158`, shoukai bonus badge `#FF9F0A`, edit and delete buttons. |
| **04** | **CompanyAdTypeModal** | [`CompanyAdTypeModal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/CompanyAdTypeModal.jsx) | [`04_CompanyAdTypeModal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/company/rules/04_CompanyAdTypeModal.md) | Posting type selector modal ("Vakansiya e'loni" vs "Avtomaktab e'loni"). |

---

## 🚫 Critical Multi-Component Error Prevention Rules

1. **Card Action Propagation Safety**:
   - All company action buttons (edit, delete, applicant view) MUST trigger `e.stopPropagation()` to prevent unwanted card clicks.
2. **Japanese Zipcode Lookup Integration**:
   - Address fields automatically fill prefecture and city via `lookupJapaneseZipcode` when entering a 7-digit Japanese postal code.

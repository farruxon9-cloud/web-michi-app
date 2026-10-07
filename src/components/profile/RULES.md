# Profile Components Architectural Rules, Dimensions & Specification Index

This document serves as the master index for the modular components of the Profile Page (`Profile.jsx`). Each component has its own dedicated rules and layout geometry specification document inside `src/components/profile/rules/`.

---

## 📐 General Profile Layout Geometry & Global Norms

1. **Outer Viewport Canvas**:
   - `.profile-container` padding: `14px` side margins on mobile, `max-width: 720px` on desktop.
2. **Bottom Clearance Spacer**:
   - Profile sub-pages apply an exact **`92px` clearance spacer** (`<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so content scrolls cleanly above the floating `BottomNav`.

---

## 📁 Component-Specific Specification Index

| # | Component Name | Source File | Dedicated Rules & Specs File | Layout Geometry & Main Invariant |
|---|---|---|---|---|
| **01** | **ProfileMain** | [`ProfileMain.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/ProfileMain.jsx) | [`01_ProfileMain.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/01_ProfileMain.md) | Header card, avatar `72x72px`, dynamic stats row, menu list items, role-based conditional company items. |
| **02** | **Applications** | [`Applications.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/Applications.jsx) | [`02_Applications.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/02_Applications.md) | Applications tracker, status pipeline filter chips (`submitted`, `reviewing`, `interview`, `accepted`, `rejected`). |
| **03** | **SavedItems** | [`SavedItems.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/SavedItems.jsx) | [`03_SavedItems.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/03_SavedItems.md) | Saved items page with tabs for Saved Jobs (`#FF9500`) and Saved Driving Academies (`#30D158`). |
| **04** | **ShoukaiReferrals** | [`ShoukaiReferrals.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/ShoukaiReferrals.jsx) | [`04_ShoukaiReferrals.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/04_ShoukaiReferrals.md) | Shoukai referral bonuses tracker, status badges (paid/pending), reward text `#FF9F0A`. |
| **05** | **Notifications** | [`Notifications.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/Notifications.jsx) | [`05_Notifications.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/05_Notifications.md) | Notifications feed, unread/read filter tabs, mark read & delete actions. |
| **06** | **Settings** | [`Settings.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/Settings.jsx) | [`06_Settings.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/06_Settings.md) | Settings options (Dark Mode, notification sound, AI voice standby, multilingual language picker). |
| **07** | **ProfileEdit** | [`ProfileEdit.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/ProfileEdit.jsx) | [`07_ProfileEdit.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/profile/rules/07_ProfileEdit.md) | Edit profile form (fullName, phone, address, JLPT level, driving license type, vehicle specs trigger). |

---

## 🚫 Critical Multi-Component Error Prevention Rules

1. **Avatar Camera Icon Badge**:
   - Avatar circle overlays camera icon badge (`24x24px`, background `var(--primary)`) to trigger image upload file chooser.
2. **Scroll Restoration Invariant**:
   - Navigating between sub-pages restores previous scroll position on main view when returning.

# Page Specification Rule: My Posted Ads / Company Home (`CompanyHome.jsx` / `Profile.jsx` -> `my_ads`)

Ushbu qoida **Mening E'lonlarim (`マイ掲載一覧`)** sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;` (`bottom: 0` full-screen container).
- **Scroll & Padding**: `overflow-y: auto; padding-bottom: 96px;`

---

## 🎯 2. Sticky Header & Title
- **Sticky Back Button**: `<div className="profile-sticky-back" style={{ zIndex: 250 }}>`
- **Title Offset**: `<div className="sub-page-header" style={{ paddingTop: '56px' }}>`
- **Title Text**: `マイ掲載一覧` (Japanese locale `myAdsMenu`).

---

## ⚓ 3. Bottom Clearance & Trailing Spacer
- **Explicit Trailing Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` (Placed inside `Profile.jsx` and `CompanyHome.jsx`).
- **Visual Gap Result**: Last card halts with a clean, spacious clearance gap above `BottomNav` without being covered.

---

## 🚫 4. Forbidden Patterns
1. **No Missing Trailing Spacer**: `CompanyHome` must always include the trailing 96px clearance spacer div to prevent iOS scroll collapsing.

# Page Specification Rule: Personal / Company Info (`Profile.jsx` -> `personalInfo`)

Ushbu qoida **Shaxsiy Ma'lumotlar / Kompaniya Profil** (`personalInfo`) sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;`
- **Scroll & Padding**: `overflow-y: auto; padding-bottom: 96px;`

---

## 🎯 2. Sticky Header & User ID Badge
- **Sticky Back Button**: Floating 40x40px back button at `top: 16px`, `left: 16px`.
- **Title Row**: Sub-header with User ID pill (`ID: 104082`).

---

## 📝 3. Form Input Cards & Save CTA
- **Input Fields Padding**: `padding: 14px; margin-bottom: 12px;`
- **Save Changes CTA**: Full-width button with `padding: 14px; border-radius: 16px; font-weight: 700;`
- **Trailing Spacer**: `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`

---

## 🚫 4. Forbidden Patterns
1. **No Double Colons**: Input labels must render clean text without embedded colons (`生年月日` not `生年月日：`).

# Page Specification Rule: Employee Management (`Profile.jsx` -> `employees`)

Ushbu qoida **Xodimlar Boshqaruvi (`employees`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 96px;`

---

## 👔 2. Employee Driver License Card
- **Driver Card Padding**: `padding: 14px; margin-bottom: 12px; border-radius: 16px;`
- **Japanese Driver License Badge**: Standard Japanese driver's license status badge (`大型免許`, `中型免許`, `準中型`, `普通免許`, `フォークリフト`).
- **Trailing Spacer**: `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`

---

## 🚫 3. Forbidden Patterns
1. **No Invalid License Classifications**: Driver license types must match official Japanese Road Traffic Act (`道路交通法`) classifications.

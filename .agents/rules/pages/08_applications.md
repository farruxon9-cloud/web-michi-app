# Page Specification Rule: Applications Sub-page (`Profile.jsx` -> `applications`)

Ushbu qoida **Arizalar va Murojaatlar (`applications`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 96px;`

---

## 🎯 2. Candidate Card Invariants
- **Candidate Card Padding**: `padding: 14px; margin-bottom: 12px; border-radius: 16px;`
- **Status Pills**: `pending` (yellow), `accepted` (green), `rejected` (red).
- **Trailing Spacer**: `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`

---

## 🚫 3. Forbidden Patterns
1. **No Mixed i18n Badges**: Status labels must use exact 7-language translation keys (`t('statusPending')`).

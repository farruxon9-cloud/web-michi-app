# Page Specification Rule: Settings Sub-page (`Profile.jsx` -> `settings`)

Ushbu qoida **Ilova Sozlamalari (`settings`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 0px !important;`

---

## ⚙️ 2. Settings Row Invariants
- **Settings Card Row**: `display: flex; align-items: center; justify-content: space-between; padding: 14px; margin-bottom: 10px; border-radius: 16px;`
- **Toggle Switch**: iOS style 51x31px smooth animated toggle.
- **Language Selector Pill**: `padding: 6px 12px; border-radius: 10px; background: rgba(10, 132, 255, 0.1);`
- **Trailing Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` (Yields exact 12px visual gap above 84px BottomNav).

---

## 🚫 3. Forbidden Patterns
1. **No Language Desynchronization**: Changing language must instantly trigger 7-language locale context re-render across all open tabs.

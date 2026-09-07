# Page Specification Rule: Saved Items Sub-page (`Profile.jsx` -> `saved_items`)

Ushbu qoida **Saqlangan E'lonlar va Xatcho'plar (`saved_items`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 96px;`

---

## 🔖 2. Bookmark Grid & Card Rules
- **Bookmark Card Padding**: `padding: 14px; margin-bottom: 12px;`
- **Remove Bookmark Button**: `36x36px` icon button at top right of card.
- **Trailing Spacer**: `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`

---

## 🚫 3. Forbidden Patterns
1. **No Corrupted LocalStorage Hydration**: Bookmark array must fall back safely to empty array `[]` on invalid JSON.

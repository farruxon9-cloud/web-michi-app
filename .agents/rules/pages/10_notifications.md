# Page Specification Rule: Notifications Sub-page (`Profile.jsx` -> `notifications`)

Ushbu qoida **Bildirishnomalar va Xabarlar (`notifications`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 96px;`

---

## 🔔 2. Notification Item Spacing
- **Notification Item Padding**: `padding: 14px; margin-bottom: 10px; border-radius: 14px;`
- **Unread Badge Dot**: `8x8px` glowing primary dot indicator.
- **Trailing Spacer**: `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`

---

## 🚫 3. Forbidden Patterns
1. **No Missing Unread Indicators**: Unread notification items must render distinct background shade.

# Page Specification Rule: Profile Main Menu (`Profile.jsx` / `Profile.css`)

Ushbu qoida **Profil Asosiy Menyusi (Profile Main)** uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Container Selector**: `.profile-container`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;` (`bottom: 0` full-screen container).
- **Scroll & Padding**: `overflow-y: auto; padding-bottom: 0px !important;`
- **Trailing Dock Clearance Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` right after `.logout-btn` (yielding 12px visual gap above 84px BottomNav).

---

## 👤 2. User Avatar & Status Card
- **Avatar Card Padding**: `padding: 16px; margin-bottom: 14px;`
- **Avatar Size**: `64x64px`, `border-radius: 50%`.
- **User Role Badge**: `padding: 4px 10px; border-radius: 12px; font-weight: 700;`

---

## 🗂️ 3. Menu Group Spacing & Logout Card Architecture
- **Menu Group Class**: `.menu-group`, `border-radius: 20px; margin-bottom: 14px;`
- **Menu Items Gap**: `1px` inner border divider separator.
- **Icon Box**: `36x36px`, `border-radius: 10px`, glassmorphic 3D background.
- **Logout Card Class**: `.logout-btn` (Mustaqil karta: `border-radius: 20px !important`, `background: var(--card-bg) !important`, `border: 1px solid var(--glass-border) !important`, `margin-top: 8px !important`, `width: 100%`).
- **Inter-Card Vertical Gap**: `margin-top: 8px !important` on `.logout-btn` combined with preceding container margins yields an exact, uniform **12px visual clearance gap** matching all app Bento cards.

---

## 🚫 4. Forbidden Patterns
1. **No Heights Clipping**: `.profile-container` height must never be clipped with `bottom: 90px !important`.
2. **No Missing Trailing Spacer**: Main profile page must always include the 96px trailing spacer after `.logout-btn`.
3. **No Merged Cards**: Never nest `.logout-btn` inside a preceding `.menu-group` container.
4. **No Double Side Margins**: Never add inline side margins to `.logout-btn` that shrink its width relative to `.menu-group`.

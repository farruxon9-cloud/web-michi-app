# Page Specification Rule: Platform About & AI Assist Vision (`Profile.jsx` -> `about`)

Ushbu qoida **Platforma Haqida va AI Assist Vision (`about`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 0px !important;`
- **Sticky Back Button**: `<div className="profile-sticky-back"><button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button></div>` pinned sticky at `top: 16px` (`left: 16px`, `40x40px`, `z-index: 250`).
- **Trailing Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />`

---

## 🤖 2. AI Assist Vision Showcase Exclusivity Invariant
- **Exclusive Host Location**: The full AI Assist Vision Showcase view (`AssistHeroShowcase.jsx`) MUST reside EXCLUSIVELY inside Profile -> "Platforma haqida" (`activePage === 'about'`).
- **Showcase Card**: `border-radius: 24px`, 3D glassmorphic hero background, interactive scan mode simulation.

---

## 🚫 3. Forbidden Patterns
1. **No AI Showcase Duplication**: Do NOT duplicate full AI Vision Showcase cards on Home Dashboard or inside Service tab.
2. **No Unpinned Back Button**: Do NOT render back button in normal document flow; it MUST use `.profile-sticky-back` pinned sticky at `top: 16px`.

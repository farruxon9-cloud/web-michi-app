# Page Specification Rule: AI Assist Voice Showcase (`AssistHeroShowcase.jsx` / `AssistHeroShowcase.css`)

Ushbu qoida **AI Assist Voice Showcase (`assist_showcase`)** sub-sahifasi uchun barcha layout, geometriya va vizual spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `.assist-showcase-container`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;` (`bottom: 0` full-screen container).
- **Scroll & Padding**: `overflow-y: auto; padding: 12px 14px 0px 14px; padding-bottom: 0px !important;`
- **Trailing Dock Clearance Spacer**: `<div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />` (matching exact 76px dock clearance).

---

## 📌 2. Header & Sticky Back Button
- **Sticky Back Button**: Pinned sticky at `top: 16px`, `left: 0px` (`40x40px`, `border-radius: 50%`, `z-index: 100`, `margin-bottom: -40px`).
- **Social Proof Badge**: `margin-left: 52px; margin-top: 4px;` (positioned side-by-side with back button at top).

---

## 🗂️ 3. Card Spacing & Bento Capabilities
- **Lead Text Margin**: `margin-bottom: 12px;`
- **Robot Hero Card**: `margin-bottom: 12px; border-radius: 24px; padding: 12px;`
- **Primary CTA Toggle Button**: `height: 52px; border-radius: 18px; margin-bottom: 12px;`
- **Bento Capabilities Grid**: `display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px;`
- **Live Simulator Card**: `border-radius: 20px; padding: 16px;`

---

## 🎨 4. Theme & Design Tokens
- **Ambient Spotlight**: `radial-gradient(circle, rgba(0, 132, 255, 0.15) 0%, transparent 70%)`, `filter: blur(60px)`
- **Color Accent**: Electric Blue `#0084FF` and Violet Gradient (`#0084FF` → `#AF52DE`)

---

## 🚫 5. Forbidden Patterns
1. **No Relative Scrolling**: Do NOT use `position: relative` or `min-height: 100vh` on container; it MUST use `position: absolute; top: 0; bottom: 0`.
2. **No Bottom Dock Clipping**: Do NOT add large container padding-bottom (e.g. 180px); dock clearance MUST use the single 90px trailing spacer.
3. **No Unpinned Back Button**: Back button MUST stay pinned sticky at `top: 16px`.

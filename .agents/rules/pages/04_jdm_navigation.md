# Page Specification Rule: JDM Navigation & Map (`JDMNavigation.jsx` / `JDMNavigation.css`)

Ushbu qoida **JDM Navigation (Navigatsiya va Xarita)** bo'limi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Container Selector**: `.jdm-nav-container`
- **Dimensions**: `height: 100vh; width: 100%; position: relative; overflow-y: auto;`
- **Bottom Clearance**: `padding-bottom: 96px;`

---

## 🗺️ 2. Map Container & Controls
- **Map Viewport**: `width: 100%; height: 100%; position: absolute; inset: 0;`
- **Search Header Overlay**: Floating search card `position: absolute; top: 16px; left: 14px; width: calc(100% - 28px); z-index: 100;`
- **Navigation HUD Cards**: `border-radius: 18px`, `backdrop-filter: blur(20px)`.

---

## 🚫 3. Forbidden Patterns
1. **No Touch Event Blocking**: Map controls must pass touch events cleanly to Leaflet map engine.

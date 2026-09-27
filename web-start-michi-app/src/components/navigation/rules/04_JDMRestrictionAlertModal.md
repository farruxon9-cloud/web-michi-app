# JDMRestrictionAlertModal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Modal Overlay:
- **Fixed Fullscreen Overlay**: `position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;`
- **Backdrop Blur**: `backdrop-filter: blur(8px)`, `background: rgba(0, 0, 0, 0.6)`
- **Modal Box**: `max-width: 440px`, `border-radius: 24px`, `border: 1px solid rgba(255, 59, 48, 0.4)`, `box-shadow: 0 16px 40px rgba(255, 59, 48, 0.25)`

### Action Button:
- **Button Height**: `44px`
- **Border Radius**: `22px`
- **Background**: `linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **High Priority Warning Z-Index**:
   - `z-index: 9999` guarantees warnings sit above map tiles and bottom HUD sheets.

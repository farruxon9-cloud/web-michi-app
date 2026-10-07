# JDMMapContainer Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Map Canvas & Viewport:
- **Container**: `.jdm-map-wrapper`, `width: 100%`, `height: 100%`, `position: relative`, `flex: 1`
- **MapLibre Canvas**: `.jdm-map-container`, `position: absolute; top: 0; bottom: 0; left: 0; right: 0;`

### Floating Controls Stack Geometry:
- **Stack Positioning**: `position: absolute; right: 16px; bottom: ${gpsBottomOffset}px; z-index: 350;`
- **Control Buttons**: `44x44px`, `border-radius: 50%`, `box-shadow: 0 4px 14px rgba(0,0,0,0.12)`
- **Locate Button**: `background: var(--primary)`, `color: #FFFFFF`, `box-shadow: 0 4px 16px rgba(10, 132, 255, 0.4)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Dynamic Dynamic Bottom Offset (`gpsBottomOffset`)**:
   - The map controls stack MUST dynamically compute `gpsBottomOffset` based on bottom HUD/panel height to prevent floating buttons from being overlapped by the navigation bar or search sheets.
2. **Smooth Compass Rotation**:
   - Compass button rotates via `transform: rotate(${-mapBearing}deg)` in sync with real-time map bearing updates.

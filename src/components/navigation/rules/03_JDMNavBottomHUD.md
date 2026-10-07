# JDMNavBottomHUD Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Bottom HUD Dock**: `position: absolute; bottom: 0; left: 0; right: 0; z-index: 350;`
- **Border Radius**: `border-top-left-radius: 24px; border-top-right-radius: 24px;`
- **Padding**: `14px 16px`
- **Backdrop Filter**: `backdrop-filter: blur(25px)`

### Active Maneuver Banner:
- **Banner Geometry**: `padding: 12px 14px`, `border-radius: 18px`, `background: rgba(10, 132, 255, 0.08)`
- **Maneuver Icon Box**: `46x46px`, `border-radius: 14px`, `background: #FFFFFF`

### CTA Start Navigation Button:
- **Button Height**: `48px`
- **Border Radius**: `24px`
- **Background**: `linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)`
- **Box Shadow**: `0 6px 20px rgba(10, 132, 255, 0.35)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **LaneIndicator Prop Safety**:
   - `LaneIndicator` is rendered inside maneuver banner ONLY when `currentStep.laneConfig` exists.
2. **ETA Calculation Format**:
   - ETA text renders in clean 24-hour format (`HH:MM`).

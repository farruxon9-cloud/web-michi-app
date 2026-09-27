# JDMPOIModal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Sheet Position**: `position: absolute; bottom: 90px; left: 14px; right: 14px; z-index: 450;`
- **Border Radius**: `22px`
- **Max Height**: `340px`
- **Padding**: `16px`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Tap to Set Destination**:
   - Tapping any POI item invokes `onSelectPOI(poi)` to immediately set it as navigation destination `destCoord`.

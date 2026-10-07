# AcademyFilterLocationSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `18px`
- **Border**: `1px solid var(--glass-border)`
- **Box Shadow**: `0 2px 10px rgba(0,0,0,0.03)`
- **Padding**: `14px 16px`
- **Icon Box**: `36x36px`, `border-radius: 10px`, `background: #0A84FF15`

### Prefecture Banner Card:
- **Background**: `linear-gradient(135deg, rgba(10, 132, 255, 0.07) 0%, rgba(94, 92, 230, 0.07) 100%)`
- **Border**: `1px solid rgba(10, 132, 255, 0.2)`
- **Border Radius**: `16px`
- **Padding**: `12px 16px`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Prefecture Picker Modal Trigger**:
   - Clicking "変更 ▾" opens `CustomMobilePickerModal` to dynamically pick from `PREFECTURES`.

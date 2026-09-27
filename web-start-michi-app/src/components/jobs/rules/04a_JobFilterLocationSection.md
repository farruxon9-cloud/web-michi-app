# JobFilterLocationSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `20px`
- **Border**: `1px solid var(--glass-border)` (Active state: `1px solid rgba(10, 132, 255, 0.4)`)
- **Box Shadow**: `0 4px 20px rgba(0,0,0,0.04)` (Active state: `0 8px 24px rgba(10, 132, 255, 0.1)`)
- **Header Padding**: `16px 18px`
- **Icon Box**: `38x38px`, `border-radius: 12px`, `background: linear-gradient(135deg, #0A84FF, #0056B3)`

### Apple-Style Prefecture Banner Card:
- **Background**: `linear-gradient(135deg, rgba(10, 132, 255, 0.07), rgba(94, 92, 230, 0.07))`
- **Border**: `1px solid rgba(10, 132, 255, 0.2)`
- **Border Radius**: `16px`
- **Padding**: `12px 16px`
- **Prefecture Change Button**: `font-size: 12.5px; font-weight: 800; padding: 7px 14px; border-radius: 14px; background: var(--primary); color: #FFF;`

### Cities & Wards Checkboxes:
- **Square Checkbox**: `18x18px` (Cities) / `16x16px` (Wards), `border-radius: 4px`
- **Accordion Indent**: `padding-left: 20px` for wards sub-items

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Pure Single-Language Dictionary Rendering (Rule 15)**:
   - Labels MUST NOT display parenthetical dual-language translations (e.g. `仙台市 (Sendai)` is PROHIBITED).
2. **Prefecture Picker Modal Sync**:
   - Tapping "変更 ▾" opens `CustomMobilePickerModal` to switch prefectures dynamically.

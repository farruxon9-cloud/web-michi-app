# JDMVehiclePickerModal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container & Preset Geometry:
- **Modal Box**: `max-width: 480px`, `border-radius: 24px`, `border: 1px solid var(--glass-border)`
- **Preset Option Card**: `padding: 12px 14px`, `border-radius: 16px`
- **Active State**: `border: 1.5px solid #0A84FF`, `background: rgba(10, 132, 255, 0.12)`, `color: #0A84FF`
- **Confirm CTA Button**: `height: 46px`, `border-radius: 23px`, `background: linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Storage Persistence**:
   - Selecting a preset updates `localStorage.setItem('michi_user_vehicle', ...)` to persist truck specs across app reloads.

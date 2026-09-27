# ProfileEdit Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Sub-Page Viewport**: `.profile-container.sub-page-view.fade-in`
- **Form Input**: `padding: 12px`, `border-radius: 12px`, `font-size: 14px`, `font-weight: 700`
- **Save CTA Button**: `height: 48px`, `border-radius: 24px`, `background: linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)`

---

## <ctrl42> Component-Specific Error Prevention & Logic Rules

1. **Vehicle Specifications Modal Integration**:
   - Tapping "Yuk Mashinasi Spetsifikatsiyalari" triggers `setIsVehiclePickerOpen(true)` to launch `JapaneseVehiclePickerModal`.

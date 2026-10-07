# CompanyJobCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Card Container Geometry:
- **Card Background**: `var(--card-bg)` with glassmorphic backdrop-filter
- **Border**: `1px solid var(--glass-border)`
- **Border Radius**: `18px`
- **Margin Bottom**: `12px`
- **Thumbnail Image**: `100x100px`, `border-radius: 14px`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Card Stop Propagation**:
   - Tapping edit button or delete button calls `e.stopPropagation()` to prevent opening detail modal.

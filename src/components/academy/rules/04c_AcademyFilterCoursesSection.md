# AcademyFilterCoursesSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `18px`, `border: 1px solid var(--glass-border)`
- **Icon Box**: `36x36px`, `border-radius: 10px`, `background: #34C75915`

### Course Selection Pills:
- **Pill Geometry**: `padding: 8px 12px`, `border-radius: 12px`, `font-size: 13px`
- **Selected State**: `border: 1px solid #0A84FF`, `background: rgba(10, 132, 255, 0.12)`, `color: #0A84FF`, `font-weight: 800`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **License Multi-Select**:
   - Toggling courses updates `selectedCourses` array via `toggleMultiSelect`.

# CompanyAdTypeModal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Modal Overlay**: `position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;`
- **Modal Card**: `max-width: 400px`, `border-radius: 24px`, `border: 1px solid var(--glass-border)`
- **Option Buttons**: `padding: 14px 16px`, `border-radius: 18px`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Selection Dispatch**:
   - Selecting 'job' or 'school' invokes `onSelectAdType(type)` to trigger the corresponding job creation form or academy creation form.

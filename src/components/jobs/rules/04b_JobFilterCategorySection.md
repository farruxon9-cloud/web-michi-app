# JobFilterCategorySection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `20px`
- **Border**: `1px solid var(--glass-border)` (Active state: `1px solid rgba(175, 82, 222, 0.4)`)
- **Icon Box**: `38x38px`, `border-radius: 12px`, `background: linear-gradient(135deg, #AF52DE, #5E5CE6)`

### Driver License Selection Buttons:
- **Flex Gap**: `8px`
- **Pill Padding**: `8px 12px`
- **Border Radius**: `12px`
- **Active Pill State**: `border: 1.5px solid #AF52DE; background: rgba(175, 82, 222, 0.12); color: #AF52DE; font-weight: 800;`
- **Inactive Pill State**: `border: 1px solid var(--glass-border); background: var(--card-bg); color: var(--text-main);`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Multi-License Toggle**:
   - Tapping a license pill toggles its inclusion in `selectedLicenses` array cleanly without resetting other filters.
2. **Subcategory Expansion**:
   - Chevron icon click MUST trigger `e.stopPropagation()` to toggle category expansion without checking parent category.

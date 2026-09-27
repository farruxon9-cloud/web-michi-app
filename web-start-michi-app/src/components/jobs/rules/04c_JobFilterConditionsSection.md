# JobFilterConditionsSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `20px`
- **Border**: `1px solid var(--glass-border)` (Active state: `1px solid rgba(255, 149, 0, 0.4)`)
- **Box Shadow**: `0 4px 20px rgba(0,0,0,0.04)` (Active state: `0 8px 24px rgba(255, 149, 0, 0.1)`)
- **Header Padding**: `16px 18px`
- **Icon Box**: `38x38px`, `border-radius: 12px`, `background: linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)`
- **Inner Content Padding**: `14px 16px`, `gap: 16px`

### Minimum Salary Options (2-Column Grid):
- **Grid Layout**: `grid-template-columns: repeat(2, 1fr)`, `gap: 8px`
- **Option Button**: `padding: 10px 12px`, `border-radius: 12px`, `font-size: 12.5px`
- **Selected State**: `border: 1.5px solid #FF9500`, `background: rgba(255, 149, 0, 0.12)`, `color: #FF9500`, `font-weight: 800`

### Employment Type Selection:
- **Flex Wrap Layout**: `gap: 8px`
- **Option Pill**: `padding: 8px 14px`, `border-radius: 12px`, `font-size: 12.5px`
- **Selected State**: `border: 1.5px solid #0A84FF`, `background: rgba(10, 132, 255, 0.12)`, `color: #0A84FF`, `font-weight: 800`

### Special Features & Welfare Pills:
- **Flex Wrap Layout**: `gap: 8px`
- **Pill Button**: `padding: 8px 12px`, `border-radius: 12px`, `font-size: 12px`
- **Selected State**: `border: 1.5px solid var(--primary)`, `background: rgba(94, 92, 230, 0.15)`, `color: var(--primary)`, `font-weight: 800`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Clean Multilingual Localization**:
   - Uses `t('searchByConditions', 'こだわり条件・給与から探す')`, `t('minSalaryFilterLabel')`, `t('employmentTypeLabel')`, `t('specialFeaturesLabel')`.
2. **Active Filter Badge Count**:
   - Calculates total active filter count `(selectedFeatures.length + (minSalary > 0 ? 1 : 0) + selectedEmploymentTypes.length)` and shows count badge when `> 0`.

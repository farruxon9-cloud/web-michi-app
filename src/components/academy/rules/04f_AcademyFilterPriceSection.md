# AcademyFilterPriceSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `18px`, `border: 1px solid var(--glass-border)`
- **Icon Box**: `36x36px`, `border-radius: 10px`, `background: #30D15815`

### Price Range Buttons (2-Column Grid):
- **Grid Layout**: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;`
- **Option Button**: `padding: 10px 12px`, `border-radius: 12px`, `font-size: 12.5px`
- **Selected State**: `border: 1.5px solid #30D158`, `background: rgba(48, 209, 88, 0.12)`, `color: #30D158`, `font-weight: 800`
- **"All Prices" Option**: Spans full 2 columns (`grid-column: span 2`)

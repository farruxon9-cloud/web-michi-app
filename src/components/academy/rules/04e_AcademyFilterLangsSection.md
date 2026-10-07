# AcademyFilterLangsSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `18px`, `border: 1px solid var(--glass-border)`
- **Icon Box**: `36x36px`, `border-radius: 10px`, `background: #AF52DE15`

### Language Option Buttons (2-Column Grid):
- **Grid Layout**: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;`
- **Option Button**: `padding: 10px 12px`, `border-radius: 12px`, `font-size: 12.5px`
- **Selected State**: `border: 1.5px solid #AF52DE`, `background: rgba(175, 82, 222, 0.12)`, `color: #AF52DE`, `font-weight: 800`
- **"All Languages" Option**: Spans full 2 columns (`grid-column: span 2`)

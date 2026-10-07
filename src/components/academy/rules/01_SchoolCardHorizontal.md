# SchoolCardHorizontal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Card Container Geometry:
- **Card Background**: `var(--card-bg)` with glassmorphic backdrop-filter blur
- **Border**: `1px solid var(--glass-border)`
- **Border Radius**: `18px`
- **Margin Bottom**: `12px` (Rule 13 layout token)
- **Padding**: `12px`
- **Box Shadow**: `0 4px 16px rgba(0, 0, 0, 0.04)`

### Image Thumbnail (`.job-card-img`):
- **Dimensions**: `100x100px` fixed ratio, `border-radius: 14px`, `object-fit: cover`
- **Badge Overlay**: Top-left position, `border-radius: 8px`, `padding: 2px 6px`, `font-size: 10px`, `background: rgba(10, 132, 255, 0.9)`, `color: #FFF`

### Card Body Typography & Colors:
- **School Name**: `font-size: 14px; font-weight: 800; color: var(--text-main)`
- **Verified Badge**: `size=14` inline SVG adjacent to school name
- **School Type**: `font-size: 13px; font-weight: 700; color: var(--text-secondary)`
- **Price Tag**: `font-size: 14px; font-weight: 900; color: #30D158;` with `Banknote` icon (`#30D158`, size 15)

### Card Action Buttons (`.job-card-actions`):
- **Flex Row**: `display: flex; gap: 8px; margin-top: 10px;`
- **Button Height**: `38px`
- **Border Radius**: `20px` (Pill shape)
- **Typography**: `font-size: 12.5px; font-weight: 800;`
- **Micro-animation**: Active scale state `transform: scale(0.96)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Card Event Bubbling Guard**:
   - `e.stopPropagation()` MUST be called on all button click handlers (`onApplySchool`, `onShoukai`, `onEditJob`, call button) to prevent opening `SchoolDetailModal` when tapping action buttons.
2. **Dynamic Price Color**:
   - Driving Academy prices use green `#30D158` (distinct from blue `#0A84FF` / orange `#FF9500` used in job cards).

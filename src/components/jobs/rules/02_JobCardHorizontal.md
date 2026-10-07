# JobCardHorizontal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Horizontal Card Outer Geometry:
- **Card Class**: `.job-card-hz`
- **Min Height**: `156px`
- **Inner Padding**: `12px`
- **Margin Bottom**: `12px`
- **Border Radius**: `16px`
- **Background**: `var(--card-bg); backdrop-filter: blur(20px);`
- **Border**: `1px solid var(--glass-border)`

### Image & Body Geometry:
- **Job Image (`.job-card-img`)**: `100x100px`, `border-radius: 8px`, `object-fit: cover`, `flex-shrink: 0`.
- **Company Name**: `font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;`
- **Title (`.job-card-title`)**: `font-size: 16px; font-weight: 800; line-height: 1.3; color: var(--text-main); display: -webkit-box; -webkit-line-clamp: 2; overflow: hidden;`
- **Salary (`.job-card-salary`)**: `font-size: 14.5px; font-weight: 800; color: #FF9500;`

### Chips & Badges (`.job-card-chips`):
- **Chip Class**: `.job-chip`
- **Padding & Radius**: `padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;`
- **International Badge**: `background: linear-gradient(135deg, #0A84FF, #5E5CE6); color: #FFF;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Bookmark Event Propagation**:
   - Clicking bookmark button MUST invoke `e.stopPropagation()` to prevent opening the job detail modal.
2. **Fallback Image Error Handling**:
   - `onError` handler MUST supply fallback image URL (`https://images.unsplash.com/photo-1519003722824-194d4455a60c`) if primary image fails to load.

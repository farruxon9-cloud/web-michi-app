# AcademySearchHeader Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Search Row Container Geometry:
- **Header Box**: `.feed-header.glass` with sticky/glass styling
- **Search Bar Height**: `44px`
- **Search Input**: `border-radius: 14px`, `background: rgba(118, 118, 128, 0.12)`, `font-size: 14px`
- **Filter Toggle Button**: `44x44px`, `border-radius: 14px`, `background: var(--card-bg)`, active state glow `border: 1px solid var(--primary)`

### Active Filter Chips Row Geometry:
- **Chips Row**: `.active-filter-chips-row.hide-scrollbar` horizontal scrolling
- **Active Chip**: `height: 28px`, `padding: 4px 10px`, `border-radius: 14px`, `font-size: 11.5px`, `background: rgba(10, 132, 255, 0.12)`, `color: var(--primary)`
- **Reset Button**: `.clear-all-chip.sticky-reset-btn`, `height: 28px`, `padding: 4px 10px`, `border-radius: 14px`, `background: rgba(255, 59, 48, 0.12)`, `color: #FF3B30`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Safe Null-Check on searchQuery**:
   - `searchQuery` and `setSearchQuery` MUST handle empty/undefined values gracefully without throwing `TypeError`.
2. **Responsive Chip Condensing**:
   - When more than 2 items are selected in a category (e.g. `selectedCourses`), chips automatically summarize to `{FirstItem} 外{Count-1}件` to preserve horizontal layout space.

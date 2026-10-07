# TownworkFilterDrawer Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Drawer Overlay & Header Geometry:
- **Overlay Class**: `.filter-drawer-overlay`
- **Positioning**: `position: fixed; inset: 0; z-index: 9999;`
- **Pinned Sticky Back Button**: `40x40px`, `border-radius: 50%`, `position: sticky; top: 0; z-index: 300;`
- **Title & Reset Row**: `min-height: 40px; position: relative` (Scrolls away naturally).

### Accordion Filter Sections (`.job-category-section`):
- **Background**: `var(--card-bg); border-radius: 20px; border: 1px solid var(--glass-border);`
- **Section Header**: `padding: 16px 18px; cursor: pointer;`
- **Icon Box**: `38x38px`, `border-radius: 12px`

### Floating Search CTA Button (Rule 24 Invariant):
- **CTA Dock**: `position: fixed; bottom: 96px; z-index: 250; pointer-events: none;`
- **Search CTA Button (`.townwork-btn-search-cta`)**: `pointer-events: auto; width: calc(100% - 28px); max-width: 792px; padding: 14px 20px; border-radius: 20px; background: linear-gradient(135deg, #0A84FF, #0056B3); color: #FFF; font-weight: 900; font-size: 15px; box-shadow: 0 4px 16px rgba(10, 132, 255, 0.3);`
- **Filter Clearance Spacer**: Strictly **78px** clearance spacer (`<div style={{ height: '78px', minHeight: '78px' }} />`).

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Pinned Back Button Only (Rule 6 Invariant)**:
   - ONLY the 40x40px Back Button stays sticky at `top: 0`. The Title and Reset button MUST scroll away naturally.
2. **Pure Single-Language Dictionary Rendering (Rule 15)**:
   - Labels MUST NOT contain parenthetical dual-language text (e.g. `通学コース (Qatnab o'qish)` is PROHIBITED).
3. **2-Column Grid Ranges (Rule 16)**:
   - Range selection pills MUST use 2-column grid (`grid-template-columns: repeat(2, 1fr); gap: 8px`).

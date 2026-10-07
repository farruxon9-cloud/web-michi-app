# SchoolDetailModal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container & Cover Geometry:
- **Full Viewport Container**: `.academy-container.detail-view.fade-in`
- **Sticky Actions Row**: `.academy-header-actions` floating top-left & top-right over cover image
- **Cover Image Container**: `.school-image-container`, `height: 240px`, `object-fit: cover`
- **Language Badge**: Top-right corner over cover image, `border-radius: 12px`, `padding: 4px 10px`, `font-size: 11.5px`, glass backdrop-filter

### Body Card Geometry:
- **Body Overlap**: `.school-detail-body` overlaps cover image by `-32px` (`margin-top: -32px`), `border-top-left-radius: 28px`, `border-top-right-radius: 28px`, `background: var(--bg-main)`
- **Padding**: `20px 18px`
- **2-Column Layout**: Desktop (`≥ 768px`) uses 2-column grid (`grid-template-columns: 1fr 300px`, `gap: 20px`). Mobile uses 1-column layout.

### Course Pricing Table (Desktop vs Mobile):
- **Desktop Table View (`≥ 768px`)**: Full `<table>` layout with green `#30D158` right-aligned prices.
- **Mobile Card View (`< 768px`)**: `.mobile-course-price-card.glass.squircle` cards, `border-radius: 16px`, `padding: 12px`, `gap: 8px`.

### Right-Column Action Bar / Floating Sidebar:
- **Button Height**: `38px`
- **Border Radius**: `20px` (Pill shape)
- **Typography**: `font-size: 13px; font-weight: 800;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Non-Pinned Modal Action Bar**:
   - Modal action buttons inside `.school-detail-right-col` are non-pinned, natural scrolling items in the document flow.
2. **Address Masking Security**:
   - All full addresses pass through `getMaskedAddress()` to protect exact street numbers until applied.

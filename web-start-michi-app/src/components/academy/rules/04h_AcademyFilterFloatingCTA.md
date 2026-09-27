# AcademyFilterFloatingCTA Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Floating Dock Geometry:
- **Fixed Position**: `position: fixed`, `bottom: 96px`, `left: var(--screen-margin-x, 14px)`, `width: calc(100% - 28px)`
- **Z-Index**: `250`
- **Pointer Events**: `pointer-events: none` on dock container, `pointer-events: auto` on CTA button

### CTA Button Geometry:
- **Button Height**: `52px`
- **Border Radius**: `26px`
- **Background**: `linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)`
- **Box Shadow**: `0 10px 28px rgba(10, 132, 255, 0.45)`
- **Typography**: `font-weight: 800; font-size: 16px; color: #FFFFFF;`

### Bottom Clearance Spacer:
- **Exact Height Requirement**: `height: 160px; min-height: 160px; width: 100%; flex-shrink: 0; clear: both;`
- **Purpose**: Prevents floating search CTA button at `bottom: 96px` from covering the last filter sections.

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Clearance Spacer Invariant**:
   - Must ALWAYS render `<div style={{ height: '160px', minHeight: '160px', width: '100%', flexShrink: 0, clear: 'both' }} />` before the floating dock container.

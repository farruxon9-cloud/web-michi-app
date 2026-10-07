# JobFilterFloatingCTA Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Floating Dock Geometry:
- **Fixed Position**: `position: fixed`, `bottom: 96px`, `left: 0`, `right: 0`
- **Z-Index**: `250` (Floats above modal content, below global nav/alerts)
- **Pointer Events**: `pointer-events: none` on dock container, `pointer-events: auto` on button

### Search CTA Button Geometry:
- **Width**: `width: calc(100% - 28px)`
- **Max Width**: `max-width: 792px`
- **Padding**: `14px 20px`
- **Border Radius**: `20px`
- **Background**: `linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)`
- **Box Shadow**: `0 4px 16px rgba(10, 132, 255, 0.3)`
- **Typography**: `font-weight: 900; font-size: 15px; color: #FFF;`

### Bottom Clearance Spacer:
- **Exact Height Requirement**: `height: 78px; min-height: 78px; flex-shrink: 0; clear: both;`
- **Purpose**: Prevents the floating CTA dock at `bottom: 96px` from obscuring the last scrollable filter section inside the drawer.

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Clearance Spacer Invariant (Rule 137)**:
   - Must ALWAYS render `<div style={{ height: '78px', minHeight: '78px', width: '100%', flexShrink: 0, clear: 'both' }} />` before the floating dock container.
2. **Fixed Floating Dock Bottom Alignment**:
   - Must be positioned at `bottom: 96px` so it hovers perfectly above the bottom navigation bar without overlaps.

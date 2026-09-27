# AcademyFilterDrawer Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Drawer Container Geometry:
- **Viewport**: `.feed-container.fade-in.hide-scrollbar`
- **Padding**: `0 14px 0 14px`
- **Pinned Sticky Back Button**: `position: sticky; top: 0; left: 0; z-index: 300; width: 40px; height: 40px; border-radius: 50%; margin-bottom: -40px;`

### 3-Tab Header Invariant:
- **Tab Height**: `flex: 1`, `padding: 10px 8px`, `border-radius: 14px`
- **Active Tab Styling**: `#FFCC00` background, black text `#000000`, `font-weight: 800`, `box-shadow: 0 4px 14px rgba(255, 204, 0, 0.35)`

### Bottom Clearance Spacer & Floating Dock:
- **160px Clearance Spacer**: `height: 160px; min-height: 160px; width: 100%; flex-shrink: 0; clear: both;`
- **Floating CTA Dock**: `position: fixed`, `bottom: 96px`, `z-index: 250`, `pointer-events: none` container with `pointer-events: auto` CTA search button (`height: 52px; border-radius: 26px; background: linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%); font-weight: 800; font-size: 16px;`).

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Rule 20 Default Accordion Fold State**:
   - All filter sections (`isLocationSectionOpen`, `isStationsSectionOpen`, `isCourseSectionOpen`, etc.) MUST default to `false` (collapsed) upon drawer open and reset.
2. **160px Clearance Spacer Invariant**:
   - Must ALWAYS render `<div style={{ height: '160px', minHeight: '160px', width: '100%', flexShrink: 0, clear: 'both' }} />` before the floating search CTA dock to prevent bottom section content truncation.

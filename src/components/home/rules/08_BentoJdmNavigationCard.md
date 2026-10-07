# BentoJdmNavigationCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Outer Card Geometry:
- **Card Class**: `.bento-action-card.bento-jdm-card`
- **Margin Top**: `10px`
- **Inner Padding**: `10px 12px` (Ultra-compact single-row sleek)
- **Border Radius**: `16px`
- **Background**: `linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)`
- **Border**: `1.2px solid rgba(16, 185, 129, 0.22)`
- **Box Shadow**: `0 3px 14px rgba(16, 185, 129, 0.06)`

### Floating Badge Tag:
- **Position**: `position: absolute; top: 8px; right: 8px; z-index: 5;`
- **Typography**: `font-size: 9px; font-weight: 900; letter-spacing: 0.4px; text-transform: uppercase; white-space: nowrap;`
- **Padding & Radius**: `padding: 2px 7px; border-radius: 12px;`
- **Background**: `linear-gradient(135deg, #FF9500 0%, #FF2D55 100%); box-shadow: 0 2px 8px rgba(255, 149, 0, 0.35);`

### Inner Subtags (Single-Row Horizontal Scroll):
- **Subtag Container**: `display: flex; align-items: center; gap: 4px; overflow-x: auto; scrollbar-width: none; white-space: nowrap;`
- **Subtag Pill**: `font-size: 8.5px; padding: 2px 5px; border-radius: 5px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.22); color: #10b981; font-weight: 800; flex-shrink: 0;`

### Typography & Icon:
- **Badge Category**: `font-size: 8.5px; font-weight: 800; letter-spacing: 0.6px; color: #10b981; text-transform: uppercase;`
- **Title (`h3`)**: `font-size: 13px; font-weight: 850; letter-spacing: -0.2px; line-height: 1.2; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- **Subtitle (`p`)**: `font-size: 10px; opacity: 0.85; line-height: 1.25; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- **Icon Box**: `30x30px`, `border-radius: 10px`, `background: linear-gradient(135deg, #10b981 0%, #059669 100%)`, `box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Single-Row Horizontal Subtag Scroll Invariant**:
   - Subtag pills MUST use `flexShrink: 0` and single horizontal scroll wrapper (`overflowX: 'auto'`) so they NEVER wrap into a 2nd vertical row, keeping card height strictly compact.
2. **Navigation Trigger**:
   - Card click MUST execute `triggerSound()` and `onNavigateToJDM()` to open the JDM Smart Truck Navigation map view.

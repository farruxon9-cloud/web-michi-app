# JDMNavSearchHeader Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Header Dock**: `position: absolute; top: 0; left: 0; right: 0; z-index: 300; padding: 12px 14px;`
- **Back Button**: `40x40px`, `border-radius: 50%`, `background: var(--card-bg)`
- **Search Stack Box**: `border-radius: 18px`, `border: 1px solid var(--glass-border)`, `padding: 6px 12px`
- **Vehicle Pill**: `height: 40px`, `padding: 0 12px`, `border-radius: 20px`, `font-size: 12px`, `font-weight: 800`

### Suggestion Items:
- **Item Padding**: `10px 12px`, `border-radius: 10px`, `font-size: 13px`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Pointer-Events Container Safety**:
   - Outer container applies `pointer-events: none` while interactive child controls apply `pointer-events: auto` to allow panning through map regions above header.
2. **Debounced Address Search**:
   - Inputs trigger `searchAddress` only when input length `>= 2` characters.

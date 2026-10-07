# AcademyFilterStationsSection Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Section Container Geometry:
- **Card Radius**: `18px`
- **Border**: Active state `1px solid rgba(48, 209, 88, 0.4)` / Inactive `1px solid var(--glass-border)`
- **Box Shadow**: Active state `0 8px 24px rgba(48, 209, 88, 0.1)` / Inactive `0 4px 20px rgba(0, 0, 0, 0.03)`
- **Icon Box**: `36x36px`, `border-radius: 10px`, `background: #30D15815`

### Train Line Dot Indicator:
- **Badge Dot**: `width: 10px; height: 10px; border-radius: 50%; background: line.color; boxShadow: 0 0 6px line.color;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Station Array Unique Set Handling**:
   - Selecting an entire line adds all stations using `Array.from(new Set([...prev, ...line.stations]))`.

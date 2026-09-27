# JobSkeletonCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Outer Skeleton Geometry:
- **Card Class**: `.job-card-hz.skeleton-card.glass`
- **Min Height**: `156px`
- **Width**: `100%`
- **Margin Bottom**: `12px`
- **Border Radius**: `16px`
- **Border**: `1px solid var(--glass-border)`

### Shimmer Elements (`.skeleton-shimmer`):
- **Image Placeholder**: `height: 100px; width: 100px; border-radius: 8px;`
- **Title Line 1**: `width: 40%; height: 12px; border-radius: 4px;`
- **Title Line 2**: `width: 80%; height: 18px; border-radius: 4px; margin-top: 4px;`
- **Salary Line**: `width: 50%; height: 14px; border-radius: 4px;`
- **Chip Placeholders**: `60x22px` & `70x22px` (`border-radius: 12px`)
- **Action Buttons**: `flex: 1; height: 32px; border-radius: 8px;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Exact 156px Height Parity**:
   - Skeleton layout height MUST match actual `JobCardHorizontal` min-height (156px) so layout shift (CLS) is zero when loading completes.
2. **Keyframe Shimmer Speed**:
   - Shimmer animation uses `linear-gradient` sweep with 1.5s infinite loop.

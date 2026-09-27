# HeroCarousel Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Outer Dimensions & Spacing:
- **Container Class**: `.dash-hero-carousel-container`
- **Width**: `100%` (fill parent viewport width up to 820px desktop cap)
- **Margin Top**: `0px` (First element inside `.dashboard-container`)
- **Padding Bottom**: `16px` (Bottom clearance for active pagination dots)
- **Positioning**: `position: relative; overflow: hidden;`

### Individual Card Geometry:
- **Card Class**: `.dash-hero-card`
- **Height**: `160px` on mobile (`< 768px`), `200px` on tablet (`>= 768px`), `220px` on desktop (`>= 1200px`)
- **Inner Padding**: `20px` (mobile), `28px 36px` (tablet), `32px 44px` (desktop)
- **Border Radius**: `24px` (mobile), `28px` (desktop)
- **Card Gap**: `padding: 0 4px` on `.dash-hero-slide-wrapper`

### Typography & Icon Norms:
- **Badge (`.dash-badge`)**: `font-size: 11px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;`
- **Title (`.dash-hero-title`)**: `font-size: 22px; font-weight: 800; line-height: 1.2; margin: 0 0 6px; white-space: nowrap; text-overflow: ellipsis;`
- **Subtitle (`.dash-hero-sub`)**: `font-size: 13px; max-width: 90%; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2;`
- **3D Icon (`.dash-hero-icon-3d`)**: `64x64px`, `margin-left: 12px`, `transform: rotate(-10deg)`, `filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))`

### Dots Indicator Norms:
- **Dot inactive**: `width: 6px; height: 6px; border-radius: 50%;`
- **Dot active**: `width: 12px; height: 6px; border-radius: 6px;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Swipe vs Tap Disambiguation**:
   - `handleCardClick` MUST verify `Math.abs(touchStartX - touchEndX) < 10px`. Any drag exceeding 10px is treated strictly as a horizontal swipe gesture, NOT a tap action.
2. **Auto-play Pause Safety**:
   - Auto-play timer (4s interval) MUST pause immediately when `isPaused === true` (user holding touch/mouse).
3. **Smooth Transition Curve**:
   - Track slider MUST use `transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)` to guarantee Apple-grade spring physics.

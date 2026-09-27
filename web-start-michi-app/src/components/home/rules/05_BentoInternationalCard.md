# BentoInternationalCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Outer Card Geometry:
- **Card Class**: `.bento-action-card.bento-international-card`
- **Margin Top**: `12px`
- **Inner Padding**: `20px 24px`
- **Border Radius**: `24px` (`squircle`)
- **Background**: `var(--dash-card-bg); backdrop-filter: blur(20px);`
- **Border**: `1px solid var(--dash-card-border)`

### Live Pulse Dot Indicator:
- **Dot Class**: `.premium-live-dot`
- **Size**: `6x6px`, `border-radius: 50%`, `background: #30D158; box-shadow: 0 0 8px #30D158;`
- **Pulse Ring (`:after`)**: `14x14px`, `animation: 2s ease-out infinite livePulse`

### Content Layout & Typography:
- **Category Badge**: `font-size: 9px; font-weight: 800; letter-spacing: 1.5px; color: var(--text-secondary); text-transform: uppercase;`
- **Visa Tag**: `font-size: 9px; font-weight: 800; letter-spacing: 1px; color: #AF52DE; text-transform: uppercase;`
- **Title (`h3`)**: `font-size: 20px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.2; margin: 0 0 6px 0;`
- **Subtitle (`p`)**: `font-size: 12.5px; opacity: 0.85; line-height: 1.4; margin: 0 0 12px 0;`
- **Minimal Tags**: `font-size: 9.5px; padding: 3px 8px; border-radius: 8px; background: var(--glass-bg); border: 1px solid var(--glass-border); font-weight: 700;`
- **Icon Container (`.bento-international-card-icon`)**: `48x48px`, `border-radius: 50%`, `background: var(--glass-bg)`, `color: var(--primary)`. Hover effect: `background: var(--primary); color: #FFF;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Click Handler Routing**:
   - Card click MUST execute `onNavigateToInternational` to switch view to International Jobs.
2. **Text Wrap Prevention**:
   - Category badges MUST use `white-space: nowrap` and `flexWrap: wrap` for minimal tags so elements adjust smoothly on narrow mobile screens (320px-375px).

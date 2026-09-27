# BentoQuickNav Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Bento Grid Row Geometry:
- **Container Class**: `.bento-icons-row`
- **Margin Top**: `12px`
- **Flex Gap**: `12px` (mobile), `16px` (desktop)
- **Desktop Grid**: `@media (width >= 768px)` -> `grid-template-columns: repeat(4, 1fr)`

### Individual Action Card (`.bento-icon-card`):
- **Min Height**: `115px` (mobile), `135px` (desktop)
- **Inner Padding**: `14px 12px` (mobile), `18px 16px` (desktop)
- **Border Radius**: `20px` (mobile), `22px` (desktop)
- **Dark Card (`.dark-card`)**: `background: #2D2A26; border: 1px solid rgba(255, 255, 255, 0.08); color: #FFF;`
- **Light Card (`.light-card`)**: `background: var(--dash-card-bg); border: 1px solid var(--dash-card-border); color: var(--text-main);`

### Inner Card Elements:
- **Icon Wrapper (`.bento-icon-wrap`)**: `44x44px`, `border-radius: 50%`, `background: rgba(255, 255, 255, 0.1)` for dark cards, `var(--bg-color)` for light cards.
- **Card Title (`h4`)**: `font-size: 15px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.02em;`
- **Card Subtitle (`p`)**: `font-size: 11px; opacity: 0.7; margin: 0;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Equal Width Distribution**:
   - On mobile layouts, `.bento-icon-card` items MUST use `flex: 1 1 0; min-width: 0;` so all 3 cards divide container width equally.
2. **Haptic Click Trigger**:
   - Card click MUST call `triggerSound()` to trigger haptic click before `setActiveTab(...)`.
3. **Hover Animation Scale**:
   - Hover state applies `transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);`.

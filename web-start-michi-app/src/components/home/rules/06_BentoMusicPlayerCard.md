# BentoMusicPlayerCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Full-Width Mode Geometry (`isCompact=false`):
- **Card Class**: `.bento-music-card`
- **Margin Top**: `10px`
- **Inner Padding**: `16px 20px` (mobile), `24px` (desktop)
- **Border Radius**: `24px` (`squircle`)
- **Gradient Icon (`.music-gradient-icon`)**: `44x44px`, `border-radius: 12px`, `background: linear-gradient(135deg, var(--primary), #af52de); box-shadow: 0 4px 12px rgba(94, 92, 230, 0.25)`
- **Control Buttons**: Play/Pause `38x38px` (`.btn-play-pause`), Skip `32x32px` (`.btn-skip`), Volume `28x28px` (`.btn-vol`)
- **Volume Slider**: `width: 60px; height: 3px; border-radius: 1.5px;`

### Compact Mode Geometry (`isCompact=true`):
- **Card Class**: `.bento-music-card.compact-music-card`
- **Min Height**: `156px`
- **Inner Padding**: `16px !important`
- **Buttons**: Play/Pause `48x48px !important`, Skip `40x40px !important`
- **Marquee Track Title (`.compact-title`)**: `font-size: 12px; font-weight: 700; line-height: 1.3; animation: 8s ease-in-out infinite alternate marquee-scroll;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Title Marquee Animation**:
   - In compact mode, track titles MUST use keyframes `marquee-scroll` with `transform: translate(min(0px, 95px - 100%))` so long track names scroll horizontally without clipping.
2. **Dynamic Volume Gradient**:
   - Volume slider input MUST compute dynamic background gradient percentage in inline style: `linear-gradient(to right, var(--primary) ${musicPlayer.volume * 100}%, rgba(120, 120, 128, 0.2) ${musicPlayer.volume * 100}%)`.
3. **Pulse Animation on Playing**:
   - When `musicPlayer.isPlaying` is true, `.music-gradient-icon` receives `.playing-pulse` class (`animation: 2.5s ease-in-out infinite pulse-glow`).

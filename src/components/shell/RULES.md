# Global App Shell & Navigation Suite Architecture & Layout Rules

## Core Layout & Dimension Norms
- **Floating Bottom Navigation Bar (`.bottom-nav`)**:
  - `position: absolute`, `bottom: 12px`, `left: 14px`, `width: calc(100% - 28px)`.
  - `height: 72px`, `border-radius: 24px`, `backdrop-filter: blur(24px) saturate(200%)`.
  - `z-index: var(--z-nav)` (9000).
- **Desktop Side Navigation Rail (`.side-nav`)**:
  - `position: fixed`, `left: 0`, `top: 0`, `bottom: 0`, `width: 240px`, `z-index: 9000`.
- **Global Clearance Clearance Rule**:
  - Scrollable view containers MUST render an exact `<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />` to guarantee contents scroll past the floating bottom bar without clipping.

## Per-Component Spec Index (`rules/`)
1. [`bottom_nav_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/shell/rules/bottom_nav_spec.md) - Floating glass tab bar, touch slide gesture navigation, haptic click feedback.
2. [`side_nav_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/shell/rules/side_nav_spec.md) - Desktop navigation rail and sidebar collapse controller.
3. [`language_select_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/shell/rules/language_select_spec.md) - Global 8-language switcher (UZ, JA, EN, RU, VI, ZH, HI).
4. [`splash_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/shell/rules/splash_spec.md) - App boot splash animation screen.
5. [`error_boundary_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/shell/rules/error_boundary_spec.md) - UI exception boundary fallback & app recovery trigger.

## Bug Prevention & Learned Fixes
- **Bottom Navigation Overlap Fix**: Always maintain explicit `z-index: var(--z-nav)` (9000) below modal overlays (`z-index: 9999`), but above page content layers (`z-index: 1`).
- **Touch Gesture Swipe Threshold**: Bottom tab bar swipe navigation enforces a minimum drag displacement threshold of 30px to avoid accidental tab switching while scrolling vertically.

# Bottom Navigation Specification

## Layout Geometry & Positioning
- **Container**: `position: absolute`, `bottom: 12px`, `height: 72px`, `border-radius: 24px`.
- **Active Pill Indicator**: Dynamic position calculated by `startOffset + dragDelta`, `border-radius: 20px`, background `rgba(161, 51, 255, 0.15)`.
- **Nav Icon Box**: `width: 24px`, `height: 24px`.
- **Text Label**: `font-size: 10px`, `font-weight: 700`, active color `#a133ff`.

## Button & Event Rules
- **Tab Click**: Triggers `setActiveTab(tabId)` and fires Web Audio / Haptic click feedback (`playHapticClick`).
- **Drag Swipe Gesture**: Horizontal drag tracks finger position; releasing switches active tab if drag distance > 30px.

## Learned Errors & Fixes
- **Error**: Tab label wrapping on small screen phones in multi-word languages.
- **Fix**: Set `flex: 1`, `min-width: 0`, and `white-space: nowrap` with ellipsis on `.nav-item span`.

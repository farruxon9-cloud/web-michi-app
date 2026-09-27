# Michi Drawer Trigger Specification

## Layout Geometry & Positioning
- **Container**: Floating pill button.
- **Position**: `fixed`, `bottom: calc(84px + env(safe-area-inset-bottom))`, `right: 16px`.
- **Z-Index**: `9980`.
- **Dimensions**: `height: 48px`, `padding: 0 16px`, `border-radius: 24px`.
- **Background**: `rgba(20, 20, 25, 0.85)` with `backdrop-filter: blur(16px)` and gradient border.

## Button & Event Rules
- **Click Event**: Opens `MichiSideDrawer` with slide-in animation.
- **Badge Indicator**: Displays unread AI suggested actions count when available.

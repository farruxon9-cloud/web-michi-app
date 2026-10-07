# Side Navigation Specification

## Layout Geometry & Positioning
- **Container**: `position: fixed`, `left: 0`, `top: 0`, `bottom: 0`, `width: 240px`.
- **Visibility**: Rendered on tablet/desktop viewports (`@media (min-width: 768px)`).
- **Navigation Item**: `height: 48px`, `padding: 0 16px`, `border-radius: 12px`, `margin-bottom: 6px`.

## Button & Event Rules
- **Side Nav Tab Select**: Navigates active main view tab.
- **Collapse Toggle**: Toggles side rail width between 240px and 72px (icon-only mode).

# Error Boundary Fallback Specification

## Layout Geometry & Positioning
- **Error Card Container**: Centered modal card `max-width: 420px`, `padding: 32px`, `border-radius: 24px`, background `var(--dash-card-bg)`.
- **Alert Icon Box**: `width: 60px`, `height: 60px`, `border-radius: 50%`, background `rgba(239, 68, 68, 0.15)`.

## Button & Event Rules
- **Reload App Button**: Calls `window.location.reload()` to recover from unhandled JavaScript runtime exceptions.
- **Report Issue Link**: Logs error trace to console / reporting engine.

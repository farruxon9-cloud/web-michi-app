# Robot Avatar Specification

## Layout Geometry & Positioning
- **Avatar Graphic Box**: `width: 64px`, `height: 64px`, `border-radius: 50%`, background `linear-gradient(135deg, #a133ff, #6366f1)`.
- **Pulse Ring**: `position: absolute`, `inset: -6px`, `border-radius: 50%`, border `2px solid rgba(161, 51, 255, 0.5)`.
- **States**: `idle` (subtle float), `listening` (glowing pulse), `speaking` (equalizer bar animation).

## Button & Event Rules
- **Avatar Click**: Toggles Michi AI voice panel overlay.

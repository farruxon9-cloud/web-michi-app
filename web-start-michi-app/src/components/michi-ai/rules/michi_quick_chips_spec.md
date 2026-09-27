# Michi Quick Chips Specification

## Layout Geometry & Positioning
- **Container**: `display: flex`, `gap: 8px`, `overflow-x: auto`, `padding: 4px 0`, `-webkit-overflow-scrolling: touch`.
- **Chip Item**: `height: 34px`, `padding: 0 14px`, `border-radius: 17px`, `white-space: nowrap`, `font-size: 13px`.
- **Background**: `rgba(255, 255, 255, 0.06)`, border `1px solid rgba(255, 255, 255, 0.12)`.

## Button & Event Rules
- **Chip Click**: Triggers immediate submission of the chip query string to Michi AI processing pipeline without typing delay.

# Driver Registration Form Specification

## Layout Geometry & Positioning
- **Form Scroll Container**: `max-height: calc(100dvh - 120px)`, `overflow-y: auto`, `padding: 20px`.
- **License Checkbox Grid**: 2 columns grid `gap: 10px`, `margin-top: 12px`.
- **License Item Badge**: `height: 42px`, `padding: 0 12px`, `border-radius: 10px`, background `rgba(255, 255, 255, 0.05)`, active border `var(--brand-primary)`.

## Button & Event Rules
- **License Selection Toggle**: Toggles license code in `selectedLicenses` array.
- **Complete Profile Button**: Validates email format, password strength score (>= 2), and terms agreement check.

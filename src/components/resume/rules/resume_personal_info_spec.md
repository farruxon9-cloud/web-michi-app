# Resume Personal Info Specification

## Layout Geometry & Positioning
- **Form Card**: `border-radius: 16px`, `padding: 20px`, background `var(--dash-card-bg)`.
- **Photo Upload Area**:
  - Dimensions: `width: 120px`, `height: 160px` (Exact 3:4 aspect ratio required for Japanese Rirekisho).
  - Border: `2px dashed rgba(255, 255, 255, 0.2)`.
  - Radius: `12px`.
- **Input Fields Grid**: 2-column grid on desktop (`gap: 16px`), single column stack on mobile.

## Button & Event Rules
- **Photo Upload**: Validates image aspect ratio and truncates size under 5MB.
- **Gender Selection**: Options: `Man`, `Woman`, `Unspecified` (Japanese optional convention).

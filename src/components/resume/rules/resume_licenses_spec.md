# Resume Licenses Specification

## Layout Geometry & Positioning
- **License List Card**: `border-radius: 16px`, `padding: 20px`, background `var(--dash-card-bg)`.
- **Pre-set Japanese License Badges**: `display: flex`, `flex-wrap: wrap`, `gap: 8px`, `margin-bottom: 16px`.
- **Badge Item**: `height: 36px`, `padding: 0 12px`, `border-radius: 18px`, `font-size: 13px`.

## Button & Event Rules
- **Quick Add Badge**: One-click add for Japanese licenses:
  - `普通自動車第一種運転免許` (Class 1 Standard Driver's License)
  - `準中型自動車免許` (Semi-Medium Driver's License)
  - `中型自動車第一種運転免許` (Medium Driver's License)
  - `大型自動車第一種運転免許` (Heavy / Large Vehicle License)
  - `日本語能力試験 N1 / N2 / N3` (JLPT Certification)
- **Remove License**: Deletes item from `licenses` list state.

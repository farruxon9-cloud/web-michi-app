# Custom Inline Dropdown Specification

## Layout Geometry & Positioning
- **Dropdown Control**: `height: 48px`, `border-radius: 14px`, `display: flex`, `align-items: center`, `justify-content: space-between`.
- **Menu Container**: `position: absolute`, `top: calc(100% + 6px)`, `left: 0`, `right: 0`, `z-index: 500`, background `var(--dash-card-bg)`, `border-radius: 14px`.

## Button & Event Rules
- **Toggle Open**: Opens dropdown list menu with slide animation.
- **Select Item**: Sets value and triggers callback.

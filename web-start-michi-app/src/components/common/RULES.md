# Common Mobile UI Controls & Custom Pickers Suite Architecture & Layout Rules

## Core Layout & Dimension Norms
- **Custom Bottom Sheet Picker Modal (`.custom-mobile-picker-overlay`)**:
  - `position: fixed`, `inset: 0`, `z-index: 9999` (`var(--z-modal)`).
  - Background `rgba(0, 0, 0, 0.6)` with backdrop blur `12px`.
  - Sheet Container: `width: 100%`, `max-width: 500px`, `max-height: 80dvh`, `border-radius: 28px 28px 0 0` bottom sheet on mobile.
- **Custom Inline Glass Dropdown (`.custom-inline-dropdown`)**:
  - `height: 48px`, `border-radius: 14px`, `padding: 0 16px`, background `rgba(255, 255, 255, 0.06)`, border `1px solid rgba(255, 255, 255, 0.12)`.
  - Dropdown Menu Layer: `position: absolute`, `top: calc(100% + 6px)`, `left: 0`, `right: 0`, `z-index: 500`, `max-height: 260px`, `overflow-y: auto`.

## Per-Component Spec Index (`rules/`)
1. [`custom_mobile_picker_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/common/rules/custom_mobile_picker_spec.md) - Native-like wheel / list picker bottom sheet with search filter.
2. [`custom_inline_dropdown_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/common/rules/custom_inline_dropdown_spec.md) - Searchable glass dropdown with keyboard navigation support.
3. [`japanese_vehicle_picker_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/common/rules/japanese_vehicle_picker_spec.md) - Commercial vehicle classification picker (Kei truck, Medium 4t, Heavy 10t, Trailer).
4. [`referral_modal_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/common/rules/referral_modal_spec.md) - Shoukai referral program reward claim dialog.
5. [`vehicle_gradient_card_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/common/rules/vehicle_gradient_card_spec.md) - Vehicle showcase card with dynamic background gradient.
6. [`robot_avatar_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/common/rules/robot_avatar_spec.md) - Michi AI robot avatar graphic with voice animation state rings.

## Bug Prevention & Learned Fixes
- **Mobile Picker Body Scroll Lock**: When opening bottom sheet picker, add `overflow: hidden` to `document.body` to prevent background scrolling underneath the overlay.
- **Click Outside Dismiss**: All custom dropdowns and bottom sheets must attach click listener on `document` to close cleanly when clicking outside container bounds.

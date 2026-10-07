# Email OTP Modal Specification

## Layout Geometry & Positioning
- **Modal Overlay**: `fixed`, `top: 0`, `left: 0`, `right: 0`, `bottom: 0`, `z-index: 9999` (`var(--z-modal)`).
- **Glassmorphism Backdrop**: `background: rgba(0, 0, 0, 0.6)`, `backdrop-filter: blur(12px)`.
- **OTP Input Grid**: 6 individual digit input boxes (`width: 44px`, `height: 52px`, `border-radius: 12px`, `text-align: center`, `font-size: 22px`).
- **Resend Countdown Timer**: `font-size: 13px`, `color: var(--text-secondary)`, `margin-top: 12px`.

## Button & Event Rules
- **Submit OTP Code**: Auto-triggers upon completing 6th digit entry or clicking 'Verify'.
- **Resend Code Button**: Disabled until 60-second cooldown timer reaches 0.
- **Close Button**: Closes modal and resets state.

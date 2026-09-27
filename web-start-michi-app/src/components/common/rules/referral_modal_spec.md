# Referral Modal Specification

## Layout Geometry & Positioning
- **Modal Box**: Centered popup `max-width: 420px`, `padding: 24px`, `border-radius: 24px`, background `var(--dash-card-bg)`.
- **Reward Badge Banner**: Gradient background `linear-gradient(135deg, #f59e0b, #ef4444)`, `border-radius: 16px`, `padding: 16px`.
- **Referral Code Input**: `height: 48px`, `border-radius: 12px`, `font-weight: 800`, `letter-spacing: 2px`.

## Button & Event Rules
- **Copy Referral Code**: Copies unique user referral code (`michi.app/ref/ID`) to clipboard.
- **Claim Bonus**: Triggers `handleShoukai()` callback.

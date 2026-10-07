# Job Detail View Specification

## Layout Geometry & Positioning
- **Container (`.job-detail-container`)**: Full width mobile view `max-width: 600px` centered, `padding: 0 16px 120px 16px`.
- **Hero Image / Company Banner**: `height: 200px`, `border-radius: 20px`, `margin-bottom: 16px`, `object-fit: cover`.
- **Salary Highlight Card**: Background `linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.1))`, `border-radius: 16px`, `padding: 16px`.
- **Sticky Bottom Action Bar**: `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`, `height: 76px`, `z-index: 100`, background `var(--dash-card-bg)` with blur backdrop.

## Button & Event Rules
- **Apply Job Button**: Triggers `onApply(job)` modal or application submission state.
- **Shoukai (Referral) Button**: Opens referral reward modal (`onShoukai(job)`).
- **Save Bookmark Button**: Toggles `onToggleSave(job)` and updates local bookmark state.
- **Share Button**: Invokes `navigator.share()` API or copies web link to clipboard.

## Learned Errors & Fixes
- **Address Privacy Masking Rule**: Full exact addresses in Japan must mask sub-chome details (`getMaskedAddress`) to respect company privacy compliance until application acceptance.

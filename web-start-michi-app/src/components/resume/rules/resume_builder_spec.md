# Resume Builder Controller Specification

## Layout Geometry & Positioning
- **Main Wrapper**: `.resume-builder-page` with `max-width: 800px`, `margin: 0 auto`, `padding: 16px 16px 120px 16px`.
- **Step Header Progress Bar**: `height: 6px`, `border-radius: 3px`, active step background `var(--brand-primary)` (#a133ff).
- **Navigation Action Bar**: Fixed bottom sticky bar `height: 64px`, `z-index: 100`, background `var(--dash-card-bg)` with top border.

## Button & Event Rules
- **Back Button**: Navigates back to previous form section step or Profile main screen.
- **Next Step Button**: Validates current step fields before advancing.
- **Generate PDF Button**: Renders standard Japanese PDF sheet via `generateRirekisho` utility.

## Learned Errors & Fixes
- **Error**: Form state reset when switching tabs.
- **Fix**: Auto-save draft inputs into `localStorage.setItem('michi_resume_draft', JSON.stringify(formData))` on every change.

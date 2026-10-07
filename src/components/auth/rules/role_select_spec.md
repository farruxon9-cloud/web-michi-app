# Role Select Controller Specification

## Layout Geometry & Positioning
- **Header**: Back button (`width: 40px`, `height: 40px`), title `24px font-weight: 800`, language selector dropdown top right.
- **Card Stack**: Vertical flex layout with `16px` gap.
- **Driver Card**: Background gradient `linear-gradient(135deg, rgba(161, 51, 255, 0.2), rgba(59, 130, 246, 0.1))`.
- **Company Card**: Background gradient `linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.1))`.
- **Guest Access Link**: Fixed link at container bottom `padding: 12px`, `font-size: 14px`, text decoration underline.

## Button & Event Rules
- **Select Driver Role**: Sets `selectedRole('driver')` and proceeds to registration form.
- **Select Company Role**: Sets `selectedRole('company')` and proceeds to corporate recruiter form.
- **Guest Mode Button**: Calls `onGuest()` prop to launch app in read-only public mode.

## Learned Errors & Fixes
- **Error**: Rapid double-clicking on role cards triggered dual state transitions.
- **Fix**: Added click throttle flag `isSubmitting` during step changes.

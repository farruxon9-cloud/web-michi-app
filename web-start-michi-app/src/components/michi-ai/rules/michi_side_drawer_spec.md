# Michi Side Drawer Specification

## Layout Geometry & Positioning
- **Container**: Slide-over drawer container.
- **Position**: `fixed`, `top: 0`, `right: 0`, `bottom: 0`, `width: 100%`, `max-width: 420px`.
- **Z-Index**: `9990` (`var(--z-voice)`).
- **Background**: `var(--dash-card-bg)` with glassmorphism backdrop blur.
- **Header Height**: `60px` with close button and conversation clear trigger.

## Button & Event Rules
- **Send Message Button**: Submits input text to Gemini / HuggingFace AI mesh engine.
- **Clear Chat**: Clears current session history and updates local cache.
- **Drawer Close Button**: Slides drawer off-screen with CSS `transform: translateX(100%)`.

## Learned Errors & Fixes
- **Error**: Virtual keyboard on iOS Safari hides the bottom message input field.
- **Fix**: Wrapped input area with `padding-bottom: max(16px, env(safe-area-inset-bottom))` and set dynamic height calculation using `100dvh`.

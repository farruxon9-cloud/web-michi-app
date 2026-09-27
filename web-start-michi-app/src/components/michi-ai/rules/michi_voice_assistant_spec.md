# Michi Voice Assistant Controller Specification

## Layout Geometry & Positioning
- **Container**: Ambient floating modal / bottom sheet overlay.
- **Z-Index**: `9990` (`var(--z-voice)`).
- **Max Width**: `380px` centered on mobile viewport.
- **Padding**: `24px` content padding inside setup modal.
- **Close Button**: `width: 28px`, `height: 28px`, absolute `top: 16px`, `right: 16px`.

## Button & Event Rules
- **Mic Permission Button**: Triggers `navigator.mediaDevices.getUserMedia({ audio: true })`.
- **API Key Submit**: Persists key to `localStorage.setItem('michi_gemini_api_key')`.
- **Close Modal Button**: Dismisses overlay and returns focus to active tab view.

## Learned Errors & Fixes
- **Error**: Web Speech API disconnects unexpectedly after 5 seconds of silence in Chrome.
- **Fix**: Implemented heartbeat timer that re-initializes `speechRecognition` when active mode is standby.

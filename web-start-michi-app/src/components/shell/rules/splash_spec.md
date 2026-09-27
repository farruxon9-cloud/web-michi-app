# App Boot Splash Specification

## Layout Geometry & Positioning
- **Container**: `fixed`, `inset: 0`, `z-index: 99999`, background `var(--dash-bg)`.
- **Logo Graphic**: Centered 80px x 80px animated Michi logo with pulse ring.
- **Duration**: Fades out smoothly after initial bundle initialization (800ms fade transition).

## Button & Event Rules
- **Auto Dismiss**: Triggers `onFinish()` callback once app resources & i18n locales are ready.

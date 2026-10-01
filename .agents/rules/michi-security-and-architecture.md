# Michi Security & Architecture Rules

## 1. Security Guidelines
- **Auto-Escaping & XSS Defense**: Always render user-generated queries and AI responses using standard JSX curly braces (`{text}`) or sanitized DOM methods. Never use `dangerouslySetInnerHTML` for unformatted AI responses or user inputs.
- **Confirmation Safety Triggers**: Destructive operations like clearing chat history (`onClearHistory`) or purging persistent cache must be guarded by multi-language explicit confirmation dialogs before invoking storage purges.
- **Overlay & Clickjacking Protection**: Set high explicit `z-index` (e.g. `999999`) for full-viewport portals and apply `pointer-events: none` on decorative pulse rings or background ambient glow overlays.

## 2. Architectural & UX Guidelines
- **Mandatory Stylesheet Import Verification**: When creating or refactoring a component, explicitly verify that its corresponding stylesheet (e.g., `import './VoiceAssistant.css';`) is imported at the top of the file to prevent unstyled layout collapse.
- **Portal Scoping Strategy**: Use `createPortal(overlay, document.body)` ONLY for full-viewport backdrop overlays (`MichiSideDrawer`). Trigger buttons docked to container edges (`MichiDrawerTrigger`) must render inside `#root` directly without portals to avoid flex column stacking below `#root`.
- **Sub-page Clearance Uniformity & Scope Isolation**: Ensure sub-page container variants (e.g. `.profile-container.sub-page-view`) align container CSS `padding-bottom` with JSX end-of-block inline spacers (`height: '12px'`). Always scope spacing edits strictly to the requested page (`Profile.jsx`) without altering global CSS variables or unrelated page containers.
- **Dynamic Bounding Rect Calculations**: Calculate edge offsets dynamically using `getBoundingClientRect()` of container elements instead of hardcoded CSS calc formulas that break on resize.
- **Defensive Prop Destructuring & State Fallbacks**: Always provide default fallback parameters in component signatures (e.g. `speechLang = 'ja'`, `drawerInput = ''`, `soundSettings = { sound: true, vibration: true }`, `onLogout = () => {}`) and create local state with `localStorage` persistence fallback for optional toggles (`notificationSound`, `showProfileBadges`) to prevent unhandled `TypeError: fn is not a function` crashes.

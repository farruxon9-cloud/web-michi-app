# React Full-Screen Overlay & Portal Guidelines

## 1. Direct `document.body` Portal
- For full-viewport drawers, modals, or floating controls that need to escape container overflow (`overflow: hidden` on `#root` or `.app-layout`), always render via `createPortal(component, document.body)`.
- **Do NOT** insert secondary container `div` elements into `index.html` alongside `#root` when `body` uses flexbox column alignment (`display: flex; flex-direction: column`). This causes the portal container to stack underneath `#root` in document flow.

## 2. Fixed Overlay & Centered Container
- Apply `position: fixed !important; inset: 0 !important; width: 100vw; height: 100dvh; z-index: 999999` to full-screen overlay wrappers.
- On desktop responsive views, center inner panels with `max-width: 820px; width: 100%; margin: 0 auto;` so that both side margins render clean background space.

## 3. Prop Verification
- Always verify that props referenced inside render methods or helper functions (e.g. `speechLang`, `status`, `t`) are explicitly destructured with default fallbacks in the component's signature, preventing runtime `ReferenceError` crashes.

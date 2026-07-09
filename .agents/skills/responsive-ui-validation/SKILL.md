---
name: responsive-ui-validation
description: Guidelines for ensuring UI layouts look consistent and fit perfectly across mobile devices and desktop simulator container frames.
---

# Responsive UI Validation Skill

This skill prevents visual overlap, simulator boundaries breakout, and responsiveness bugs.

## 1. Desktop Simulator Boundaries (iPhone Mock frame)
- When building overlays, modals, dropdowns, and drawers in desktop previews where the `#root` container acts as a phone frame mockup:
  - Never use `position: fixed` if the modal needs to be locked within the phone frame boundaries. Use `position: absolute` instead.
  - Mount React Portals to `document.getElementById('root') || document.body` so that they render inside the phone frame mockup on desktop, while falling back to the full body on native mobile.

## 2. Dynamic SafeArea Padding
- Always apply native bottom/top safe areas using CSS layout values:
  - `padding-bottom: calc(16px + env(safe-area-inset-bottom));`
- Verify that touch targets (buttons) have a minimum size of 44px for easy finger tapping.

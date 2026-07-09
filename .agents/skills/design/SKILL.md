---
name: design
description: General visual guidelines for designing premium, clean, iOS-style layouts and interaction models.
---

# Premium Design Guidelines

## 1. Cupertino Aesthetics
- Follow Apple Human Interface Guidelines (HIG) spacing and scales.
- Card structures should have subtle, thin borders (`1px solid rgba(0,0,0,0.04)`) to separate content without adding visual clutter.
- Use a high contrast level for text to optimize visibility for all user classes.

## 2. Interaction Feedback
- All buttons and interactive tabs must scale slightly on press: `transform: scale(0.96)`.
- Use soft haptic-vibration feedback simulation when available.

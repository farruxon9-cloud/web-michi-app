---
name: ui-styling
description: Guidelines for implementing premium UI styling patterns, glassmorphism blur effects, custom animations, transitions, and dark mode variables.
---

# UI Styling Guidelines

## 1. Glassmorphism Blur
Always implement high-quality translucent backdrops:
- `background: rgba(255, 255, 255, 0.7)` for light theme.
- `background: rgba(20, 20, 26, 0.75)` for dark theme.
- `backdrop-filter: blur(20px)` and `-webkit-backdrop-filter: blur(20px)`.
- `border: 1px solid rgba(255, 255, 255, 0.2)` (light) or `border: 1px solid rgba(255, 255, 255, 0.08)` (dark).

## 2. Transitions & Easing
Avoid default transitions. Use cubic-bezier ease-out springs:
- `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`
- Bosilganda micro-animatsiya scale: `transform: scale(0.96)`.

## 3. Dark Mode Classes
Enforce dark mode styles using `html.dark-mode` selector or `@media (prefers-color-scheme: dark)`.
Always set background and text colors dynamically.

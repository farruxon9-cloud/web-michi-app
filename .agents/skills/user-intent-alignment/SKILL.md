---
name: user-intent-alignment
description: Rules for aligning AI code generation with user-provided screenshots, visual design goals, and complete UX intents.
---

# User Intent Alignment Skill

This skill ensures the agent fully understands the visual and behavioral requirements of the user.

## 1. Visual Inspection
- When the user uploads screenshots, compare the current browser rendering against the screenshots.
- Look for overlapping elements, margins, clipping borders, and font weight mismatches.
- Always check if custom elements (like headers, bottom nav bars, and simulators) are layout-compatible with the requested changes.

## 2. Structural Code Scanning
- Before modifying a component, inspect its parent layout wrapper to understand how it's positioned and structured in the viewport hierarchy.
- Avoid writing raw inline overrides that conflict with existing design systems.

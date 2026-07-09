---
name: design-system
description: Rules and guidelines for managing consistent design tokens, typography scales, spacing units, and reusable UI components.
---

# Design System Rules

## 1. Typography Scale
Always use a semantic font scale based on a root font size:
- `--font-size-xs`: 10px / 11px (captions, badges)
- `--font-size-sm`: 12px / 13px (secondary text, labels)
- `--font-size-md`: 14px / 15px (main text, input text, body)
- `--font-size-lg`: 16px / 18px (titles, headers)
- `--font-size-xl`: 20px / 24px (major highlights)

## 2. Spacing Scale
Follow an 8px grid system for spacing:
- `--spacing-xxs`: 4px (micro margins)
- `--spacing-xs`: 8px (small margins, chip gaps)
- `--spacing-sm`: 12px / 16px (card paddings, row gaps)
- `--spacing-md`: 20px / 24px (main container padding)

## 3. Borders & Shadows
- Use Apple-style squircle corners (border-radius: 12px - 28px).
- Use soft, premium drop shadows:
  - `--shadow-sm`: 0 4px 12px rgba(0, 0, 0, 0.05)
  - `--shadow-md`: 0 12px 30px rgba(0, 0, 0, 0.1)

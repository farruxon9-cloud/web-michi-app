# Michi App UI & Navigation Rules

## 1. Bottom Navigation Docking Rule
- `BottomNav` MUST always remain a fixed horizontal dock at the bottom of the screen (`bottom: 0`, `flex-direction: row`).
- Do NOT convert or refactor `BottomNav` into a sidebar, vertical drawer, or side column on wider desktop screens.

## 2. Vertical Line Grid Alignment Rule
- `BottomNav`'s outer left and right boundaries MUST align precisely in a single vertical line with the outer edges of the content cards above it.
- Always use `--screen-margin-x` (14px) and `--card-width-full` (`calc(100% - 28px)`).
- Ensure `max-width: 100%` on `.bottom-nav` so it matches the container's responsive grid bounds identically.

## 3. Branch Workflow Rule
- `full-branch` serves as the clean baseline reference.
- Active development and feature iterations continue on `web-1` branch.

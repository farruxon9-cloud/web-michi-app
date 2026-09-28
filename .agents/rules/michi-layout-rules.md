# Michi App UI, Navigation & Git Rules

## 1. Git Branch Sync Protocol Rule
- All active development and experimental iterations occur strictly on `web-1` branch.
- Synchronizing or merging changes across `full-branch`, `web`, `s`, `s1`, `b` is STRICTLY FORBIDDEN until the user explicitly requests or approves via chat.

## 2. Bottom Navigation & Grid Boundary Rule
- `BottomNav` and AI Hub button MUST stay anchored to the 820px grid boundaries (`margin: 0 14px`, `max-width: 820px`).
- Do NOT convert `BottomNav` into a sidebar or vertical drawer on wide desktop screens.

## 3. Town Work Style 820px Core Container Rule
- The core app (`#root` & `.app-layout`) is strictly locked to `max-width: 820px; margin: 0 auto;`.
- The outer desktop canvas remains clean neutral/white space (Town Work style). Side extensions do NOT shrink or distort the 820px core container.

## 4. Scroll & Back Navigation Invariants
- Switching tabs from `BottomNav` MUST scroll main content to top (`scrollTop = 0`).
- Clicking detail back button (`ArrowLeft`) MUST restore the exact scroll position where the user clicked the item.

## 5. Language Rule
- All user responses, plans, explanations, and documentation MUST be provided in 100% clean, professional Uzbek language.

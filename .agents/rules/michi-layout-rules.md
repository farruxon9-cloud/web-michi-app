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

## 5. Detail View Overlay Top Offset Invariant
- Detail view overlays (`JobDetail.css`, `DrivingAcademy.css`) MUST strictly set `top: 56px` to flush perfectly against the `.global-header` (`56px`), eliminating any 8px peeking background search bar gap.

## 6. Instruction Languages Layout (B Variant)
- Instruction languages in detail views MUST be rendered inside the detail body metadata section as localized glassmorphic pills with flags (🇯🇵 🇺🇿 🇬🇧), avoiding crowding in the hero image.

## 7. `useTranslation` i18n Scope Safety Rule
- Whenever `i18n.language` is accessed, `{ t, i18n }` MUST be destructured from `useTranslation()`.

## 8. Bottom Clearance Spacers (+8px breathing room)
- Feed and tab list bottom clearance spacers MUST be at least `100px` (`height: 100px; minHeight: 100px`).
- Detail view containers (`JobDetail.css`, `DrivingAcademy.css`, `Profile.jsx`) MUST set `padding-bottom: 104px` / `104px` clearance to guarantee clean visual separation above the floating `BottomNav`.

## 9. Language Rule
- All user responses, plans, explanations, and documentation MUST be provided in 100% clean, professional Uzbek language.



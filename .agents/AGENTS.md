# Michi Workspace Agent Rules

These rules govern the behavior, quality controls, and coding style of all AI agents working on the Michi Application codebase.

## 🛡️ 1. Git Workflow & Deployment Limits
- **NO REMOTE PUSH ON BRANCHES:** Never run `git push` while working on development/experimental branches (such as `b`). All commits must be made **locally** to preserve remote branch cleanliness.
- **MAIN-ONLY PUSH:** Remote pushing is only permitted when explicitly requested or when deploying changes directly to the `main` branch.

## 📱 2. Mobile-First Viewport Strategy
- **Focus on Mobile Only:** Focus exclusively on mobile screens (viewport widths <= 480px) to keep code simple, fast, and easy to build.
- **Direct Viewport Styles:** Write standard mobile styles (e.g. `position: fixed` overlays, bottom action sheets, safe area padding).
- **No Desktop Adapters:** Do not write extra responsive layers, helper margins, or container wrapper hacks for desktop monitor simulation unless requested. Assume viewport matches mobile.

## 🧪 3. Quality & Verification Protocols
- **Always Test Before Finishing:** After completing any major feature or utility change, run `npm run build` to ensure there are no compilation errors, and `npm run test` to execute all Vitest unit tests.
- **No Unused Code:** Clean up all unused variables, console statements, and loose imports before committing.

## 🎨 4. Premium Aesthetic Standards
- Maintain high-quality iOS-style glassmorphism backdrops, HSL-based gradient fills, and squircle border radiuses.
- Always implement input debouncing and lazy loading for heavy scripts or assets.

## 🧭 5. Codebase Mapping & Validation
- **Auto-update codebase_map.md:** Whenever you add, modify, or delete components or files under `src/`, you must run `npm run validate` to update the codebase map (`codebase_map.md`), and check ESLint and unit test suites.
- **Write Tests:** Every new React component must have a corresponding test file under `src/components/*.test.jsx`.
- **Read & Update Memory (past_mistakes.md):** At the beginning of every task, read `.agents/rules/past_mistakes.md` to avoid repeating historical design mistakes. When you fix a new critical runtime bug, update `past_mistakes.md` with a summary of the mistake and its solution.

## ⛓️ 6. Branching, Merging & Push Restrictions
- **Development Branch `b`:** All active work on the phases must be carried out only on branch `b`. Do not switch branches or create new feature branches unless explicitly told.
- **NO MERGING:** Do not merge branch `b` back to `main` under any circumstances. Merging is strictly reserved for the user to execute manually.
- **NO PUSHING:** Do not run `git push` or perform any remote pushes to origin unless the user explicitly requests it.

## 🗺️ 7. Map & Coordinate Sanitization Constraints (MapLibre & API Integration)
- **Always Validate Coordinates:** Before passing coordinates (latitude/longitude) from external APIs (like Nominatim search, OSRM/Valhalla routes, or local search histories) to MapLibre GL JS methods like `setLngLat`, `fitBounds`, `easeTo`, or marker creation, ALWAYS ensure they are valid numbers and not `NaN`.
- **API Response Fallbacks:** Always wrap routing requests in `try/catch` and throw explicit errors if the API returns no routes, forcing a geodesic direct-line fallback instead of a blank or frozen UI screen.
- **HUD Formatting Protection:** Always check if dynamic routing details (e.g. `innerDiff`, `sweptPath`, `estimatedWidth`) are valid numbers before calling formatting functions like `.toFixed()` on them.

## 🗺️ 8. Mandatory Codebase Map Reading & Updating
- **Read Map First:** At the beginning of every task, before writing any code or proposing changes, you MUST read the project's table of contents (`MUNDARIJA.md`) and automatic codebase map (`codebase_map.md`) to verify the file layout and understand component imports/dependencies.
- **Keep it Updated:** Every time you add, modify, or delete files, run `npm run validate` to automatically regenerate `codebase_map.md`.

## 🇺🇿 9. Uzbek Language Communication Rule
- **Muloqot tili (Strict Uzbek):** Agent foydalanuvchi bilan muloqot qilganda, barcha rejalashtirishlar (`implementation_plan.md`), topshiriqlar roʻyxati (`task.md`), hisobotlar (`walkthrough.md`) va oʻrganish takliflarida (`learning_proposal.md`) faqat **Oʻzbek tilida** (lotin alifbosida) yozishi shart.
- **Dasturlash va Texnik jarayonlar:** Kodlarni tuzishda, oʻzgaruvchilar nomlarida, logik mantiqlarda va kod ichidagi izohlarda (comments) ingliz tilidan yoki qulay texnik tillardan toʻliq foydalaniladi.

## 🌐 10. Multi-Language Adaptability & i18n Rule
- **Matnlarni qattiq kodlash taqiqlanadi:** Ilovadagi barcha yangi UI matnlari, tugmalar nomlari, placeholderlar, xabarnomalar va modal oynalardagi yozuvlar qattiq kodlanishi (hardcode) taqiqlanadi.
- **i18n Integratsiyasi:** Har qanday yangi matnli kalit `src/i18n.js` faylining barcha tillar boʻlimiga (`uz`, `ja`, `en`) mos tarjimalari bilan birga qoʻshilishi shart.
- **Dinamik Muloqot:** Komponentlarda matnlarni chiqarish uchun `useTranslation` hookidan foydalanish va `t('key')` orqali dinamik render qilish lozim.



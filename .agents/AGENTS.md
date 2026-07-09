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

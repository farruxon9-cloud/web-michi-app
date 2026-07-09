# Michi Workspace Agent Rules

These rules govern the behavior, quality controls, and coding style of all AI agents working on the Michi Application codebase.

## 🛡️ 1. Git Workflow & Deployment Limits
- **NO REMOTE PUSH ON BRANCHES:** Never run `git push` while working on development/experimental branches (such as `b`). All commits must be made **locally** to preserve remote branch cleanliness.
- **MAIN-ONLY PUSH:** Remote pushing is only permitted when explicitly requested or when deploying changes directly to the `main` branch.

## 📱 2. Desktop Phone Simulator Constraints
- The web application is wrapped inside a phone mockup container (`#root` styled to `max-width: 480px; height: 90vh; border: 8px solid #1c1c1e`) on desktop views.
- **Portal Containment:** When rendering full-screen modals, drawers, or floating notifications inside a React Portal, always mount the portal to `document.getElementById('root')` instead of `document.body`.
- **Absolute Overlay Position:** Use `position: absolute` for overlay containers so they stay locked within the simulated phone frame boundaries on desktop monitors, rather than floating outside.

## 🧪 3. Quality & Verification Protocols
- **Always Test Before Finishing:** After completing any major feature or utility change, run `npm run build` to ensure there are no compilation errors, and `npm run test` to execute all Vitest unit tests.
- **No Unused Code:** Clean up all unused variables, console statements, and loose imports before committing.

## 🎨 4. Premium Aesthetic Standards
- Maintain high-quality iOS-style glassmorphism backdrops, HSL-based gradient fills, and squircle border radiuses.
- Always implement input debouncing and lazy loading for heavy scripts or assets.

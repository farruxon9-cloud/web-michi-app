# Michi v1.1 Learnings (Errors → Fixes)

These are real bugs found during v1.1 (Phases B, D, A on `feature/v1.1-profile`), each with its fix.
Read this before touching the resume/PDF, profile, applications, dialogs, layout or E2E tooling. Do not repeat these mistakes.

## 1. PDF / Resume (pdfmake 0.3.x)
- **Font registration**
  - ❌ `pdfMake.vfs = vfs` is silently ignored in 0.3.x, so every PDF fails with "font not found in VFS".
  - ✅ Use `pdfMake.addVirtualFileSystem(vfs)` + `pdfMake.setFonts({...})`.
- **Async blob:** `getBlob()` returns a **Promise** in 0.3.x. Always `await` it (no callback style).
- **Lazy load:** load pdfmake with `await import('pdfmake/build/pdfmake')`, never as a static import.
  - The static import made the main bundle 3.85 MB; lazy loading brought it to 2.89 MB.
- **Image formats:** pdfmake accepts only JPEG/PNG data URLs. Skip anything else, because webp etc. crash generation.
- **Table widths:** pick column widths so labels never wrap.
  - The age column went from `[45,'*',35,20]` to `[45,'*',58,20]`.
  - Phone row: put label+value in a sub-table in the wide column; email gets `colSpan: 2`.
- **Cross-platform download** (`src/utils/resumeDownload.js`), in this order:
  1. Capacitor native → `Filesystem.writeFile` + `Share`.
  2. Mobile browser → `navigator.share({ files })`. An `AbortError` means the user cancelled, which is not an error.
  3. Fallback → `<a download>` + `URL.revokeObjectURL` after ~60s (not immediately).
  - Call `window.open` **synchronously** inside the click handler, otherwise popup blockers stop it.
- **Honesty in the UI:** never show a fake "Verified ✓" for user-entered data such as JLPT.
  - Show 「自己申告」 (self-declared) in the palette blue `#0A84FF`.

## 2. CSP
- PDF preview in an iframe/object needs `'self' blob:` in both `frame-src` and `object-src`.
- `connect-src` has no `data:`. Never `fetch()` a `data:` URL; use the data URL directly.

## 3. Storage & Privacy
- **Per-user drafts:** use `src/utils/localDraftStore.js` with keys `michi_draft:<kind>:<userId>`.
  - Never use a global key, because it leaks between accounts on a shared device.
  - Clear drafts on logout via `clearAllUserDrafts()`.
- **Persisted applications:** strip `applicantInfo` (base64 avatar + personal data) before saving.
  - Sanitize again on load (`src/utils/applicationItems.js`).
- **Size:** do not store big base64 blobs in localStorage (quota of about 5 MB).

## 4. Props Wiring (silent no-op buttons)
- ❌ App never passed the notification handlers or `onShoukaiPaid` to Profile. Their defaults `= () => {}` made the buttons silently do nothing.
- ✅ Grep for default no-op props (`= () => {}`) and verify each one is actually wired by the parent.
  - Prefer no default (or a dev warning) for required handlers.

## 5. IDs, Keys & Dates
- ❌ Job and school applications both used `Date.now()` ids, so they collided in React keys and in the hidden set.
- ✅ Use namespaced keys `job:<id>` / `school:<id>` (`appItemKey`) everywhere: React `key`, hide/undo sets, selection.
- ❌ Sorting by a locale-formatted date string.
- ✅ Store `appliedAt` as ISO 8601 and sort by it. Format only for display.
- **Dead placeholder images:** `via.placeholder.com` is dead. Use an icon fallback + `onError` handler, never an external placeholder URL.

## 6. Dialogs
- ❌ `window.confirm` / `alert` (native, unstyled, blocked in some WebViews).
- ✅ Use `ConfirmSheet` (built on `AppSheet`, portaled into `#root` via `getModalRoot()`).
- Already converted: notification clear, company ad delete, vehicle delete / clear-all, vehicle validation & photo errors.
- Still TODO: the remaining `alert(...)` calls elsewhere in Profile.
- For info-only messages use `ConfirmSheet` with `hideCancel` + `danger={false}`.

## 7. Layout / CSS
- **Floating bars:** never center them with `transform: translateX(-50%)`.
  - The shared `sheet-up` keyframes override `transform` and push the bar off-screen.
  - ✅ Use `left: 0; right: 0; margin: 0 auto; width: …`.
- **Desktop column:**
  - `--app-max-w: 820px`, breakpoint `@media (min-width: 821px)`.
  - `--desktop-side-bg` is `#fff` in light and `#000` in dark (`html.dark-mode` wins by specificity).
  - `#root { transform: translateZ(0) }` on desktop makes `position: fixed` overlays stay inside the column.
  - Overlays using `height: 100vh` need a desktop override `#root … { height: 100% }`.
- **Portals:** portal into `getModalRoot()` (`#root`), not `document.body`. Otherwise they escape the desktop column.
  - Exception: `CustomInlineDropdown` intentionally stays on `body`.
- **Specificity:** `index.css` loads **before** component CSS, so overrides in `index.css` need `#root` prefix specificity.
- **Dark mode:** never use `@media (prefers-color-scheme: dark)`. It breaks the app's light mode on dark-OS devices.
  - Use only `html.dark-mode` (fixed in `BottomNav.css`).
- **`.sr-only` is not defined globally.** RobotAvatar's SR text is visible by design.
  - Hide it only at ≤360px.
  - Do not add a global `.sr-only`, because it would visibly change the approved design.
- **Known, not fixed (design decision):** at 320px the AI FAB overlaps the dashboard time pill. Ask the user before moving the FAB.

## 8. React Patterns
- Avoid `setState` inside `useEffect` just to sync props/state (lint error + extra render).
- Use **render-phase sync** with a "previous value" state instead:
  - e.g. `useHiddenItems` on account switch.
  - e.g. Profile reset on an `activePage` change.
- Optional-chain reset callbacks that may be undefined: `setX?.(…)` (the DriverFeed crash fix).

## 9. Testing & Environment
- **Playwright:**
  - Run with BypassSandbox.
  - Uses the cached `chromium_headless_shell-1234` binary.
  - The script must live inside the repo (e.g. temporary `scratch_e2e/`) so `playwright` resolves. **Delete `scratch_e2e/` before committing.**
- **Module-level browser tests:** open `/robots.txt` and `import()` modules from the dev server.
- **E2E login seeding:**
  - Set localStorage keys: `michi_lang`, `michi_permanent_user_id`, `michi_jwt_token`, `michi_user_session` (with `role`, `userId`), `michi_darkmode`.
  - Abort requests to `api.michi.jp.net` via `page.route`, so the app uses the cached session.
- **Shell:** heredocs and `/tmp` are blocked. Write files with edit tools and use the brain `scratch/` dir.
  - zsh `--include=*.css` globbing fails; use the grep_search tool instead.
- **Edit tools:** `view_file` shows a literal `"` inside a line as `\"`. In `TargetContent` write a plain `"`, otherwise the match fails.

## 9b. Vehicles (Phase C)
- ❌ `getVehicleImageUrl()` returned the carimagery **XML API URL** as an `<img src>` → always broken, then a random Unsplash sedan.
  - ✅ `src/services/vehicleImageService.js` is local-only: model-matched preset or `null`. `VehiclePhoto.jsx` shows photo → preset → brand gradient card.
- ❌ Wikipedia search took any first result (company logo, "Sedan" article) and overwrote presets/user photos.
  - ✅ `isRelevantWikiTitle()` requires the model name in the page title; misses are cached (`NO_PHOTO`), network errors are not.
  - ✅ Effects never fetch when `photoUrl` exists or a local preset matches (`getLocalVehicleImage`).
- ❌ Changing make/model/type kept the old model's photo. ✅ `photoForIdentityChange()` (keeps user uploads `data:`).
- ❌ A network request per keystroke in the model input. ✅ Handlers only set state; the constructor effect debounces.
- ❌ Catalog picker wrote the **catalog id** over the user's vehicle id and saved immediately (duplicates, plate/color copied, Cancel did nothing).
  - ✅ `applyCatalogSelection()` keeps the user id, stores `catalogId`, and only fills the form; saving happens on 「保存」.
- ❌ No validation, unguarded `localStorage.setItem` (quota crash with 5 MB base64 photos).
  - ✅ `validateVehicle()` (make/model, positive dims, duplicate plate) + `safeSetJSON()`; photos are resized before storing.
- ❌ Legacy data: `v_2` typed `truck_2t` but named "Giga 10t" with the Giga photo; romaji `'ni'` in the hiragana list.
  - ✅ `sanitizeVehicles()` repairs on load (dedupes ids, fixes v_2, `'ni'` → `'に'`).
- Picker `DICT` lacked vi/ne and fell back to Uzbek → now has vi/ne and falls back to English.
- Shared helpers live in `src/utils/vehicleUtils.js` (unit-tested in `vehicleUtils.test.js`).

## 10. Commit Checklist (every phase)
1. `npx vitest run`: all tests pass.
2. `npm run lint`: 0 errors.
3. `npm run build`: OK, and **0 `console.log`** in `dist/`.
4. Visual check (screenshots) when CSS/layout changed. Design, colors and classNames stay unchanged.
5. i18n: `t(key, fallback)` with the key added to all 7 locales (ja, uz, en, ru, zh, vi, ne), and no duplicate keys.
6. Commit locally only. **No push or merge without explicit user permission.**

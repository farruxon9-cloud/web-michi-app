# Michi App Full Codebase Audit & Architectural Rules

> [!NOTE]
> Historical audit log (2026-09). Where it conflicts with [AGENTS.md](../../AGENTS.md) or docs/PAGE_MAP.md, those win. Some file names below (e.g. `ShoukaiReferrals.jsx`, `Settings.jsx`) were later moved to `src/components/profile/*Page.jsx`.

This file documents all technical, architectural, layout, component fixes, and error patterns learned during the 39-component audit and pair programming sessions.

---

## 1. Web Canvas & Responsive Layout Standard
- **820px Desktop Web Canvas (`src/index.css`)**: The application is built as an 820px max-width Desktop Web Application (`max-width: 820px; margin: 0 auto;` with glass ambient blobs in light mode and open side margins). NEVER restrict `#root` or `.app-layout` to a 430px narrow mobile shell frame unless explicitly requested by the user.
- **Vertical Scrolling Contract (`src/App.css`)**: `.main-content` MUST maintain `overflow-y: auto;` and `-webkit-overflow-scrolling: touch;`. Never set `.main-content` to `overflow: hidden`, as it locks vertical scrolling across all main views (`Dashboard`, `DriverFeed`, `DrivingAcademy`, `Profile`, `CompanyHome`).

---

## 2. Floating Bottom Navigation & Trailing Clearance Spacers
- **Standard Views Clearance**: `Dashboard.jsx`, `DriverFeed.jsx`, `DrivingAcademy.jsx`, and `CompanyHome.jsx` use a trailing clearance spacer of **`64px`**:
  ```jsx
  <div style={{ height: '64px', minHeight: '64px', width: '100%', flexShrink: 0, clear: 'both' }} />
  ```
- **Profile Page Exception (`Profile.jsx`)**: The Profile page uses a custom **`76px`** clearance spacer (`64px + 12px`), and the `.logout-btn` element has `marginTop: '12px'` to maintain a distinct 12px gap below the profile menu box.
- **Fixed Floating CTA Dock Centering (`DriverFeed.jsx` & `DrivingAcademy.jsx`)**: Any floating CTA button container positioned with `position: fixed` MUST use `left: 50%; transform: translateX(-50%);` (instead of `left: 14px`) so that it is mathematically dead-centered on both desktop (820px canvas) and mobile viewports.
- **Filter Modal Clearance Spacer (`DriverFeed.jsx` & `DrivingAcademy.jsx`)**: Filter drawer content uses a **`140px`** clearance spacer with the floating search CTA dock positioned at **`bottom: 96px`** (adding a 12px gap above `BottomNav` at 84px, and reducing the gap between the search button and the last scroll container by 20px).

---

## 3. Component Fixes & Audited Modules (39 Files Breakdown)

### A. Core Feed & Map Components
- **`DriverFeed.jsx`**:
  - **Flickering Skeleton Fix**: Resolved infinite re-render loop by wrapping `filteredJobs` in `useMemo` and utilizing a module-level constant (`const EMPTY_ARRAY = []`) for default array props. Removed artificial 200ms `setLocalLoading` delay.
  - **`JobMapModal` Restoration**: Rendered via `createPortal` into `#root`. Leaflet Voyager Carto tiles (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/...`) restored. Removed `document.body.style.overflow` mutation to prevent scroll jump.
- **`DrivingAcademy.jsx`**: License category filters (AT, MT, Heavy Truck, Towing), school course pricing, 7-language dictionary, 92px clearance spacer.
- **`CompanyHome.jsx`**: Multi-view layout for job posting, local vs Tokutei Ginou (SSW) international visa recruitment, driving school ad creation, and applicant overview.
- **`Dashboard.jsx`**: Bento hero carousel slider, calendar week selector, Michi Voice AI card, 3D JDM Truck Navigation banner, lofi music player.

### B. Michi AI Suite (`src/components/michi-ai/*`)
- **`MichiDrawerTrigger.jsx`**: Floating AI trigger is styled as a 38px x 44px rounded square (`borderRadius: 14px 0 0 14px`), `linear-gradient(135deg, #4F46E5, #3B82F6)`, `box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45)` displaying a white sparkle icon `✨` and bold white `"AI"` badge.
- **`MichiSideDrawer.jsx` & Subcomponents**:
  - **`MichiDrawerHeader.jsx`**: Features a circular left back button `←`, purple gradient icon badge (`#A855F7` to `#7E22CE`) with `✨`, `Michi AI Hub` title, `🟢 準備完了` status, and top-right actions (Power `⏻`, Trash `🗑`, Close `✕`).
  - **`MichiQuickChips.jsx`**: 3-column grid with color-coded circular icon badges: `🚗 免許切替` (Orange `#FF9500`), `🌐 ビザ情報` (Blue `#0A84FF`), `☀️ 天気・生活` (Green `#30D158`).
  - **`MichiActivationCard.jsx`**: Soft lavender glass card with circular power badge `⏻`, title `Michi AI を有効化`, and primary blue gradient button `✨ AI を起動する`.
  - **`MichiEmptyChatView.jsx`**: Robot avatar badge `🤖` with title `Michi AI アシスタントへようこそ` and subtext `質問を入力するか、上のクイックタグをタップしてください。`.
  - **`MichiDictationInput.jsx`**: Circular mic button, rounded pill input (`Michi AI に質問を入力...`), and blue circular send button.
- **Specialized AI Assistants (9 Cards)**:
  1. `CandidateMatchingCard.jsx`
  2. `CareerAdvancementCard.jsx`
  3. `DocumentTranslationCard.jsx`
  4. `ExamPrepCard.jsx`
  5. `InterviewPrepCard.jsx`
  6. `SalaryCalculatorCard.jsx`
  7. `TrafficRulesCard.jsx`
  8. `VisaAssistantCard.jsx`
  9. `WorkplaceJapaneseCard.jsx`

### C. Profile & Employer Subcomponents
- **`ProfileMain.jsx` & `Profile.jsx`**: Unified user profile management, vehicle Fleet picker modal integration, Shoukai referral bonus tracking, 76px trailing clearance spacer.
- **`ShoukaiReferrals.jsx`**: 7-language dictionary (`ja`, `uz`, `en`, `ru`, `zh`, `vi`, `ne`), referral link copy to clipboard, QR code generator, bonus tier table.
- **`Settings.jsx`**: Sound & vibration haptic toggles, dark/light theme switcher, `aria-pressed` states, keyboard navigation.
- **`SavedItems.jsx`**: Bookmarked jobs & driving school courses, bookmarkManager sync, keyboard accessibility.
- **`Notifications.jsx`**: Read/unread status filtering, mark all read button, localized notification cards.
- **`MyAds.jsx`**: Active job and school vacancy ad management, applicant count, edit/delete modal triggers.
- **`Applications.jsx`**: Applicant status pipeline (Submitted, Under Review, Interview, Accepted/Rejected).
- **`EmployeeManagement.jsx`**: Fleet driver team management, driver invitation link generation.

### D. Vehicle & Navigation Engine
- **`JapaneseVehiclePickerModal.jsx`**: Dark OLED matte aesthetic backdrop, Escape key listener, photo cache handling (`resolvedPhotosRef`), historical era tags (Showa, Heisei, Reiwa).
- **`LazyVehicleImage.jsx`**: Progressive HD image loader with skeleton shimmer fallback.
- **`VehicleGradientCard.jsx`**: Premium glass gradient card displaying active vehicle specs (height, width, weight, length).
- **`JDMNavigation.jsx` & `JDMNavigationSearch.jsx`**: Heavy truck routing avoiding 3.8m height & weight limits using Overpass API restrictions.

### E. Service Layer (`src/services/*`)
- **`michiApiService.js`**: Exported default object + named exports for `VoiceAssistant` backward compatibility. `AbortController` timeout (15–25s), CORS Vite proxy `/api`, rate limit 429 localized warnings.
- **`authSecurityService.js`**: Session token handling, n8n webhook security headers `X-API-Key`, zero plaintext OTP exposure on client UI.
- **`vehicleApiService.js`**: Master database lookup, Wikipedia HD photo resolution, in-memory photo caching.

---

## 4. 5-Language Localization Standard (`ja`, `uz`, `en`, `ru`, `zh`)
- All UI text must provide 7-language coverage via dictionary objects (`DICT`) or `i18n.t()`.
- Always include fallback logic (`DICT[key]?.[lang] || DICT[key]?.uz || t(key, '')`).

---

## 5. Git & Workflow Protocol
- **Unit Test Requirement**: Every change must be validated against the full 20-file test suite (`npm test -- --run`).
- **CRITICAL GIT CONSTRAINT**: Code changes are committed locally on the working branch (`web-1`). NEVER execute `git push` under any circumstances.

---

## 6. Documented Error Patterns, Anti-Patterns & Defensive Fixes

1. **Fixed Positioning inside Centered 820px Canvas**:
   - **Error**: Using `position: fixed; left: 14px;` for bottom floating CTA docks.
   - **Consequence**: On desktop displays, `left: 14px` anchors to the far left viewport edge, shifting the CTA button out of alignment with the centered 820px layout.
   - **Fix**: Always use `position: fixed; left: 50%; transform: translateX(-50%); width: calc(100% - 28px); maxWidth: 792px;` so fixed elements sit dead-centered on both desktop and mobile.

2. **Floating CTA Dock & BottomNav Touch/Overlap Bug**:
   - **Error**: Setting fixed CTA dock `bottom: 84px`, causing the button bottom to touch the top border of `BottomNav` (which sits at 84px top edge).
   - **Fix**: Set floating CTA dock `bottom: 96px` to maintain a distinct 12px vertical gap above `BottomNav`.

3. **Excessive Clearance Spacer White Space**:
   - **Error**: Over-inflating clearance spacers (e.g., 162px/160px), creating a large empty white gap below the last content card when scrolled down.
   - **Fix**: Calibrate filter drawer clearance spacer to **`140px`**, keeping content tightly bound to the search CTA dock without excess whitespace.

4. **Infinite Re-render & Flickering Skeleton Loop (`DriverFeed.jsx`)**:
   - **Error**: Re-creating array props or state inside render loops, triggering repeated loading skeleton flashes.
   - **Fix**: Wrap filtered lists in `useMemo` and use module-level constant arrays (`const EMPTY_ARRAY = []`).

5. **Global `document.body` Overflow Mutation Bug (`JobMapModal`)**:
   - **Error**: Mutating `document.body.style.overflow = 'hidden'` when opening Leaflet map modal.
   - **Consequence**: Page scroll position resets and jumps unexpectedly when closing the modal.
   - **Fix**: Render modals via `createPortal` into `#root` and handle scroll containment strictly in CSS.

6. **AI Gateway Request Timeout & Raw JSON Exposure**:
   - **Error**: Gateway AI calls hanging indefinitely or returning unparsed `<think>` tags and raw JSON blocks to the UI.
   - **Fix**: Use `AbortController` timeout (15–25s) in `michiApiService.js` and sanitize output via `sanitizeMichiResponse()`.

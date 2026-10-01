# GEMINI.md - Michi App Full Development Rules & Learnings

This repository contains the Michi Japan Logistics Web Application codebase. The guidelines in this document MUST be strictly followed by all AI agents.

---

## 1. UI Layout, Canvas & Scrolling Contract
- **820px Townwork Web Canvas (`src/index.css`)**: The app is designed as an 820px max-width Desktop Web Application (`max-width: 820px; margin: 0 auto;` with ambient background glass blobs in light mode). NEVER constrain `#root` or `.app-layout` to a 430px mobile shell container.
- **Vertical Scrolling Contract (`src/App.css`)**: `.main-content` MUST maintain `overflow-y: auto;` and `-webkit-overflow-scrolling: touch;`. Never set `.main-content` to `overflow: hidden`, as it locks vertical scrolling across all main views (`Dashboard`, `DriverFeed`, `DrivingAcademy`, `Profile`, `CompanyHome`).
- **Trailing Dock Clearance Spacers**:
  - **`Dashboard`**, **`DriverFeed`**, **`DrivingAcademy`**, **`CompanyHome`**: Use a trailing clearance spacer of **`64px`**:
    ```jsx
    <div style={{ height: '64px', minHeight: '64px', width: '100%', flexShrink: 0, clear: 'both' }} />
    ```
  - **`Profile` Page Exception**: Uses a custom **`76px`** clearance spacer (`64px + 12px`), and the `.logout-btn` element has `marginTop: '12px'` to maintain a distinct 12px gap below the profile menu box.
  - **Fixed Floating CTA Dock Centering**: Any floating CTA button container positioned with `position: fixed` MUST use `left: 50%; transform: translateX(-50%);` (instead of `left: 14px`) so that it is mathematically dead-centered on both desktop (820px canvas) and mobile viewports.
  - **Filter Modal Clearance Spacer**: Filter drawer content uses a **`148px`** clearance spacer (`84px` CTA bottom + `52px` CTA height + `12px` standard gap = `148px`) so that the floating search CTA dock sits flush at `84px` directly above `BottomNav` and the last card halts with an exact standard **12px** gap above the search button.

---

## 2. Michi AI Suite Standards (`src/components/michi-ai/*`)
- **Side Drawer Panel (`VoiceAssistant.css`)**: AI Hub drawer is right-aligned (`max-width: 440px; right: 0; top: 0; bottom: 0;`) with a glassmorphism backdrop blur (`backdrop-filter: blur(16px);`), keeping the main web content visible on the left side.
- **Trigger Alignment (`MichiDrawerTrigger.jsx`)**: Floating trigger `minY` bound is set to `110px` to prevent the trigger button from sliding behind the `.global-header` (height: 56px).
- **Gateway AI Integration (`MichiChatPanel.jsx` & `michiApiService.js`)**:
  - AI requests use `POST https://api.michi.jp.net/api/chat` with body `{ "message": text }`.
  - All AI responses must pass through `sanitizeMichiResponse()` to strip `<think>...</think>` tags and raw JSON leaks.
  - Fetch requests use `AbortController` timeout (15–25s) and handle HTTP 429 rate limits gracefully.

---

## 3. Core Feed & Performance Rules (`src/components/DriverFeed.jsx`)
- **Skeleton Flashing Resolution**: `filteredJobs` must be wrapped in `useMemo`. Default array props MUST use module-level constants (e.g. `const EMPTY_ARRAY = []`) rather than inline `[]` defaults to prevent reference shifts that trigger infinite re-render loops.
- **Leaflet Map Modal (`JobMapModal`)**: Rendered via `createPortal` into `#root`. Do NOT mutate `document.body.style.overflow` during modal lifecycles to prevent page scroll jumping on close. Retain Carto Voyager tiles and `🚛` pin markers.

---

## 4. Complete Audit Log of 39 Audited Files

### Core Views & Layout
1. `src/App.css`: Unblocked `.main-content` scrolling with `overflow-y: auto`.
2. `src/index.css`: Restored 820px web canvas layout bounds and background ambient blobs.
3. `src/components/Dashboard.jsx`: Hero carousel slider, calendar selector, Michi Voice AI card, JDM truck navigation card, music player, 64px spacer.
4. `src/components/DriverFeed.jsx`: Resolved infinite skeleton loop, memoized `filteredJobs`, restored `JobMapModal` Leaflet Carto tile map without scroll lock, 64px spacer.
5. `src/components/DrivingAcademy.jsx`: License category filters (AT/MT/Truck/Towing), course pricing, 5-language dict, 64px spacer.
6. `src/components/CompanyHome.jsx`: Local vs Tokutei Ginou SSW visa recruitment, driving school ad creation, 64px spacers.
7. `src/components/JobDetail.jsx`: Job details modal, company phone dialer, apply button, 5-language dictionary.
8. `src/components/RoleSelect.jsx`: Employer vs Driver role toggle with persistence.

### Michi AI Suite (13 Files)
9. `src/components/michi-ai/VoiceAssistant.jsx`: Voice AI drawer logic, speech synthesis fallback, voice standby toggle.
10. `src/components/VoiceAssistant.css`: Right-side panel (`max-width: 440px`), shaffof glass overlay.
11. `src/components/michi-ai/MichiDrawerTrigger.jsx`: Drag bounds clamped to `minY: 110px`.
12. `src/components/michi-ai/MichiChatPanel.jsx`: AI Gateway integration, `sanitizeMichiResponse()`.
13. `src/components/michi-ai/AssistHeroShowcase.jsx`: Cleaned dangling syntax errors, added keyboard shortcuts.
14–22. Specialized AI Assistant Cards:
    - `CandidateMatchingCard.jsx`
    - `CareerAdvancementCard.jsx`
    - `DocumentTranslationCard.jsx`
    - `ExamPrepCard.jsx`
    - `InterviewPrepCard.jsx`
    - `SalaryCalculatorCard.jsx`
    - `TrafficRulesCard.jsx`
    - `VisaAssistantCard.jsx`
    - `WorkplaceJapaneseCard.jsx`

### Profile & Subpages (9 Files)
23. `src/components/Profile.jsx`: Profile main controller, vehicle fleet modal, 76px spacer, logout button `marginTop: 12px`.
24. `src/components/ProfileMain.jsx`: User info, contract toggle, profile photo upload.
25. `src/components/ShoukaiReferrals.jsx`: Shoukai referral bonus tracking, QR code generator, copy link.
26. `src/components/Settings.jsx`: Sound/vibration toggles, theme switcher, `aria-pressed`.
27. `src/components/SavedItems.jsx`: Saved jobs & driving school courses.
28. `src/components/Notifications.jsx`: Read/unread status filter, mark all read.
29. `src/components/MyAds.jsx`: Posted vacancy & school ad management.
30. `src/components/Applications.jsx`: Application status pipeline tracking.
31. `src/components/EmployeeManagement.jsx`: Fleet driver management & invitation link copy.

### JDM Fleet & Vehicle (5 Files)
32. `src/components/JapaneseVehiclePickerModal.jsx`: Dark OLED aesthetic backdrop, Escape key listener, photo cache (`resolvedPhotosRef`), era tags.
33. `src/components/LazyVehicleImage.jsx`: Progressive HD image loader with skeleton shimmer fallback.
34. `src/components/VehicleGradientCard.jsx`: Glass gradient card displaying active vehicle specs.
35. `src/components/JDMNavigation.jsx`: Heavy truck navigation avoiding 3.8m height & weight limits.
36. `src/components/JDMNavigationSearch.jsx`: Address & landmark lookup for truck navigation.

### Engine Services (3 Files)
37. `src/services/michiApiService.js`: Export default object + named exports, `AbortController` timeout, CORS Vite proxy `/api`, 429 rate limit warnings.
38. `src/services/authSecurityService.js`: Webhook security headers `X-API-Key`, OTP session lifecycle.
39. `src/services/vehicleApiService.js`: JDM database search, Wikipedia HD photo lookup, in-memory photo cache.

---

## 5. Git & Quality Control Protocol
- **Unit Testing**: Run `npm test -- --run` to verify 100% pass across all 20 test files (90 tests).
- **CRITICAL GIT CONSTRAINT**: All commits MUST remain local on branch `web-1`. **NEVER execute `git push`**.
- **Localization**: Support 5 languages (`ja`, `uz`, `en`, `ru`, `zh`) across all UI text.

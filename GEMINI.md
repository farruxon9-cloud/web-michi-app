# GEMINI.md - Michi App Full Development Rules & Learnings

This repository contains the Michi Japan Logistics Web Application codebase. The guidelines in this document MUST be strictly followed by all AI agents.

---

## 1. UI Layout, Canvas & Scrolling Contract
- **820px Townwork Web Canvas (`src/index.css`)**: The app is designed as an 820px max-width Desktop Web Application (`max-width: 820px; margin: 0 auto;` with ambient background glass blobs in light mode). NEVER constrain `#root` or `.app-layout` to a 430px mobile shell container.
- **Vertical Scrolling Contract (`src/App.css`)**: `.main-content` MUST maintain `overflow-y: auto;` and `-webkit-overflow-scrolling: touch;`. Never set `.main-content` to `overflow: hidden`, as it locks vertical scrolling across all main views (`Dashboard`, `DriverFeed`, `DrivingAcademy`, `Profile`, `CompanyHome`).
- **Trailing Dock Clearance Spacers**:
  - **`Dashboard`**, **`DriverFeed`**, **`DrivingAcademy`**: Use a trailing clearance spacer of **`92px`**:
    ```jsx
    <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    ```
  - **`CompanyHome` (`マイ掲載一覧`)**: Uses a **`76px`** clearance spacer (`<div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so job posting buttons (`publishJob`/`publishSchoolAd`) halt 12px clear of floating `BottomNav`.
  - **`Profile` Page & Sub-pages**: `about`, `settings`, `applications`, `my_shoukai` use **`86px`**; `personalInfo` (`会社情報`) uses **`82px`**; main profile view logout button uses **`86px`**.
  - **Fixed Floating CTA Dock Centering**: Any floating CTA button container positioned with `position: fixed` MUST use `left: 50%; transform: translateX(-50%);` (instead of `left: 14px`) so that it is mathematically dead-centered on both desktop (820px canvas) and mobile viewports.
  - **Filter Modal Clearance Spacer**: Filter drawer content in `DriverFeed.jsx` & `DrivingAcademy.jsx` uses a **`160px`** clearance spacer with the floating search CTA dock positioned at **`bottom: 96px`**, guaranteeing 12px clearance between the search button top edge and the last filter container.

---

## 2. Michi AI Suite Standards (`src/components/michi-ai/*`)
- **Michi AI Floating Trigger (`MichiDrawerTrigger.jsx`)**: 38px x 44px rounded rectangle (`borderRadius: 14px 0 0 14px`), `linear-gradient(135deg, #4F46E5, #3B82F6)` with white `✨` sparkle + `"AI"` badge, box shadow `0 6px 20px rgba(79, 70, 229, 0.45)`.
- **Michi AI Hub Page (`MichiSideDrawer.jsx` & Subcomponents)**:
  - Header: Circular back button `←`, purple square icon badge (`#A855F7` to `#7E22CE`) with `✨`, title `Michi AI Hub`, status `🟢 準備完了`, actions (Power `⏻`, Trash `🗑`, Close `✕`).
  - Quick Chips: 3-column color-coded grid: `🚗 免許切替` (Orange `#FF9500`), `🌐 ビザ情報` (Blue `#0A84FF`), `☀️ 天気・生活` (Green `#30D158`).
  - Hero Card: Soft lavender glass banner with circular power badge `⏻`, title `Michi AI を有効化`, and primary blue gradient button `✨ AI を起動する`.
  - Empty Chat View: Robot avatar badge `🤖` with title `Michi AI アシスタントへようこそ` and subtext `質問を入力するか、上のクイックタグをタップしてください。`.
  - Input Bar: Mic button, rounded pill input (`Michi AI に質問を入力...`), and blue circular send button.

---

## 3. Core Feed & Performance Rules (`src/components/DriverFeed.jsx`)
- **Skeleton Flashing Resolution**: `filteredJobs` must be wrapped in `useMemo`. Default array props MUST use module-level constants (e.g. `const EMPTY_ARRAY = []`) rather than inline `[]` defaults to prevent reference shifts that trigger infinite re-render loops.
- **Leaflet Map Modal (`JobMapModal`)**: Rendered via `createPortal` into `#root`. Do NOT mutate `document.body.style.overflow` during modal lifecycles to prevent page scroll jumping on close. Retain Carto Voyager tiles and `🚛` pin markers.

---

## 4. Complete Audit Log of 39 Audited Files

### Core Views & Layout
1. `src/App.css`: Unblocked `.main-content` scrolling with `overflow-y: auto`.
2. `src/index.css`: Restored 820px web canvas layout bounds and background ambient blobs.
3. `src/components/Dashboard.jsx`: Hero carousel slider, calendar selector, Michi Voice AI card, JDM truck navigation card, music player, 92px spacer.
4. `src/components/DriverFeed.jsx`: Resolved infinite skeleton loop, memoized `filteredJobs`, restored `JobMapModal` Leaflet Carto tile map without scroll lock, 92px spacer, 160px filter spacer.
5. `src/components/DrivingAcademy.jsx`: License category filters (AT/MT/Truck/Towing), course pricing, 5-language dict, 92px spacer, 160px filter spacer.
6. `src/components/CompanyHome.jsx`: Local vs Tokutei Ginou SSW visa recruitment, driving school ad creation, 76px spacers.
7. `src/components/JobDetail.jsx`: Job details modal, company phone dialer, apply button, 5-language dictionary.
8. `src/components/RoleSelect.jsx`: Employer vs Driver role toggle with persistence.

### Profile & Subpages (9 Files)
23. `src/components/Profile.jsx`: Profile main controller, vehicle fleet modal, 86px/82px spacers, logout button `marginTop: 12px`.
24. `src/components/ProfileMain.jsx`: User info, contract toggle, profile photo upload.
25. `src/components/ShoukaiReferrals.jsx`: Shoukai referral bonus tracking, QR code generator, copy link.
26. `src/components/Settings.jsx`: Sound/vibration toggles, theme switcher, `aria-pressed`, defensive local state fallbacks.
27. `src/components/SavedItems.jsx`: Saved jobs & driving school courses.
28. `src/components/Notifications.jsx`: Read/unread status filter, mark all read.
29. `src/components/MyAds.jsx`: Posted vacancy & school ad management.
30. `src/components/Applications.jsx`: Application status pipeline tracking.
31. `src/components/EmployeeManagement.jsx`: Fleet driver management & invitation link copy.

---

## 5. Git & Quality Control Protocol
- **Unit Testing**: Run `npm test -- --run` to verify 100% pass across all 20 test files (90 tests).
- **CRITICAL GIT CONSTRAINT**: All commits MUST remain local on branch `web-1`. **NEVER execute `git push`**.
- **Localization**: Support 5 languages (`ja`, `uz`, `en`, `ru`, `zh`) across all UI text.
- **AI Learn Protocol**: Save all learned rules and error prevention audits into `.agents/rules/` and map in `codebase_map.md`.

---

## 6. Documented Error Patterns, Anti-Patterns & Defensive Fixes
1. **Fixed Positioning inside Centered 820px Canvas**:
   - **Error**: `position: fixed; left: 14px;` causes floating CTA docks to align to the viewport left edge on desktop displays.
   - **Fix**: Use `position: fixed; left: 50%; transform: translateX(-50%); width: calc(100% - 28px); maxWidth: 792px;` so fixed elements stay dead-centered on desktop (820px) and mobile.
2. **Floating CTA Dock & BottomNav Touch/Overlap Bug**:
   - **Error**: CTA dock at `bottom: 84px` touches the top border of `BottomNav`.
   - **Fix**: Set floating CTA dock at `bottom: 96px` to maintain a 12px vertical gap above `BottomNav`.
3. **Filter Drawer CTA Search Button & Last Container Touch Bug**:
   - **Error**: Trailing spacer of 140px caused the last filter container to collide with/overlap the fixed search CTA button when scrolled down to the end.
   - **Fix**: Set filter drawer clearance spacer to **`160px`**, halting the last container 12px clear of the search button.
4. **Missing Callback Prop Crashes (`TypeError: fn is not a function`)**:
   - **Error**: Optional toggles like `notificationSound` or `showProfileBadges` crashing when parent component omits props.
   - **Fix**: Provide default fallback parameters (`onLogout = () => {}`) and internal `useState` + `localStorage` persistence fallbacks.
5. **Infinite Re-render & Flickering Skeleton Loop (`DriverFeed.jsx`)**:
   - **Error**: Inline array props or un-memoized state triggering constant re-renders.
   - **Fix**: Memoize computed lists with `useMemo` and use module-level constant arrays (`const EMPTY_ARRAY = []`).
6. **Global `document.body` Overflow Mutation Bug (`JobMapModal`)**:
   - **Error**: Setting `document.body.style.overflow = 'hidden'` resets page scroll position on modal close.
   - **Fix**: Render modals via `createPortal` into `#root` and handle scroll containment strictly in CSS.
7. **Voice Assistant Multilingual Status Localization Bug**:
   - **Error**: When `speechLang` is set to Japanese (`ja`), STT status bubble showed hardcoded Uzbek fallback text (`Tinglanmoqda...`).
   - **Fix**: Use `getListeningStatusText` and `getThinkingStatusText` functions in `VoiceAssistant.jsx` and `MichiDrawerHeader.jsx` to dynamically render status text matching `speechLang` (`ja`: `聞き取り中...`, `uz`: `Tinglanmoqda...`, `en`: `Listening...`).
8. **STT Auto-Send Prevention & Explicit Send Button Protocol**:
   - **Requirement**: Prevent accidental or incomplete spoken phrases from triggering automatic API queries.
   - **Fix**: STT populates input text fields live. Auto-dispatch on speech completion is disabled. API requests to `michiApiService.sendChatMessage` are strictly sent only when the user clicks the explicit **Send (`Jo'natish` / `送信`)** button.
9. **Premium Glass-Gradient User & AI Avatar Icons**:
   - **Requirement**: Replace plain dot indicators with modern, professional 3D glass gradient avatar icons.
   - **Fix**: Implemented 22px x 22px `.bubble-avatar` badges with Lucide icons: User (`<User size={12} />` with warm orange gradient), AI (`<Bot size={12} />` with futuristic purple-pink gradient), Listening (`<Mic size={12} />` emerald gradient with pulse), and Thinking (`<Sparkles size={12} />` cobalt gradient with 360° rotation).

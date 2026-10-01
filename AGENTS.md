# Michi App Workspace Guidelines & Audited Modules Summary

This repository represents the Michi Japan Logistics Web Application. All 39 core components, services, and UI modules have been systematically audited, optimized, localized (5 languages), and tested.

## 1. Layout & Architecture Standards
1. **820px Desktop Web Canvas (`src/index.css`)**: The app is designed as an 820px max-width Desktop Web Canvas (`max-width: 820px; margin: 0 auto;` with ambient background blobs in light mode). NEVER narrow `#root` or `.app-layout` to a 430px mobile container.
2. **Scrolling Contract (`src/App.css`)**: `.main-content` MUST maintain `overflow-y: auto;` and `-webkit-overflow-scrolling: touch;`. Never use `overflow: hidden` on `.main-content`.
3. **Trailing Clearance Spacers**:
   - `Dashboard`, `DriverFeed`, `DrivingAcademy`, `CompanyHome`: **`64px`** spacer (`<div style={{ height: '64px', minHeight: '64px', width: '100%', flexShrink: 0, clear: 'both' }} />`).
   - `Profile`: **`76px`** custom spacer (`64px + 12px`), with `marginTop: '12px'` on `.logout-btn`.
4. **AI Side Drawer Panel (`VoiceAssistant.css` & `MichiDrawerTrigger.jsx`)**:
   - AI Hub drawer is right-aligned (`max-width: 440px; right: 0; top: 0; bottom: 0;`).
   - Floating trigger `minY` bound is set to `110px` to clear the 56px `.global-header`.
5. **Driver Feed Performance (`DriverFeed.jsx`)**:
   - `filteredJobs` must be wrapped in `useMemo`.
   - Use `const EMPTY_ARRAY = []` for default array props.
   - Do NOT modify `document.body.style.overflow` inside Leaflet map modals.
6. **Filter Modal Clearance Spacer (`DriverFeed.jsx` & `DrivingAcademy.jsx`)**:
   - Filter drawer content uses a **`140px`** clearance spacer with the floating search CTA dock positioned at **`bottom: 96px`** (adding a 12px gap above `BottomNav` at 84px, and reducing the gap between the search button and the last scroll container by 20px).

## 2. Audited & Verified Components (39 Files)
- **Core Views**: `Dashboard.jsx`, `DriverFeed.jsx`, `DrivingAcademy.jsx`, `CompanyHome.jsx`, `JobDetail.jsx`, `RoleSelect.jsx`
- **Michi AI Suite**: `VoiceAssistant.jsx`, `VoiceAssistant.css`, `MichiDrawerTrigger.jsx`, `MichiChatPanel.jsx`, `AssistHeroShowcase.jsx`, plus 9 specialized AI assistant cards (`CandidateMatchingCard`, `CareerAdvancementCard`, `DocumentTranslationCard`, `ExamPrepCard`, `InterviewPrepCard`, `SalaryCalculatorCard`, `TrafficRulesCard`, `VisaAssistantCard`, `WorkplaceJapaneseCard`)
- **Profile Subpages**: `Profile.jsx`, `ProfileMain.jsx`, `ShoukaiReferrals.jsx`, `Settings.jsx`, `SavedItems.jsx`, `Notifications.jsx`, `MyAds.jsx`, `Applications.jsx`, `EmployeeManagement.jsx`
- **JDM Fleet & Vehicle**: `JapaneseVehiclePickerModal.jsx`, `LazyVehicleImage.jsx`, `VehicleGradientCard.jsx`, `JDMNavigation.jsx`, `JDMNavigationSearch.jsx`
- **Engine Services**: `michiApiService.js`, `authSecurityService.js`, `vehicleApiService.js`

## 3. Code Quality & Git Rules
- Maintain 100% unit test pass rate (`npm test -- --run`).
- Local commits only on `web-1` branch. **NEVER execute `git push`**.
- Support 5 languages: Japanese (`ja`), Uzbek (`uz`), English (`en`), Russian (`ru`), Chinese (`zh`).

## 4. Documented Error Patterns, Anti-Patterns & Defensive Fixes
1. **Fixed Positioning inside Centered 820px Canvas**:
   - **Error**: `position: fixed; left: 14px;` causes floating CTA docks to align to the viewport left edge on desktop displays.
   - **Fix**: Always use `position: fixed; left: 50%; transform: translateX(-50%); width: calc(100% - 28px); maxWidth: 792px;` so fixed elements stay dead-centered on desktop (820px) and mobile.

2. **Floating CTA Dock & BottomNav Touch/Overlap Bug**:
   - **Error**: CTA dock at `bottom: 84px` touches the top border of `BottomNav`.
   - **Fix**: Set floating CTA dock at `bottom: 96px` to maintain a 12px vertical gap above `BottomNav`.

3. **Excessive Clearance Spacer White Space**:
   - **Error**: Over-inflating clearance spacers (e.g., 162px/160px), creating empty white space below the last content card.
   - **Fix**: Set filter drawer clearance spacer to **`140px`**, keeping content tightly bound to the search CTA dock.

4. **Infinite Re-render & Flickering Skeleton Loop (`DriverFeed.jsx`)**:
   - **Error**: Inline array props or un-memoized state triggering constant re-renders.
   - **Fix**: Memoize computed lists with `useMemo` and use module-level constant arrays (`const EMPTY_ARRAY = []`).

5. **Global `document.body` Overflow Mutation Bug (`JobMapModal`)**:
   - **Error**: Setting `document.body.style.overflow = 'hidden'` resets page scroll position on modal close.
   - **Fix**: Render modals via `createPortal` into `#root` and handle scroll containment strictly in CSS.

6. **AI Gateway Request Timeout & Raw JSON Leak**:
   - **Error**: Gateway AI calls hanging indefinitely or outputting raw `<think>` tags.
   - **Fix**: Add `AbortController` timeout (15–25s) in `michiApiService.js` and sanitize output via `sanitizeMichiResponse()`.

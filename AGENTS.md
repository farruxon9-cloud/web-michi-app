# Michi App Workspace Guidelines & Audited Modules Summary

This repository represents the Michi Japan Logistics Web Application. All core components, services, sub-pages, and UI modules have been systematically audited, optimized, localized (5 languages), and tested.

## 1. Layout, Spacing & Docking Standards
1. **820px Desktop Web Canvas (`src/index.css`)**: The app is designed as an 820px max-width Desktop Web Canvas (`max-width: 820px; margin: 0 auto;` with ambient background blobs in light mode). NEVER narrow `#root` or `.app-layout` to a 430px mobile container.
2. **Scrolling Contract (`src/App.css`)**: `.main-content` MUST maintain `overflow-y: auto;` and `-webkit-overflow-scrolling: touch;`. Never use `overflow: hidden` on `.main-content`.
3. **Trailing Clearance Spacers (Clearance Math Protocol)**:
   - **`Dashboard`**, **`DriverFeed`**, **`DrivingAcademy`**: **`92px`** spacer (`<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so bottom cards halt cleanly 12px above floating `BottomNav`.
   - **`CompanyHome` (`マイ掲載一覧`)**: **`76px`** spacer (`<div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />`) so job posting buttons (`publishJob`/`publishSchoolAd`) halt 12px clear of floating `BottomNav`.
   - **Profile Sub-pages (`Profile.jsx`)**: `about`, `settings`, `applications`, `my_shoukai` use **`86px`** spacers; `personalInfo` (`会社情報`) uses **`82px`** spacer; main profile view logout button uses **`86px`** spacer.
4. **Filter Drawer Search CTA Spacer (`DriverFeed.jsx` & `DrivingAcademy.jsx`)**:
   - Filter drawer content uses a **`160px`** trailing clearance spacer with the floating search CTA dock positioned at **`bottom: 96px`**, guaranteeing 12px visual clearance between the search button top edge and the last filter container.
5. **AI Side Drawer Panel (`VoiceAssistant.css` & `MichiDrawerTrigger.jsx`)**:
   - AI Hub drawer is right-aligned (`max-width: 440px; right: 0; top: 0; bottom: 0;`).
   - Floating trigger `minY` bound is set to `110px` to clear the 56px `.global-header`.
6. **Driver Feed Performance (`DriverFeed.jsx`)**:
   - `filteredJobs` must be wrapped in `useMemo`.
   - Use `const EMPTY_ARRAY = []` for default array props.
   - Do NOT modify `document.body.style.overflow` inside Leaflet map modals.

## 2. Audited & Verified Components (39 Files)
- **Core Views**: `Dashboard.jsx`, `DriverFeed.jsx`, `DrivingAcademy.jsx`, `CompanyHome.jsx`, `JobDetail.jsx`, `RoleSelect.jsx`
- **Michi AI Suite**: `VoiceAssistant.jsx`, `VoiceAssistant.css`, `MichiDrawerTrigger.jsx`, `MichiChatPanel.jsx`, `AssistHeroShowcase.jsx`, plus 9 specialized AI assistant cards (`CandidateMatchingCard`, `CareerAdvancementCard`, `DocumentTranslationCard`, `ExamPrepCard`, `InterviewPrepCard`, `SalaryCalculatorCard`, `TrafficRulesCard`, `VisaAssistantCard`, `WorkplaceJapaneseCard`)
- **Profile Subpages**: `Profile.jsx`, `ProfileMain.jsx`, `ShoukaiReferrals.jsx`, `Settings.jsx`, `SavedItems.jsx`, `Notifications.jsx`, `MyAds.jsx`, `Applications.jsx`, `EmployeeManagement.jsx`
- **JDM Fleet & Vehicle**: `JapaneseVehiclePickerModal.jsx`, `LazyVehicleImage.jsx`, `VehicleGradientCard.jsx`, `JDMNavigation.jsx`, `JDMNavigationSearch.jsx`
- **Engine Services**: `michiApiService.js`, `authSecurityService.js`, `vehicleApiService.js`

## 3. Code Quality & AI Agent Learn Protocol
- Maintain 100% unit test pass rate (`npm test -- --run`).
- Local commits only on `web-1` branch. **NEVER execute `git push`**.
- Support 5 languages: Japanese (`ja`), Uzbek (`uz`), English (`en`), Russian (`ru`), Chinese (`zh`).
- **AI Learn & Scope Protocol**: AI agents MUST always execute strictly targeted modifications, calculate exact clearance math, document error causes in `.agents/rules/`, and map all created/modified files in `codebase_map.md`.

## 4. Documented Error Patterns, Anti-Patterns & Defensive Fixes
1. **Fixed Positioning inside Centered 820px Canvas**:
   - **Error**: `position: fixed; left: 14px;` causes floating CTA docks to align to the viewport left edge on desktop displays.
   - **Fix**: Always use `position: fixed; left: 50%; transform: translateX(-50%); width: calc(100% - 28px); maxWidth: 792px;` so fixed elements stay dead-centered on desktop (820px) and mobile.
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
10. **On-Demand Branch Merge Protocol**:
    - **Rule**: AI agents MUST NOT automatically merge code into other branches (`start-1.0`, `b`, `web`, etc.) after finishing tasks. All work remains strictly on `web-1`. Branch merges must ONLY be performed when the user explicitly sends an explicit merge command.

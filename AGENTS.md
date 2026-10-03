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

## 5. Auth & Security Architecture Rules (FAZA 1–5 Learnings)
- **Zero Plaintext Passwords**: Never store passwords or user arrays with passwords in `localStorage`. Keshlangan user session ob'ektlaridan `password` atributi avtomatik `delete` qilinadi (`authService.js`).
- **Single Source of Truth (`AuthContext`)**: `<App />` is wrapped in `<AuthProvider>` in `main.jsx`. All components use `useAuth()` hook for state and actions.
- **Central API Client (`apiClient.js`)**: Inject `Authorization: Bearer <token>` automatically. Catch 401 response and automatically attempt `refreshAccessToken()` with in-flight queue before retrying original request.
- **Server OTP & Rate Limiting**: OTP verification calls `POST /api/auth/verify-otp`. Enforce max 3 failed attempts lockout (15 mins) via `authSecurityService`.
- **Single Sign-Out**: On `logoutUser()`, send `POST /api/auth/logout` with `{ refreshToken }` to invalidate the refresh token on the server.
- **Zero Hardcoded Backdoors & Test Code Hints**: NEVER include hardcoded OTP bypass codes (`1234`/`123456`) or test hint labels (`(Test: 1234)`) in authentication services (`authSecurityService.js`), components (`RoleSelect.jsx`), or locale translation files (`locales/*.js`). All OTP verification and password recovery MUST call server proxy endpoints (`api.michi.jp.net`).
- **Zero Client-Side OTP Storage**: NEVER store generated OTP codes in `localStorage` (`michi_v2_otp_<email>`) or generate OTP codes on the client. OTP creation (`POST /api/auth/send-otp`) and verification (`POST /api/auth/verify-otp`) MUST be handled exclusively via `n8nEmailOtpService` backend HTTPS proxy.
- **Dynamic Anti-Bot CAPTCHA**: Anti-bot math CAPTCHA (`generateCaptcha()` in `authSecurityService.js`) MUST generate dynamic random operands and operators (`+`, `-`, `×`) and MUST NEVER return hardcoded static values like `5 + 3 = 8`.
- **Server Password Reset Contract**: Password reset (`RoleSelect.jsx` recovery flow) MUST always execute an HTTP POST to `API_ENDPOINTS.RESET_PASSWORD` (`/api/auth/reset-password`) sending `{ email, code, otpCode, newPassword }` and upon success reset lockout attempts and transition cleanly to the `login` step.
- **Production Environment Configuration**: Production `.env` MUST be configured with `VITE_APP_ENV=production` and `VITE_API_BASE_URL=https://api.michi.jp.net`. NEVER bundle frontend secret key placeholders (`VITE_GEMINI_API_KEY`, `VITE_N8N_API_KEY`, `VITE_N8N_OTP_WEBHOOK_URL`); all secret key operations MUST strictly run through central HTTPS backend proxies on `https://api.michi.jp.net`.
- **Server Application Submission**: Every job application (`handleApplyJob` in `App.jsx`) MUST execute `await submitApplicationToBackend(job.id, profileData)` to push candidate applications directly to `POST /api/applications` on `https://api.michi.jp.net`.
- **Production Feed Cleanliness**: Production state for `jobs` and `schools` (`App.jsx`) MUST initialize to empty arrays `[]`. Feed components (`DriverFeed.jsx`, `DrivingAcademy.jsx`) MUST render backend API items (`apiJobs`/`apiSchools`) directly without merging mock datasets into production feeds.
- **Strict API Error Propagation**: Central API services (`michiJobsApiService.js`, `michiSchoolsApiService.js`) MUST NEVER swallow HTTP 404 or network errors by returning fake local `cleanData` fallback payloads. API errors MUST be explicitly thrown so UI components can display genuine failure feedback.
- **Export Alias Preservation**: API services (`michiJobsApiService.js`, `michiSchoolsApiService.js`) MUST export backward-compatible function aliases (`export const postJob = createJob`, `export const postSchool = createSchool`) to prevent runtime `TypeError: fn is not a function` crashes in consumer hooks (`useMichiJobs.js`, `useMichiSchools.js`).
- **Unified API Client Usage (`apiClient.js`)**: All primary API services (`michiJobsApiService.js`, `michiSchoolsApiService.js`, `michiApiService.js`, `authService.js`) MUST route API requests through `apiFetch` from `apiClient.js` rather than raw `fetch()`. This ensures that JWT `Authorization: Bearer <token>` headers are attached automatically and HTTP 401 response status codes trigger automatic 401 token refresh queue processing.
- **Real Application Data Fetching (`App.jsx`)**: When switching to or loading company mode (`userRole === 'company'`), applications MUST be loaded directly from backend via `apiFetch(API_ENDPOINTS.APPLICATIONS)` instead of setting static `mockIncomingApplications`.
- **Pending Application Restoration (`App.jsx`)**: Guest-mode applications stored in `pendingApply` MUST be automatically processed and submitted after successful registration/login in `handleRoleSelection` and verified via `useEffect` upon `userRole` transition.
- **Strict Network Error Handling on Auth (`authService.js`)**: `checkEmailExists` MUST throw an explicit error (`throw new Error(...)`) on network or server connection failure rather than silently returning `false`, preventing unauthorized duplicate registration attempts when the server is unreachable.
- **Dynamic Salary Range Parsing (`CompanyHome.jsx`)**: When dispatching company job postings to backend (`submitJobToBackend`), `minSalary` and `maxSalary` MUST be parsed dynamically from user input via `parseSalaryRange(newJob.salary)` rather than hardcoding static values (`250000`/`450000`).
- **Nested Licenses Array Prevention (`CompanyHome.jsx`)**: When passing licenses payload to backend (`submitJobToBackend`), format using `Array.isArray(job.license) ? job.license : [job.license]` to prevent nested array wrapping (`[['lic_futsu']]`).
- **Server-Side Job Update Persistence (`CompanyHome.jsx`)**: When a company edits an existing job vacancy (`newJob.id`), dispatch a `PUT` request via `apiFetch(`${API_ENDPOINTS.JOBS}/${newJob.id}`, { method: 'PUT', body: JSON.stringify(job) })` alongside updating local state to ensure edits persist on the server.
- **Server-Side Job Deletion (`CompanyHome.jsx`)**: When deleting a job/school ad (`handleDeleteJob`/`handleDeleteSchool`), prompt for user confirmation via `window.confirm` and send an explicit `DELETE` HTTP request to `${API_ENDPOINTS.JOBS}/${jobId}` (`${API_ENDPOINTS.SCHOOLS}/${schoolId}`) before updating local state.
- **Company Dashboard Job Ownership Filtering (`CompanyHome.jsx`)**: When rendering job and school lists in company dashboard view, filter items via `isMyJob(job)` (`isMySchool(school)`) to ensure competitor company postings are not displayed in the logged-in company's management panel.
- **Company Jobs API Fetching (`CompanyHome.jsx`)**: Fetch live company job postings from server on component mount via `fetchJobs({ company: profileData?.fullName })` inside `useEffect` and populate state via `setJobs` so production backend jobs are loaded dynamically.
- **Complete Form Payload in Job Submit (`CompanyHome.jsx`)**: When dispatching job postings to backend via `submitJobToBackend`, pass all missing form fields (`employmentType`, `bonusPrivilege`, `workShift`, `holidayType`, `socialInsurance`, `dormitorySupport`, `foreignerSupport`, `callReceptionStyle`, `trainLine`, `subcategory`, `image`) to prevent form data loss on server creation.
- **Dead Code Mock Elimination (`CompanyHome.jsx`)**: Unused mock dataset constants like `INITIAL_COMPANY_JOBS` MUST be purged from codebase files to reduce bundle size and prevent developer confusion with production API endpoints.
- **Dead Import & Unused State Cleanup (`CompanyHome.jsx`, `RoleSelect.jsx`, `App.jsx`)**: Unused component imports, unused icon symbols, and obsolete state variables/handlers MUST be removed during component refactoring to maintain clean code standards and prevent bundle bloat.
- **Standard Option Value Keys (`CompanyHome.jsx` vs `DriverFeed.jsx` & `JobDetail.jsx`)**: Option values in form select and chip arrays (`WORK_HOURS_OPTIONS`, `DAY_OFF_OPTIONS`, `INSURANCE_OPTIONS`, `FOREIGNERS_OPTIONS`, `HOUSING_OPTIONS`, `LICENSE_OPTIONS`) MUST use standardized keys (`wh_day`, `do_weekend`, `insurance_full`, `foreigners_visa`, `housing_dorm`, `lic_futsu`) rather than localized plain strings. Each option object MUST specify `key` and `label` attributes so `renderChips` and `t(job[field])` dynamically render localized labels across all 7 supported languages without storing hardcoded Uzbek/Japanese text in the database.
- **Robust Benefit Filter Exclusion (`DriverFeed.jsx`)**: Housing and benefit filters MUST check for all negative indicators (`housing_none`, `hou_none`, `Yo'q`, `none`) to ensure jobs without housing support are correctly excluded when filtering.
- **Real API Saved Items Integrity (`Profile.jsx`)**: Saved jobs and schools (`savedJobs`, `savedSchools`) MUST NOT be filtered against static mock datasets (`MOCK_JOBS`/`MOCK_SCHOOLS`); saved items MUST directly render all active saved items stored in `profileData.savedItems`.
- **Language Selection Persistence (`App.jsx`)**: `languageSelected` state MUST initialize via lazy evaluation from `localStorage.getItem('michi_lang')` (`Boolean(localStorage.getItem('michi_lang'))`) to prevent forcing the language selection screen on page refresh (F5).
- **Guest Session Persistence (`AuthContext.jsx`)**: When entering guest mode (`userRole === 'guest'`), persist `localStorage.setItem('michi_guest_session', 'true')` so that refreshing the page (F5) maintains the guest session without forcing the user back to the role selection screen.
- **Dynamic User Geolocation Distance Calculation (`DriverFeed.jsx`)**: Radius distance filtering MUST use live user coordinates obtained via `navigator.geolocation.getCurrentPosition` (falling back to Tokyo Station center `35.6812, 139.7671` only if denied/unavailable) so distance math is accurate across all Japanese regions (Osaka, Sendai, Nagoya, etc.).
- **Leaflet Map Search Activation & ES Import Fallback (`DriverFeed.jsx`)**: Map search modal MUST have `ENABLE_MAP_SEARCH = true` and `JobMapModal` MUST resolve Leaflet instance via `(typeof window !== 'undefined' && window.L) || L` (using module import `import L from 'leaflet'`) so interactive map modal search opens reliably.
- **Production Environment & Error Handling Invariants**:
  - **ErrorBoundary Wrapping**: All top-level early-return views (`Splash`, `LanguageSelect`, `RoleSelect`, `AdminDashboard`) in `App.jsx` MUST be wrapped inside `<ErrorBoundary>` to prevent unhandled React render errors from causing a white screen of death.
  - **Debug Overlay Guard**: Visual error logger overlays in `src/main.jsx` MUST be strictly guarded with `import.meta.env.DEV` to ensure they never render in production.
  - **Console & Debugger Stripping**: Production builds (`vite.config.js`) use Vite 8 minification for clean bundle optimization. Debug logger overlays (`src/main.jsx`) MUST be guarded with `import.meta.env.DEV`.
  - **Japanese Default Fallbacks for Navigation Controls (`BottomNav.jsx`)**: Navigation labels (`navHome`, `navJobs`, `navService`, `navAcademy`, `navProfile`) MUST use native Japanese fallback defaults (`ホーム`, `求人`, `整備`, `教習所`, `マイページ`) in `t('key', fallback)` helpers, and all locale files (`ru.js`, `vi.js`, `ne.js`, `zh.js`, `en.js`, `uz.js`, `ja.js`) MUST define explicit translated labels for each tab.
- **Complete 7-Locale Dictionary Map (`DrivingAcademy.jsx`)**: Language label lookups (`getLanguageLabel`) and flag indicators (`getLanguageFlag`) MUST cover all 7 supported application languages (`ja`, `uz`, `en`, `ru`, `zh`, `vi`, `ne`) via a comprehensive dictionary map (`LANG_LABELS_MAP`), and section headers MUST use translation keys (`t('languagesOffered', '対応言語')`) rather than hardcoded 2-language ternary checks.
- **PWA Asset Presence & Manifest Integrity (`public/` & `vite.config.js` & `index.html`)**: All PWA icon assets defined in `vite.config.js` manifest (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`, `favicon.ico`, `masked-icon.svg`) MUST physically exist in the `/public/` root directory and be correctly referenced in `index.html` `<head>` tags to prevent HTTP 404 console errors and ensure PWA installability across desktop, iOS, and Android devices.
- **Comprehensive SEO Meta Tags & Dynamic Route Title Switching (`index.html` & `App.jsx`)**: `index.html` MUST declare complete SEO metadata including canonical links (`https://web.michi.jp.net/`), Open Graph tags (`og:title`, `og:description`, `og:image`, `og:locale`), Twitter Cards (`twitter:card`), hreflang language alternates (`ja`, `uz`, `en`), robots directive (`index, follow`), and JSON-LD `WebApplication` `schema.org` structured data. `App.jsx` MUST dynamically update `document.title` on `activeTab` transition to ensure search engine indexability and social sharing preview accuracy.
- **Strict Brand Theme Color Synchronization (`index.html` & `vite.config.js`)**: `theme-color` meta tags in `index.html` (`#5E5CE6` for primary / light mode and `#1C1C1E` for dark mode) MUST strictly match `theme_color` (`#5E5CE6`) and `background_color` (`#1C1C1E`) in `vite.config.js` `manifest` to eliminate color discrepancies between browser status bars, PWA splash screens, and iOS theme overlays.
- **Dynamic HTML Lang Attribute Synchronization (`i18n.js` & `LanguageSelect.jsx`)**: `document.documentElement.lang` MUST NOT be hardcoded to a static string like `'en'` in `index.html`. It MUST dynamically synchronize with the active application locale (`ja`, `uz`, `en`, `ru`, `zh`, `vi`, `ne`) both on i18n initialization and on runtime language changes via `i18n.on('languageChanged')` and `LanguageSelect.jsx` handlers to ensure proper screen reader accessibility, browser translation prompt triggers, and localized search engine indexing.
- **Automatic Company Email Notification Dispatch (`applicationService.js` & `App.jsx`)**: When a driver candidate submits a job application (`handleApplyJob`), the client MUST execute `notifyCompanyNewApplication({ companyEmail, applicantName, jobTitle, type: 'new_application' })` targeting `API_ENDPOINTS.NOTIFY_COMPANY` (`/api/auth/notify-company` proxy to n8n webhook) so logistics companies receive instant email alerts whenever new applications are submitted.
- **Job Publication Email Confirmation Dispatch (`michiJobsApiService.js` & `CompanyHome.jsx`)**: When a company publishes a new job posting (`submitJobToBackend`), the system MUST trigger `notifyJobCreatedConfirmation({ companyEmail, companyName, jobTitle, type: 'job_published' })` to send a publication confirmation email to the company's contact email.
- **Candidate Application Status Change Email Dispatch (`applicationService.js` & `App.jsx`)**: When a company updates an application status (`handleChangeAppStatus` to `'accepted'`, `'interview'`, `'reviewed'`, `'rejected'`), the system MUST trigger `notifyApplicantStatusChange({ applicantEmail, applicantName, companyName, jobTitle, newStatus, type: 'application_status_update' })` targeting `API_ENDPOINTS.NOTIFY_COMPANY` to send an instant email notification to the candidate.
- **RESTful Job Mutation Contract (`michiJobsApiService.js` & `CompanyHome.jsx`)**: Job ad updates and deletions MUST execute `PUT /api/jobs/:id` (`updateJobInBackend`) and `DELETE /api/jobs/:id` (`deleteJobInBackend`) HTTP requests via `apiFetch` to ensure full CRUD state persistence on the central backend.
- **Expanded Company Invitation Webhook Payload (`n8nEmailOtpService.js`)**: Company invitations MUST dispatch an n8n webhook request (`sendCompanyInviteViaN8n`) with `{ action: 'invite_company', email, companyName, inviteLink }` to `API_ENDPOINTS.NOTIFY_COMPANY`.
- **Centralized Secure AI Gateway (`michiApiService.js` & `VoiceAssistant.jsx`)**: Frontend components MUST NEVER expose secret API keys like `VITE_GEMINI_API_KEY`. All AI queries MUST route directly through the central HTTPS gateway (`POST https://api.michi.jp.net/api/chat` with `{ "message": userMessage }`).











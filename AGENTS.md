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
   - Filter drawer content uses a **`160px`** clearance spacer (`96px` CTA bottom + `52px` CTA height + `12px` standard gap = `160px`) so that when fully scrolled, the last card halts with an exact standard **12px** gap above the search button.

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

# Michi UI & Feature Scoping Rules

1. **Strict Change Scoping**: Never modify, redesign, or add interactive banners to placeholder screens (e.g., coming-soon screens) unless explicitly instructed by the user. If the user asks to move a feature (e.g. AI showcase), modify ONLY the specified target page and keep all other untouched pages in their exact original state.
2. **AI Showcase Exclusivity**: The AI Assist Vision card and full showcase view must exist EXCLUSIVELY inside Profile -> "Platforma haqida" (`activePage === 'about'`). Do not duplicate AI cards on the Home Dashboard or inside the Servis tab.
3. **Japanese Navigation Terms**: When Japanese (`ja`) locale is active, bottom navigation tab labels must strictly use standard Japanese app conventions:
   - Home -> `ホーム`
   - Jobs -> `求人`
   - Service -> `サービス`
   - Academy -> `教習所`
   - Profile -> `マイページ`
4. **Mobile Flex Viewport Overflow Invariant**: Every text container inside a flex item on mobile layouts MUST include `min-width: 0;` and `overflow-wrap: anywhere; word-break: break-word;` to strictly prevent any horizontal overflow past the mobile device frame.
5. **No Raw Text Emojis**: Replace raw text emojis (`🗣️`, `🤖`) with Lucide vector icons wrapped in stylized 3D glassmorphic containers.
6. **Mobile Navigation Header Spacing Invariants**:
   - **Back Button & Sticky Header Offset**: The floating back button (`<button className="icon-btn glass">`) must sit at exactly `top: 16px` and `left: 16px` with dimensions `40px × 40px` (`flex-shrink: 0`, `aspect-ratio: 1 / 1`, `border-radius: 50%`) across all sub-pages (`Profile.jsx`, `AssistHeroShowcase.jsx`, `JobDetail.jsx`, `DrivingAcademy.jsx`) for 1:1 visual parity.
   - **Pinned Back Button Only & 1:1 Baseline Alignment**: In mobile filter drawers (`DrivingAcademy.jsx`, `DriverFeed.jsx`), ONLY the Back Button (`<button className="icon-btn glass">`, `40x40px`, `border-radius: 50%`) stays pinned sticky at `top: 0` (`position: sticky; top: 0; z-index: 300`). The Title (`自動車学校の絞り込み`) and Reset button (`リセット`) MUST sit in a scrollable header row (`minHeight: 40px; position: relative`) so they align 1:1 on the exact same baseline upon entering the page, but scroll away naturally when the user scrolls down.
7. **Bottom Dock Bar Clearance & Live Under-Glass Scroll Invariant**:
   - **Full-Screen Container Positioning (`bottom: 0`)**: All scrollable main containers and sub-page views (`.dashboard-container`, `.feed-container`, `.academy-container`, `.profile-container`) MUST extend to full viewport height using `bottom: 0` (or `height: 100%`). NEVER clip outer containers height with fixed bottom bounds (such as `bottom: 90px !important`), which stops scrolling prematurely and causes a frozen/static background artifact behind `BottomNav`.
   - **Uniform Clearance Gap Formula**: Scrollable containers MUST apply `padding-bottom: 96px;` (or `padding-bottom: 88px` for Jobs Feed yielding exact 4px visual gap) so that when scrolled all the way down, the last card halts cleanly above the floating bottom dock (`.bottom-nav`, top edge at `12px + 72px = 84px`), while allowing content to scroll live underneath the glassmorphism backdrop blur filter.
8. **Mobile Filter Floating CTA Button Invariants**:
    - **Full-Width Spanning**: Mobile sticky search/action buttons (`.townwork-btn-search-cta`) must use `width: 100%; max-width: 100%;` to fill the container width. Never apply rigid max-width caps (e.g., `max-width: 240px`) that cause half-width alignment gaps.
    - **Pure Standalone Floating Element & Compact 124px Trailing Clearance Spacer**: Do not wrap floating CTA buttons inside extra translucent glass cards, outer border containers, backdrop filters (`backdrop-filter`), or nested background gradient masks. The button must float cleanly as a single standalone pill element (`position: fixed; bottom: 96px; z-index: 250;`) inside a transparent wrapper with `pointer-events: none` (`pointer-events: auto` on the button itself), while outer scroll container uses a compact `124px` trailing clearance spacer (`<div style={{ height: '124px', minHeight: '124px', width: '100%', flexShrink: 0, clear: 'both' }} />`) directly following the last card to guarantee an exact, tight 12px visual clearance gap without large empty whitespace.
9. **Prefecture & Location Banner Aesthetics**:
    - Use Apple-style Banner Cards (`対象エリア (地域): 全ての地域 (全国) [変更 ▾]`) for prefecture/region selection inside accordion filter sections instead of generic inline select pills.
10. **Flex Scroll Container Invariant**:
    - **Explicit Container Heights**: Mobile flex-based scroll containers (e.g. `.feed-container` or sub-page inline views) nested inside flex parents (`flex: 1`) MUST explicitly include `height: 100%; max-height: 100%; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box;` to guarantee overflow scrollability across all browsers.
12. **Page-Specific Invariant Specification Rules Architecture**:
    - Every main page and sub-page MUST strictly adhere to its dedicated specification document located in `.agents/rules/pages/`:
      - [01_dashboard.md](file:///.agents/rules/pages/01_dashboard.md): Home Dashboard (`Dashboard.jsx`)
      - [02_driver_feed.md](file:///.agents/rules/pages/02_driver_feed.md): Jobs Feed (`DriverFeed.jsx`)
      - [03_driving_academy.md](file:///.agents/rules/pages/03_driving_academy.md): Driving Academy (`DrivingAcademy.jsx`)
      - [04_jdm_navigation.md](file:///.agents/rules/pages/04_jdm_navigation.md): JDM Navigation (`JDMNavigation.jsx`)
      - [05_profile_main.md](file:///.agents/rules/pages/05_profile_main.md): Profile Main (`Profile.jsx`)
      - [06_my_ads.md](file:///.agents/rules/pages/06_my_ads.md): My Posted Ads (`CompanyHome.jsx`)
      - [07_personal_info.md](file:///.agents/rules/pages/07_personal_info.md): Personal Info (`personalInfo`)
      - [08_applications.md](file:///.agents/rules/pages/08_applications.md): Applications (`applications`)
      - [09_saved_items.md](file:///.agents/rules/pages/09_saved_items.md): Saved Items (`saved_items`)
      - [10_notifications.md](file:///.agents/rules/pages/10_notifications.md): Notifications (`notifications`)
      - [11_settings.md](file:///.agents/rules/pages/11_settings.md): Settings (`settings`)
      - [12_platform_about.md](file:///.agents/rules/pages/12_platform_about.md): Platform About (`about`)
      - [13_shoukai_referrals.md](file:///.agents/rules/pages/13_shoukai_referrals.md): Shoukai Referrals (`my_shoukai`)
      - [14_employee_management.md](file:///.agents/rules/pages/14_employee_management.md): Employee Management (`employees`)
      - [15_filter_drawer.md](file:///.agents/rules/pages/15_filter_drawer.md): Recruitment Filter Drawer (`TownworkFilterDrawer.jsx`)
      - [16_assist_showcase.md](file:///.agents/rules/pages/16_assist_showcase.md): AI Assist Voice Showcase (`AssistHeroShowcase.jsx`)
13. **Uniform Design Token System (Yagona Pikselik Standart Tizimi)**:
    - Barcha sahifalar va sub-sahifalarda quyidagi **6 ta daxlsiz Design Token** qat'iy rioya qilinishi shart:
      - **Yon Margin**: `14px` (barcha konteynerlar va `BottomNav` paneli `left: 14px; width: calc(100% - 28px)` bilan 1:1 simmetrik).
      - **Orqaga Tugmasi (Sticky Back Button Invariant)**: `40x40px`, `border-radius: 50%`, `top: 16px`, `left: 16px` (`z-index: 250`). Barcha sub-sahifalarda ortga qaytish tugmasi istisnosiz `.profile-sticky-back` yoki `.personal-info-sticky-back` orqali sticky-pin holatida bo'lishi shart.
      - **Kartochkalar Oraliq Gap (Flex Gap Invariant)**: `12px / 14px` (Bento gridlar, e'lon ro'yxatlari, profil menyulari va sub-sahifa bloklari orasida). Flex container ichidagi bola kartalarda har doim `margin-top: 0` saqlanib, masofa faqat ota flex-konteynerning `gap` tokeni orqali yagona va toza boshqariladi (hech qachon ikkilangan 28px margin accumulation ishlatilmaydi).
      - **BottomNav Pastki Clearance (Micro-Compact Dock Gap)**: Sub-sahifalarda CSS'dagi `padding-bottom: 0px !important` va JSX'dagi bitta yagona `90px` trailing spacer (`<div style={{ height: '90px', minHeight: '90px', width: '100%', flexShrink: 0, clear: 'both' }} />`) orqali `BottomNav` paneli ustida aniq `6px` micro-compact vizual bo'shliq kafolatlanadi (hech qachon takroriy double-padding ishlatilmaydi).
      - **Burchaklar Radiusi Ierarxiyasi (Border Radius Hierarchy)**: `24px` (BottomNav, Hero) → `20px` (Bento, Konteyner) → `16px` (Kartochka, Modal, Input) → `12px` (Logo, Badge) → `8px` (Pill, Tag).
      - **Konteyner Full-Screen Positioning**: `bottom: 0` + `padding-bottom` (HECH QACHON `bottom: 90px !important` kabi sun'iy qirqish ishlatilmaydi).
14. **Page Creation Blueprint Protocol (Yangi Sahifa Yaratish Blueprinti)**:
    - Barcha 16 ta sahifa, sub-sahifa, drawer va modallar uchun `.agents/rules/pages/` katalogidagi `01_` dan `16_` gacha bo'lgan blueprint fayllari **majburiy daxlsiz standart** hisoblanadi. Kodga o'zgartirish kiritishdan oldin AI tegishli `.md` blueprintni o'qib rioya qilishi shart.
    - Yangi sahifa yoki sub-modal yaratilganda u uchun ham `.agents/rules/pages/` katalogida alohida spetsifikatsiya fayli yaratilishi shart.
    - Yangi sahifa qo'shilgandan so'ng `node scripts/deep_ui_audit.mjs` va `npx vitest run` audit skriptlari ishlatilishi va 100% Passed bo'lishi kafolatlanishi shart.
15. **Pure Single-Language Filter Drawer Invariant**:
    - Filtr menyularidagi (`DrivingAcademy.jsx`, `DriverFeed.jsx`) birorta sarlavha, litsenziya, dars uslubi, imtiyoz pill tugmasi yoki til tugmasi qavs ichida aralash matnlar bilan berilmasligi shart (masalan, `通学コース (Qatnab o'qish)`, `合宿免許 (Yashab/Lagerda o'qish)`, `O'zbekcha (UZ)` kabi anti-patternlar QAT'IYAN TAQIQLANADI).
    - Barcha matnlar tegishli i18n lug'at klyuchlari (`ja.js`, `uz.js`, `en.js`, `ru.js`) orqali har bir til uchun 100% toza va yagona render qilinishi shart.
16. **Symmetrical 2-Column Grid & Zero-Whitespace Invariant**:
    - Narx va maosh diapazonlari kabi tanlov variantlarida tarqoq `flex-wrap` va o'ng tomonda ochiq vizual bo'shliqlar (awkward empty whitespace) qoldirish QAT'IYAN TAQIQLANADI.
    - Barcha diapazon va tanlov tugmalari har doim **2 ustunli CSS Grid (`grid-template-columns: repeat(2, 1fr); gap: 8px`)** orqali 1:1 simmetrik, toza va teng 50% enida joylashtirilishi shart (`Barchasi` / `すべての...` esa `grid-column: span 2` bilan tepani to'liq qoplaydi).
17. **i18n Multi-Language Dictionary Complete Coverage Standard (Rule 42)**:
    - Har qanday yangi interfeys matni, modal sarlavhasi yoki dinamik holat (status) kaliti yaratilganda u barcha **8 ta locale faylida** (`src/locales/{uz,ja,en,id,vi,ru,zh,ne}.js`) teng va to'liq tarjima qilinishi SHART.
    - Qaysidir til faylida kalit tushib qolishi yoki yapon/inglizcha matn boshqa tillarga placeholder qilib qoldirilishi MAN ETILADI.
    - Candidate Resume (`candidateResume`, `fullNameLabel`, `jlptVerified`, `viewResumeBtn`, `hideResumeBtn`), App Statuses (`statusSubmitted`, `statusReviewing`, `statusReviewed`, `statusInterview`, `statusAccepted`, `statusRejected`) hamda HR status simulyatsiya tugmalari har bir tilda 100% toza aks etishi majburiydir.
18. **Sticky Back Button Bounded Scroll Container Invariant (Rule 18)**:
    - Sticky ortga qaytish tugmasi (`position: sticky; top: 16px; z-index: 300`) joylashgan ota-konteyner HECH QACHON `height: 100%` yoki `max-height: 100%` bilan cheklanmasligi shart (agarda ichki scroll emas, tashqi `.sub-page-view` scroll qilinsa).
    - Agarda ota-konteyner `height: 100%` ga ega bo'lsa, `height: auto; maxHeight: none; overflow-y: visible;` inline-style override qo'llanib, ota-konteyner balandligi forma kontentining to'liq balandligiga mos ravishda tabiiy ravishda cho'zilishi kafolatlanishi shart.
19. **Theme-Scoped Visual Refinements Invariant (Rule 19)**:
    - **Dark Mode Scoping**: When implementing OLED matte black styling (`#0B0C10` containers, `#13151B` cards) or hiding glowing background blobs/haze, ALWAYS scope the CSS overrides strictly under `html.dark-mode` and `@media (prefers-color-scheme: dark) :root:not(.light-mode)`.
    - **Light Mode Preservation**: Light mode (`html.light-mode`) default variables (`--bg-color: #e5eafc` / `#f5f7fa`, `--card-bg: rgba(255, 255, 255, 0.65)`), backdrop blur filters (`backdrop-filter: blur(20px)`), card shadows, and ambient background blobs (`.glass-blob`, `.music-jelly-blob`) MUST remain untouched and fully functional unless the user explicitly requests modifying Light Mode as well.
20. **Granular Modular Architecture & Living Codebase Map Invariant (Rule 20)**:
    - **Granular Single-Responsibility Decoupling**: Every UI component, widget, sub-drawer, modal, button handler, AI module, and utility MUST be split into standalone, single-responsibility modular files (under `src/components/<feature>/`, `src/services/`, `src/utils/`, etc.). Avoid monolithic multi-purpose files; keep components focused so changes only target isolated modules.
    - **Living Codebase Architecture Map Protocol**: Whenever a new file, component, hook, service, or dictionary is created or restructured, the developer/agent MUST immediately update [codebase_map.md](file:///Users/kanoatovfarrux/michiappforjapan/codebase_map.md) in the workspace root, documenting:
      1. File path and component name.
      2. Exact purpose and responsibilities.
      3. Key props, inputs, and state dependencies.
      4. Placement within the visual Mermaid architecture diagram.
21. **Search Header Scrollability Invariant (Rule 21)**:
    - Search containers on list screens (`.feed-header` in `DriverFeed.jsx`, `.academy-header` in `DrivingAcademy.jsx`) MUST use `position: relative` so they scroll away naturally when the user scrolls down, allowing maximum content visibility. Only the top `.global-header` and bottom `.bottom-nav` remain pinned.
22. **Desktop Container Centering Invariant (Rule 22)**:
    - Desktop bounds `@media (min-width: 768px)` for all page containers (`.dashboard-container`, `.profile-container`, `.academy-container`, `.job-detail-container`, `.feed-container`) MUST use strictly `max-width: 820px !important; margin: 0 auto !important; width: 100% !important;`. Never apply `left: 50%` or `transform: translateX(-50%)` without absolute positioning, which causes leftward alignment shifts.
23. **Selective Page Clearance Spacer Invariant (Rule 23)**:
    - Feeds, Academy, Dashboard, and CompanyHome main view MUST use an exact 8px trailing clearance spacer (`<div style={{ height: '8px', minHeight: '8px' }} />`).
    - Profile Main, all Profile sub-pages, and Job Posting page (`Profile.jsx` -> `myAds`) MUST retain an exact 12px trailing clearance spacer (`<div style={{ height: '12px', minHeight: '12px' }} />`) leaving an exact 12px gap from bottom navigation.
24. **Floating Search CTA Button Squircle & Compact 78px Filter Spacer Invariant (Rule 24)**:
    - Floating search CTA buttons (`.townwork-btn-search-cta`) MUST use `border-radius: 20px` to match container squircle aesthetics, `box-shadow: 0 4px 16px rgba(10, 132, 255, 0.2)` for a subtle minimalist glow, strict 1:1 vertical margin alignment (`left: 14px; width: calc(100% - 28px)` / desktop `.floating-search-cta-dock` `max-width: 792px`), and an exact **78px filter clearance spacer** (`<div style={{ height: '78px', minHeight: '78px' }} />`) in filter drawers so content halts cleanly with a 26px visual gap above the floating search CTA button.
26. **Profile Sub-Page Navigation Scroll Mechanics Invariant (Rule 26)**:
    - Navigating to any Profile sub-page (`handleOpenSubPage`) MUST force scroll position to top (`scrollTop = 0`), while saving current pixel offset in `savedMainScroll`. Clicking back (`handleBackToMain`) MUST reliably restore main Profile scroll position to the exact saved position. All sub-page back buttons MUST call `handleBackToMain`.
27. **Floating BottomNav Layer & Clearance Spacer Standards (Rule 27)**:
    - `.main-content` MUST be `position: absolute; top: 56px; bottom: 0; left: 0; right: 0;` so page content scrolls dynamically underneath floating BottomNav.
    - `.bottom-nav-dock` MUST be `position: absolute; bottom: 0; left: 0; right: 0; width: 100%; pointer-events: none;` ensuring `.bottom-nav` (`width: calc(100% - 28px)`) lines up 1:1 in a straight vertical line with cards above.
    - Clearance spacers from screen bottom MUST be set to **`92px`** on main feeds (`DriverFeed`, `DrivingAcademy`, `Dashboard`, `CompanyHome`), **`96px`** on My Page / Profile (`Profile.jsx` main and all sub-pages), and **`162px`** on Filter Drawers (`DriverFeed`, `DrivingAcademy`).
28. **Floating AI Hub Side Drawer Trigger Boundary Docking (Rule 28)**:
    - The floating AI Hub trigger (`.voice-side-drawer-trigger`) MUST dock on the right boundary wall of the 820px container on desktop using `@media (min-width: 768px) { right: calc(50% - 410px); }` and `right: 0` on mobile.
29. **AI Hub Native Background Color Matching (Rule 29)**:
    - `.voice-side-drawer-overlay` and `.voice-side-drawer-panel` MUST use `background: var(--bg-color, #e5eafc)` (and `#0B0C10` in dark mode) so the AI Hub view matches all regular app pages natively without dark black side backdrops.
30. **Nested Component Spacer Deduplication (Rule 30)**:
    - Containers wrapping nested components that already define their own clearance spacer (such as `Profile.jsx`'s `myAds` rendering `CompanyHome`) MUST use a reduced **`12px` spacer** to avoid double-spacer stacking.






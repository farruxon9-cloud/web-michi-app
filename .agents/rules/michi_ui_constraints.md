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

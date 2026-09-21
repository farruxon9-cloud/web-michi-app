# Michi Ilovasi: Tarixiy Saboqlar va Xatolar Xotirasi (Past Mistakes Log)

Ushbu fayl loyihani tahrirlash davomida aniqlangan kritik xatoliklar va ularning oldini olish qoidalarini jamlaydi. Har safar kodga o'zgartirish kiritishdan oldin, ushbu qoidalar hamda alohida sahifa qoidalari o'qilishi shart.

---

## 🗺️ Sahifalar va Bo'limlar Bo'yicha Alohida Qoidalar va Xatolar Mundarijasi

| Sahifa / Bo'lim | Tegishli Komponent va CSS | Alohida Qoida va Xatolar Fayli | Asosiy Invariantlar |
| :--- | :--- | :--- | :--- |
| **01. Home Dashboard** | `Dashboard.jsx`, `Dashboard.css` | [`01_dashboard.md`](file:///.agents/rules/pages/01_dashboard.md) | Compact Bento Grid, 24px/20px Border Radius, Home Header |
| **02. Jobs Feed** | `DriverFeed.jsx`, `DriverFeed.css` | [`02_driver_feed.md`](file:///.agents/rules/pages/02_driver_feed.md) | **Rule 50**: Tokutei Ginou & Job Feed 92px Clearance Spacer, Pure Single-Language Filters |
| **03. Driving Academy** | `DrivingAcademy.jsx`, `DrivingAcademy.css` | [`03_driving_academy.md`](file:///.agents/rules/pages/03_driving_academy.md) | **Rule 48 & 49**: 92px Main / 160px Filter Clearance Spacer, 100% Reset & Accordion Collapse |
| **04. JDM Navigation** | `JDMNavigation.jsx`, `JDMNavigation.css` | [`04_jdm_navigation.md`](file:///.agents/rules/pages/04_jdm_navigation.md) | Navigation Mode Map Viewport, Bottom Vehicle Selector Clearance |
| **05. Profile Main** | `Profile.jsx`, `Profile.css` | [`05_profile_main.md`](file:///.agents/rules/pages/05_profile_main.md) | **Rule 47**: Logout Button 100px Spacer (16px Breathing Gap above BottomNav) |
| **06. My Posted Ads** | `CompanyHome.jsx` | [`06_my_ads.md`](file:///.agents/rules/pages/06_my_ads.md) | **Rule 46**: Form Submit 28px Clearance / 12px Spacer Invariant |
| **07. Personal Info** | `Profile.jsx` (`personalInfo`) | [`07_personal_info.md`](file:///.agents/rules/pages/07_personal_info.md) | 90px Sub-Page Clearance Spacer, Japanese Vehicle Picker Modal Geometry |
| **08. Applications** | `Profile.jsx` (`applications`) | [`08_applications.md`](file:///.agents/rules/pages/08_applications.md) | **Rule 51**: Sub-Page 96px Clearance Spacer (Exact 12px gap above BottomNav) |
| **09. Saved Items** | `Profile.jsx` (`saved_items`) | [`09_saved_items.md`](file:///.agents/rules/pages/09_saved_items.md) | Bookmark Manager Sync, Saved Item Card Actions |
| **10. Notifications** | `Profile.jsx` (`notifications`) | [`10_notifications.md`](file:///.agents/rules/pages/10_notifications.md) | Notification List Clearance & Read Status Flags |
| **11. Settings** | `Profile.jsx` (`settings`) | [`11_settings.md`](file:///.agents/rules/pages/11_settings.md) | Theme Switcher, i18n Language Picker, Cache Actions |
| **12. Platform About** | `Profile.jsx` (`about`) | [`12_platform_about.md`](file:///.agents/rules/pages/12_platform_about.md) | Exclusive AI Showcase Card & Vision View |
| **13. Shoukai Referrals** | `Profile.jsx` (`my_shoukai`) | [`13_shoukai_referrals.md`](file:///.agents/rules/pages/13_shoukai_referrals.md) | Shoukai Bonus Calculation & Copy Link Actions |
| **14. Employee Mgmt** | `Profile.jsx` (`employees`) | [`14_employee_management.md`](file:///.agents/rules/pages/14_employee_management.md) | Company Employee List & Permission Badges |
| **15. Filter Drawer** | `TownworkFilterDrawer.jsx` | [`15_filter_drawer.md`](file:///.agents/rules/pages/15_filter_drawer.md) | Townwork 3-Tab Filter Header, 160px CTA Clearance |
| **16. Assist Showcase** | `AssistHeroShowcase.jsx` | [`16_assist_showcase.md`](file:///.agents/rules/pages/16_assist_showcase.md) | Voice Assistant Interface, Pinned Back Button Offset |

---

## 🚫 1. HMR va React.lazy Ziddiyati (Fast Refresh Invalidation)
* **Xatolik**: `default` export qilinadigan React komponenti joylashgan faylda boshqa massivlar yoki obyektlarni ham `export const` qilish (masalan, `DriverFeed.jsx` da `MOCK_JOBS`ni export qilish). Bu Vite Fast Refresh (HMR) tizimini buzadi va brauzerda sahifa qulab qolishiga olib keladi.
* **Yechim**: Komponentlarni dinamik yuklashda (`React.lazy`) ehtiyot bo'lish, yoki xatolikni butunlay bartaraf etish uchun `App.jsx` da barcha asosiy sahifalarni **statik import** orqali yuklash.

## 🚫 2. React Hooks ReferenceError
* **Xatolik**: Komponent tanasida `useEffect` yoki `useRef` kabi React hooklarini ishlatish, lekin fayl boshida ularni `import { ... } from 'react'` ro'yxatiga qo'shishni unutib qoldirish. Bu runtime vaqtida ReferenceError beradi.
* **Yechim**: Har qanday React hookini ishlatishdan oldin import qilinganini tekshirish. Komponentlar yuklanishini Vitest orqali local render qilib sinab ko'rish.

## 🚫 3. Defensive Destructuring (Xavfsiz Parametrlash)
* **Xatolik**: Props obyekti tarkibidagi o'zgaruvchilarni (masalan, `verifiedCompanies`, `applications`) to'g'ridan-to'g'ri massiv sifatida ishlatib tekshirish (`verifiedCompanies.includes(...)`). Agar prop kelmay qolsa, undefined xatosi tufayli butun ilova qulaydi.
* **Yechim**: Har doim destructuring paytida yoki ishlatishda massivlarga default qiymat berib ketish (`verifiedCompanies = []` yoki `(verifiedCompanies || []).includes(...)`).

## 🚫 4. MapLibre GL JS NaN va API Koordinatalari Xatosi (MapLibre Coordinates Crash)
* **Xatolik**: OSRM/Valhalla yoki Nominatim qidiruv API dan kelayotgan koordinatalar (lat/lng) string ko'rinishida yoki `NaN` bo'lganida MapLibre `Marker` yoki `fitBounds` funksiyalariga to'g'ridan-to'g'ri berilishi. Bu MapLibre GL JS proyeksiyalash tizimida uncaught exception berib, butun React render zanjirini va ilovani qulatadi (`ChunkErrorBoundary`).
* **Yechim**: Koordinatalarni ishlatishdan oldin har doim `Number()` orqali coercing qilish va `!isNaN(Number(lng)) && !isNaN(Number(lat))` yordamida koordinatalarni to'liq tekshirish. MapLibre bilan ishlovchi har qanday funksiyani (masalan `fitBounds`) `try/catch` bloklari ichiga olish.

## 🚫 5. Undefined JSX Event Handlers (ReferenceError)
* **Xatolik**: JSX shablonlari ichida turli tugmalar yoki interaktiv elementlarga hodisa boshqaruvchilar (masalan, `handleShareRoute`, `onStartVoice`) bog'lash, biroq ularni komponentning local scopeda e'lon qilish yoki import qilishni unutish. Bu ilova ishga tushganda yoki hodisa sodir bo'lganda ReferenceError xatosi bilan ilovani qulatadi.
* **Yechim**: JSX ichida ishlatilgan har bir funksiyaning mavjudligini qat'iy tekshirish. O'zgarishlardan so'ng har doim `npx eslint "src/**/*.js" "src/**/*.jsx" --quiet` buyrug'ini ishga tushirib, no-undef xatolarini tekshirib olish.

## 🚫 6. Vitest Testlaridagi Mock Komponentlar va React Hooks Qoidasi
* **Xatolik**: Vitest testlarida `vi.mock('react-map-gl/maplibre', ...)` ko'rinishidagi mock komponentlarni kichik harfdagi arrow funksiyalar bilan e'lon qilish: `default: ({ children }) => { React.useEffect(...) }`. Bu React Hook (rules-of-hooks) qoidalarini buzadi va ESLint xatoligini keltirib chiqaradi.
* **Yechim**: Agar mock komponent tarkibida React hooklari (`useEffect`, `useState` va boshqalar) ishlatilsa, komponent funksiyasini har doim katta harf bilan boshlanadigan deklaratsiya ko'rinishida yozish shart: `default: function MockReactMap({ children }) { ... }`.

## 🚫 7. MapLibre GL JS fitBounds Padding va Qatlam Xavfsizligi (MapLibre Viewport & Layers Safety)
* **Xatolik**: MapLibre `fitBounds` funksiyasida qattiq belgilangan (hardcoded) padding qiymatlarining xarita konteyneri oʻlchamidan katta boʻlib ketishi tufayli yuz beradigan va React renderini qulatadigan boʻlinish xatoligi. Shuningdek, mavjud boʻlmagan qatlam yoki manbalarni tahrirlashda yuzaga keladigan xatolar.
* **Yechim**: Padding qiymatlarini har doim xarita konteynerining joriy eni va boʻyiga nisbatan tekshiruvchi dinamik helperdan foydalanish (masalan, padding oʻlchamlari jami boʻyi/enining 40% idan oshmasligi kerak). Xaritaga source yoki layer qoʻshish, yangilash yoki oʻchirish kodlarini har doim `try/catch` bloklari ichiga olish shart.

## 🚫 8. Raqamli Da'vo Yolg'onchiligi (Numeric Claims Falsification)
* **Xatolik**: Rejada "500+ model yaratish" deyilgan, lekin haqiqatda faqat 60 ta model yozildi va "500+ model tayyor" deb da'vo qilindi. 3 ta brend (Daihatsu, Infiniti, Acura) butunlay kiritilmadi — 0 model. Skript orqali tekshirish o'tkazilmadi, shuning uchun kamchilik aniqlanmadi.
* **Yechim**: Har qanday raqamli da'vo (masalan "X ta element tayyor") faqat `node scripts/validate_vehicle_db.mjs` yoki `node -e "..."` skripti bilan haqiqiy son tasdiqlangandan keyin qilinishi mumkin. Agar haqiqiy son rejadagidan 20%+ kam bo'lsa — commit TAQIQLANADI va kamchilik to'ldirilishi kerak.

## 🚫 9. Placeholder Rasm Suiiste'moli (Fake Photo Fallback Abuse)
* **Xatolik**: 60 ta modeldan 31 tasiga (`/images/presets/nissan_skyline.jpg`) bitta sedan rasmi ishlatildi — shu jumladan Honda NSX, Toyota Supra, Mazda RX-7, Subaru WRX kabi butunlay boshqa modellar uchun ham. Foydalanuvchi RX-7 tanlasa Skyline rasmi ko'radi.
* **Yechim**: Har bir model uchun mos rasm bo'lishi yoki SVG procedural rendering ishlatilishi kerak. Boshqa modelning haqiqiy rasmini "qarz" olish TAQIQLANADI. Agar real rasm yo'q bo'lsa — `type + bodyStyle + make` asosida gradient card yoki SVG silhouette generatsiya qilinadi.

## 🚫 10. String-Safe DOM Querying va Scroll-Snap Qulflanishi (`scrollIntoView`)
* **Xatolik**: DOM elementlarida raqamli yoki matnli ID lar taqqoslanganda string konversiyasi bo'lmasa `querySelector` `null` qaytaradi va avto-skroll ishlamaydi. Shuningdek, Safari/WebKit brauzerlarida CSS `scroll-snap-type` tufayli `scrollTo` buyrug'i element qutblanishiga urilib skrollni to'xtatadi.
* **Yechim**: `data-veh-id` va selektorlarda har doim `String(id)` ni qo'llash hamda skrollni majburiy va silliq markazlashtirish uchun `targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })` dan foydalanish.

## 🚫 11. Simmetrik Bo'lmagan Elementli Header-larda Matematik Markazlashtirish (`Absolute 50%`)
* **Xatolik**: Sarlavha panelida chap va o'ng tarafdagi elementlar eni turlicha bo'lganda, o'rtadagi elementga `flex: 1` berilsa, u ekran va notch/Dynamic Island o'rtasidan og'ib qoladi.
* **Yechim**: Ekran o'rtasida 100% matematik aniqlikda joylashtirish uchun o'rta elementga absolute positioning ishlatish: `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);`.

## 🚫 12. Dinamik Ko'p Tilli Brauzer Kalka Yozuvlari (`title` Atributlari)
* **Xatolik**: HTML `title="..."` atributiga matnni bir tilda qattiq yozish tufayli yapon tilidagi profilda sichqoncha olib borilganda boshqa dagi yozuv chiqishi.
* **Yechim**: Barcha `title="..."` atributlari `i18n.language` yordamida har doim tanlangan tilga mos dinamik matn ko'rsatishi shart.

## 🚫 13. AI Voice Assistant & React Hook Temporal Dead Zone (Initialization Order)
* **Xatolik**: AI Ovozli Yordamchi (`VoiceAssistant.jsx`) va boshqa murakkab komponentlarda `useRef` yoki `useState` (masalan, `statusRef`, `apiKeyRef`) hooklarini ularga murojaat etuvchi event handlerlar yoki `useEffect` lardan pastroq qatorda e'lon qilish. Bu brauzerda `ReferenceError: Cannot access 'apiKeyRef' before initialization` xatoligini berib, ErrorBoundary orqali ilovani qulatadi.
* **Yechim**: Komponent tanasidagi BARCHA `useRef` va `useState` e'lonlarini har doim har qanday yordamchi funksiya, event handler yoki `useEffect` hooklaridan YUQORIDA (komponent tanasining eng boshida) e'lon qilish.

## 🚫 14. Ixcham Bento Action Cardlar va 1-Qatordagi Subtag Joylashuvi (Single-Row Compact Subtag Layout)
* **Xatolik**: Bento aksiyalar va navigatsiya kartalarida subtag pill belgilari `flexWrap: 'wrap'` bilan 2-qatorga tushib qolishi hamda me'yordan ortiqcha ichki bo'shliq (`padding: 12px 14px` va o'ng tarafdagi `paddingRight: 65px`) tufayli vizual kattalashib ketishi.
* **Yechim**: Aksiyalar hamda navigatsiya kartalarida subtaglarni har doim 1 ta yolg'iz gorizontal qatorda joylashtirish (`flexWrap: 'nowrap'`, `whiteSpace: 'nowrap'`, `overflowX: 'auto'`), badge shriftlarini ixchamlashtirish (`8.5px`–`9px`) va kartaning ichki bo'shliqlarini ixcham o'lchamga keltirish (`padding: 10px 12px`).

## 🚫 15. Tezkor Kodlashda Nolinchi Buzilish Kafolati (Zero-Breakage Rapid Regression Safety)
* **Xatolik**: Yangi imkoniyat yoki UI tugmasini tez yozish jarayonida ilovaning boshqa mavjud sahifalaridagi (masalan, JDM Navigation, Driver Feed, Resume Builder) kodlarni yoki importlarni tasodifan buzib qo'yish.
* **Yechim**: Har safar kodga tezkor o'zgartirish kiritilgandan so'ng, commit qilishdan oldin `npm test && node scripts/validate_vehicle_db.mjs` va `node scripts/health_check.mjs` buyruqlarini avtomatik ishga tushirish. 15 ta test faylining barchasi 100% o'tgandagina commit qilishga ruxsat etiladi.

## 🚫 16. E'lon Harakat Tugmalarini Pin Qilmaslik va Eng O'ng Tarafda Qo'ng'iroq Tugmasi (Un-Pinned Action Block & Far-Right Call Button)
* **Xatolik**: 
  1. E'lon batafsil sahifalarida (`JobDetail`, `DrivingAcademy`) harakat tugmalarini ekranning pastki qismiga pin qilib (`position: sticky; bottom: 0`) Bottom Nav bilan biriktirib qo'yish.
  2. Qo'ng'iroq qilish tugmasi (`[ 📞 電話する ]`) birinchi yoki o'rtada kelishi.
* **Yechim**: 
  1. Harakat tugmalari blokiga `position: relative; margin-top: 24px; margin-bottom: 24px;` berib, e'lon matnining eng oxirida (oddiy hujjat oqimida) joylashtirish.
  2. Qo'ng'iroq qilish tugmasini (`[ 📞 電話する ]`) har doim eng o'ng tarafda (oxirida) joylashtirish: `[ 応募する ]` -> `[ 紹介 (報酬あり) ]` -> `[ 📞 電話する ]`.

## 🚫 17. Yagona Global Glassmorphism Tokenlar va Shaffoflik Integratsiyasi (Unified Global Glassmorphic Tokens)
* **Xatolik**: Turli komponentlar yoki modallarda glassmorphic fonlar uchun hardcoded `background` yoki `backdrop-filter` qiymatlarini har xil qilib yozish tufayli sahifalar o'rtasida shaffoflik va xiralashuv farq qilishi.
* **Yechim**: Barcha glassmorphic elementlar (Header, BottomNav, Bento Cards, Detail Modals) uchun har doim global `.glass` klassi yoki `:root` dagi `--glass-bg`, `--glass-border` va `backdrop-filter: blur(24px) saturate(180%)` tokenlaridan foydalanish:
  - **Light Mode**: `rgba(255, 255, 255, 0.45)` bg, `rgba(255, 255, 255, 0.8)` border.

## 🚫 18. Bir Chiziqli Vertikal Tarmoq va Batafsil Sahifalar Standarti (Single Vertical Line Grid & Detail View Invariants)
* **Xatolik**: 
  1. Avtomaktablar va Ish e'lonlari batafsil sahifasida harakat kartasi (`.school-sticky-actions` / `.sticky-action`) devorlarga tegib ketishi, ichma-ich skroll tufayli matnlar `BottomNav` ostida pin bo'lib qolishi yoki top offset 64px noto'g'ri qo'llanishi.
* **Yechim**: 
  1. DOM Nesting qoidasi: `#root` darajasidagi detail (`JobDetail`) uchun `top: 64px; z-index: 200`, `<main>` ichidagi detail (`DrivingAcademy`) uchun `top: 0; z-index: 200`. Tepadagi `MICHI` header (`z-index: 300`) va pastdagi `BottomNav` (`z-index: 1000`) doim 100% ochiq va ko'rinib turishi shart.
  2. Bir Chiziqli Grid: Barcha kartalar va Harakat bento idishlari chap va o'ng devordan **qat'iy 14px masofada** (`width: calc(100% - 28px)`), `border-radius: 24px` bilan shakllanadi.
  3. Qat'iy Matematik Clearance Tenglamasi: `(0px detail padding + 96px container clearance) - 84px (BottomNav top edge) = 12px visual gap`.
  4. Yagona Skroll Idishi: Ichki `.school-detail-scroll` dan `overflow-y: auto` olib tashlanib, faqat tashqi detail idishi skroll bo'ladi.

## 🚫 20. Ranglar Va Glassmorphic Chegaralar Daxlsizligi Standarti (Global Visual & Color Token Integrity Standard)
* **Xatolik**: 
  1. Komponentlarni tahrirlashda global `:root` rang o'zgaruvchilarini (`var(--primary)`, `var(--success)`, `var(--glass-bg)`, `var(--glass-border)`) chetlab o'tib, ad-hoc hardcoded hex ranglar (`#34C759`, `#000`) ishlatilishi.
  2. Glassmorphic burchaklar (`border-radius: 24px`), shisha devor xiralashtiruvlari (`backdrop-filter: blur(24px)`) yoki nozik soyalarni (`var(--shadow-sm)`) tasodifan o'chirib yuborish tufayli ilovaning premium ko'rinishiga ziyon yetkazilishi.
* **Yechim**: 
  1. **Ranglar Integratsiyasi**: Barcha ranglar har doim `:root` da e'lon qilingan CSS tokenlar orqali chaqirilishi shart (`var(--primary)`, `var(--success)`, `var(--text-main)`, `var(--bg-color)`). Hardcoded ranglar ishlatish TAQIQLANADI.
  2. **Chegaralar va Burchaklar Uniformasi**:
     - `BottomNav` paneli va barcha Harakat bento kartalari: `border-radius: 24px; border: 1px solid var(--glass-border);`.
     - Kontent bento kartalari (`.detail-section`, `.shoukai-section`): `border-radius: 20px; border: 1px solid var(--glass-border);`.
## 🚫 21. Tizim UI Lokalizatsiyasi va Xom Foydalanuvchi Ma'lumotlari Daxlsizligi (Zero Hardcoded Fallbacks & Raw User Content Preservation Invariant)
* **Xatolik**: 
  1. JSX komponentlarda `t('key', "O'zbekcha matn")` ko'rinishida ikkinchi argument sifatida qattiq tildagi matn berilishi hamda shu kalit `ja.js` lug'atida bo'lmagani sababli, Yaponcha profil tanlanganda ham sahifada o'zbekcha yozuvlar chiqib qolishi.
  2. Foydalanuvchi yoki kompaniya kiritgan original matnli ma'lumotlarni ilova tomonidan o'zgartirib yoki majburiy tarjima qilib ko'rsatish.
* **Yechim**: 
  1. **Nol Qattiq Fallback (Zero Hardcoded Fallbacks)**: Component JSX fayllarida `t('key')` chaqiruvlarida ikkinchi argument sifatida qattiq tildagi fallback matnlar berilishi TAQIQLANADI. Barcha kalitlar majburiy ravishda 5 ta lug'at faylida (`ja.js`, `en.js`, `uz.js`, `ru.js`, `zh.js`) to'liq e'lon qilinishi shart.
  2. **Xom Ma'lumotlar Daxlsizligi (Raw User Content Preservation)**: Foydalanuvchi yoki kompaniya kiritgan original kontent (vakansiya sarlavhasi, ism-sharif, izohlar va b.q.) ilova tomonidan aslo o'zgartirilmaydi yoki avto-tarjima qilinmaydi — foydalanuvchi kiritganicha 100% asl holicha ko'rsatiladi.
  3. **Seans Boshida (Opening Protocol)**: Har safar ishni boshlashda `node scripts/health_check.mjs` buyrug'i orqali Git, Vitest testlar, DB va 5-til i18n simmetriyasi avtomatik tekshiriladi.
  4. **Seans Oxirida (Closing Protocol)**: Yangi kod va tugmalar qo'shilgandan so'ng `node scripts/validate_i18n.mjs` yordamida barcha 5 ta til kalitlari to'liqligi va xatosizligi tasdiqlangach commit qilinadi.

## 🚫 22. Ichki Elementlar Tufayli Tashqi Sahifa Skrollining Avto-O'zgarishi Taqiqlanishi (No Unintended Outer Page Scroll Invariant)
* **Xatolik**: 
  1. Karta ichidagi ichki sub-tablar yoki elementlar (masalan, `My Car` avtomobil tanlov tablari) yuklanganda `targetEl.scrollIntoView()` buyrug'ini chaqirish. Bu brauzerni butun sahifani (`.profile-container`) pastga skroll qilib, sahifa boshini yashirib qo'yishiga olib keladi.
* **Yechim**: 
  1. Komponentlar yuklanganda (`mount`) ichki elementlarda har qanday `.scrollIntoView()` chaqiruvlari QAT'IYAN TAQIQLANADI.
  2. Ichki gorizontal satrlarni skroll qilish uchun faqat nisbiy konteyner skrollidan foydalaniladi: `container.scrollTo({ left: targetOffset, behavior: 'smooth' })`.
  3. Har bir asosiy sahifa (Profil, Avtomaktab, E'lonlar) tab o'zgarganda va ochilganda doim `scrollTop = 0` holatida — ya'ni eng yuqori sarlavhadan ochilishi shart.

## 🚫 23. Sub-Sahifalar va Asosiy Profil Layout Invariantlari (Sub-Page & Main Profile Clearance Invariant)
* **Xatolik**: 
  1. Sub-sahifalarda (`about`, `settings`, `notifications` va b.q.) orqaga qaytish tugmasi va sarlavhaning alohida qatorda turishi tufayli 28px+ ortiqcha bo'shliq hosil bo'lishi.
  2. Idishda `sub-page-view` sinfi yoki Log Out tugmasidan so'ng `72px` spatseri tushib qolishi tufayli eng pastki kartalar va Log Out tugmasi `BottomNav` ostida to'silib qolishi.
* **Yechim (Piksel-Simmetrik Standart)**: 
  1. **Yagona Satrli Sarlavha (`Single-Row Header`)**: Orqaga qaytish tugmasi va sarlavha bitta gorizontal flex-row tarkibida joylashtiriladi (`display: flex; align-items: center; justify-content: space-between;`). Sarlavha matni `flex: 1`, `text-align: center`, hamda tugma kengligiga mos `margin-right` orqali 100% matematik markazlashtiriladi.
  2. **Majburiy Sub-Page Idish va Spatser**: Barcha sub-sahifalar idishi `<div className="profile-container sub-page-view fade-in">` sinfi bilan e'lon qilinadi va oxirida (shu jumladan asosiy profil Log Out `<button className="logout-btn">` tugmasidan so'ng) majburiy `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />` spatseri qo'yiladi. Skroll eng pastga tushganda visual masofa **aynan 14px (kartalar gap'i bilan 100% teng va 100% ochiq)** bo'ladi.

## 🚫 24. Lug'at Kalitlari Sofligi va O'rnatilgan Nuqtalar Taqiqlanishi (Dictionary Label Cleanliness & No Embedded Colon Invariant)
* **Xatolik**: 
  1. Lug'at fayllarida (`ja.js`, `en.js`, `uz.js`, `ru.js`, `zh.js`) maydon sarlavhalari (`*Label`, `*Title`) matniga ikkinchi nuqta (`:` yoki `：`) biriktirib qo'yilishi (masalan `"birthDateLabel": "生年月日："`).
  2. JSX shablonida `{t('birthDateLabel')}:` chaqirilganda ekranda mantiqsiz va xunuk ikki nuqta `生年月日：:` (double colon bug) hosil bo'lishi.
* **Yechim**: 
  1. Barcha lug'at fayllarida matnlar toza holda saqlanadi: `"birthDateLabel": "生年月日"`, `"birthPlaceLabel": "出生地"`.
  2. Nuqtalar yoki punktuatsiyalar faqat JSX shablonining o'zida bir marta izchil shaklda beriladi: `{t('birthDateLabel')}:`.


## 🚫 26. Townwork Standardidagi Yapon Ish Qidiruv Filtr Interfeysi Invarianti (Japanese Recruitment Location Filter Drawer Invariant)
* **Qoida**: 
  1. E'lonlar bo'limi (`DriverFeed.jsx`) filtr darchasi Yaponiya mehnat bozorining Townwork standartidagi 3 tabli sariq/brend sarlavhaga ega bo'ladi:
     - **Tab 1 (`駅・路線`)**: Poyezd liniyalari va bekatlar akkordeon ko'rinishida kvadrat belgilash shakllari (`[ ]`) bilan tanlanadi. Liniya tanlansa barcha bekatlar avtomatik belgilanadi.
     - **Tab 2 (`市区町村`)**: Prefektura shahar va tumanlari akkordeoni. Major shaharlar (masalan `仙台市`, `東京23区`, `横浜市`, `大阪市`) kengaytirilganda tumanlar (`青葉区`, `港区`, `淀川区`) tanlanadi.
     - **Tab 3 (`現在地`)**: Foydalanuvchi joriy GPS o'rnidan 1km dan 20km gacha radius (piyoda 徒歩 va avto 車 vaqtlari bilan) radio tugmalar orqali tanlanadi.
  2. Darcha pastki qismida muallaq fiksatsiyalangan paneda chapda `クリア (Tozalash)` tugmasi, o'ngda esa dinamik vakansiyalar sonini ko'rsatuvchi kapsula tugma (`{filteredJobs.length}件 検索`) joylashadi.

## 🚫 27. Qat'iy Yagona Til va Qavssiz Sof Ko'p Tillilik Standarti (Strict Single-Language Rendering & Zero Mixed Parentheses Invariant)
* **Qoida**: 
  1. **Qat'iy Sof Yagona Til**: Ilovaning istalgan joyida (sarlavhalar, tablar, akkordeonlar, chiplar, maosh shartlari, radio tugmalar) qaysi til (`ja`, `uz`, `en`, `ru`, `zh`, `vi`, `ne`) tanlangan bo'lsa, FAQAT va FAQAT O'SHA TILDAGI matn ko'rsatiladi. Boshqa tillardagi ma'lumotlar qavs ichida aralashtirib berilishi (`外国人歓迎 (Chet elliklar ochiq)`) QAT'IYAN TAQIQLANADI.
  2. **Nol Qattiq Parametr Fallback va 8 Tilli Sinxronlashtirish**: `t('key')` chaqiruvlarida ikkinchi argument sifatida biron tildagi qattiq matn berish QAT'IYAN TAQIQLANADI. Har bir yangi sarlavha kaliti bir vaqtning o'zida barcha **8 ta til lug'atlariga** (`ja.js`, `uz.js`, `en.js`, `ru.js`, `zh.js`, `vi.js`, `ne.js`) sinxron kiritilishi shart.
  3. **Kompaniya va Foydalanuvchi Kiritgan Xom Ma'lumotlar Daxlsizligi**: Kompaniyalar yoki nomzodlar tomonidan kiritilgan original ma'lumotlar (vakansiya sarlavhasi, ish tavsifi, ism-sharif va b.q.) foydalanuvchi kiritganicha 100% asl holida saqlanadi va ko'rsatiladi. Ularga ilova tomonidan sun'iy ravishda aralash qavslar qo'shilmaydi.

## 🚫 28. Mobil Formatda Custom Picker Modallaridan Foydalanish Standarti (Custom Mobile Pickers over Native Select Invariant)
* **Qoida**:
  1. **Nol Raw Select Popups**: Mobil interfeyslar va telefon simulyatorlarida uzun ro'yxatli dropdownlar uchun brauzerning xom `<select>` elementlaridan foydalanish QAT'IYAN TAQIQLANADI, chunki uning native popuplari telefon bezelidan tashqariga chiqib ketadi.
  2. **Custom Mobile Bottom Sheets**: Uzun tanlovlar uchun doim telefon ekrani ichida (`position: absolute; inset: 0; z-index: 13000;`) chegaralangan va scroll bo'ladigan custom Glassmorphism Bottom Sheet modallari (`isPrefPickerOpen`) ishlatilishi shart.

## 🚫 29. Yaponiya Transport va Logistika Bozorining 21 ta Subkategoriyasi Qamrovi Standarti (Exclusive Japanese Logistics & Driver 21 Specializations Invariant)
* **Qoida**:
  1. **Logistika Ixtisoslashuvi**: Ilova qidiruv va vakansiyalar bo'limi 100% faqat **🚚 Yetkazib Berish va Haydovchilik (`delivery_driver`)** sohasiga yo'naltiriladi. Boshqa aloqasiz kategoriyalar (ofis, restoran, savdo) filtr bazasidan toza holatda chetlatiladi.
  2. **21 ta Aniq Subkategoriya Qamrovi**: Yaponiyadagi har qanday kuryerlik, pochta, benzovoz, avtovoz, dengiz konteyneri, evakuator, daiko, qor tozalash va maxsus transport avtomobillari haydovchilik yo'nalishlarini qamrab oluvchi **21 ta subkategoriya** (`delivery_local`, `delivery_keivan`, `route_delivery`, `driver_truck`, `long_haul_truck`, `unic_crane_truck`, `refrigerated_truck`, `container_trailer`, `tanker_hazmat_driver`, `tow_carrier_driver`, `concrete_mixer_driver`, `heavy_equipment_driver`, `tech_forklift`, `japan_post_bike`, `newspaper_delivery`, `bike_delivery`, `driver_taxi`, `daiko_kaiso_driver`, `driver_bus`, `shuttle_care_driver`, `moving`) strictly barcha ko'p tilli lug'at atributlari bilan qo'llab-quvvatlanadi.

## 🚫 30. E'lon Yaratish va Qidiruv Filtrlarining Simmetrik Biriktiruv Standarti (Symmetrical Employer Posting & Search Filter Alignment Invariant)
* **Qoida**:
  1. **1-ga-1 Simmetrik Sxema**: Kompaniya e'lon yaratish shaklidagi barcha maydonlar (`subcategory` [21 ta tur], `license`, `prefecture`, `detailAddress`, `nearestStation`, `walkTime`, `foreigners`, `housing`, `insurance`, `shoukaiFee`) nomzodlar qidiruv filtridagi mezonlar bilan 100% bir xil kalitlar va turlar orqali bog'lanishi shart.
  2. **`normalizeJobPosting()` Utilitasi O'tkazuvchanligi**: Har qanday yangi yaratilgan yoki tahrirlangan e'lon obyekt holatiga saqlanishidan oldin `normalizeJobPosting()` funksiyasidan o'tkazilib, barcha filtr atributlari (shu jumladan GPS koordinatalari `lat`/`lng` hamda bekat minutlari) to'liq shakllantirilishi shart.

## 🚫 31. useTranslation Hookida i18n va currentLang O'zgaruvchilarining Xavfsiz Ajratilish Standarti (i18n Destructuring & currentLang Scope Safety Invariant)
* **Qoida**:
  1. **Majburiy `i18n` Ajratish**: Komponent ichida tanlangan til (`i18n.language`) ishlatiladigan barcha joylarda `useTranslation()` hookidan `i18n` obyekti strictly ajratib olinishi shart: `const { t, i18n } = useTranslation();`.
  2. **Komponent Darajasidagi `currentLang` Xavfsizlik O'zgaruvchisi**: Komponent tanasi tepasida, hookdan so'ng darhol `const currentLang = i18n?.language || 'uz';` xavfsizlik o'zgaruvchisi e'lon qilinishi va JSX interpolatsiyalarida to'g'ridan-to'g'ri `currentLang` dan foydalanilishi shart.

## 🚫 32. 入社祝い金あり (Sign-on Hiring Bonus) Alohida Boshqaruv va Oltin Nishon Standarti (Dedicated Sign-on Hiring Bonus Integration Invariant)
* **Qoida**:
  1. **Alohida Filtr Xususiyati (`signon_bonus`)**: `JOB_FEATURES.special` bazasida `signon_bonus` id'li alohida `入社祝い金あり` filtri strictly barcha 8 ta tillarda sinxron kiritilishi va saqlanishi shart.
  2. **Vakansiya Kartasidagi Oltin Nishon (`chip-gold`)**: Agar e'londa `job.hasShoukai === true` yoki `job.shoukaiFee > 0` bo'lsa, vakansiya kartasi chip paneda oltin rangli yaltiroq nishon ko'rinishida `🎁 入社祝い金 ¥XX,XXX` (`signonBonusBadgeLabel`) avtomatik render qilinishi majburiy hisoblanadi.
  3. **Mantiqiy Filtrlash Utilitasi**: `DriverFeed.jsx` dagi filtr saralash mantiqida `benefit === 'signon_bonus'` tanlanganda `job.hasShoukai` va `job.shoukaiFee` ko'rsatkichlari strictly baholanishi shart.

## 🚫 33. 入社祝い金 (Sign-on Hiring Bonus) Aniq Raqamli Summa Tanlovi va Valyuta Formatlash Standarti (Exact Numeric Sign-on Bonus Amount Selection & Currency Formatting Invariant)
* **Qoida**:
  1. **Preset Summa Tugmalari va Raqamli Input**: E'lon yaratish shaklida `hasShoukai === 'yes'` bo'lganda tezkor **`¥30,000`**, **`¥50,000`**, **`¥100,000`**, **`¥200,000`** preset chip tugmalari hamda aniq raqamli `shoukaiFee` inputi bir vaqtda taqdim etilishi shart.
  2. **Kartochkalarda Aniq Valyuta Formatlanishi**: Barcha e'lon kartalari va modallarda kirish puli strictly `Number(job.shoukaiFee).toLocaleString()` orqali probel/vergul bilan formatlanib `🎁 {t('signonBonusBadgeLabel')} ¥50,000` shaklida aks ettirilishi majburiy hisoblanadi.

## 🚫 34. Maxsus Xususiyatlar Filtrlarining Ikki Tomonlama Simmetrik Baholanish Standarti (Symmetric Feature Filter Evaluation Invariant)
* **Qoida**:
  1. **Nol Ishlov Berilmagan Shart Fallbacki**: `JOB_FEATURES.special.options` ro'yxatiga qo'shilgan har bir xususiyat (`signon_bonus`, `foreigner_welcome`, `no_experience`, `daily_pay` va h.k.) `DriverFeed.jsx` dagi `matchFeatures` VA `matchBenefits` funksiyalarida strictly alohida `if` tarmog'i orqali baholanishi shart.
  2. **Bosh Tarmon Sukutiy Fallback Taqiqlanishi**: Filtr baholash funksiyalarining oxiridagi sukutiy `return true;` javobiga tayanib qolish QAT'IYAN TAQIQLANADI. Har bir `JOB_FEATURES` identifikatori uchun aniq atributiv shart bo'lishi va soxta e'lonlar filtrlarda 100% elanishi majburiydir.

## 🚫 35. Mobil Bounded Custom Inline Dropdown va Solid Fon Standarti (Mobile Bounded Inline Dropdown & Opaque Background Invariant)
* **Qoida**:
  1. **Eni va Balandligi Chegaralangan (Bounded Width & Height)**: Har qanday custom dropdown menyusi kiritish inputining eni bilan 100% bir xil (`width: 100%`) bo'lishi va balandligi strictly **atigi 4 ta yoki 5 ta variantga (`max-height: 210px`)** tenglashtirilgan holda o'zi ichida vertikal scroll bo'lishi (`overflow-y: auto`, `WebkitOverflowScrolling: 'touch'`) shart.
  2. **100% Solid Opacity (Shaffofmas Fon)**: Dropdown menyu orqasidagi matnlar va form elementlari ko'rinib qolmasligi uchun menyu foni strictly 100% ziddiyatli solid pigment (`background: var(--dropdown-solid-bg, #ffffff)`) va chuqur ko'tarilish soyasi (`box-shadow: 0 16px 40px rgba(0,0,0,0.25)`) bilan ta'minlanishi majburiy hisoblanadi.
  3. **1-Bo'sh Variant va Initial Empty State (`value: ''`)**: Forma darchalari bo'sh (`''`) holatda ochilishi hamda menyu ichida 1-variant strictly bo'sh placeholder (`{ id: '', name: placeholder }`) bo'lishi va tanlanmaganida qizil inline xatolik ko'rsatilishi shart.
  4. **Placeholder Neytralligi va Bog'liq Darcha Prompti**: Dropdown menyusidagi `id === ''` bo'lgan bo'sh placeholder elementiga birorta ham yashil fon va yashil checkmark (`✓`) berilishi TAQIQLANADI. Ota darcha tanlanmagan bo'lsa, bola darcha strictly `-- 都道府県を先に選択してください --` ni aks ettirishi shart.

## 🚫 36. Erta Qaytarish Ko'rinishida Komponent Render Mantig'i Xavfsizligi (Early Return Component Mounting Safety Invariant)
* **Qoida**:
  1. **DOM Mount Tree Yaxlitligi**: React komponentlarida early return (`if (condition) return (...)`) mavjud bo'lsa, ushbu ko'rinish ichida ishlatiladigan barcha modal darchalar, dropdownlar va pickerlar strictly o'sha `return (...)` blokining o'zi ichida render qilinishi majburiy hisoblanadi.

## 🚫 37. Yaponiyaning 47 Ta Prefekturasi va Dual-API Pochta Indeksi Standarti (Full 47 Japanese Prefectures & Dual-API Postal Lookup Invariant)
* **Qoida**:
  1. **47 Ta Prefektura Yaxlitligi (`ALL_47_PREFECTURES`)**: Ilovadagi har qanday joylashuv darchasi va filtrlash menyusi strictly Yaponiyaning barcha 47 ta prefekturasini (`ALL_47_PREFECTURES` / `JAPAN_REGIONS` master ma'lumotlari) o'z ichiga olishi shart.
  2. **Dual-API va Offline Hududiy Indeks (`lookupJapaneseZipcode`)**: Yapon pochta indeksidan manzilni aniqlash strictly bir vaqtda 2 ta API (Zipcloud va Zipaddress) hamda offline hududiy indeksi bor `lookupJapaneseZipcode` moduli orqali bajarilishi shart.
  3. **Moslashuvchan Dropdown Auto-Match Mantig'i**: Custom select va dropdown darchalari state dagi qiymatni (ID, Nom, Kanji, lowercase) moslashtiruvchi universal rejimda (`opt.id`, `opt.name`, `opt.kanji`, `vClean`) solishtirishi va darchada vizual ravishda zudlik bilan avto-tanlovni aks ettirishi shart.
  4. **Sof Yaponcha Kanji Formatlash (Pure KANJI Only)**: Yaponcha manzil va prefektura darchalari va nishonlarida matn strictly faqat toza iyeroglifda (`千葉県`, `松戸市常盤平`) ko'rsatilishi shart. Har qanday `(Chiba)` kabi inglizcha qavsli yozuvlar chiqarilishi taqiqlanadi.
  5. **Nol Qattiq Misol Matnlari (Zero Hardcoded Placeholders Invariant)**: Kiritish inputlarida qattiq qat'iy matnlar (hardcoded strings) berilishi TAQIQLANADI. Barcha misol matnlari strictly `placeholder={t('keyPlaceholder', 'Fallback')}` orqali 7 ta til lug'atlarida (`ja`, `uz`, `en`, `ru`, `zh`, `vi`, `ne`) dinamik aks ettirilishi majburiydir.
  6. **Barcha Majburiy Maydonlar Qizil Yulduzchasi (*)**: Barcha majburiy darchalar (`雇用形態`, `賞与`, `職種`, `郵便番号`, `都道府県`, `詳細住所` va h.k.) sarlavhasida strictly qizil `<span style={{ color: '#FF3B30' }}>*</span>` yulduzcha o'rnatilishi va tanlanmaganda inline error ko'rsatilishi majburiydir.
  7. **Prefekturaga Biriktirilgan Dinamik Shaharlar (`getCitiesByPrefecture`)**: `詳細住所 *` darchasi strictly `都道府県 *` da tanlangan prefekturaga biriktirilgan shahar va tumanlarni (`市`, `区`, `町`, `村`) toza Kanji shaklida ko'rsatuvchi va `allowCustom={true}` bilan moslashuvchan text kiritish imkonini beruvchi dynamic dropdown bo'lishi majburiydir. Barcha 47 prefektura va 500+ shaharlar `scripts/verify_all_47_cities.mjs` avtomatik skripti hamda `node scripts/health_check.mjs` (8-bo'lim) orqali doimiy audit qilinishi shart.
  8. **4 Bosqichli Professional Yapon Manzil Tizimi (4-Tier Address Hierarchy)**: Yaponiyada manzil formasi strictly 4 alohida iyerarxik bosqichda kiritilishi majburiydir: 1) `都道府県 *`, 2) `市区町村 *`, 3) `町名・丁目 *`, 4) `建物名・部屋番号`.

## 🚫 36. CustomInlineDropdown Variant Tanlash Oynasi Yagona Dizayn Invarianti
* **Xatolik**: 
  1. `CustomInlineDropdown` menyusida `overflowY: auto` va `borderRadius: 16px` bitta div da bo'lsa brauzer pastki burchaklarni tekis qirqadi.
  2. Menyu ota-konteyner ichida `position: absolute` bo'lsa, pastdagi qo'shni kartochkalar (Stacking Context bo'yicha) menyuni yopib qo'yadi yoki `overflow: hidden` qirqib tashlaydi.
* **Qoida (MAJBURIY)**:
  1. Darcha menyusi strictly **React Portal (`createPortal(..., document.body)`)** orqali `document.body` darajasida (`zIndex: 999999`) render qilinishi SHART.
  2. Menyu ota-kartochkalar va barcha qo'shni bloklardan 100% mutloq YUQORIDA turishi va ularning Stacking Context iyerarxiyasidan O'TIB KETISHI shart.
  3. `dropUp` va dinamik pozitsiya o'lchoqlari `useLayoutEffect` hamda `getBoundingClientRect()` yordamida hisoblanishi SHART.
  4. Forma kartochkalarida `overflow: visible !important;` xossasiga ega `.squircle-form-card` ishlatilishi majburiydir.
  6. **Portal Event Preservation Invarianti**: `handleClickOutside` da ham `containerRef.current` (trigger) ham `menuRef.current` (portal menyu) bir vaqtda tekshirilishi va `rawVal` fallback resolution (`opt.id` / `opt.value` / `opt.name`) bajarilishi SHART.
  7. **12px Konteynerlar-Arasi Masofa Invarianti**: Forma kartochkalari (`BLOCK 1`, `BLOCK 2`, `BLOCK 3`, `BLOCK 4`), submit tugmasi (`+ 求人を掲載する`) orasida strictly **aynan 12px** bo'lishi SHART (`marginBottom: '12px'`, `paddingBottom: '14px'`).
  8. To'liq dizayn token'lari va qoidalar: `.agents/skills/dropdown-consistency/SKILL.md`.

## 🚫 37. Safe i18n Translation Keys & Complete Job Edit Form State Persistence Invariant
* **Xatolik**: 
  1. Safari / WebKit brauzerida `i18n.t(key)` chaqiruviga `undefined` yoki `null` qiymati tushganda `i18next` ichida `nsSeparator` tekshiruvi orqali `TypeError: undefined is not an object (evaluating 'key.includes')` xatoligi kelib chiqishi va ErrorBoundary ilovani to'xtatishi.
  2. Vakansiya saqlanganda yoki tahrirlash tugmasi (`求人を編集`) bosilganda ba'zi manzil va forma atributlari (`townAddress`, `buildingAddress`, `trainLine`, `subcategory`) saqlanmay yoki `newJob` state ichida o'zlashtirilmay qolishi.
* **Yechim (MAJBURIY)**:
  1. **i18n Safe Key Wrapper**: `src/i18n.js` da `i18n.t` funksiyasiga global xavfsizlik o'rami kiritiladi — agar `key` string bo'lmasa, `undefined` bo'lsa yoki `null` bo'lsa, `t()` hech zaman xato bermaydi va xavfsiz fallback matn qaytaradi.
  2. **Forma State Yaxlitligi**: E'lon yaratish (`handleAddJob`) va tahrirlashga olish (`jobToEdit` useEffect) jarayonida barcha 4 bosqichli manzil maydonlari (`postalCode`, `prefecture`, `detailAddress`, `townAddress`, `buildingAddress`) hamda barcha ixtisoslashuv va bekat maydonlari (`trainLine`, `subcategory`, `nearestStation`, `walkTime`) 100% to'liq saqlanishi hamda state'ga tiklanishi shart.

## 🚫 38. Zero Hardcoded i18n Fallback Arguments & 7-Locale Key Parity Invariant
* **Xatolik**: 
  1. JSX shablonlarida `t('jobsCountResult', '{{count}} ta vakansiya')` ko'rinishida ikkinchi argument sifatida qattiq o'zbekcha matn berilishi hamda shu kalit `ja.js` lug'atida bo'lmagani sababli, Yaponcha profil tanlanganda ham sahifada Uzbekcha yozuv ("6 ta vakansiya") chiqib qolishi.
* **Yechim (MAJBURIY)**:
  1. **Nol Qattiq Fallback Argumentlar**: Component JSX fayllarida `t('key', 'Uzbek text')` ko'rinishida ikkinchi argument sifatida qattiq tildagi matn berilishi QAT'IYAN TAQIQLANADI.
  2. **7-Til Simmetriyasi**: Barcha kalitlar strictly barcha 7 ta til lug'atlarida (`ja.js`, `en.js`, `uz.js`, `ru.js`, `zh.js`, `vi.js`, `ne.js`) sinxron e'lon qilinishi shart (masalan `jobsCountResult`: `6件の求人`, `6 jobs found`, `6 ta vakansiya`, `6 вакансий`, `6 个职位`, `6 việc làm`, `6 वटा नोकरीहरू`).

## 🚫 39. Sort & Results Bar Compact Visual Spacing Invariant
* **Xatolik**: 
  1. `.feed-header`, `.sort-results-bar` va `.jobs-list` elementlarining to'plangan padding va margin masofalari chiziq ostida 44px ortiqcha va xunuk bo'shliq hosil qilishi.
* **Yechim (MAJBURIY)**:


## 🚫 40. Profile Sub-Page Bottom Dock Clearance & Spacer Override
* **Xatolik**:
  1. `.profile-container.sub-page-view` sinfida `padding-bottom: 12px !important;` ishlatilganligi sababli, 96px umumiy pastki clearance masofasi buzilib, sub-pagelar (masalan `my_ads`, `settings`, `notifications`, `applications`) va ularning pastidagi tugmalar (Chiqish, Saqlash) suzuvchi `BottomNav` paneli ostida qolib ketgan.
* **Yechim (MAJBURIY)**:
  1. `.profile-container.sub-page-view` pastki bo'shlig'i `padding-bottom: 24px !important;` qilib o'rnatiladi.
  2. `Profile.jsx` ichidagi har bir sub-page (`notifications`, `settings`, `about`, `my_ads`, `personalInfo`, `applications`, `saved_items`, `my_shoukai`, `employees`, `main`) taqida yagona `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />` ajratuvchi bo'shliq qo'yilishi shart. Bu `BottomNav` ustida har doim **aniq 12px vizual oraliq (gap)** bo'lishini kafolatlaydi (`(72px + 24px) - 84px = 12px`).

## 🚫 42. Pastki Menyu Ortida E'lonlar Qotib Qolishini Oldini Olish Va To'liq Ekran Skroll Standarti (Live Under-Glass Backdrop Blur Scroll Invariant)
* **Xatolik**: 
  Sub-sahifalar va profil konteyneriga (`.profile-container`, `.profile-container.sub-page-view`) pastki menyudan bo'sh joy qoldirish uchun `bottom: 90px !important` kabi sun'iy pastki chegara o'rnatilishi. Bu konteyner balandligini sun'iy ravishda pastki menyu ustida qirqib qo'yadi hamda pastki menyuning shaffof shisha foni (`backdrop-filter: blur(24px)`) ortida kartochkalar scroll bo'lmay, harakatsiz/qotgan rasm kabi ko'rinib qolishiga olib keladi.
  2. **Ichki Skroll Masofasi (`padding-bottom: 96px`)**: Pastki menyugacha bo'lgan masofa konteyner ichida `padding-bottom: 96px` orqali beriladi. Bu kontent skroll bo'lganda `BottomNav` shaffof oynasi ortidan jonli va silliq o'tishini, hamda skroll eng oxiriga yetganda eng so'nggi kartochka `BottomNav` menyusidan exact **12px toza va qotgan masofada (`96px - 84px = 12px`)** to'xtashini kafolatlaydi.

## 🚫 44. Floating Dock Double-Spacer Anti-Pattern
* **Xatolik**: Floating Search CTA tugmasi (`bottom: 96px`, `height: 52px` -> Top Edge = `148px`) uchun scroll container `padding-bottom: 160px` qilib to'g'ri o'rnatilgandan so'ng, qo'shimcha va takroriy ravishda `<div style={{ height: '64px' }} />` spacer div qo'shilishi. Bu clearance masofasini `224px` ga oshirib yuborib, scroll oxirida 76px li keraksiz ulkan bo'shliq hosil qilgan.
* **Yechim**:
  - Floating dock o'lchamlariga tayanib yagona va aniq `padding-bottom: 160px` (`148px + 12px = 160px`) parametri ishlatilishi shart.
  - Aniq hisoblangan padding ustiga takroriy inline spacer divlar qo'shish qat'iyan taqiqlanadi. Shunda akordeonlar yopiq yoki ochiq bo'lishidan qat'i nazar scroll oxirida tugma ustida doim 100% exact 12px visual gap saqlanadi.

## 🚫 45. Header Container Overlap & Unpinned Header Controls
* **Xatolik**: Headerdagi title matni yoki action tugmalari (masalan, `リセット`) ortga qaytish tugmasi bilan birgalikda sticky qilib qo'yilishi yoki o'ng/chap chetlardagi konteynerlar ustma-ust (overlap) tushib, sarlavha matnini ekran markazidan siljitib yuborishi. Shuningdek status tugmalarida oddiy emojilardan foydalanish.
* **Yechim**: Header bo'limlarida har doim FAQAT va FAQAT ⬅️ Ortga Qaytish Tugmasi (`40x40px`, `border-radius: 50%`) `sticky` (pinned) qilinadi. Sarlavha containeri esa `minHeight: 40px`, `alignItems: 'center'`, `justifyContent: 'center'` bilan to'liq markazlashtiriladi hamda `margin-bottom: -40px` offseti orqali yagona horizontal baseline hosil qilinadi. Status tugmalarida emojilar o'rniga Lucide vector ikonkalari ishlatiladi.

## 🚫 46. Form Submit Button & Floating BottomNav Compact Clearance Invariant
* **Xatolik**: Forma yoki e'lon yaratish sahifalarida (`CompanyHome.jsx` -> `showAddForm`, `showJobTypeSelect`, `showAdTypeSelect`) eng pastdagi "E'lon joylash" (`+ 求人を掲載する`) va submit tugmalari ostida 84px–124px li ortiqcha spacer qo'yilishi va flex container `gap: 16px` qo'shilib, pastki menyu (`BottomNav`) o'rtasida 44px–60px keraksiz va xunuk ochiq bo'shliq (blank void) hosil qilishi.
* **Yechim (MAJBURIY)**:
  1. `flexDirection: 'column'` va `gap: 16px` ga ega shakl konteynerlarida trailing clearance spacer balandligi strictly **`12px`** (yoki minimal `12px`–`16px`) qilib o'rnatilishi shart.
  2. Natijada `12px` spacer + `16px` flex gap = **28px** pastki clearance hosil bo'ladi va eng pastki e'lon joylash submit tugmasi suzuvchi `BottomNav` paneli (`height: 72px`, `bottom: 12px`, Top Edge = `84px`) bilan absolyut va zich, hech qanday keraksiz ochiq bo'shliqlarsiz mukammal va parallel tutashib turishi majburiydir.

## 🚫 47. Profile Main View Logout Button BottomNav Clearance Invariant
* **Xatolik**: Profil asosiy ko'rinishida (`Profile.jsx`) eng pastki `ログアウト` (Chiqish) tugmasi ostidagi trailing spacer `80px` qilib o'rnatilishi tufayli, `BottomNav` paneli (`height: 72px`, `bottom: 12px`, Top Edge = `84px`) tugmani 4px ga bosib/ustma-ust tushib qolishi hamda ortida qotib qolishi.
* **Yechim (MAJBURIY)**:
  1. `Profile.jsx` asosiy ko'rinishi oxiridagi `logout-btn` ostidagi ajratuvchi spacer balandligi strictly **`100px`** (`<div style={{ height: '100px', minHeight: '100px', width: '100%', flexShrink: 0, clear: 'both' }} />`) qilib o'rnatilishi shart.
  2. Natijada `100px - 84px = 16px` exact visual breathing gap hosil bo'ladi va `ログアウト` tugmasi `BottomNav` ustida hech qanday ustma-ust tushmasdan, bemalol va silliq joylashishi kafolatlanadi.

## 🚫 48. Floating Search CTA Dock Clearance & 12px Gap Invariant
* **Xatolik**: Avtomaktab va ish e'lonlari filtr darchalarida (`DrivingAcademy.jsx` -> `isFilterOpen`, `DriverFeed.jsx` -> `isFilterDrawerOpen`) suzuvchi qidiruv tugmasi (`bottom: 96px`, `height: 52px` -> Top Edge = `148px`) mavjud bo'lganida, trailing clearance spacer yetarsiz (80px–120px) qilib qo'yilishi va outer padding bottom `40px` qilinishi. Bu kontentning eng oxirgi akordeon/konteynerini suzuvchi qidiruv tugmasining ostida 28px ga to'sib qolishiga, skroll to'xtab qolishiga va 12px masofa tugma ostida ko'rinmay ketishiga olib keladi.
* **Yechim (MAJBURIY)**:
  1. Suzuvchi qidiruv tugmasi top edge = `148px` bo'lganda, skroll clearance height strictly **`160px`** (`148px + 12px = 160px`) qilib belgilanishi shart (`<div style={{ height: '160px', minHeight: '160px', width: '100%', flexShrink: 0, clear: 'both' }} />`).
  2. Outer `feed-container` dagi `paddingBottom: '40px'` olib tashlanib, `paddingBottom: '0px'` ga o'tkazilishi shart.
  3. Bu filtrlar ro'yxatini suzuvchi qidiruv tugmasi ostidan 100% to'liq va silliq skroll bo'lib o'tishini hamda eng oxirgi konteyner suzuvchi tugma ustida **anig'i bilan roppa-rosa 12px vizual masofada (`160px - 148px = 12px`)** to'xtashini kafolatlaydi.

## 🚫 49. Complete Initial State Reset & Accordion Collapse Invariant
* **Xatolik**:
  1. Filtr reset tugmasi (`resetFilters` / `リセット`) bosilganda faqatgina qiymat o'zgaruvchilarini (`selectedPrefecture`, `selectedCourses`, h.k.) nollab, foydalanuvchi ochgan akordeon bo'limlarini (`isCourseSectionOpen`, `isLocationSectionOpen`, h.k.) ochilganicha qoldirish. Bu sahifaning dastlabki toza holatiga qaytmasligiga va forma chalkash bo'lib qolishiga olib keladi.
  2. Faol filtr chipchalari satrida (`active-filter-chips-row`) e'lon qilinmagan o'zgaruvchilarga (`selectedCourse` singular, `onlyShoukai`) murojaat qilish. Bu filtr tanlanganda JavaScript `ReferenceError` xatosini berib ilovani qotirib qo'yadi.
* **Yechim (MAJBURIY)**:
  1. **100% Dastlabki Holatga Qaytish (Full Initial State Restore)**: `resetFilters` tugmasi bosilganda tanlangan barcha filtr qiymatlari tozallanishi Bilan birga, ochilgan barcha akordeon bo'limlari strictly yig'ilib yopilishi (`setIsSectionOpen(false)`), faol tab dastlabki tabga (`activeFilterTab = 'course'`) va sahifalash `10` ga o'tkazilishi SHART.
  2. **Safe Multi-Select Chip Arrays**: Active chip darchalarida barqaror va e'lon qilingan massiv holatlaridan (`selectedCourses.map`, `selectedStyles.map`, `selectedFeatures.map`) foydalanilishi hamda e'lon qilinmagan yagona o'zgaruvchilarga murojaat QAT'IYAN TAQIQLANADI.

## 🚫 50. Job Feed Trailing Clearance Spacer & 92px Dock Clearance Invariant
* **Xatolik**: Ish e'lonlari sahifasida (`DriverFeed.jsx` -> `.jobs-list`) yoki `特定技能` (Tokutei Ginou) segmentida trailing dock clearance spacer qo'yilmasdan faqat `.feed-container` da `padding-bottom: 88px` berilishi. Bu oxirgi e'lon kartochkasi yoki `もっと見る` (Load More) tugmasining suzuvchi `BottomNav` (Top Edge = `84px`) paneliga yopishib qolishiga va yetarsiz bo'shliq tufayli scroll trap hosil bo'lishiga olib keladi.
* **Yechim (MAJBURIY)**:
  1. `.feed-container` dagi `padding-bottom` strictly **`0px`** qilib o'rnatilishi shart.
  2. `.jobs-list` konteyneridan so'ng strictly yagona va aniq `<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />` trailing clearance spacer qo'yilishi SHART.
  3. Bu kelajakda `特定技能`, `正社員`, `アルバイト` e'lonlari ro'yxati qancha ko'payishidan va `もっと見る` bosilishidan qat'i nazar, eng oxirgi e'lon kartochkasi pastki menyu ustida me'yorda va ixcham **8px visual gap (`92px - 84px = 8px`)** masofada to'xtashini kafolatlaydi.

## 🚫 51. Profile Sub-Pages 96px Dock Clearance & No 80px Overlap Invariant
* **Xatolik**: Profil sub-sahifalarida (`Profile.jsx` -> `applications` (`受信した応募`), `notifications`, `settings`, `personalInfo`, `saved_items`, `my_shoukai`, `employees`) trailing clearance height `80px` qilib qo'yilishi. `BottomNav` paneli top edge `84px` (balandlik: `72px`, bottom: `12px`) bo'lgani sababli, `80px - 84px = -4px` hisobi bo'yicha pastki menyu eng oxirgi ariza/bildirishnoma konteynerining pastki chegarasini 4px ga bosib/ustiga tushib qolishi hamda 0px vizual bo'shliq tufayli scroll trap hosil qilishi.
* **Yechim (MAJBURIY)**:
  1. Barcha profil sub-sahifalari oxirida strictly `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` trailing clearance spacer ishlatilishi SHART (`80px` ishlatish qat'iyan TAQIQLANADI).
  2. Bu kelajakda `受信した応募` arizalari, bildirishnomalar yoki saqlangan e'lonlar soni nechtaga ko'payishidan qat'i nazar, eng oxirgi kartochka konteyneri suzuvchi `BottomNav` ustida **anig'i bilan roppa-rosa 12px visual gap (`96px - 84px = 12px`)** masofada toza va ajralib to'xtashini kafolatlaydi.

## 🚫 52. Profile Double-Click Reset & Multi-Frame Scroll Restoration Invariant
* **Xatolik**: `BottomNav` paneli orqali `My Page` (Profil) tugmasini 2 va undan ko'p marta bosganda yoki sub-sahifalardan (`notifications`, `settings`, `personalInfo`, `applications`, `saved_items`, `my_shoukai`, `employees`) turib `My Page` bosilganda:
  1. Sub-sahifada bo'lganda `mainContainerRef` unmount qilingani uchun `useEffect([activePage])` ilgari saqlangan `savedMainScroll` (masalan 500px) ni qayta tiklab, `scrollToTopTrigger` buyrug'ini ustidan bosib ketishi.
  2. Scroll reset jarayoni faqat bitta 40ms taymer bilan amalga oshirilib, CSS transformatsiyalari va re-render vaqtida smooth scroll inertsiyada to'xtab qolishi.
  3. `BottomNav.jsx` dagi drag tolerance cheklovi (`dragDistance.current > 4px`) tufayli barmoq tebranishi (double-tap jitter) ikkinchi `click` hodisasini bekor qilib yuborishi.
* **Yechim (MAJBURIY)**:
  1. Sub-sahifalarga kirishda `handleOpenSubPage` orqali `container.scrollTop` xotirada `savedMainScroll` o'zgaruvchisiga saqlanadi.
  2. Sub-sahifadan Orqaga tugmasi orqali qaytilganda `savedMainScroll > 0` bo'lsa, DOM elementining layout balandligi to'liq tayyor bo'lishini ta'minlovchi `restoreScroll` retry ilgagi (requestAnimationFrame + 30ms x 15 takroriy layout settle tekshiruvi) orqali scroll aynan 100% bosilgan joyiga qaytarilishi SHART.
  3. BottomNav orqali `scrollToTopTrigger` oshgandagina `savedMainScroll(0)` bajarilib profil eng yuqorisiga reset qilinadi.

## 🚫 53. Navigation Origin Isolation & Sub-Page Route Preserving Invariant
* **Xatolik**: Home dashboard (`Dashboard.jsx`) kabi sahifalardan `マイ掲載一覧` (`my_ads`) yoki `受信した応募` (`applications`) kabi sub-sahifalarga o'tish tugmalari bosilganda, `setActiveTab('profile')` wrapperi `setProfileActivePage('main')` deb Profil sub-sahifasini majburiy ravishda `main` ga o'tkazib yuborishi.
* **Yechim (MAJBURIY)**:
  1. `BottomNav.jsx` faqat o'zidan amalga oshirilgan bosishlar uchun `setActiveTab(tabId, { fromBottomNav: true })` flagini uzatishi SHART.
  2. `App.jsx` dagi `setActiveTab` wrapperi faqat va faqat `options.fromBottomNav === true` bo'lgandagina `setProfileActivePage('main')` resetini bajarishi shart.
## 🚫 55. AI Assistant Action Registry & Sub-10ms Semantic Intent Router Isolation Invariant
* **Xatolik**:
  1. AI voice assistant da foydalanuvchi buyruqlarini (masalan, `求人を見る`, `ishlarni ko'rsat`, `show jobs`, `マイページ`, `musiqa qo'y`) faqat bulutdagi Gemini/LLM REST API so'rovlariga topshirish. Bu API limitlariga (429 Rate Limit), yuqori javob kutish vaqtiga (1-3s latency) va internet yo'qolganda ilova buyruqlarining to'liq ishlamay qolishiga olib keladi.
  2. Vektorli n-gram hisoblashda ko'p tilli (Yapon, O'zbek, Ingliz) namuna jumlalarni bitta umumiy o'rtacha centroidga yig'ish. Bu tillar o'rtasida feature tokenlar suyulib (dilute bo'lib), kosinus o'xshashlik balining 0.45 dan pastga tushib ketishiga olib keladi.
## 🚫 57. Screen & UI Structure Knowledge Base Context Invariant
* **Xatolik**: AI Assistant ga faqat sahifa nomini (masalan, `jobs`) bilishi va ekrandagi aniq bo'limlar, filtr chiplari, sub-sahifalar hamda tugmalar nomlarini bilmasligi. Bu AI ning foydalanuvchiga ekranda aynan nimalar ko'rinib turganini va qaysi harakatlar mavjudligini tushuntira olmasligiga olib keladi.
* **Yechim (MAJBURIY)**:
  1. **Comprehensive Screen Knowledge Base (`screenStructureIndex.js`)**: Michi App dagi barcha 7 ta asosiy sahifa (`home`, `jobs`, `academy`, `company`, `profile`, `community`, `tools`), sub-sahifalar va modallar `screenStructureIndex.js` da strukturalangan holatda indekslanishi SHART.
## 🚫 58. Deep Microscopic UI Element Schema & DOM Target Invariant
* **Xatolik**: AI Assistant ning faqat bo'limlar nomini bilishi, lekin har bir bo'lim ichidagi muayyan input maydonlari (`text_input`, `range_slider`, `modal_picker`), selektorlar va `stateProp` o'zgaruvchilarini mikroskopik darajada bilmasligi. Bu AI ning foydalanuvchiga muayyan inputga nimani yozish yoki qaysi slayderni surishni aniq ko'rsata olmasligiga olib keladi.
* **Yechim (MAJBURIY)**:
  1. **Deep Microscopic Element Indexing (`deepUISchemaIndex.js`)**: Har bir bo'lim va modal ichidagi har bir input, checkbox, slayder, teg va tugma `deepUISchemaIndex.js` da uning tipi, selektori, `stateProp` va enum opsiyalari bilan to'liq indekslanishi SHART.
  2. **Automatic Schema Enrichment**: `screenStructureIndex` har bir sahifa kontekstini shakllantirganda `deepUISchemaIndex` dan barcha mikroskopik maydonlar tafsilotlarini avtomatik biriktirib uzatishi SHART.

## 🚫 59. Logical Reasoning & Multi-Step Goal Decomposition Invariant
* **Xatolik**: Foydalanuvchi ko'p bosqichli murakkab so'rov bersa (masalan, *"Tokyoda 350,000 yen maoshli katta yuk mashinasi ishini top va ariza topshir"*), AI Assistant ning so'rovni faqat bitta bo'lakka bo me'yor qisqartirib, qolgan parametrlarni (maosh, shahar, litsenziya) tushirib qoldirishi.
* **Yechim (MAJBURIY)**:
  1. **Chain-of-Thought Goal Decomposition (`reasoningEngine.js`)**: Har qanday birikmali so me'yoriy so'rov `reasoningEngine.decomposeGoal` yordamida mantiqiy micro-harakatlar zanjiriga (`FILTER_JOBS` → `prefecture`, `minSalary`, `license`) bo'linishi hamda barcha parametrlar bilan birga ijro etilishi SHART.
  2. **Profile & Visa Compatibility Deduction**: Litsenziya yetishmasligi (masalan, faqat 普通 bo'la turib 大型 so'ralganda) yoki talaba vizasi cheklovlari `reasoningEngine.inferJobCompatibility` orqali mantiqiy aniqlanib, foydalanuvchiga to'g'ri maslahat (Avtomaktab kursiga yo'naltirish) berilishi SHART.

## 🚫 60. Master Japanese Logistics Domain Dictionary & Keigo Honorific Invariant
* **Xatolik**: AI Assistant ning yaponcha professional transport terminologiyasini (masalan, `地場配送`, `点呼`, `手積み手降ろし`, `ウイング車`, `歩合制`, `特定技能1号`) va yaponcha rasmiy muloyimlik (Keigo 敬語) shakllarini bilmasligi yoki qo'pollik bilan javob berishi.
* **Yechim (MAJBURIY)**:
  1. **Master Japanese Logistics Dictionary (`japaneseLogisticsDictionary.js`)**: Litsenziyalar, yuk mashinasi turlari, ish tartibi, vizalar va maosh terminlari 100% `japaneseLogisticsDictionary.js` da indekslanishi hamda `japaneseLanguageEngine.lookupTerm` orqali mantiqan tushunilishi SHART.
  2. **Professional Keigo Honorific Formatting (`japaneseLanguageEngine.js`)**: Yaponcha barcha AI javoblari `japaneseLanguageEngine.applyKeigoPoliteness` yordamida rasmiy muloyimlik shakliga (*"かしこまりました。求人を検索いたします。"* / *"お疲れ様です。"* ) o'tkazilishi SHART.

## 🚫 61. Sub-Card Padding Excess & Container Spacing Asymmetry Invariant
* **Xatolik**: 
  1. Profile va Resume sub-cardlarida (`.profile-subcard`) eski `padding: 18px 16px` hamda `gap: 16px` ishlatilishi tufayli bitta-ikkita elementga ega sub-cardlar (masalan `特殊技術・資格証明書`) baland va vizual bo'sh bo'lib ko'rinishi.
  2. Sub-cardlar va qo'shni konteynerlar (`マイカー (登録車両)`) o'rtasidagi pastki margin masofalarining (`marginBottom`) har xil yoki me'yordan ortiqcha (10px–14px) bo'lib, vizual uzilish va bo'shliqlar hosil qilishi.
* **Yechim (MAJBURIY)**:
  1. **Ixcham Glassmorphism Sub-Card Layout (`.profile-subcard`)**: Barcha profile va resume sub-group cardlari strictly `border-radius: 16px`, `padding: 12px 14px`, `gap: 10px`, hamda `.profile-subcard-icon-wrap` (`32x32px`), `.profile-subcard-title` (`14.5px`) o'lchamlari bilan shakllantirilishi SHART.
  2. **Aniq Qat'iy Masofa va Simmetriya**: `特殊技術・資格証明書` konteyneri va `マイカー (登録車両)` konteynerlari orasidagi va ostidagi vertical margin masofasi (`marginBottom`) strictly **`4px`** qilib o'rnatilishi hamda 100% vertikal masofa simmetriyasi ta'minlanishi SHART.

## 🚫 62. Japanese Postal Code Lookup API Mapping & Zen-kaku Normalization Invariant
* **Xatolik**: 
  1. E'lon yaratish shaklida (`CompanyHome.jsx`) poçta indeksi qidiruvi natijasini o'zlashtirishda `result.prefecture`, `result.city`, `result.town` kabi `lookupJapaneseZipcode` modulida MAVJUD BO'LMAGAN kalitlarga murojaat qilingani tufayli, auto-fill ishlamay `undefined` qiymatlar saqlanishi va forma validatsiya xatoligi berishi.
  2. Bazada topilmagan 7-xonali poçta indekslari kiritilganda forma topshirish to'silib qolishi va yapon klaviaturalaridagi to'liq enli raqamlar (`０-９`) tozalanganda o'chib ketishi.
* **Yechim (MAJBURIY)**:
  1. **API Response Mapping**: `lookupJapaneseZipcode` qaytaradigan atributlar (`prefJa`, `detailAddress`, `townAddress`) strictly `prefecture`, `detailAddress`, `townAddress` state maydonlariga 1-ga-1 o'zlashtirilishi SHART.
  2. **Silent Unknown Zipcode Acceptance**: Bazada mavjud bo'lmagan poçta indeksi kiritilganda tizim uni toza va indamay qabul qiladi (`100-0001`), validatsiya xatosi berilmaydi va foydalanuvchiga hududni ro'yxatdan o'zi tanlash maslahati ko'rsatiladi.
  3. **Live Search City Selection**: `CustomInlineDropdown` darchasi 500+ Yaponiyaning barcha shaharlari va shaharchalarini ko'rsatadi hamda live search (`🔍 Qidirish / 検索...`) orqali tezkor topish va `allowCustom={true}` orqali ixtiyoriy matn kiritish imkonini beradi.

## 🚫 63. Universal Japanese Text Audit & i18n Particle Grammar Invariant
* **Xatolik**: 
  1. Yaponcha lug'at fayllarida (`ja.js`) va boshqa tillar lug'at matnlarida yaponcha gap ichida inglizcha yuklamalar tushib qolishi (masalan `"新しい求人票 of 作成"` -> `of` inglizcha bog'lovchi xatosi).
  2. Sub-sahifalar va modallarda ishlatiladigan `t('key')` kalitlarining ba'zi joylarda `ja.js` lug'atida ta'riflanmagani sababli raw kalit yozuvlari (`bonus_1`, `jobType_outsourcing`) ekranga chiqib qolishi.
  3. `プロファイル作成` kabi texnik yaponcha so'zlar yapon mehnati interfeysida yaponcha tabiiy `プロフィール作成` o'rnida ishlatilishi.
* **Yechim (MAJBURIY)**:
  1. **100% Zero-Typo Japanese Grammar Integrity**: Yaponcha barcha sarlavhalar, tavsiflar, darcha matnlari va placeholderlar strictly yapon tili grammatikasi qoidalariga mos professional business Japanese (Keigo 敬語) va toza zarf va bog'lovchilar (`の`, `を`, `に`, `で`) bilan yozilishi SHART.
  2. **Zero Raw Translation Key Leakage**: Har qanday `.jsx` komponentdagi `t('key')` chaqiruvi majburiy ravishda `ja.js` va boshqa 7 ta tillarda to'liq shaklda e'lon qilinishi hamda Japanese fallback matni bilan ta'minlanishi SHART.

## 🚫 64. Compact Smart Filter Chip Aggregation & Sticky Reset Button Invariant
* **Xatolik**: 
  1. Qidiruv va Avtomaktab filtrlarida (`DriverFeed.jsx`, `DrivingAcademy.jsx`) foydalanuvchi bir nechta hudud (`📍 東京23区`, `📍 八王子市`, `📍 立川市`, `📍 武蔵野市` ...) tanlaganda, barcha chiplar alohida ketma-ket chiqarilishi hamda gorizontal skroll tufayli eng pastdagi `リセット` (Clear All) tugmasi ekrandan o'ngga surilib ko'rinmay qolishi.
* **Yechim (MAJBURIY)**:
  1. **Smart Location & Feature Aggregation**: 3 va undan ortiq hudud, bekat, litsenziya yoki xususiyatlar tanlanganda, chiplar avtomatik ravishda birinchi tanlov va qolganlar soni ko'rinishida ixchamlashtirilishi SHART: **`📍 東京23区 外3件 ×`** (yoki `🚉 品川駅 外2件 ×`, `🪪 大型免許 外2件 ×`). Chipdagi `×` bosilganda barcha tanlangan elementlar tozalanadi.
  2. **Pinned Sticky Reset Button (`.sticky-reset-btn`)**: Active filter bar idishida (`.active-filter-chips-container`) `リセット` tugmasi strictly `.sticky-reset-btn` klassi bilan o'ng tomonda `position: sticky; right: 0; z-index: 10;` ko'rinishida fikslanadi. Chiplar soni qancha bo'lishidan qat'i nazar, `リセット` tugmasi **DOIMO ekranning o'ng tomonida 100% ko'rinib va bosilishga tayyor turishi SHART**.

## 🚫 65. Location Drawer Parity & Target Area Banner Invariant
* **Xatolik**: 
  1. Avtomaktablar filtrida (`DrivingAcademy.jsx`) `都道府県・市区町村から探す` bo'limida shahar/tuman va bekat akordeonlarining yetishmasligi hamda oddiy va takrorlanuvchi tugma kartochkasi ishlatilishi.
* **Yechim (MAJBURIY)**:
  1. **Strict 1:1 Location & Station Parity**: `DrivingAcademy.jsx` va `DriverFeed.jsx` joylashuv va bekatlar filtristrictly 1:1 bir xil tuzilishga ega bo'lishi SHART: 501 shahar/tumanlar akordeoni (`tab-cities-wrapper`) hamda rasmiy chiziq ranglari 🟢🟡🟠🔴🩷🔵 bilan bekatlar akordeoni (`tab-stations-wrapper`).
  2. **Target Area Header Banner (`対象エリア (地域)`)**: Location drawer ichidagi prefektura ko'rsatkichi strictly gradient fon, `対象エリア (地域)` sarlavhasi, tanlangan prefektura nomi (`全ての地域 (全国)` / `東京都`) hamda o'ng tomondagi moviy `変更 ⌄` pill tugmasidan iborat banner card ko'rinishida bo'lishi SHART. Orticha va takrorlanuvchi ichki button-cardlar taqiqlanadi.
  3. **Complete Active Chips Rendering**: Active chips satrida strictly shaharlar (`📍`), bekatlar (`🚃`), kurslar (`🚗`), o'qish uslublari (`🏫`), til (`🗣️`), narx (`💰`) va qidiruv kalitlari ixcham guruhlanib chiqishi SHART.

## 🚫 66. Company Profile Sub-Card Container & Dock Clearance Invariant
* **Xatolik**: 
  1. Kompaniya ma'lumotlari (`Profile.jsx` dagi `会社情報`) ko'rsatilganda `事業種別`, `住所`, `担当者名`, `電話番号`, `法人番号`, `企業のウェブサイト`, `設立年`, `従業員数`, `会社概要` kabi maydonlarning hech qanday `profile-subcard glass squircle` idishiga o'ralmasdan, to'g'ridan-to'g'ri ochiq fon ustiga tashlanib qolishi.
  2. Sub-card bo'shliqlari yetishmagani sababli kontent pastki `BottomNav` orqasiga kirib o'qilmay qolishi.
* **Yechim (MAJBURIY)**:
  1. **Strict 2-SubCard Structure for Company Profile**: Kompaniya ma'lumotlari strictly 2 ta alohida `.profile-subcard glass squircle` idishlariga guruhlanishi SHART:
     - **Card 1 (`基本情報`)**: Ism, Email, `事業種別` (badge-blue bilan), `担当者名`, `電話番号`.
     - **Card 2 (`企業詳細・登録情報`)**: `<Building2 size={18} />` ikonkali sarlavha, `住所`, `法人番号`, `企業のウェブサイト` (moviy link bilan), `設立年`, `従業員数`, `会社概要`.
  2. **96px Trailing Clearance Spacer**: Barcha subcard-lar va profillar pastida strictly `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` tozalovchi bo'shliq qo'yilishi SHART. Kontent pastki navigatsiyadan to'liq 100% balandda toza skroll bo'lishi ta'minlanadi.

## 🚫 67. Mathematical Trailing Clearance Formula Invariant (`96px - 84px = 12px Gap`)
* **Xatolik**: Sub-sahifalarda (`Profile.jsx` -> `personalInfo` / `会社情報`, `applications`, `settings`, `about` va h.k.) pastki menyugacha bo'lgan trailing clearance spacer qiymatini tasodifiy (masalan 140px, 128px, 116px, 104px, 76px, 52px) o'zgartirish orqali pastki menyu va eng oxirgi kard o'rtasida katta ochiq bo'shliq (blank void) yoki ustma-ust tushish (overlay trap) hosil qilish.
* **Yechim (MAJBURIY)**:
  1. **Qat'iy Matematik Geometriya Formulasi**:
     - Suzuvchi `BottomNav` paneli balandligi: `height: 72px`, pastdan masofasi `bottom: 12px` -> **Yuqori chegara (Top Edge) = 84px**.
     - Sub-sahifalar oxiridagi trailing clearance spacer balandligi strictly **`96px`** (`<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />`) bo'lishi SHART.
  2. **Aniq 12px Vizual Oraliq (Gap)**:
     - `96px (spacer balandligi) - 84px (BottomNav top edge) = 12px exact visual clearance gap`.
     - Ushbu formula barcha sub-sahifalardagi eng oxirgi konteyner (masalan, `会社情報` dagi `企業詳細・登録情報` kardi) pastki navigatsiya tugmalarining ustida roppa-rosa va parallel ravishda **12px toza vizual oraliq** qoldirib to'xtashini 100% kafolatlaydi.

## 🚫 68. Candidate Funnel Pipeline Grid & Custom Clearance Spacer Rule
* **Xatolik**: 
  1. Ariza/Nomzod sub-sahifasida (`Profile.jsx` -> `applications` (`受信した応募`)) 5 ta bosqichli filtrlash tugmalarini bir qatorga joylashtirish tufayli tugmalarning ekrandan chiqib ketishi yoki matnlarning sig'may qolishi.
  2. Nomzod kartochkasi ichidagi vertikal paddinglar, marginlar hamda pastki clearance spacer balandligini yetarlicha tushuntirmasdan yoki matematikasi ko'rsatilmasdan o'zgartirish.
* **Yechim (MAJBURIY)**:
  1. **2-Row Responsive Grid Funnel Filters**: Nomzod/Ariza filtrlash bosqichlari strictly 2 qatorli grid (`gridTemplateColumns: 'repeat(3, 1fr)'` top row: `新規応募`, `選考・面接`, `採用決定`; bottom row: `不採用`, `全件（すべて）`) ko'rinishida ixcham joylashishi va barcha ekran o'lchamlarida 100% to'liq va o'qishga qulay ko'rinishi SHART.
  2. **Candidate Card Padding & Bottom Spacing**: Nomzod kartochkasi (`.application-card`) strictly `padding: 10px 14px; margin-bottom: 12px;` o'lchamlarda ixcham bo'lishi va tugmalar `gridTemplateColumns: '1fr 1fr'` gridida teng taqsimlanishi SHART.
  3. **Strict Math Clearance Calculations**: Clearance spacer `72px` (yoki `84px` / `96px`) o'rnatilganda suzuvchi `BottomNav` (`height: 72px`, `bottom: 12px` -> top edge `84px`) bilan bo'lgan masofaning aniq matematikasi foydalanuvchiga tushuntirilishi va saqlanishi SHART.

## 🚫 69. Universal 12px Inter-Container Gap Across All Sub-Pages Rule
* **Xatolik**: Sub-sahifalarda (`applications`, `saved_items`, `my_shoukai`, `employees`, `notifications`) ro'yxat konteynerlarida CSS flex `gap` (masalan 16px) hamda inline `marginBottom` (12px) birgalikda qo'llanishi tufayli 1-konteyner va 2-konteyner orasidagi masofa 28px gacha kattalashib, ochiq bo'sh joy hosil bo'lishi.
* **Yechim (MAJBURIY)**:
  1. **Strict 12px Inter-Container Gap**: Barcha sub-sahifalardagi 1-konteyner va 2-konteyner (va barcha ketma-ket kartochkalar) o'rtasidagi masofa strictly **`12px`** bo'lishi SHART.
  2. **No Double Spacing Overlap**: Ro'yxat o'rovchilarida CSS `gap: 12px` belgilanishi va individual kartochkalardan ziddiyatli qo'shimcha `marginBottom` va takroriy marginlar olib tashlanishi SHART.
  3. **Universal Sub-Page Consistency**: Ushbu 12px inter-card gap qoidasi loyihadagi barcha sub-sahifalarda (`受信した応募`, `保存した求人`, `紹介履歴`, `従業員管理`, `通知一覧`) 100% bir xil va standart tarzda amal qiladi.

## 🚫 70. Sub-Page Back Button, Header Title & Filter Container Spacing Invariant
* **Xatolik**: Sub-sahifalarda (`sub-page-header`) `paddingTop: '46px'` yoki yetarsiz joy o'rnatilishi sababli ortga qaytish tugmasi ($\leftarrow$, top: 16px, height: 40px -> bottom edge: 56px) sarlavha matni ustiga minib qolishi (`overlap`) va ostidagi filtrlash konteyneriga yopishib turishi.
* **Yechim (MAJBURIY)**:
  1. **Strict Non-Overlapping Back Button Gap**: Barcha sub-sahifalar sarlavhasi o'rovchisida strictly `paddingTop: '61px'` va `paddingBottom: '5px'` o me'yori qo'llanishi SHART ($56\text{px} + 5\text{px} = 61\text{px}$). Natijada ortga qaytish tugmasi va sarlavha matni o'rtasida aniq **5 px toza oraliq** hosil bo'ladi va tugma sarlavhaga mutlaqo tegmaydi.
  2. **Filter Container Top Margin**: Sub-sahifalar filtrlash trek paneli (`margin: '7px 16px 8px 16px'`) sarlavhadan pastga qo'shimcha **5 px** ochilib, toza va moslashuvchan ko'rinadi.

## 🚫 71. Job Creation International Recruitment Banner Japanese i18n Enforcement
* **Xatolik**: Yangi e'lon qo'shish formasi (`CompanyHome.jsx` -> `showAddForm` -> `新規求人を追加`) yuqorisidagi binafsharang banner `特定技能・特定活動・海外採用` sarlavhasi ostida o'zbekcha fallback matni (`Chet eldagi nomzodlarni jalb qilish...`) qolib ketganligi sababli yapon tilidagi interfeysda mantiqiy uzilish hosil bo'lishi.
* **Yechim (MAJBURIY)**:
  1. **Strict i18n Translation Binding**: Banner tavsif matni strictly `t('recruitmentInternationalDesc', '海外からの候補者採用および特定技能ビザ支援用求人票フォーム。')` orqali dinamik i18n kalitiga biriktirilishi SHART.
  2. **No Hardcoded Non-Japanese Strings in Form Banners**: Kompaniya e'lon yaratish va tahrirlash shakllaridagi barcha bannerlar hamda tushuntirish yozuvlari Strictly yaponcha rasmiy matn ko'rinishida bo me'yori bo'yicha dinamik ravishda almashishi shart.

## 🚫 72. Notifications Chronological Sorting, Categorization & Deletion Invariant
* **Xatolik**: Bildirishnomalar sahifasida (`Profile.jsx` -> `notifications` (`通知`)) bildirishnomalar tartibsiz ko'rinishi, eng yangi xabarlar tepada turmasligi, turiga qarab filtrlash yetishmasligi hamda xabarlarni bittadan va to'liq o'chirish (`Clear All`) imkoniyatining yo'qligi.
* **Yechim (MAJBURIY)**:
  1. **Strict Chronological Order (Newest at Top, Oldest at Bottom)**: Ro'yxat strictly `[...filteredNotifs].sort((a, b) => Number(b.id) - Number(a.id))` bo'yicha saralanadi. Yangi bildirishnoma doim Ro'yxatning eng yuqori qismida (boshida) turadi, eski xabarlar esa pastga qarab joylashadi.
  2. **Categorization Segmented Track Filter Bar**: Ro'yxat tepasida 4 qismli segmentli trek paneli (`すべて`, `未読`, `選考`, `報酬`) va live sanoq ko'rsatkichlari bo'lishi SHART.
  3. **Single & Bulk Deletion**: Har bir xabarda bittadan o'chirish tugmasi (`Trash2`, `onDeleteNotif`) va sarlavhada barcha bildirishnomalarni tozalash (`すべて消去`, `onClearAllNotifs`) tugmasi bo'lishi SHART.

## 🚫 73. Company Profile B2B Phone Call Action Button Invariant
* **Xatolik**: Kompaniya profilida (`userRole === 'company'`) turib `マイ掲載一覧` (`CompanyHome.jsx`) sahifasida boshqa logistika kompaniyasining e me'lonlari ko'rilganda haydovchilarga mo'ljallangan yashil yoki boshqa rangli `応募する` tugmasi ko'rinishi.
* **Yechim (MAJBURIY)**:
  1. **Role-Aware B2B Action Button**: Boshqa kompaniyalar e'lonlarida (`!isMine`) foydalanuvchi roli kompaniya bo'lganda (`userRole === 'company'`) strictly **`[ 📞 電話する ]`** (Direct B2B Call) tugmasi ko'rinishi SHART.
  2. **Dark Slate Grey Palette (#505759)**: Tugma rangi yashil bo'lmasligi, va foydalanuvchi taqdim etgan namunadagi kabi strictly to'q slanes-kulrang (`background: '#505759'`, `color: '#ffffff'`) bo'lishi SHART.
  3. **Strict Button Dimension Geometry Preservation**: Tugma o'lchamlari, balandligi, chekka burchaklari va `flex: 1` taqsimoti Strictly asl original ko'rinishida saqlanadi (`className="job-card-btn btn-apply"`). Geometriya va o me'yoriy o'lchamlarga zarracha ham ziyon yetkazilmaydi.
  4. **Driver Role Unchanged**: Haydovchilar uchun (`userRole === 'driver'`) `[ 応募する ]` tugmasi daxlsiz saqlanadi.

## 🚫 74. Filter Drawer Full-Row Clickable Checkbox Touch Target Invariant
* **Xatolik**: Filtr darchasida (`DriverFeed.jsx`, `DrivingAcademy.jsx`) shahar (`東京23区`), bekat va toifalarni tanlashda `onClick` hodisasining faqat kichik 20px to'rtburchak (`townwork-square-checkbox`) ustiga qo'yilganligi. Eski va kichik ekranli mobil qurilmalarda foydalanuvchilar to'rtburchakni aniq bosa olmay qiynalishi.
* **Yechim (MAJBURIY)**:
  1. **Full-Row Click Target**: Bosish (`onClick`) hodisasining to'g'ridan-to'g'ri o'rovchi `<label className="townwork-checkbox-label">` va `<div className="townwork-sub-checkbox-item">` elementlariga o'tkazilishi SHART.
  2. **Entire Text & Label Hit Area**: Yozuv matni (`<span>`) yoki uning atrofidagi butun qator bosilganda ham katakcha zudlik bilan belgilanadi (`checked`).
  3. **Pointer-Events & StopPropagation**: `.townwork-square-checkbox` ichida `pointer-events: none` qo'llanilib, akordeon pastga ochilish ko'rsatgichi (`ChevronUp`/`ChevronDown`) esa `e.stopPropagation()` bilan alohida ishlaydi.

## 🚫 75. Auth Security Controller & Progressive Exponential Lockout Invariant
* **Xatolik**: Autentifikatsiya modulida (`RoleSelect.jsx`) cheksiz noto'g'ri parol kiritish imkoniyati ochiq bo'lishi hamda sekin parollarni sinash hujumlariga (Slow Brute-Force / Credential Stuffing) qarshi avtomatlashtirilgan himoyaning yo'qligi.
* **Yechim (MAJBURIY)**:
  1. **Progressive Exponential Lockout**: Noto'g'ri kirish urinishlari soni `authSecurityService.js` orqali nazorat qilinadi: 5 marta xatoda 15 min -> 2-darajada 60 min -> 3-darajada 24 soat -> 4-darajada Strictly Email Challenge unlock rejimiga o'tadi.
  2. **Anti-Bot Math CAPTCHA**: 3-noto'g'ri kiritishdan boshlab avtomatik matematik interfaol CAPTCHA paydo bo'ladi.
  3. **6-Digit OTP & Password Strength**: Ro'yxatdan o'tishda 6-xonali raqamli OTP grid va 60 soniyali resend taymeri, hamda parollarni kiritishda jonli `evaluatePasswordStrength` indikatori ko'rsatiladi.

## 🚫 76. Foydalanuvchi (Haydovchi / Ish Qidiruvchi) Autentifikatsiya, 6-Digit OTP & Safe Touch-Target Standarti
* **Qoida (Foydalanuvchilar Ulanishi)**:
  1. **6-Digit OTP Box Grid & Clipboard Auto-Paste**: Haydovchilar va nomzodlar ro'yxatdan o'tishi va parolni tiklashida 6-xonali kiritish gridida oddiy raqam kiritish bilan birga, nusxalangan koddagi barcha raqamlarni bir vaqtda joylashtiruvchi `onPaste={handleOtpPaste}` moslashuvi majburiydir.
  2. **Full-Row Touch Target Filter Convenience**: Haydovchilar uchun ish va avtomaktab filtrlari katakchalarida (`DriverFeed.jsx`, `DrivingAcademy.jsx`) har qanday tugma va yozuv butun satr bo'ylab bosilishi (`townwork-checkbox-label`), kichik ekranli mobil uskunalarda foydalanuvchilar qiyinchiliksiz filtrlarni tanlay olishi ta'minlanishi shart.
  3. **Progressive Account Safeguard**: Noto'g'ri kirish urinishlaridan keyin hisob bloklanganda haydovchiga taymer va elektron pochta orqali bir zumda qayta kirish (`unlockViaEmail`) imkoniyati ko'rsatiladi.

## 🚫 77. Kompaniya (Ish Beruvchi / Avtomaktab) B2B Xavfsizlik, Phone Call & Profile Invariantlari
* **Qoida (Kompaniyalar va B2B Ulanishi)**:
  1. **Corporate Identity & Account Lockout**: Kompaniya va avtomaktablar profili 5 ta noto'g'ri urinishdan so'ng korporativ pochtasini himoyalash uchun avtomatik exponential lockout (15m -> 1h -> 24h -> Strict Email Unlock) bilan muhofaza qilinadi.
  2. **Direct B2B Phone Call Action Button**: Kompaniya profilida turib boshqa kompaniyalar e'lonlari ko'rilganda (`CompanyHome.jsx`) harakat tugmasi strictly **`[ 📞 電話する ]`** ko'rinishida va Slate Grey `#505759` fonida bo'lishi, tugma o'lcham va geometriya daxlsizligi 100% saqlanishi shart.
  3. **Strict 2-SubCard Profile Grouping**: Kompaniya profil ma'lumotlari strictly `基本情報` hamda `企業詳細・登録情報` subcard idishlariga ajratilib, 96px trailing clearance spatseri bilan pastki navigatsiyadan yuqorida turishi ta'minlanadi.

## 🚫 78. HR Filter Pills Japanese 1-Row Unbroken Capsule Invariant
* **Xatolik**: `Profile.jsx` dagi 3 ta HR filtrlash tugmalarida (`すべての従業員`, `確認済み`, `承認待ち`) yaponcha matnlarning `whiteSpace: 'nowrap'` va `flexShrink: 0` yetishmasligi tufayli mobil ekranlarda ikkinchi qatorga bo'linib ketishi (`すべての従業` \n `員`, `確認済` \n `み`).
* **Yechim (MAJBURIY)**:
  1. **Strict Single-Line Unbroken Rendering**: Har bir filtrlash pill tugmasida va uning ichki `<span>` teglarida strictly `whiteSpace: 'nowrap'`, `flexShrink: 0`, hamda `lineHeight: '1.2'` qo'llanishi SHART.
  2. **Lucide Vector Icons**: 3D OS emojilari o'rniga minimalistik Lucide vector ikonkalar (`<Users />`, `<CheckCircle2 />`, `<Clock />`) bilan har bir holat aniq ajratiladi.
  3. **Apple Glass Capsule Styling**: Active tugmalarga yengil translucent glass fill (`rgba(10, 132, 255, 0.14)`, `rgba(48, 209, 88, 0.14)`, `rgba(255, 159, 10, 0.14)`) hamda iOS 18 neon glow soya (`box-shadow: 0 2px 10px ...`) beriladi.

## 🚫 80. Active Filter Tag Label Helper Functions Invariant (DriverFeed & Feed Components)
* **Xatolik**: Ishlar va avtomaktablar lentasida (`DriverFeed.jsx`) filtr teglari (active chips) ko'rsatilishida `getDurationLabel(dur)`, `getTimeSlotLabel(ts)`, hamda `getFeatureLabel(f)` kabi funksiyalar kodi e'lon qilinmay chaqirilishi natijasida brauzerda `ReferenceError: Can't find variable: getFeatureLabel` yuzaga kelishi.
* **Yechim (MAJBURIY)**:
  1. **Exhaustive Category Search Helpers**: Har bir filtr chipi e'lon qilingan taqdirda, u foydalanadigan barcha yordamchi teg funksiyalari (`getDurationLabel`, `getTimeSlotLabel`, `getFeatureLabel`) component ichida to'liq va xavfsiz e'lon qilinishi SHART.
  2. **Multi-Language Resolution**: Har bir helper funksiya `JOB_FEATURES` bazasidagi tegishli o'zgaruvchilardan foydalanuvchining joriy tiliga (`uz`, `en`, `ja`) mos nomni qidirib topadi va zaxira (fallback) sifatida ID ning o'zini qaytaradi.
  3. **Runtime Protection**: Active chip tugmalari bosilganda filter ro'yxatidan xavfsiz o'chirilishi (`filter(item => item !== id)`) va `ReferenceError` kelib chiqmasligi Vitest va health check orqali doimiy tekshiriladi.
## 🚫 83. Zero JSON Leakage & Pure Natural Text Output Invariant
* **Xatolik**: Gemini javobida raw JSON belgilari (`{ "command": "NONE", "response": "..." }`) yoki ````json wrappers ... ```` qolib ketganda ekranda texnik JSON strukturasi ko'rinib qolishi.
* **Yechim (MAJBURIY)**:
  1. **`japaneseLanguageEngine.stripRawJsonSyntax`**: Har qanday AI javobini ekranda ko'rsatishdan oldin JSON belgilaridan tozalash.
  2. **Clean Typewriter Output**: Foydalanuvchiga faqat toza, odobli, professional insoniy matn ko'rinadi.

## 🚫 84. Real-Time Live Web Search & RSS News Grounding Invariant
* **Xatolik**: Foydalanuvchi "Kechagi eng yaxshi yangiliklar", "Bugungi ob-havo", "Yaponiya valyuta kursi" kabi jonli voqealar yoki sana bilan bog'liq savollar berganda:
  1. Gemini stasionar bilimlarga ega bo'lgani uchun va Google Search grounding yo'qligida, u real vaqt ma'lumotlarini bilmaydi va foydalanuvchining o'z savolini takrorlab qo'yadi (`かしこまりました。昨日の1番良いニュースはおねがいします`).
  2. Qidiruv tizimi (`autonomousWebSearchEngine`) `"昨日の1番良いニュースはおねがいします"` kabi natural yaponcha iborani DuckDuckGo/Wikipedia'ga aynan yuborganda 0 ta natija oladi (chunki Vikipediyada bunday maqola nomi yo'q).
* **Yechim (MAJBURIY)**:
  1. **Live Free RSS Feeds Integration**: Yangiliklar (`ニュース`, `news`, `yangiliklar`) so'ralganda **Google News RSS** (`https://news.google.com/rss?hl=ja&gl=JP`), **Yahoo Japan RSS**, va **NHK News RSS** orqali haqiqiy bugungi/kechagi TOP-5 sarlavha va yangiliklarni 100-200ms da olib kelish va Gemini kontekstiga kiritish (`webSearchContext`).
  2. **Natural Query Keyword Extraction**: Natural yapon/o'zbek iboralardan qidiruv kalit so'zlarini ajratib olish (masalan `"昨日のニュース"` -> `"日本 ニュース トップ"`).
  3. **Updated Model Names & Real-Time Context**: Model nomlarini `gemini-3.6-flash`, `gemini-flash-lite-latest` va `gemini-3.5-flash-lite` ga yangilash, hamda Gemini'ga "Agar kontekstda real yangiliklar berilgan bo'lsa, ulardan javob tuz, javob berolmasang manbalarga yo'naltir, hech qachon savolni qaytarma" deb uqtirish.

## 🚫 85. Non-Existent NPM Package Dependency Versions Invariant (`package.json`)
* **Xatolik**: `package.json` faylida NPM registridagi mavjud bo'lmagan yoki kelajakdagi versiyalarni (masalan, `@capacitor/core: ^8.4.1`, `i18next: ^26.2.0`, `vite: ^8.3.0`) ko'rsatish. Bu `npm install` vaqtida NPM registrida paketlar topilmay buzilgan TAR fayllar yuklanishiga, unpacking xatolariga va `vite` executable yo'qolib dev server ishlamay qolishiga olib keladi.
* **Yechim (MAJBURIY)**:
  1. **NPM Registry Verification**: `package.json` dagi barcha dependency va devDependency versiyalarini real vaqtda NPM registrida mavjud bo'lgan eng so'nggi barqaror versiyalar (`npm view <package> version`) bilan sinxronlashtirish.
  2. **Clean Reinstall Strategy**: Versiyalar tuzatilgandan so'ng, `rm -rf node_modules package-lock.json` bajarilib, `npm install` noldan qayta ishga tushiriladi.

## 🚫 86. Hugging Face Space Brain & Gradio API Payload Invariant
* **Xatolik**: 
  1. Hugging Face Space Gradio API ga so'rov yuborilganda `{ prompt, language }` formatida yuborilishi natijasida Gradio 4/5 422 Unprocessable Entity berishi.
  2. ZeroGPU space-larida `@spaces.GPU` va `import spaces` bo'lmaganda `Runtime error: No @spaces.GPU function detected during startup` bilan container to'xtab qolishi.
* **Yechim (MAJBURIY)**:
## 🚫 87. Modern Vector SVG Icon Standard for Active Filter Chips & Reset Buttons
## 🚫 88. Single Independent Hugging Face Service & Gradio Streaming Invariant (`huggingFaceService.js`)
* **Xatolik**: 
  1. Loyihadagi AI Ovozli va Chat komponentlarida (`VoiceAssistant.jsx`, `Michi AI Hub`) bloklovchi `client.predict` chaqiruvidan foydalanish tufayli javob to'liq tugaguncha foydalanuvchi bir necha soniya kutib qolishi.
  2. Tarqoq API chaqiruvlari yoki 8s fallback poygalarini ishlatish.
* **Yechim (MAJBURIY)**:
  1. **Yagona Daxlsiz Servis (`src/services/huggingFaceService.js`)**: Barcha AI Core chat so'rovlari faqat `huggingFaceService.js` moduli ichidagi `askMichiCore(userMessage, onChunkUpdate)` funksiyasidan o'tishi SHART.
  2. **Gradio `client.submit` Jonli Striming**: Bloklovchi `predict` o'rniga Gradio `client.submit("/stream_michi_core", { message: userMessage })` orqali matn `for await (const msg of app)` oqimi bilan darhol olinadi.
  3. **Instant First Chunk Indicator Dismissal**: Birinchi matn bo'lagi (chunk) kelishi bilanoq `setStatus('speaking')` bajarilib, `"思考中..."` (thinking...) indikatori darhol yo'qoladi va matn real vaqtda ekranda paydo bo'ladi.
  4. **45 Soniyalik Qat'iy Taymaut**: 45000ms taymaut beriladi.
## 🚫 89. Git Branch Merge Permission Invariant (Explicit User Permission Required)
* **Xatolik**: Foydalanuvchi so'ramagan taqdirda ham o'zbilarmonlik bilan ishchi tarmoqni (`start-1.0a1`) asosiy tarmoqqa (`start-1.0a`) avtomatik `git merge` qilish.
* **Yechim (MAJBURIY)**:
  1. **Nol Avto-Merge (Zero Auto-Merge)**: Foydalanuvchi o'zi aniq va oshkora "merge qil" yoki "start-1.0a ga qo'shib qo'y" deb aytmaguncha, QAT'IYAN avtomatik `git merge` bajarilmaydi.
  2. **Isbotlangan Ishchi Tarmoqda Qolish**: Barcha kodlar va o'zgarishlar strictly faqat foydalanuvchi bilan ishlanayotgan joriy tarmoqda (`start-1.0a1`) lokal saqlanadi va commit qilinadi.
  3. **Ruxsat So'rash va Kutilish**: Har qanday merge operatsiyasi uchun foydalanuvchining alohida va explicit ko'rsatmasi kutiladi.

## 🚫 90. Undefined Handler References on Component Refactoring (ReferenceError Prevention)
* **Xatolik**: Kodni refaktiv qilish yoki eski modallarni/funksiyalarni o'chirish jarayonida (masalan `showHistoryModal` va `openHistoryModal` o'chirilganda), JSX tugmalarda ularga bo'lgan `onClick={openHistoryModal}` murojaatlarini tozalashni unutib qoldirish. Natijada ushbu element render bo'lishi bilan JavaScript `ReferenceError: openHistoryModal is not defined` beradi va React `ErrorBoundary` qopqoni ishga tushib butun ilovani qulatadi.
* **Yechim**: Har safar funksiya yoki state o'chirilganda, butun loyiha bo'ylab `grep_search` orqali shu o'zgaruvchi/funksiya nomini qidirib topish va barcha JSX event handlerlarni to'liq yangilash (`onClick={() => setIsSideDrawerOpen(true)}`). Har bir o'zgarishdan so'ng `npx vite build` va runtime test o'tkazilishi majburiy.

## 🚫 91. AI Chat History State Synchronization & Persistent Local Storage Invariant
* **Xatolik**: AI javoblari qurilmada (`michiLocalStorageEngine`) saqlangani bilan React state'i (`chatHistoryList`) vaqtida yangilanmasligi yoki mount bo'lganda yuklanmasligi. Natijada chat yon paneli (`MichiSideDrawer.jsx`) ochilganda o'tgan savol-javoblar ko'rinmay yo'qolib qolishi.
* **Yechim**: `VoiceAssistant.jsx` mount bo'lganda va `isSideDrawerOpen` o'zgarganda `reloadChatHistory()` orqali tarix majburiy yuklanadi va har bir yangi javob kelganda `setChatHistoryList(prev => [...prev, newEntry])` orqali state zudlik bilan sinxronlashtiriladi.

## 🚫 92. Live Stream Typewriter Reset Prevention Invariant
* **Xatolik**: Hugging Face-dan kelayotgan jonli striming (`askMichiCore`) vaqtida matn ekranda real vaqtda yozilib bo'linganidan so'ng, `handleGeminiSuccess` chaqirilganda `setDisplayedAiText('')` bajarilib, tayper mashinkasi animationsi matnni 0-simvoldan boshlab QAYTADAN boshidan yozib chiqishi.
* **Yechim**: `VoiceAssistant.jsx` faylidagi `handleGeminiSuccess` ichida agar matn allaqachon jonli striming orqali ekranga chiqarilgan bo'lsa (`displayedAiText.length > 5`), `setDisplayedAiText('')` va tayper mashinkasi taymerini 0 dan qayta ishga tushirish taqiqlanadi — matn silliq yakunlanib taymer o'rnatiladi.

## 🚫 93. Robot Avatar Expanding Dissolving Aura Waves Invariant
* **Xatolik**: Robotcha AI faol holatdaligida tashqi halqaning urib/impuls berib turuvchi (`pulse-glow-ring`) rasm kabi ko'rinishi.
* **Yechim**: `RobotAvatar.jsx` va `RobotAvatar.css` da `wave-1` va `wave-2` (1.6s offset) ikkita bosqichli, 3.2s `cubic-bezier` ostida tashqariga kengayib va mayin erib/tarqalib ketuvchi halo nur toshqini (`aura-expand-dissolve`: `scale(0.95) -> scale(1.65)`, `opacity 0.75 -> 0`, `filter: blur(0.5px) -> blur(5px)`) o'rnatiladi.

## 🚫 94. Zero-Flash Feather-Soft Ambient Aura Undulation Invariant
* **Xatolik**: Aura animatsiyasida 0-soniyadan boshlab keskin ko'rsatish (`opacity: 0.75`), chaqnash yoki tez kengayish portlashi (`scale(1.65)`) ishlatilishi.
* **Yechim**: Har qanday chaqnash va portlashlar to'liq o'chiriladi: `gentle-aura-dissolve` animatsiyasi `opacity: 0` dan mayin boshlanib (`scale(0.98)`), 5.2s davomida juda sekin `scale(1.26)` gacha tebranib, `blur(8px)` va zero-opacity ko'rinishida orqa fonga sezilarsiz singib/yo'qolib ketadi.

## 🚫 96. Continuous Forward-Dissolving Aura Wave & Stationary Eye Blink Invariant (`RobotAvatar.css`)
* **Xatolik**: 
  1. AI robotcha ko'zlari z-o'qi bo'yicha kichiklashib/kattalashib depth-sinking ko'rinishida ichga kirib-chiqishi (foydalanuvchiga qo'rqinchli ko'rinishi).
  2. Aura to'lqinining ortiga qaytishi, pastga tushishi yoki tarqoq zarrachalar (`sur-particle`) ekranda ortiqcha vizual shovqin paydo qilishi.
## 🚫 97. Zero Hardcoded API Keys & Strictly Tracked `.gitignore` Environment Invariant
* **Xatolik**: 
  1. API kalitlarini (`VITE_GEMINI_API_KEY`) to'g'ridan-to'g'ri JSX/JS kodlar ichiga (masalan, `VoiceAssistant.jsx`) zaxira string sifatida hardcoded yozib qo'yish.
  2. `.env` faylini `.gitignore` ga qo'shmasdan git kuzatuvida qoldirish natijasida maxfiy API kalitlarning GitHub ga ochiq yuklanishi.
* **Yechim (MAJBURIY)**:
  1. **Strict `.gitignore` Exclusion**: `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.staging` hamda `*.env` fayllari strictly `.gitignore` ichida bo'lishi va `git rm --cached .env` orqali git indeksidan butunlay chiqarilishi SHART.
  2. **Safe Template Representation**: Ommaviy git ombori uchun faqat maxfiylikdan xoli `.env.example` shabloni taqdim etiladi.
  3. **Zero Hardcoded Key Strings**: Barcha JS/JSX fayllarda `import.meta.env.VITE_GEMINI_API_KEY || ''` ko'rinishida bo'sh zaxira string ishlatiladi, kodda hech qanday ochiq API kalit yozilishi mumkin emas.

## 🚫 98. Anonymous Demo Simulation Personal Data Invariant
* **Xatolik**: 
  1. `App.jsx` hamda boshqa demo ma'lumotlar funksiyalarida (masalan, `handleShoukai`) shaxsiy ism-sharif (`Farrux Alimov`), Shaxsiy email (`farrux.alimov@gmail.com`) kabi real foydalanuvchi ma'lumotlarini hardcoded yozib qo'yish.
* **Yechim (MAJBURIY)**:
  1. **Strict Personal Data Anonymization**: Barcha demo va simulyatsiya ma'lumotlarida real ism-sharif hamda shaxsiy email o'rniga anonim i18n qiymatlar (`t('simulatedFriend', 'Anonim Do\'st')`, `demo@michi-app.com`) qo'llanilishi SHART.
  2. **Zero Hardcoded Personal Identifiers**: Kod bazasida real foydalanuvchilarning ism va elektron pochta manzillari bo'lishi taqiqlanadi.













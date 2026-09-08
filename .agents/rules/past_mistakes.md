# Michi Ilovasi: Tarixiy Saboqlar va Xatolar Xotirasi (Past Mistakes Log)

Ushbu fayl loyihani tahrirlash davomida aniqlangan kritik xatoliklar va ularning oldini olish qoidalarini jamlaydi. Har safar kodga o'zgartirish kiritishdan oldin, ushbu qoidalar qayta o'qilishi shart.

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





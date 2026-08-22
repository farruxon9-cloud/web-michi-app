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



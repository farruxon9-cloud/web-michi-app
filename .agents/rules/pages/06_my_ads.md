# Page Specification Rule: My Posted Ads / Company Home (`CompanyHome.jsx` / `Profile.jsx` -> `my_ads`)

Ushbu qoida **Mening E'lonlarim (`マイ掲載一覧`)** sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;` (`bottom: 0` full-screen container).
- **Scroll & Padding**: `overflow-y: auto; padding-bottom: 96px;`

---

## 🎯 2. Sticky Header & Title
- **Sticky Back Button**: `<div className="profile-sticky-back" style={{ zIndex: 250 }}>`
- **Title Offset**: `<div className="sub-page-header" style={{ paddingTop: '56px' }}>`
- **Title Text**: `マイ掲載一覧` (Japanese locale `myAdsMenu`).

---

## ⚓ 3. Bottom Clearance & Trailing Spacer
- **Explicit Trailing Spacer**: `<div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />` (Placed inside `CompanyHome.jsx` form views).
- **Visual Gap Result**: `求人を掲載する` ("Publish Job") button halts **100% ULTRA-SNUG with minimal zero-void clearance gap** directly adjacent to the top boundary of `BottomNav` (`12px` spacer + `16px` flex gap = `28px` total clearance).

---

## 📍 4. Sticky Back Button & Unbounded Form Scroll Container Invariant
- **Unbounded Form Scroll Container**: `CompanyHome.jsx` formasida `renderForm()`, `showJobTypeSelect` va `showAdTypeSelect` ko'rinishlarida outer `.feed-container` elementiga har doim `height: auto; maxHeight: none; overflowY: visible; display: block; paddingBottom: 0px;` xossalari berilishi SHART.
- **Sticky Pinning Scope**: Ota-konteyner `height: 100%` bilan cheklanmasligi sababli `.profile-sticky-back` (`top: 16px; z-index: 300`) ortga qaytish tugmasi butun forma balandligi bo'ylab (2000px+) eng pastki tugmagacha uzliksiz PINNED bo'lib turadi.
- **Trailing Dock Clearance Spacer**: Forma oxiriga `<div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0 }} />` joylashtirilishi shart.

---

## 🔘 5. Home Dashboard `マイ掲載一覧` Button Navigation Origin Rule (Rule 53 Invariant)
- **Home Dashboard Card Click**: Home pagedagi `マイ掲載一覧` (My Posted Ads / `my_ads`) Bento kartasi bosilganda:
  1. `setProfileActivePageSource('home')` o'rnatiladi (Back button Home sahifasiga qaytarishi uchun).
  2. `setProfileActivePage('my_ads')` o'rnatiladi.
  3. `setActiveTab('profile')` chaqiriladi (WITHOUT `{ fromBottomNav: true }`).
  4. App `profileActivePage` qiymatini `main` ga almashtirmasligi va strictly `CompanyHome` (`my_ads`) sahifasini 100% toza va daxlsiz ochishi SHART.

---

## 🚫 6. Forbidden Patterns
1. **No Missing Trailing Spacer**: `CompanyHome` must always include the trailing 12px clearance spacer div to prevent iOS scroll collapsing while maintaining ultra-compact BottomNav alignment.
2. **No Height Capped Sticky Parents**: Never render sticky header back buttons inside `.feed-container` wrappers that lack `height: auto; maxHeight: none;` overrides, which clips container height to viewport and stops sticky pinning halfway down the form.
3. **No BottomNav Route Override**: Never allow `setActiveTab('profile')` calls originating from Home Dashboard cards to reset `my_ads` back to `main`.

---

## 📋 7. Tarixiy Kamchilik va Yechim (Defect History & Compact Clearance Resolution)
- **Kamchilik**: `CompanyHome.jsx` faylidagi **マイ掲載一覧** (Mening E'lonlarim) asosiy ro'yxati hamda e'lon yaratish formalarida (`showAddForm`, `showJobTypeSelect`, `showAdTypeSelect`) eng oxirgi kartochka va submit tugmalari ostida 80px–124px li ortiqcha spacer hamda `padding-bottom: 32px` qo'yilgan edi. Oqibatda eng pastki element va suzuvchi `BottomNav` navigatsiyasi o'rtasida 44px–60px keraksiz va xunuk ochiq bo'shliq (blank void) paydo bo'lgan.
- **Yechim va Qoida (MAJBURIY)**:
  1. `CompanyHome.jsx` ning barcha ko'rinishlarida (asosiy `マイ掲載一覧` ro'yxati va forma sahifalari oxirida) trailing clearance spacer strictly **`12px`** (`<div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />`) qilib o'rnatilishi SHART.
  2. Outer `feed-container` dagi `paddingBottom: '32px'` butunlay olib tashlanib, `paddingBottom: '0px'` ga o'tkazilishi SHART.
  3. Bu eng oxirgi e'lon kartochkasi va `+ 求人を掲載する` tugmasini pastki `BottomNav` paneli (`height: 72px`, `bottom: 12px`) bilan 100% parallel, absolyut zich hamda hech qanday keraksiz va xunuk ochiq bo'shliqlarsiz mukammal tutashishini kafolatlaydi.

## 📮 8. Japanese Postal Code Lookup API Mapping & Input Normalization Invariant (Rule 62 Invariant)
- **4-Tier Distinct Address Field Separation**: Manzil elementlari aralashtirib biriktirilmaydi. 4 ta alohida maydonning har biriga strictly o'ziga tegishli hududiy bo'linma biriktirilishi SHART:
  1. `都道府県 *`: FAQAT Prefektura nomi (`千葉県` / `Chiba`).
  2. `市区町村 *`: FAQAT Shahar yoki Tuman nomi (`松戸市`).

---

## 🌐 9. International Recruitment Banner i18n Enforcement (Rule 71 Invariant)
- **Japanese Banner Description**: `新規求人を追加` (Add New Job) shakli yuqorisidagi binafsharang banner matni strictly `t('recruitmentInternationalDesc', '海外からの候補者採用および特定技能ビザ支援用求人票フォーム。')` orqali yaponcha dinamik ko'rinadi.
- **Forbidden**: Shakldagi bannerlarda hardcoded o'zbekcha yoki inglizcha matnlarni qoldirish taqiqlanadi.

---

## 📞 10. B2B Phone Call Action Button Invariant (Rule 73 Invariant)
- **B2B Call Action Button Styling**: `CompanyHome.jsx` dagi boshqa kompaniyalarning e'lonlari hamda avtomaktab kurslarida `userRole === 'company'` uchun chiqariladigan **`[ 📞 電話する ]`** (B2B bevosita qo'ng'iroq) tugmasi rangi yashil bo'lmaydi, u strictly to'q slanes-kulrang (`#505759`) fon va oq matn (`#ffffff`) bilan `.job-card-btn btn-apply` o'lchamlariga 100% mos keladi.

---

## 📝 11. Xatoliklar va Learn Hujjatlashtiruvi (Page Mistakes & Learn Log)
- **Xatolik**: `マイ掲載一覧` (`CompanyHome.jsx`) sahifasida logistika kompaniyasi vakili sifatida kirilganda boshqa kompaniyalarning e'lonlarida haydovchilarga mo'ljallangan ariza topshirish (`応募する`) tugmasi yoki mos kelmaydigan yashil rangli tugma ko'rinishi.
- **Tuzatish & Learn**:
  1. Kompaniya profilida boshqa kompaniyalarning e'lonlariga ariza berilmasligi sababli tugma funktsiyasi va yozuvi **`[ 📞 電話する ]`** (B2B bevosita telefon qilish) ga almashtirildi.
  2. Tugma rangi yashil gradient o'rniga foydalanuvchi taqdim etgan namuna asosida to'q slanes-kulrang (`background: '#505759'`, `color: '#ffffff'`) qilib o'rnatildi.
  3. Tugma o'lchamlari va flex taqsimoti (`.job-card-btn btn-apply`, `flex: 1`, `padding: 8px 12px`, `border-radius: 12px`) original holatda saqlandi va hech qanday balandlik yoki layout o'zgarishi yetkazilmadi.



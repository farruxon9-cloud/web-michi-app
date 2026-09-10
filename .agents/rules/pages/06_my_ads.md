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

---

## 📮 8. Japanese Postal Code Lookup API Mapping & Input Normalization Invariant (Rule 62 Invariant)
- **Zipcode API Response Mapping**: `lookupJapaneseZipcode` qaytaradigan obyekt atributlari (`prefJa`, `detailAddress`, `townAddress`) strictly `CompanyHome.jsx` state maydonlariga (`prefecture`, `detailAddress`, `townAddress`) 1-ga-1 to'g'ri o'zlashtirilishi SHART (`result.prefecture` yoki `result.city` kabi mavjud bo'lmagan kalitlar ishlatilishi TAQIQLANADI).
- **Zen-kaku Full-width Normalization**: Yapon tili klaviaturalaridagi to'liq enli raqamlar (`０-９`) strictly ASCII raqamlariga (`0-9`) avtomatik o'tkazilishi shart: `.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0))`.
- **Smooth Hyphenation & Auto-Lookup**: Poçta indeksi 7 ta raqamga yetishi bilan (`digits.length === 7`) manzil avtomatik ravishda `100-0001` formatlanib, prefektura, shahar va tuman maydonlari avtomatik to'ldirilishi va yashil status nishoni ko'rsatilishi SHART.



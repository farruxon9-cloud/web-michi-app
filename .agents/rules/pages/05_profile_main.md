# Page Specification Rule: Profile Main Menu (`Profile.jsx` / `Profile.css`)

Ushbu qoida **Profil Asosiy Menyusi (Profile Main)** uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Container Selector**: `.profile-container`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;` (`bottom: 0` full-screen container).
- **Scroll & Padding**: `overflow-y: auto; padding-bottom: 0px !important;`
- **Trailing Dock Clearance Spacer**: `<div style={{ height: '100px', minHeight: '100px', width: '100%', flexShrink: 0, clear: 'both' }} />` right after `.logout-btn` (yielding 16px visual gap above 84px BottomNav).

---

## 👤 2. User Avatar & Status Card
- **Avatar Card Padding**: `padding: 16px; margin-bottom: 14px;`
- **Avatar Size**: `64x64px`, `border-radius: 50%`.
- **User Role Badge**: `padding: 4px 10px; border-radius: 12px; font-weight: 700;`

---

## 🗂️ 3. Menu Group Spacing & Logout Card Architecture
- **Menu Group Class**: `.menu-group`, `border-radius: 20px; margin-bottom: 14px;`
- **Menu Items Gap**: `1px` inner border divider separator.
- **Icon Box**: `36x36px`, `border-radius: 10px`, glassmorphic 3D background.
- **Logout Card Class**: `.logout-btn` (Mustaqil karta: `border-radius: 20px !important`, `background: var(--card-bg) !important`, `border: 1px solid var(--glass-border) !important`, `margin-top: 0 !important`, `width: 100%`).
- **Inter-Card Vertical Gap**: Flex container (`.profile-menu`) gap: 12px / 14px provides clean, un-accumulated vertical spacing without extra explicit margin-top on child cards.

---

## 🔄 5. Sub-Page Scroll Restoration & BottomNav Multi-Frame Reset (Rule 52 Invariant)
1. **Sub-Page Entry Scroll Recording (`handleOpenSubPage`)**:
   - Sub-sahifalarga (`personalInfo`, `applications`, `saved_items`, `my_shoukai`, `my_ads`, `employees`, `notifications`, `settings`, `about`, `resume_builder`) kirishda `handleOpenSubPage` funksiyasi profil container'ining `scrollTop` (masalan `550px`) qiymatini `savedMainScroll` o'zgaruvchisiga saqlaydi.

2. **Back Button Scroll Restoration (`Layout-Settle Retry`)**:
   - Sub-sahifadan **Orqaga (ArrowLeft)** tugmasi bosilib profil asosiy ko'rinishiga (`main`) qaytilganda:
   - Synchronous mount paytida DOM layout elementlarining vizual balandligi (`scrollHeight`) hali to'liq hisoblanmagani tufayli skrollning `0` ga clamped bo'lishining oldini olish uchun `restoreScroll` helperi ishlatiladi.
   - `requestAnimationFrame` + `30ms x 15` layout-settle retry taymerlari orqali `container.scrollTop = savedMainScroll` masofasi foydalanuvchi profilni bosgan **aynan o'sha pikselligiga (100% exact)** tiklanadi.

3. **BottomNav Explicit Reset Isolation**:
   - Faqatgina foydalanuvchi pastki menyudagi **My Page / Profile (`profile`)** tabini atayin 2-marta bosganda va `scrollToTopTrigger` oshgandagina `savedMainScroll(0)` bajarilib, profil sahifasi eng yuqoriga (`scrollTop = 0`) silliq nollanadi.
   - Multi-frame reset (`requestAnimationFrame` + `setTimeout 40ms` + `setTimeout 150ms`) orqali barcha `.profile-container` hamda `mainContainerRef.current` skrollini silliq ravishda eng yuqoriga (**`scrollTop = 0`**, **`scrollTo({ top: 0, behavior: 'smooth' })`**) reset qiladi.
   - `BottomNav.jsx` da `dragDistance.current` tebranish masofasi `12px` hamda `onClick` toleransi `25px` bo'lib, double-tap jitterlar 100% to'siqsiz yetib boradi.

---

## 🚫 6. Forbidden Patterns
1. **No Heights Clipping**: `.profile-container` height must never be clipped with `bottom: 90px !important`.
2. **No Missing Trailing Spacer**: Main profile page must always include the 100px trailing spacer after `.logout-btn`.
3. **No Merged Cards**: Never nest `.logout-btn` inside a preceding `.menu-group` container.
4. **No Double Side Margins**: Never add inline side margins to `.logout-btn` that shrink its width relative to `.menu-group`.
5. **No Single-Frame Scroll Reset**: Never rely on a single 40ms timeout for scroll reset; multi-frame fallback (`requestAnimationFrame` + dual timers) is strictly required.

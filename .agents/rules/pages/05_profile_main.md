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

## 🔄 5. BottomNav Tab Repeat Click & Multi-Frame Scroll Reset (Rule 52 & Rule 53 Invariant)
- **Repeat Click & Trigger Guard Behavior**: BottomNav pastki menyusidagi **My Page / Profile (`profile`)** tugmasi 2-marta (takroran) yoki biron sub-sahifada (`applications`, `notifications`, `settings`, `personalInfo`, `saved_items`, `my_shoukai`, `employees`) turib bosilganda:
  1. `scrollToTopTrigger` qiymati strictly oshgandagina (`scrollToTopTrigger !== prevScrollToTopRef.current`) reset bajariladi. Stale (eskirgan) trigger qiymatlari sub-sahifa o'tishlarida (`my_ads`, `applications`) resetni NOTO'G'RI qayta ishga tushirishidan saqlanadi.
  2. Foydalanuvchini profilning **asosiy sahifasiga (`main`)** qaytaradi.
  3. Barcha ochiq tahrirlash formalari va modallarni (`isEditing`, `isFormOpen`, `isVehiclePickerOpen` va h.k.) yopadi.
  4. Multi-frame reset (`requestAnimationFrame` + `setTimeout 40ms` + `setTimeout 150ms`) orqali barcha `.profile-container` hamda `mainContainerRef.current` skrollini silliq ravishda eng yuqoriga (**`scrollTop = 0`**, **`scrollTo({ top: 0, behavior: 'smooth' })`**) reset qiladi.
  5. `BottomNav.jsx` da `dragDistance.current` tebranish masofasi `12px` hamda `onClick` toleransi `25px` bo'lib, double-tap jitterlar 100% to'siqsiz yetib boradi.

---

## 🚫 6. Forbidden Patterns
1. **No Heights Clipping**: `.profile-container` height must never be clipped with `bottom: 90px !important`.
2. **No Missing Trailing Spacer**: Main profile page must always include the 100px trailing spacer after `.logout-btn`.
3. **No Merged Cards**: Never nest `.logout-btn` inside a preceding `.menu-group` container.
4. **No Double Side Margins**: Never add inline side margins to `.logout-btn` that shrink its width relative to `.menu-group`.
5. **No Single-Frame Scroll Reset**: Never rely on a single 40ms timeout for scroll reset; multi-frame fallback (`requestAnimationFrame` + dual timers) is strictly required.

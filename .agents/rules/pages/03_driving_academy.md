# Page Specification Rule: Driving Academy (`DrivingAcademy.jsx` / `DrivingAcademy.css`)

Ushbu qoida **Avtomaktablar (Driving Academy)** bo'limi uchun barcha layout va geometriya qoidalarini belgilaydi.

---

## 📐 1. Container & Layout Geometry
- **Container Selector**: `.academy-container`
- **Flex Layout**: `flex: 1; min-height: 0; display: flex; flex-direction: column;`
- **Scroll**: `overflow-y: auto; padding-bottom: 88px;` (yields compact 4px visual clearance gap above 84px BottomNav).

---

## 🎯 2. Sticky Back Button & Header Invariants
- **Sticky Header**: `position: sticky; top: 0; z-index: 200; background: var(--bg-color);`
- **Back Button**: Floating circle button `40x40px` at `top: 16px`, `left: 16px`, `border-radius: 50%`.

---

## 🧱 3. School Card Spacing
- **School Cards Gap**: `gap: 12px;`
- **License Badge Tags**: `display: flex; gap: 6px; flex-wrap: wrap;`
- **School Image Aspect Ratio**: `aspect-ratio: 16 / 9`, `border-radius: 14px`.

---

## 🔍 4. Driving Academy Filter Drawer Architecture
- **Filter Drawer Container**: Inline filter page view rendered when `isFilterOpen` is `true` (`padding: 0 14px 40px 14px; position: relative;`).
- **Single-Row Centered Header Bar Invariant**: Back button (`38x38px`), Title (`自動車学校の絞り込み`, mathematically centered `position: absolute; left: 50%; transform: translateX(-50%)`), and Reset button (`リセット`) sit in a single `44px` sticky shisha header bar (`position: sticky; top: 0; z-index: 300; background: var(--bg-color); backdrop-filter: blur(20px)`).
- **Townwork 3-Tab Header**: 3 yellow branding tabs (`コース・免許`, `都道府県・地域`, `こだわり条件`) with signature `#FFCC00` active state for rapid section jumps.
- **Rich Filter Dimensions**:
  1. **Prefectures & Locations**: 47 Prefectures selection with `CustomMobilePickerModal`.
  2. **License Categories / Offered Courses**: Multi-select chips for `Futsu`, `Oogata`, `Chugata`, `JunChugata`, `FutsuNishu`, `OogataNishu`, `Forklift`, `Tokushu`, `Nirin`.
  3. **Training Style**: Multi-select chips for `Tsugaku` (Qatnab o'qish), `Gashuku` (Yashab/Lagerda o'qish), `ShortTerm` (Tezlashtirilgan), `OnlineTheory` (Masofaviy nazariya).
  4. **Instruction Languages**: `UZ`, `JP`, `EN`, `RU`, `ZH`, `VI`.
  5. **Price Range Brackets**: `~¥250,000`, `¥250k ~ ¥300k`, `¥300k ~ ¥350k`, `¥350,000~` (Rendered in symmetrical 2-column CSS Grid `repeat(2, 1fr)` with `allPrices` spanning 2 columns, eliminating awkward whitespace).
  6. **Perks & Features**: `shuttle` (無料送迎バス), `dormitory` (宿舎・食事付き), `subsidy` (教育訓練給付金対象), `installment` (ローン・分割払いOK), `nightClass` (ナイター教習), `femaleInstructor` (女性指導員), `kidsRoom` (託児所完備), `shoukai` (紹介手当).
- **Explicit 160px Trailing Dock Clearance Spacer**: Dedicated `<div style={{ height: '160px', minHeight: '160px', width: '100%', flexShrink: 0, clear: 'both' }} />` spacer directly following Section 6 (`こだわり条件・特典`), so Section 6 floats cleanly past the fixed Search CTA button (`bottom: 96px`, `height: 52px` -> Top Edge = `148px`) and halts with an EXACT **12px clearance gap** (`160px - 148px = 12px`)!
- **Explicit 92px Main List Trailing Clearance Spacer**: Dedicated `<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />` spacer directly follows `.jobs-list` in main view (`isFilterOpen === false`), yielding exact **8px compact visual gap (`92px - 84px = 8px`)** above `BottomNav` top edge (84px).
- **100% Initial State Reset & Accordion Collapse Invariant (Rule 49)**: `resetFilters` (`リセット`) MUST clear all filter value selections AND collapse all 6 accordion sections back to default folded state (`false`), resetting activeTab to `'course'` and visibleCount to `10`.

---

## 🌐 5. Pure Single-Language Isolation & Translation Invariant
- **Single-Language Rule**: Every filter section header, license chip, study style option (`styleOptions`), feature pill (`featureOptions`), and language option (`languageOptions`) MUST render strictly in the active `i18n` locale (`ja`, `uz`, `en`, `ru`) via clean `t('key')` calls.
- **Dynamic Translation Keys**:
  - `ja`: `通学コース`, `合宿免許`, `ウズベク語 (UZ)`, `日本語 (JP)`, `英語 (EN)`, `ロシア語 (RU)`
  - `uz`: `Qatnab o'qish kursi`, `Yashab / Lagerda o'qish`, `O'zbek tili (UZ)`, `Yapon tili (JP)`, `Ingliz tili (EN)`, `Rus tili (RU)`
  - `en`: `Commuter Course`, `Residential Camp License`, `Uzbek (UZ)`, `Japanese (JP)`, `English (EN)`, `Russian (RU)`
  - `ru`: `Курс с ежедневным посещением`, `Обучение с проживанием (Лагерь)`, `Узбекский (UZ)`, `Японский (JP)`, `Английский (EN)`, `Русский (RU)`

---

## 🚫 6. Forbidden Patterns
1. **No Mixed Parenthetical Language Strings**: NEVER render hardcoded mixed parenthetical strings in filter chips (such as `通学コース (Qatnab o'qish)`, `合宿免許 (Yashab/Lagerda o'qish)`, `O'zbekcha (UZ)`). Every fallback string in `t('key', 'fallback')` MUST be pure single-language in the target language.
2. **No Missing Back Button Offset**: Back button must never collide with screen notch or title text.
3. **No Hardcoded Static Filter Lists**: Filters must dynamically filter all mock and server school items across all attributes.
4. **No Header Overlapping**: Filter header elements must never stack on separate unpinned layers.
5. **No Partial Filter Resets**: Never leave accordion sections open or active tabs un-reset when clicking `リセット`.
6. **No Undefined Variable References in Active Chips**: Never reference singular or un-declared state variables (like `selectedCourse` or `onlyShoukai`) in active filter chips.

---

## 👆 7. Full-Row Clickable Checkbox Touch Target Invariant (Rule 74 Invariant)
- **Entire Row Hit Area**: Avtomaktablar filtrida (`DrivingAcademy.jsx`) barcha shahar, tuman, bekat hamda litsenziya toifasi qatorlarida (`townwork-checkbox-label`, `townwork-sub-checkbox-item`) chertish (`onClick`) hodisasi FAQAT 20px to'rtburchakka emas, **butun yozuv va qator maydoniga** taalluqli bo'lishi SHART.
- **Mobile Touch Accessibility**: Kichik to'rtburchak elementida `pointer-events: none` bo'lib, `label` yoki o'rovchi konteyner to'liq `flex: 1` va `user-select: none` bilan bosish oson va qulay bo'lishini ta'minlaydi. Akordeonni ochish/yopish ko'rsatkichi (`ChevronUp`/`ChevronDown`) esa `e.stopPropagation()` bilan alohida ajratilgan.

---

## 📝 8. Xatoliklar va Learn Hujjatlashtiruvi (Page Mistakes & Learn Log)
- **Xatolik**: Avtomaktablar bo'limida (`DrivingAcademy.jsx`) filtr ochilganda shahar, tuman va metro staytsiyalarini tanlash uchun katakchalar (`townwork-square-checkbox`) faqat 20px kvadrat ustigagina bosganda javob bergan. Foydalanuvchilar yozuv matnini bosganda tanlov ishlamay xunuk taassurot qoldirgan.
- **Tuzatish & Learn**:
  1. `DrivingAcademy.jsx` sahifasida ham `townwork-checkbox-label` va `townwork-sub-checkbox-item` o'rovchilariga to'liq `onClick` biriktirilib, yozuv matnini va qatorni bosganda checkbox uzliksiz va zudlik bilan ishlaydigan qilindi.
  2. Akordeon ochish/yopish tugmasiga `e.stopPropagation()` berildi. Togri va xatosiz ishlash avtomatik ravishda Vitest va layout invariantlar orqali tasdiqlandi.


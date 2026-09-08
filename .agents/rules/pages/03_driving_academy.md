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
  5. **Price Range Brackets**: `~¥250,000`, `¥250k ~ ¥300k`, `¥300k ~ ¥350k`, `¥350,000~`.
  6. **Perks & Features**: `shuttle` (無料送迎バス), `dormitory` (宿舎・食事付き), `subsidy` (教育訓練給付金対象), `installment` (ローン・分割払いOK), `nightClass` (ナイター教習), `femaleInstructor` (女性指導員), `kidsRoom` (託児所完備), `shoukai` (紹介手当).
- **Explicit 120px Trailing Dock Clearance Spacer**: Dedicated `<div style={{ height: '120px', minHeight: '120px', width: '100%', flexShrink: 0, clear: 'both' }} />` spacer directly following Section 6 (`こだわり条件・特典`), so Section 6 floats cleanly above the fixed Search CTA button (`bottom: 96px`, `height: 52px`) and halts with an EXACT **12px clearance gap**!

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

# Page Specification Rule: Driving Academy (`DrivingAcademy.jsx` / `DrivingAcademy.css`)

Ushbu qoida **Avtomaktablar (Driving Academy)** bo'limi uchun barcha layout va geometriya qoidalarini belgilaydi.

---

## 📐 1. Container & Layout Geometry
- **Container Selector**: `.academy-container`
- **Flex Layout**: `flex: 1; min-height: 0; display: flex; flex-direction: column;`
- **Scroll**: `overflow-y: auto; padding-bottom: 96px;`

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
- **Filter Drawer Container**: Inline filter page view rendered when `isFilterOpen` is `true` (`padding: 16px 14px 160px 14px; position: relative;`).
- **Header Geometry**: ONLY Back button stays PINNED STICKY (`top: 0; left: 0; height: 40px; margin-bottom: -40px; z-index: 300;`). Title (`自動車学校の絞り込み`) and Reset button (`リセット`) scroll away naturally.
- **1:1 Baseline Alignment**: Sticky Back Button container (`height: 40px; align-items: center; top: 0;`) and Title Row (`minHeight: 40px; align-items: center; justify-content: center; position: relative; margin-bottom: 16px;`) match 1:1 on the exact same horizontal baseline (`y-center = 20px`).
- **Townwork 3-Tab Header**: 3 yellow branding tabs (`コース・免許`, `都道府県・地域`, `こだわり条件`) for rapid section jumps.
- **Rich Filter Dimensions**:
  1. **Prefectures & Locations**: 47 Prefectures selection with `CustomMobilePickerModal`.
  2. **License Categories / Offered Courses**: Multi-select chips for `Futsu`, `Oogata`, `Chugata`, `JunChugata`, `FutsuNishu`, `OogataNishu`, `Forklift`, `Tokushu`, `Nirin`.
  3. **Training Style**: Multi-select chips for `Tsugaku` (Qatnab o'qish), `Gashuku` (Yashab/Lagerda o'qish), `ShortTerm` (Tezlashtirilgan), `OnlineTheory` (Masofaviy nazariya).
  4. **Instruction Languages**: `UZ`, `JP`, `EN`, `RU`, `ZH`, `VI`.
  5. **Price Range Brackets**: `~¥250,000`, `¥250k ~ ¥300k`, `¥300k ~ ¥350k`, `¥350,000~`.
  6. **Perks & Features**: `shuttle` (無料送迎バス), `dormitory` (宿舎・食事付き), `subsidy` (教育訓練給付金対象), `installment` (ローン・分割払いOK), `nightClass` (ナイター教習), `femaleInstructor` (女性指導員), `kidsRoom` (託児所完備), `shoukai` (紹介手当).
- **Exact 12px Clearance**: Floating Search CTA button (`{count}件の教習所を検索`) floating at `bottom: 96px`, with `160px` bottom clearance padding on `feed-container` so the last card clears the button by EXACTLY 12px!

---

## 🚫 5. Forbidden Patterns
1. **No Missing Back Button Offset**: Back button must never collide with screen notch or title text.
2. **No Hardcoded Static Filter Lists**: Filters must dynamically filter all mock and server school items across all attributes.

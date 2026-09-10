# Page Specification Rule: Jobs Feed (`DriverFeed.jsx` / `DriverFeed.css`)

Ushbu qoida loyihamizning **Vakansiyalar Ro'yxati (Jobs Feed)** sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container & Layout Geometry
- **Container Selector**: `.feed-container`
- **Flex Parent Binding**: `flex: 1; height: 100%; max-height: 100%; min-height: 0; display: flex; flex-direction: column;`
- **Scroll Behavior**: `overflow-y: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box;`
- **Bottom Clearance**: `padding-bottom: 0px;` (Controlled strictly via explicit `92px` trailing clearance spacer after `.jobs-list` in `DriverFeed.jsx`).
- **Explicit 92px Trailing Dock Clearance Spacer Invariant**: `<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />` MUST follow `.jobs-list`. No matter how many job cards are loaded for `特定技能` (Tokutei Ginou), `正社員`, `アルバイト`, or `すべて`, scrolling ALWAYS halts with exact **8px compact visual gap (`92px - 84px = 8px`)** above `BottomNav` top edge (84px).

---

## 🎯 2. Header & Filter Control Bar
- **Header Padding**: `padding: 12px 14px;` (14px side margin 1:1 match).
- **Search & Filter Button Row**: `height: 44px`, `gap: 8px`.
- **Active Filter Chips Bar (`.active-filter-chips-container`)**:
  - `display: flex; align-items: center; position: relative; width: 100%; gap: 8px;`
  - **Smart Chip Grouping**: 3+ selected locations, stations, licenses, or features automatically summarize: `📍 東京23区 外3件 ×` (or `🚉 品川駅 外2件 ×`, `🪪 大型免許 外2件 ×`). Clicking `×` clears all items in that category.
  - **Sticky Reset Button (`.sticky-reset-btn`)**: `position: sticky; right: 0; flex-shrink: 0; z-index: 10;` with glass shadow background. Guarantees `リセット` button is 100% visible on screen at all times without horizontal scrolling.

---

## 🧱 3. Job Card Spacing Invariants
- **List Class**: `.jobs-list`
- **Inter-Card Gap**: `gap: 12px;`
- **Job Card Padding**: `padding: 14px;`
- **Company Logo Badge**: `48x48px`, `border-radius: 12px`.
- **Salary Tag Pill**: `padding: 4px 8px; border-radius: 8px; background: rgba(10, 132, 255, 0.1); font-weight: 700;`

---

## ⚓ 4. Floating Filter CTA Button Rules
- **CTA Class**: `.townwork-btn-search-cta`
- **Position**: `position: fixed; bottom: 96px; left: 50%; transform: translateX(-50%); z-index: 250;`
- **Width**: `width: calc(100% - 28px); max-width: 100%;` (Side margin 14px 1:1 match).
- **Style**: Standalone floating pill element without backdrop filters or nested border frames.

---

## 🚫 5. Forbidden Patterns & Page Anti-Patterns
1. **No Mixed Languages**: Vacancy tags and salary terms must render strictly in active i18n locale without mixed parentheses.
2. **No Truncated Descriptions**: `overflow-wrap: anywhere; word-break: break-word;` must be set on job detail preview.
3. **No Unspaced Job List Ends**: NEVER leave `.jobs-list` without the explicit `92px` trailing clearance spacer in `DriverFeed.jsx`. Missing spacer causes `特定技能` (Tokutei Ginou) and other job feed cards to stick directly against `BottomNav` or get trapped behind floating search CTA buttons.

# Page Specification Rule: Jobs Feed (`DriverFeed.jsx` / `DriverFeed.css`)

Ushbu qoida loyihamizning **Vakansiyalar Ro'yxati (Jobs Feed)** sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container & Layout Geometry
- **Container Selector**: `.feed-container`
- **Flex Parent Binding**: `flex: 1; height: 100%; max-height: 100%; min-height: 0; display: flex; flex-direction: column;`
- **Scroll Behavior**: `overflow-y: auto; -webkit-overflow-scrolling: touch; box-sizing: border-box;`
- **Bottom Clearance**: `padding-bottom: 96px;`

---

## 🎯 2. Header & Filter Control Bar
- **Header Padding**: `padding: 12px 14px;` (14px side margin 1:1 match).
- **Search & Filter Button Row**: `height: 44px`, `gap: 8px`.
- **Active Filter Chips Bar**: `display: flex; gap: 8px; overflow-x: auto; padding: 4px 14px;`

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

## 🚫 5. Forbidden Patterns
1. **No Mixed Languages**: Vacancy tags and salary terms must render strictly in active i18n locale without mixed parentheses.
2. **No Truncated Descriptions**: `overflow-wrap: anywhere; word-break: break-word;` must be set on job detail preview.

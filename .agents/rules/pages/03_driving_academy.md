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

## 🚫 4. Forbidden Patterns
1. **No Missing Back Button Offset**: Back button must never collide with screen notch or title text.

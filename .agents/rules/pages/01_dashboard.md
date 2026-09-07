# Page Specification Rule: Home Dashboard (`Dashboard.jsx` / `Dashboard.css`)

Ushbu qoida loyihamizning **Asosiy Sahifasi (Home Dashboard)** uchun barcha o'zgarmas layout, geometriya, spacing va visual invariantlarini belgilaydi.

---

## 📐 1. Container & Layout Geometry
- **Container Selector**: `.dashboard-container`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;` (To'liq ekran bo'ylab tushirilgan, `bottom: 0`).
- **Scroll Behavior**: `overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch;`
- **Side Padding**: `padding: 14px;` (Ekran yon chetlaridan `14px` masofa, `BottomNav` yon chetlari bilan 1:1 bog'langan).
- **Bottom Clearance**: `padding-bottom: 96px;` (Kontent scroll bo'lganda `BottomNav` menyusi ortidan jonli va silliq o'tishi va oxirida **exact 12px gap** bilan halt qilishi uchun).

---

## 🎯 2. Header & Top Bar Controls
- **Top Greeting Bar**: `margin-bottom: 14px; padding-top: 16px;`
- **User Avatar Badge**: `36x36px`, `border-radius: 50%`.
- **Search Header Bar**: `height: 48px`, `border-radius: 16px`, glassmorphism background.

---

## 🧱 3. Card & Component Spacing
- **Bento Icon Cards Row**: `display: flex; gap: 12px; margin-bottom: 14px;`
- **Feature Cards**: `border-radius: 20px`, `padding: 16px`.
- **Inter-Card Vertical Margin**: Har bir bento va banner kartalari orasida `margin-bottom: 14px`.

---

## ⚓ 4. Bottom Dock Clearance & Spacers
- **Bottom Dock Geometry**: `BottomNav` top edge at `84px` (`bottom: 12px` + `height: 72px`).
- **Total Scroll Boundary**: `padding-bottom: 96px;` (`96px - 84px = 12px` exact visual clearance gap).

---

## 🎨 5. Theme & Color Tokens
- **Background**: `background-color: transparent;`
- **Card Background (Light Mode)**: `rgba(255, 255, 255, 0.85)` + `backdrop-filter: blur(12px)`
- **Card Background (Dark Mode)**: `rgba(28, 28, 30, 0.85)` + `backdrop-filter: blur(12px)`

---

## 🚫 6. Page-Specific Constraints & Forbidden Patterns
1. **No Fixed Height Clipping**: `.dashboard-container` da `bottom: 96px !important` berish QAT'IYAN TAQIQLANADI (`bottom: 0` va `padding-bottom: 96px` ishlatilishi shart).
2. **No Horizontal Overflow**: Barcha bento flex text elementlarida `min-width: 0;` mavjud bo'lishi shart.

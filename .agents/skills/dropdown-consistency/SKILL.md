---
name: dropdown-consistency
description: CustomInlineDropdown variant tanlash oynasining yagona dizayn standarti. Barcha darchalar 100% bir xil o'lcham, burchak, rang va harakatga ega bo'lishi SHART.
---

# 🎯 CustomInlineDropdown — Yagona Dizayn Standarti (Dropdown Consistency Skill)

Bu skill fayldagi qoidalarni **har qanday** `CustomInlineDropdown` komponentiga tegishli o'zgartirish kiritishdan OLDIN o'qish MAJBURIY.

---

## 📐 QOIDA 1: Ikki Qatlamli Wrapper Strukturasi (BUZISH TAQIQLANADI)

`CustomInlineDropdown.jsx` dagi menyu oynasi DOIMO 2 ta qatlamdan iborat bo'lishi SHART:

```
TASHQI QATLAM (Outer Wrapper):
  - overflow: 'hidden'         ← Burchaklarni maskalaydi
  - borderRadius: '16px'       ← Yumaloq burchaklar
  - border, boxShadow, bg      ← Vizual stillar
  
  ICHKI QATLAM (Inner Scroll):
    - maxHeight: '210px'        ← Scroll chegarasi
    - overflowY: 'auto'         ← Scroll
    - padding: '6px'            ← Ichki bo'shliq
```

> ⚠️ TAQIQ: `overflowY: auto` va `borderRadius: 16px` ni BITTA div ga berish TAQIQLANADI. Bu brauzerlarda pastki burchaklarni tekis qirqib tashlaydi.

---

## 📐 QOIDA 2: O'zgarmas Dizayn Token'lari (BUZISH TAQIQLANADI)

Har bir `CustomInlineDropdown` menyusi quyidagi QATTIQ qiymatlarga ega:

| Token | Qiymat | Izoh |
|-------|--------|------|
| Menyu `borderRadius` | `16px` | Tashqi ramka burchaklari |
| Menyu `overflow` | `hidden` | Burchaklarni maskalash |
| Menyu `maxHeight` | `210px` | Ichki scroll qatlami |
| Menyu `padding` | `6px` | Ichki bo'shliq |
| Menyu `zIndex` | `99999` | Ustma-ust chiqish |
| Menyu `boxShadow` | `0 16px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)` | 3D soya |
| Kartochka `borderRadius` | `12px` | Variant burchaklari |
| Kartochka `padding` | `11px 14px` | Variant ichki bo'shlig'i |
| Kartochka `fontSize` | `13.5px` | Matn kattaligi |
| Kartochka `fontWeight` | `500` (oddiy) / `700` (tanlangan) | Matn qalinligi |
| Tanlangan fon | `rgba(48, 209, 88, 0.15)` | Yashil fon |
| Tanlangan chegara | `1px solid rgba(48, 209, 88, 0.4)` | Yashil border |
| Tanlangan rang | `#28a745` | Yashil matn |
| Checkmark | `<Check size={16} color="#28a745" />` | Yashil belgi |
| Kartochkalar orasidagi tirqish | `4px` (`gap: 4px`) | Vertikal masofa |

---

## 📐 QOIDA 3: `useLayoutEffect` Majburiyati (BUZISH TAQIQLANADI)

`dropUp` yo'nalishini aniqlash uchun DOIMO `useLayoutEffect` ishlatilishi SHART.

```jsx
// ✅ TO'G'RI:
useLayoutEffect(() => {
  if (isOpen && containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < 250 && rect.top > 250);
  }
}, [isOpen]);

// ❌ NOTO'G'RI (birinchi renderda miltillash keltirib chiqaradi):
useEffect(() => { ... }, [isOpen]);
```

---

## 📐 QOIDA 4: Ota-Konteyner Overflow Tekshiruvi

`CustomInlineDropdown` joylashgan OTA-KONTEYNERDA `overflow: hidden` bo'lishi TAQIQLANADI. Aks holda absolute pozitsiyali darcha kesiladi.

```jsx
// ✅ TO'G'RI:
<div style={{ padding: '0 16px' }}>
  <CustomInlineDropdown ... />
</div>

// ❌ NOTO'G'RI:
<div style={{ padding: '0 16px', overflow: 'hidden' }}>
  <CustomInlineDropdown ... />
</div>
```

---

## 📐 QOIDA 5: Barcha 7 Ta Darcha Joylari (CompanyHome.jsx)

`CompanyHome.jsx` da quyidagi 7 ta joyda `<CustomInlineDropdown />` ishlatiladi. Barchasi BITTA importdan va BITTA komponentdan foydalanishi SHART:

1. `雇用形態 *` (Employment Type) — ~841-qator
2. `賞与 *` (Bonus) — ~868-qator
3. `職種 *` (Job Category) — ~890-qator
4. `都道府県 *` (Prefecture) — ~1032-qator
5. `市区町村 *` (City) — ~1049-qator
6. `利用路線 *` (Train Line) — ~1099-qator
7. `最寄り駅 *` (Nearest Station) — ~1114-qator

**Tekshirish buyrug'i**:
```bash
grep -c "CustomInlineDropdown" src/components/CompanyHome.jsx
# Natija: 8 (1 import + 7 ta ishlatish)
```

---

## 📐 QOIDA 6: O'zgartirish Kiritishdan Keyin Majburiy Tekshiruvlar

Har qanday `CustomInlineDropdown.jsx` ga tegishli o'zgartirishdan KEYIN quyidagi 3 buyruq SHART bajarilishi kerak:

```bash
npm test                        # 72/72 passed bo'lishi SHART
npm run build                   # 0 error bo'lishi SHART
node scripts/health_check.mjs   # 8/8 passed bo'lishi SHART
```

---

## 📐 QOIDA 7: React Portal Architecture (`createPortal`)

Custom Inline Dropdown menyulari **hech qachon** ota-komponent ichida `position: absolute` bilan render qilinmasligi kerak. Ular strictly `createPortal(..., document.body)` orqali `document.body` ga uzatiladi:

```jsx
import { createPortal } from 'react-dom';

// ...
{isOpen && createPortal(
  <div style={{ ...portalStyle, zIndex: 999999 }}>
    {/* Inner scroll wrapper */}
  </div>,
  document.body
)}
```

**Nima uchun Portal zarur?**
- Brauzer HTML stacking context qoidasiga ko'ra pastki cardlar (`2 勤務条件`) tepadagi card ichidagi darchani to'sib qo'yadi.
- `document.body` darajasida render qilish darchaga **100% mutloq ustunlik** beradi va barcha qo'shni elementlar hamda forma kartochkalari ustida ko'rinishini kafolatlaydi.

---

## 📐 QOIDA 8: Portal Event Safety & Selection Resolution

React Portal menyulari ishlatilganda event handling va qiymat tanlash quyidagicha xavfsiz bo'lishi SHART:

```jsx
const menuRef = useRef(null);

// 1. Double Ref Guard against premature dismissal:
useEffect(() => {
  const handleClickOutside = (e) => {
    const isInsideTrigger = containerRef.current && containerRef.current.contains(e.target);
    const isInsideMenu = menuRef.current && menuRef.current.contains(e.target);
    if (!isInsideTrigger && !isInsideMenu) {
      setIsOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('touchstart', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('touchstart', handleClickOutside);
  };
}, []);

// 2. Multi-key Fallback for Option Values:
const rawVal = opt.id !== undefined ? opt.id : opt.value !== undefined ? opt.value : opt.name;
```



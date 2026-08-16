# 🗺️ Navigatsiya UI Zamonaviylashtirish va Xalqaro Standartlarga Moslashtirish Roadmap

Ushbu reja Michi ilovasining marshrut rejalashtirish panelini (bottom sheet) minimallashtirib, xalqaro darajadagi navigatsiya tizimlariga (Google Maps, Apple Maps, Waze, TomTom) mos zamonaviy ko'rinishga keltirish uchun tuzilgan.

---

## Foydalanuvchi Tasdiqlashi Zarur Bo'lgan Masalalar

> [!IMPORTANT]
> **Snap Detent tizimi**: Pastki panel uchta holatda ishlaydi — **Yig'ilgan** (~88px, faqat ETA/GO ko'rinadi), **Yarim ochiq** (~40% ekran), **To'liq ochiq** (~85% ekran). Siz qaysi holatni asosiy (default) deb belgilashni xohlaysiz?

> [!IMPORTANT]
> **Yo'l belgilari ma'lumot manbai**: Hozirda Overpass API orqali Yaponiya yo'l cheklovlari (balandlik, og'irlik) olinadi. Yo'l belgilarini xaritada ko'rsatish uchun ushbu ma'lumotlardan foydalanamizmi yoki qo'shimcha dataset kerakmi?

---

## Ochiq Savollar

1. **Tun rejimi (Dark Mode)**: Navigatsiya panelining qorong'u rejimi ham kerakmi? (Google Maps va Apple Maps kabi)
2. **3D kavshak ko'rinishi**: Katta kavshak va avtomagistrallarga yaqinlashganda TomTom uslubida 3D kavshak rasmi kerakmi?
3. **Tezlik ko'rsatkichi**: Waze uslubida joriy tezlikni ko'rsatuvchi doiraviy speedometer qo'shilsinmi?

---

## Taklif Etilayotgan O'zgarishlar

Reja **5 ta bosqich (faza)** ga bo'lingan. Har bir bosqich mustaqil ishlaydigan, tekshiriladigan va joylashtirilishi mumkin bo'lgan yaxlit qism.

---

### 📐 I-BOSQICH: Kompakt Panel va Snap Detent Tizimi

Maqsad: Pastki panelni Google Maps/Apple Maps uslubida 3 ta snap holatga ega qilish, xarita maydoni maksimal ko'rinishini ta'minlash.

#### [MODIFY] [JDMNavigation.css](file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.css)

**`.am-bottom-sheet` kompakt tizimi:**
- `max-height: 80vh` → dinamik `height` CSS variable orqali boshqarish
- Uchta snap detent qo'shish: `--sheet-collapsed: 88px`, `--sheet-half: 45vh`, `--sheet-full: 85vh`
- `transition` ni spring-based cubic-bezier ga o'zgartirish: `cubic-bezier(0.32, 0.72, 0, 1)` — Apple Maps effekti
- Drag handle interaction sohasini kengaytirish (touch target: 44px minimum)

**`.am-sheet-content` scroll tizimi:**
- Yig'ilgan holatda `overflow: hidden` (scroll o'chiriladi)
- Yarim/to'liq ochiq holatda `overflow-y: auto` + `-webkit-overflow-scrolling: touch`
- Scroll-to-top ga qaytganda panelni yig'ish (scroll → drag handoff)

**Yangi CSS klasslar:**
```css
/* Yig'ilgan holat — faqat ETA va GO ko'rinadi */
.am-bottom-sheet.collapsed {
  height: 88px;
  overflow: hidden;
}
/* Yarim ochiq holat — input maydonlari ko'rinadi */
.am-bottom-sheet.half {
  height: 45vh;
}
/* To'liq ochiq holat — barcha sozlamalar */
.am-bottom-sheet.full {
  height: 85vh;
}
```

#### [MODIFY] [JDMNavigation.jsx](file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.jsx)

**State boshqaruvi:**
- `isSettingsCollapsed` (boolean) → `sheetDetent` (enum: `'collapsed'` | `'half'` | `'full'`)
- Yangi `useRef` — `sheetContentRef` scroll holatini kuzatish uchun
- Touch drag gesture handler qo'shish (touch start/move/end)

**JSX tuzilmasi o'zgarishi:**
```
HOZIRGI:
  div.am-bottom-sheet.show
   └── div.am-bottom-sheet-overlay (max-height: 80vh)
        ├── drag-handle
        ├── header (sarlavha + X tugma)
        └── content (hamma narsa ichida)

YANGI:
  div.am-bottom-sheet.show.[collapsed|half|full]
   ├── div.am-drag-handle-zone (44px touch target)
   ├── div.am-compact-footer (DOIMO ko'rinadi: ETA + GO)
   └── div.am-sheet-scroll-body (scroll, shartli ko'rinish)
        ├── header (sarlavha + X tugma)
        ├── transport tabs
        ├── waypoints inputs
        ├── pills row
        └── advanced options
```

**Muhim mantiq:**
- `collapsed` holatda faqat `am-compact-footer` ko'rinadi (ETA vaqti, masofa, GO tugmasi)
- Drag handle ni tepaga suring → `half` holatga o'tadi
- `half` holatda input maydonlari va transport tablar ko'rinadi
- Yana tepaga suring → `full` holat (barcha sozlamalar)
- Xarita ustiga bosish → avtomatik `collapsed` holatga qaytadi

---

### 🎯 II-BOSQICH: Mukammal Markazlashtirish va Simmetrik Padding

Maqsad: Marshrut chizig'i, boshlanish va tugash nuqtalari har doim ekran markazida, chekka tomonlardan bir xil masofada ko'rinishi.

#### [MODIFY] [JDMNavigation.jsx](file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.jsx)

**`getDynamicFitPadding` ni qayta yozish:**

```javascript
const getDynamicFitPadding = (map, sheetDetent) => {
  try {
    const container = map.getContainer();
    const W = container.clientWidth || 400;
    const H = container.clientHeight || 600;

    // Pastki panel haqiqiy balandligini o'lchash
    const sheetEl = document.querySelector('.am-bottom-sheet');
    const sheetH = sheetEl ? sheetEl.offsetHeight : 88;

    // Tepada status bar + safe area (~56px)
    const topInset = 56;

    // Simmetrik yon padding (chap = o'ng)
    const sidePad = Math.max(32, Math.round(W * 0.08));

    // Ko'rinadigan xarita maydoni balandligi
    const visibleH = H - sheetH - topInset;

    // Marshrut chizig'ini ko'rinadigan maydon ichida markazlash
    const verticalBreath = Math.round(visibleH * 0.08);

    return {
      top: topInset + verticalBreath,
      bottom: sheetH + verticalBreath,
      left: sidePad,
      right: sidePad
    };
  } catch (e) {
    return { top: 80, bottom: 120, left: 32, right: 32 };
  }
};
```

---

### 🎛️ III-BOSQICH: Tugmalar Izchilligi va Joylashuv Standartlashtirish

Maqsad: Barcha oynalardagi tugmalar bir xil dizayn, bir xil joylashuv va bir xil mantiqda ishlashini ta'minlash. Ustma-ust tushish va takrorlanishlarni bartaraf etish.

#### [MODIFY] [JDMNavigation.jsx](file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.jsx)

**Muammolar va yechimlari:**

1. **Swap (Almashtirish) tugmasining ikkita har xil dizayni:**
   - **Yechim**: Ikkala joyda ham yangi `am-swap-btn` klassidan foydalanish — doiraviy 36px icon + tooltip bilan yagona dizayn
2. **`.am-binoculars-btn` klass nomi ikkita turli tugmada ishlatilmoqda:**
   - **Yechim**: Locate tugmasiga yangi `am-locate-btn` klass nomi berish
3. **Layer popup trigger tugmasidan uzoqda ochilmoqda:**
   - **Yechim**: Popupni `right: 12px` ga ko'chirish (trigger tugma yoniga)
4. **Dropdown overflow clipping:**
   - **Yechim**: `.am-bottom-sheet-overlay` da `overflow: visible` qilish yoki dropdown portal ishlatish
5. **Bookmarks/POI panellarining qattiq pozitsiyasi:**
   - **Yechim**: `bottom` ni `calc(var(--sheet-height, 88px) + 16px)` formulasi bilan dinamik qilish

---

### 🧭 IV-BOSQICH: Marshrut Chizig'ida Yo'nalish Strelkalari

Maqsad: Marshrut polyline ustida harakatlanish yo'nalishini ko'rsatuvchi strelkalar qo'shish.

#### [NEW] [routeArrow.svg](file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/public/icons/routeArrow.svg)

---

### 🚦 V-BOSQICH: Yo'l Belgilari va Cheklovlar Vizualizatsiyasi

Maqsad: Xaritada marshrut bo'ylab yo'l belgilarini ko'rsatish.

---

## Bosqichlar Jadvali (Timeline)

| Bosqich | Nomi | Murakkablik | Taxminiy Vaqt |
|---------|------|-------------|---------------|
| **I** | Kompakt Panel + Snap Detents | ⭐⭐⭐ Yuqori | 1–2 seans |
| **II** | Simmetrik Markazlashtirish | ⭐⭐ O'rta | 1 seans |
| **III** | Tugmalar Izchilligi | ⭐⭐ O'rta | 1 seans |
| **IV** | Yo'nalish Strelkalari | ⭐ Past | 30 daqiqa |
| **V** | Yo'l Belgilari Qatlami | ⭐⭐ O'rta | 1 seans |

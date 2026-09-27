# K-2: MapLibre GL Lazy Import

## Tavsif
`JDMNavigation.jsx` faylida static `import * as maplibregl from 'maplibre-gl'` dinamik lazy import pattern ga o'tkazildi. Bu orqali 1,207 KB bo'lgan MapLibre heavy vendor js bundle birinchi sahifa yuklanishida (initial load) yuklanmaydi, faqat foydalanuvchi JDM Navigation bo'limiga kirganda yuklanadi.

## Amalga oshirilgan o'zgarishlar
1. `src/components/JDMNavigation.jsx` faylidagi statik `import * as maplibregl from 'maplibre-gl'` olib tashlandi.
2. `loadMapLibre()` yordamchi dinamik import funksiyasi yaratildi.
3. `JDMNavigation` komponenti ichida `maplibreglModule` state va `Marker` dynamic binding o'rnatildi.
4. `<ReactMap>` komponentiga `mapLib={maplibreglModule || loadMapLibre()}` biriktirildi.

## Natija va Tekshiruv
- `JDMNavigation` componenti build hajmi **161.83 KB** ga qisqardi.
- `vendor-maps` (1,207 KB) alohida split chunk sifatida ajratildi va faqat navigatsiyada dinamik yuklanadi.
- Vitest unit testlar 100% muvaffaqiyatli o'tdi (83/83 passed).
- Production build xatosiz amalga oshirildi (`npm run build`).

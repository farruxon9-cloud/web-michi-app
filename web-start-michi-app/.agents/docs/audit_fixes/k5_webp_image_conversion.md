# K-5: PNG → WebP Tasvir Konvertatsiyasi

## Tavsif
Loyihadagi asosiy PNG grafik resurslar (`logo.png`, `truck.png`, `school.png`, `pwa-192x192.png`, `pwa-512x512.png`) 80% sifat bilan zamonaviy WebP formatiga o'tkazildi. Eski brauzerlar va PNG talab qiluvchi metadata mosligi uchun PNG versiyalari saqlab qolindi hamda `index.html` va PWA asset konfiguratsiyasiga `.webp` preloading va caching qo'shildi.

## Natijalar va Hajm Qisqarishi
- **`logo.png` (39.0 KB)** → `logo.webp` (**15.1 KB**, **61.0% kichikroq**)
- **`truck.png` (103.1 KB)** → `truck.webp` (**44.7 KB**, **56.6% kichikroq**)
- **`school.png` (111.4 KB)** → `school.webp` (**50.6 KB**, **54.5% kichikroq**)
- **`pwa-192x192.png` (39.0 KB)** → `pwa-192x192.webp` (**15.1 KB**, **61.0% kichikroq**)
- **`pwa-512x512.png` (39.0 KB)** → `pwa-512x512.webp` (**15.1 KB**, **61.0% kichikroq**)

## Bajarilgan o'zgarishlar
1. `public/` jildida WebP fayllar hosil qilindi.
2. `index.html` dagi og:image, twitter:image hamda `<link rel="preload">` meta taglari `/logo.webp` ga yangilandi.
3. `vite.config.js` PWA asset keshiga `logo.webp`, `truck.webp`, `school.webp` kiritildi.

## Tekshiruv
- Vitest unit testlar 100% o'tdi (83/83 passed).
- Production build va Service Worker precache muvaffaqiyatli yakunlandi (`npm run build`).

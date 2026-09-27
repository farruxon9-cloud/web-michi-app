# K-7: Content Security Policy (CSP) Header Konfiguratsiyasi

## Tavsif
Loyiha xavfsizligini ta'minlash hamda XSS (Cross-Site Scripting) va ma'lumotlarni noqonuniy sizib chiqishidan himoya qilish uchun `public/_headers` fayliga `Content-Security-Policy` (CSP) xavfsizlik sarlavhasi qo'shildi.

## Sozlangan CSP Direktivalari
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; media-src 'self' https: blob: data:; connect-src 'self' https: http://138.197.28.114:5678 wss: blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
```

## Resurs Xaritasining Ruxsatlari
1. **`script-src` & `worker-src`:** MapLibre GL va PWA worker'lari hamda Vite bundle uchun `blob:` va `'unsafe-inline'` qo'llab-quvvatlanadi.
2. **`style-src` & `font-src`:** Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) va `data:` shriftlari ruxsat etilgan.
3. **`img-src`:** Map layer tile'lari (CartoDB, OpenStreetMap, ArcGIS, Terrarium), UI Avatars, Unsplash va lokal grafik resurslar uchun moslashtirilgan.
4. **`connect-src`:** Gemini AI API (`generativelanguage.googleapis.com`), Hugging Face Multi-AI space, n8n webhook Server, Overpass API, Nominatim va OSRM/Valhalla routing xizmatlariga ulanish ruxsat berilgan.
5. **`object-src` & `frame-ancestors`:** Tashqi xavfli pluginlar va iframe embed orqali loyihani chaqirish cheklangan (`'none'`).

## Tekshiruv
- **Unit Testlar:** `npx vitest run` — 83/83 testlar muvaffaqiyatli o'tdi.
- **Production Build:** `npm run build` — `dist/_headers` fayliga CSP sarlavhasi muvaffaqiyatli ko'chirildi.

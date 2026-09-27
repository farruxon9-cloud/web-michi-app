# K-6: Production Muhit O'zgaruvchilari Konfiguratsiyasi (.env.production)

## Tavsif
Loyihaning ildiz jildida (`/`) `.env.production` fayli yaratildi va ishlab chiqarish (production) muhiti uchun zaruriy barcha muhit o'zgaruvchilari (Environment Variables) sozlandi. Asosiy domen qiymati sifatida `VITE_APP_URL=https://web.michi.jp.net` belgilandi.

## Sozlangan Muhit O'zgaruvchilari
```env
VITE_APP_URL=https://web.michi.jp.net
VITE_API_BASE_URL=https://web.michi.jp.net/api
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0

# AI Backend & API Endpoints
VITE_HF_BRAIN_URL=https://farruxkanoatov-michiai.hf.space/api/predict
VITE_N8N_OTP_WEBHOOK_URL=http://138.197.28.114:5678/webhook/351b1de7-f29c-422c-ad21-ac6e506fa6e3

# Gemini API Keys (Cloudflare/Vercel/Hosting platformalari backendida xavfsiz saqlanadi)
VITE_GEMINI_API_KEY=
...
```

## Afzalliklari va Havfsizlik
1. **Domen Mosligi:** Loyihaning domen manzili `https://web.michi.jp.net` qat'iy belgilandi, bu PWA, CORS, hamda Meta OpenGraph kartalari uchun aniq URL bilan ishlashni ta'minlaydi.
2. **Kesh va Build Optimizatsiyasi:** Vite production build jarayonida ushbu o'zgaruvchilar avtomatik `import.meta.env` ob'ektiga yuklanadi va kod ichida to'g'ri bog'lanadi.
3. **Maxfiylik:** API kalitlari uchun shablon o'zgaruvchilar tayyorlandi, kalitlar xavfsiz hosting secret'larida saqlanadi.

## Tekshiruv
- **Unit Testlar:** `npx vitest run` — 83/83 testlar muvaffaqiyatli o'tdi.
- **Production Build:** `npm run build` — 356ms da nosozliklarsiz tayyorlandi va SW precaching ishga tushdi.

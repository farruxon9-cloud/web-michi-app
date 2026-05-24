# Michi App - So'nggi O'zgarishlar (Batafsil Izohlar)

Ushbu hujjatda ilovada qilingan so'nggi muhim o'zgarishlar va dizayn yangiliklari saqlangan.
Boshqa kompyuterda ochganda ham kodni va mantiqni oson tushunishingiz uchun batafsil yozildi.

## 1. Dizayn va "Glassmorphism" Effektlari (`src/index.css`)
- **Asosiy Fon Rang (Zamin):** Ilova orqa foni `#f5f7fa` (och kulrang-moviy) rangga o'zgartirildi. Bu sof oq emas va ko'zni charchatmaydi.
- **Suzib Yuruvchi "Blob" lar (Shar/Dog'lar):** Orqa fonga 3 ta katta dumaloq shakllar qo'shildi va ularga xiralashtirish effekti (`filter: blur(80px)`) va 60% shaffoflik (`opacity: 0.6`) berildi. Ular sekin harakatlanadi (`blob-float` animatsiyasi orqali).
  - 1-Blob: `#e0f2fe` (Och moviy)
  - 2-Blob: `#e0e7ff` (Och indigo)
  - 3-Blob: `#f3e8ff` (Och binafsha)
- **Gradient Logotip va Yozuvlar:** Logotip (`道`) va boshqa muhim vizual elementlar uchun yorqin ko'k gradient qo'shildi (Boshlanish: `#0066cc`, Tugash: `#00b3ff`).

## 2. Ko'p Tilli Interfeys (i18n) va "Yapon tili" xatoliklari tuzatilishi (`src/i18n.js` va `src/components/RoleSelect.jsx`)
- **Muammo:** Yapon yoki boshqa tillarni tanlaganda "Ro'yxatdan o'tish" (RoleSelect) sahifasidagi matnlar va maydonlar (placeholder) hamda profildagi "Haydovchilik guvohnomalari" kabilar tarjima qilinmayotgan va interfeys xato ko'rsatayotgan edi (yoki o'zbek tilida qolib ketgandi).
- **Yechim:** 
  1. `src/components/RoleSelect.jsx` faylidagi barcha "qattiq yozilgan" (hardcoded) o'zbekcha so'zlar maxsus tarjima funksiyasiga (`t("kalit_so'z", "standart_matn")`) o'zgartirildi. Endi ular tanlangan tilga mos ravishda to'liq avtomatik tarjima qilinadi.
  2. `src/i18n.js` fayliga Yapon (`ja`), Ingliz (`en`), Xitoy (`zh`), Nepal (`ne`), Vyetnam (`vi`) tillari uchun yetishmayotgan tarjima kalitlari (Masalan: `lic_futsu`, `tech_forklift`, `driverLicensesLabel`) qo'shib chiqildi. Sintaktik xatolik (qo'shtirnoq va qochirish belgilari) to'liq tuzatildi va server qizil xatolik bermasdan ishlashi ta'minlandi.

Ushbu arxiv barcha o'zgarishlar va `b` branchining joriy qismini o'z ichiga oladi. Ishga tushirish uchun odatdagidek `npm install` va `npm run dev` buyruqlaridan foydalaning.

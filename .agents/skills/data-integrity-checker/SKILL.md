---
name: data-integrity-checker
description: >-
  Ma'lumotlar bazasi (JSON/JS massiv) yaratilgandan yoki o'zgartirilgandan so'ng
  avtomatik sifat tekshiruvini o'tkazish uchun qo'llanma. Agent har qanday katta
  ma'lumotlar bazasi operatsiyasidan keyin ushbu skillni aktivlashtirishi va
  validatsiya skriptini ishga tushirishi SHART.
---

# Data Integrity Checker (Ma'lumotlar Yaxlitligi Tekshiruvchisi)

Ushbu skill ma'lumotlar bazalari uchun avtomatik sifat tekshiruvini o'tkazadi.

## Qachon Ishlatiladi?

- Har qanday `src/data/*.js` fayli yaratilganda yoki o'zgartirilganda
- Katta hajmli ma'lumot (50+ element) yozilganda
- Commit qilishdan OLDIN (majburiy)

## Tekshiruv Skripti

Skript joylashuvi: `scripts/validate_vehicle_db.mjs`

### Ishga tushirish:
```bash
node scripts/validate_vehicle_db.mjs
```

### Skript tekshiradigan mezonlar:

1. **Jami elementlar soni** >= belgilangan minimum (masalan 150)
2. **Har bir brend** kamida N ta modelga ega (masalan 2)
3. **Noyob ID tekshiruvi** — dublikat ID yo'q
4. **Majburiy maydonlar tekshiruvi** — har bir elementda `id, make, model, era, year, type, bodyStyle` bor
5. **Rasm mosligi tekshiruvi** — yuk mashina uchun sedan rasmi ishlatilmagan
6. **Era qiymatlari tekshiruvi** — faqat ruxsat etilgan qiymatlar (`classic`, `jdm_golden`, `modern`)

### Natija formati:
```
✅ Jami modellar: 210 (minimum 150) — O'TDI
✅ Barcha 15 brend kamida 2 ta modelga ega — O'TDI
✅ Dublikat ID topilmadi — O'TDI
✅ Barcha majburiy maydonlar mavjud — O'TDI
⚠️ 3 ta model noto'g'ri rasm ishlatmoqda — OGOHLANTIRISH
❌ Daihatsu da 0 model — XATOLIK

🚨 1 ta xatolik, 1 ta ogohlantirish. Commit TAQIQLANADI.
```

## Qat'iy Qoida

> Agar skript `❌` xatolik bersa, commit qilish **TAQIQLANADI**.
> Agar skript `⚠️` ogohlantirish bersa, ogohlantirish sababi tushuntirilishi kerak.
> Faqat `✅ BARCHA TEKSHIRUVLAR O'TDI` holatida commit ruxsat etiladi.

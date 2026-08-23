---
name: pre-flight-checklist
description: >
  Har bir yangi sessiya boshlanishida ishga tushiriladigan to'liq "uchishdan oldingi" tekshiruv ro'yxati.
  Agent loyihaning holati, testlar, build va qoidalar muvofiqligini avtomatik audit qiladi.
  Ushbu skillni har safar yangi sessiya boshida faollashtirish SHART.
---

# ✈️ Pre-Flight Checklist Skill

## Maqsad
Har bir yangi sessiya boshida loyihaning "sog'ligi"ni 60 soniyadan kam vaqt ichida to'liq tekshirish va faqat hamma narsa yashil bo'lgandan keyin ishga kirishish.

## Bajarilish Tartibi

### 1-Qadam: Xotira va Kontekstni O'qish (10 soniya)
```bash
# Quyidagilarni o'qish SHART:
cat .agents/rules/past_mistakes.md       # Tarixiy xatolarni eslash
cat .agents/AGENTS.md                     # 14 ta qoidani o'qish
cat codebase_map.md                       # Loyiha xaritasini ko'rish
git branch --show-current                 # Hozirgi branch
git status --short                        # O'zgarishlar bormi
```

### 2-Qadam: Avtomatik Sog'lik Tekshiruvi (30 soniya)
```bash
# Barcha testlarni yurgizish
npm test 2>&1

# Database validatsiya
node scripts/validate_vehicle_db.mjs 2>&1

# Production build tekshiruvi
npm run build 2>&1
```

### 3-Qadam: Natijalarni Baholash
- ✅ Agar **hamma tekshiruv o'tsa** → ishga kirishish mumkin
- ❌ Agar **biror tekshiruv buzilsa** → avval shu muammoni tuzatish kerak
- ⚠️ Agar **ogohlantirish bo'lsa** → qayd qilib davom etish mumkin

### 4-Qadam: Foydalanuvchiga Qisqacha Hisobot
Tekshiruv natijasini qisqacha jadvalda ko'rsatish:
```markdown
| Tekshiruv | Natija |
|-----------|--------|
| Branch    | b1 ✅  |
| Tests     | 55/55 ✅ |
| DB Valid  | 7/7 ✅ |
| Build     | OK ✅  |
```

## Muhim Eslatmalar
- Bu skill har bir sessiya boshida **avtomatik** ishga tushishi kerak
- Agar foydalanuvchi "davom etamiz" desa — avval shu tekshiruvni yurgizish
- Agar oldingi sessiyada commit qilinmagan o'zgarishlar bo'lsa — foydalanuvchiga xabar berish

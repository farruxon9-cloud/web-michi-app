---
name: session-handoff
description: >
  Sessiyalar orasidagi bilimlarni to'liq uzatish protokoli.
  Keyingi agent yoki sessiya uchun loyiha holati, bajarilgan va bajarilmagan ishlar haqida
  qisqacha va to'liq ma'lumot tayyorlash.
---

# 🔄 Session Handoff Skill

## Maqsad
Har bir sessiya tugaganda yoki yangi sessiya boshlanayotganda loyiha holati haqida to'liq bilim uzatishni ta'minlash. Bu kelajakdagi agentlarga kontekstni tiklash uchun zarur bo'lgan vaqtni 80% ga qisqartiradi.

## Sessiya Tugashida Bajariladigan Ishlar

### 1. Yakuniy Commit
```bash
# Barcha o'zgarishlarni saqlash
npm test && node scripts/validate_vehicle_db.mjs && npm run build
git add . && git commit -m "<type>(<scope>): <tavsif> on <branch> branch"
```

### 2. Walkthrough Yangilash
`walkthrough.md` artifaktini yangilash:
- Nimalar bajarildi
- Nimalar tekshirildi
- Qanday natijalar chiqdi

### 3. Keyingi Sessiya Uchun Eslatmalar
Agar bajarilmagan ishlar bo'lsa, ularni aniq belgilash:
```markdown
## Keyingi Sessiya Uchun
1. [ ] Bajarilmagan ish #1 — tavsif
2. [ ] Bajarilmagan ish #2 — tavsif
```

## Yangi Sessiya Boshlanishida

### Kontekst Tiklash Ketma-ketligi
```
1. pre-flight-checklist skillini ishga tushirish
2. walkthrough.md ni o'qish — oldingi natijalar
3. implementation_plan.md ni o'qish — reja holati
4. past_mistakes.md ni o'qish — xatolardan saqlaning
5. git log --oneline -10 — oxirgi commitlar
```

### Foydalanuvchiga Qisqacha Xabar
```
Assalomu alaykum! Loyiha holati tekshirildi:
- Branch: b1 ✅
- Testlar: 55/55 ✅
- Oldingi sessiya: [qisqacha tavsif]
- Keyingi vazifa: [agar mavjud bo'lsa]
Davom etamizmi?
```

## ⚠️ Muhim Qoidalar
- Hech qachon sessiyani **commit qilmasdan** tugatmang
- Hech qachon yangi sessiyani **pre-flight tekshiruvsiz** boshlamang
- Kontekst uzatish — bu xatoliklarning 50%+ ni oldini oladi

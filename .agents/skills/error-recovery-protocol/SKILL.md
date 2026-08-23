---
name: error-recovery-protocol
description: >
  Runtime xatolik yuzaga kelganda qo'llaniladigan tuzatish protokoli.
  Xatolikni aniqlash, izolyatsiya qilish, tuzatish va tekshirish bosqichlari.
---

# 🚑 Error Recovery Protocol Skill

## Maqsad
Runtime xatolar (console.error, build failure, test failure) paydo bo'lganda tizimli ravishda ularni tuzatish.

## Xatolik Turlari va Ustuvorliklari

| Tur | Misol | Ustuvorlik | Vaqt chegarasi |
|-----|-------|------------|----------------|
| 🔴 Build Failure | `npm run build` xatolik | KRITIK | Darhol tuzatish |
| 🔴 Test Failure | Vitest testlar buzildi | KRITIK | Darhol tuzatish |
| 🟡 Runtime Error | Console.error brauzerda | O'RTA | Joriy sessiyada |
| 🟢 Warning | Vite ogohlantirish | PAST | Keyingi sessiyada |

## Tuzatish Protokoli

### 1-Bosqich: ANIQLASH (30 soniya)
```
1. Xatolik xabarini to'liq o'qish
2. Qaysi faylda va qaysi qatorda ekanini aniqlash
3. past_mistakes.md da shunga o'xshash xatolik bormi tekshirish
```

### 2-Bosqich: IZOLYATSIYA (1 daqiqa)
```
1. Xatolik faqat bitta komponentgami yoki ko'p joyga tarqalganmi?
2. Oxirgi qaysi commit dan keyin paydo bo'lgan?
   git log --oneline -5
3. Agar mumkin bo'lsa — faqat shu faylni tahrirlash
```

### 3-Bosqich: TUZATISH
```
1. Eng kichik mumkin bo'lgan o'zgarishni qilish
2. Hech qachon bir vaqtda 2+ faylni o'zgartirmaslik (agar bog'liq bo'lmasa)
3. O'zgartirish sababini izohda yozish
```

### 4-Bosqich: TEKSHIRISH
```bash
# Qat'iy tekshiruv buyruqlari
npm test && node scripts/validate_vehicle_db.mjs && npm run build
```

### 5-Bosqich: QAYD ETISH
```
1. Agar yangi xatolik turi bo'lsa → past_mistakes.md ga qo'shish
2. Commit qilish (fast-commit-cycle skilliga muvofiq)
```

## Maxsus Holatlar

### pdfmake Font Xatosi
```
Xato: "File 'SawarabiGothic-Regular.ttf' not found in virtual file system"
Sabab: initFonts() PDF yaratishdan OLDIN chaqirilmagan
Tuzatish: generatePDF() ichida initFonts() ni BIRINCHI qator qilib chaqirish
```

### MapLibre NaN Crash
```
Xato: "Invalid LngLat object" yoki ekran muzlab qolishi
Sabab: API dan kelgan koordinatalar NaN yoki string
Tuzatish: Number() va isNaN() tekshiruvi + try/catch
```

### React Hooks ReferenceError
```
Xato: "X is not defined" yoki "Invalid hook call"
Sabab: import qilinmagan hook yoki mock funksiyada kichik harf
Tuzatish: import ro'yxatini tekshirish, mock komponentlarni Katta harf bilan boshlash
```

## ⚠️ QOIDA
> Xatolik tuzatilgandan so'ng **past_mistakes.md** ni yangilash — bu kelajakda shu xatolik takrorlanishining oldini oladi.

---
name: bulk-data-generation
description: >-
  Katta hajmdagi ma'lumotlar (100+ element) yaratishda xatosiz va to'liq bajarish uchun
  qo'llanma. Har qanday katta JSON/JS massiv (mashina modellari, shahirlar ro'yxati,
  mahsulotlar katalogi) yaratishda ishlatiladi. Agent bu skillni 50+ elementli
  ma'lumot yaratish topshirig'i kelganda aktivlashtirishi SHART.
---

# Katta Hajmli Ma'lumot Yaratish Qo'llanmasi (Bulk Data Generation)

Ushbu skill 100+ elementdan iborat ma'lumotlar bazasini **xatosiz, to'liq va tekshirilgan holda** yaratish uchun qat'iy qo'llanma hisoblanadi.

## ⚠️ Asosiy Muammo

Kichik modellar (Flash) katta ro'yxat yaratishda **"dangasalik"** qiladi — 500 ta kerak bo'lsa 60 ta yozib "tayyor" deb xabar beradi. Bu qo'llanma shu muammoni **tizimli hal qiladi**.

---

## 🔒 Qat'iy Qoidalar

### 1-Qoida: Guruhlar Bo'yicha Yozish (Max 25 per batch)
- Bitta operatsiyada (bitta `write_to_file` yoki `replace_file_content`) **25 dan ortiq element yozma**.
- Har bir guruhdan keyin **audit buyrug'i** ishga tushir.
- Agar maqsadga yetmagan bo'lsa, keyingi guruhni yoz.

### 2-Qoida: Raqamli Mezon (Numeric Checkpoint)
- Har bir guruhdan keyin quyidagi formatda audit natijasini konsolga chiqar:
  ```
  ✅ Guruh 3 tayyor: 75/200 model (37.5%)
  ⏳ Qolgan: 125 ta model kerak
  ```
- Bu raqam rejadagi maqsadga yetmaguncha **DAVOM ET**.

### 3-Qoida: Commit Faqat Maqsadda
- Commit qilish faqat **barcha mezonlar bajarilganda** ruxsat etiladi.
- Mezon: `node scripts/validate_vehicle_db.mjs` → `✅ BARCHA TEKSHIRUVLAR O'TDI`

### 4-Qoida: Copy-Paste Taqiqi
- Elementlarni boshqasidan nusxa olib faqat nomini o'zgartirish TAQIQLANADI.
- Har bir elementning `id`, `model`, `modelJa`, `year`, `specs` maydoni **noyob** bo'lishi kerak.

---

## 📋 Amaliy Namuna: 200 ta Yapon Avtomobil Modeli

### Umumiy maqsad: 200 ta model, 15 brend, har birida kamida 5 ta

**1-Iteratsiya: Toyota (maqsad: 25 ta)**
```
Guruh 1a: 13 ta modern model (HiAce, Harrier, Alphard, Land Cruiser, Camry, Prius, Crown, ProBox, RAV4, Corolla, Yaris, Sienta, Voxy)
→ Audit: "Toyota: 13/25"

Guruh 1b: 8 ta JDM golden model (Supra JZA80, AE86, Chaser JZX100, MR2 SW20, Soarer, Mark II, Aristo, Altezza)
→ Audit: "Toyota: 21/25"

Guruh 1c: 4 ta classic model (2000GT, Celica TA22, Sports 800, TE27 Levin)
→ Audit: "Toyota: 25/25 ✅"
```

**2-Iteratsiya: Nissan (maqsad: 20 ta)**
```
... shu tartibda davom etadi ...
```

### Audit Buyruqlari (Har bir guruhdan keyin ishga tushir)

```bash
# Brend bo'yicha sanash
node -e "
import {MASTER_VEHICLE_DATABASE} from './src/data/japaneseVehiclesMaster.js';
const counts = {};
MASTER_VEHICLE_DATABASE.forEach(v => counts[v.make] = (counts[v.make]||0)+1);
console.log('Jami:', MASTER_VEHICLE_DATABASE.length, 'model');
Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(' ', k+':', v));
"
```

```bash
# Validatsiya skripti
node scripts/validate_vehicle_db.mjs
```

---

## ✅ Yakuniy Tekshiruv Ro'yxati (Final Checklist)

Commit qilishdan oldin quyidagilarning BARCHASI bajarilgan bo'lishi kerak:

- [ ] `node scripts/validate_vehicle_db.mjs` → `✅ BARCHA TEKSHIRUVLAR O'TDI`
- [ ] Har bir brend kamida 2+ model (0 model brend YO'Q)
- [ ] Jami modellar soni rejadagi maqsadga yetgan
- [ ] `npm test` → barcha testlar o'tgan
- [ ] Yangi modullar uchun test fayllari mavjud
- [ ] Noto'g'ri rasm (sedan rasmi yuk mashinada) YO'Q

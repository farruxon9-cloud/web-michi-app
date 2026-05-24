# Michi App Design & Architecture Memory

Ushbu hujjat sun'iy intellekt agenti tomonidan kelajakda Michi ilovasi ustida ishlaganda uning funksiyalari, dizayni, va eng muhim jihatlarini eslab qolish uchun yozilgan xotira (memory) faylidir. Ilova React va Vite orqali qurilgan mobil (PWA) dizaynga moslashtirilgan veb-ilovadir.

## 1. Asosiy Dizayn va Fon Ranglari (Premium iOS Design)
Ilovaning asosiy dizayn kontseptsiyasi Apple iOS tizimining premium, shisha (glassmorphism) effektlari va sodda yorug'liklariga asoslangan.

- **Asosiy Fon (Background)**:
  - `light-mode` da: `--bg-color: #EEF0F9;` (Asosiy tana) va `--bg-color: #e5eafc;` (root). Bu biroz moviy-kulrang, ko'zga tashlanmaydigan juda yumshoq va premium rang (iOS premium foni).
  - `dark-mode` da: `--bg-color: #050510;` (Qop-qora emas, juda to'q ko'k-qora premium rang).
  
- **Card va Glass (Shisha) Effektlari**:
  - Kartochkalar (Jobs, Academies): `--card-bg: rgba(255, 255, 255, 0.6);` (Yarim shaffof oq rang).
  - Shisha fonlar: `--glass-bg: rgba(255, 255, 255, 0.45);` fonini xiralashtiruvchi `backdrop-filter: blur(16px);` effekti bilan ishlatiladi. Bu iOS dagi kabi "blur" orqa fonni beradi.

- **Tugmalar (Buttons)**:
  - Asosiy (Primary) tugmalar: Binafsharang/Ko'k rang (Michi Premium Indigo: `--primary: #5A55EA;`).
  - Ishga topshirish tugmalari: To'q kulrang (Apple dark gray: `#2C2C2E`), faol holatda yashil.
  - Yumaloq (Squircle) shakllar: `border-radius: 16px` va `24px` orqali silliq qirralar hosil qilingan.

## 2. Layout va Chegaralar (App Container)
Mobil ko'rinishga mos bo'lishi uchun, ilova kompyuter ekranida ham markazda joylashgan "telefon shaklidagi" konteynerda namoyish etiladi:
- `.app-container`: Kengligi maksimal 480px, bo'yi 100vh. Barcha tarkib shu chegaraning ichida bo'lishi shart!
- Elementlar ekrandan chiqib ketmasligi uchun (ayniqsa fixed pozitsiyali konteynerlar, masalan JobDetail) `position: absolute;` orqali shu `.app-container` ga bog'langan (cheklangan). `position: fixed` ilovadan tashqariga, kompyuter ekraniga yoyilib ketishiga sabab bo'lishi mumkinligi uchun ehtiyotkorlik bilan faqat ichki elementlarga ishlatilgan.

## 3. Asosiy Bo'limlar va Ularning Vazifalari

### A. Asosiy Header va Bottom Nav (Pin qilingan)
- **Global Header**: Eng tepada joylashgan (Michi logosi, foydalanuvchi ismi, avatar). Har doim ko'rinib (sticky) turadi. Z-index: 100.
- **Bottom Navigation**: Eng pastdagi 4 ta tugmacha (Asosiy, Avtomaktablar, Servis, Profil). Har doim qotirilgan (fixed at bottom). Z-index: 100. Har qanday fon ustida ko'rinishi uchun yorug'lik effektlarisiz tekis qalin rang qilingan.

### B. Asosiy (DriverFeed / CompanyHome)
- **Foydalanuvchi (Haydovchi)** uchun ish e'lonlari ro'yxatini chiqarib beradi. Har bir e'lon rasmi, maoshi, nomi, va joylashuvidan iborat. E'lon rasmlari standart 140px balandlikda (`.job-image-container`).
- **Kompaniya** roli uchun `CompanyHome.jsx` ishlaydi. U erda "Yangi e'lon qo'shish" oynasi va o'zining joylagan e'lonlari ro'yxati (Tahrirlash tugmasi bilan) chiqadi. 

### C. Avtomaktablar (DrivingAcademy)
- Yaponiyadagi avtomaktablar ro'yxati. Ularning rasmi, kurs turlari va tillari ko'rsatiladi.

### D. Batafsil Sahifalar (JobDetail va Academy Detail)
Ushbu sahifalar e'lonlar ustiga bosilganda ochiladi. Ular ustki header va pastki nav-bar o'rtasida to'liq ekranni qoplaydi.
- **Tuzilishi**:
  - `job-detail-container` (va academy container): `position: absolute; top: 64px; bottom: 84px;` orqali header va bottom nav o'rtasiga joylashtirilgan.
  - Orqaga qaytish tugmasi: `position: absolute` orqali tepaga joylashtirilgan (scroll qilinganda tepaga qarab yo'qolib ketadi).
  - Barcha harakat tugmalari (Ariza topshirish, Qo'ng'iroq qilish, Shoukai) eng pastki qismda `padding-bottom: 84px` bilan oddiy (static/relative) qilib joylashtirilgan. Bu pin qilinmaganligini va faqat sahifa eng oxiriga tushganda nav-bar ustida ko'rinishini ta'minlaydi.

## 4. Muhim Tugmalar
1. **Ariza topshirish (Apply)**: Oddiy holatda qora, bosilganda (applied) iOS yashil rangida tasdiq (CheckCircle) belgisi bilan chiqadi.
2. **Qo'ng'iroq qilish (Call)**: Yashil hoshiya va yozuv (`#34C759`).
3. **Shoukai (Tavsiya qilish)**: Sariq-yashil yoxud zarg'aldoq (`#FF9F0A` / `#2e7d32`) hoshiyali, ichida ulush summasi yozilgan maxsus ulashish tizimi tugmasi.

Ushbu xotira keyingi qadamlarda kiritiladigan o'zgartirishlar arxitekturani buzmog'ligi va tizim falsafasi saqlanib qolinishi uchun yozib olingan.

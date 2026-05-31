# 🚚 MICHI APP — Premium Ish Qidirish va Avtomaktab Ilovasi

Michi App — Yaponiyada istiqomat qiluvchi chet elliklar va mahalliy haydovchilar uchun mo'ljallangan, professional, ko'p tilli (Uzbek, Japanese, English) ish e'lonlari hamda avtomaktablar katalogidir. Ilova dizayni **goo-net.com** premium uslubida horizontal kartochkalar va zamonaviy **Bento Dashboard** batafsil ma'lumotlar paneliga ega.

---

## 💻 Boshqa kompyuterda loyihani qayta tiklash va ishga tushirish (Setup & Restore Guide)

Loyiha boshqa kompyuterga o'tkazilganda uni tez va xatosiz ishga tushirish uchun quyidagi ketma-ketlikni bajaring:

### 1-Qadam: Node.js o'rnatish
Kompyuterda Node.js o'rnatilganligiga ishonch hosil qiling. 
* Agar o'rnatilmagan bo'lsa, [Node.js rasmiy saytidan (LTS versiyasini)](https://nodejs.org/) yuklab oling va o'rnating.
* Terminalda tekshirish buyrug'i:
  ```bash
  node -v
  npm -v
  ```

### 2-Qadam: Loyiha papkasiga kirish
Terminal (yoki VS Code o'rnatilgan bo'lsa, VS Code Terminalini) ochib, loyiha joylashgan papkaga kiring:
```bash
cd "papka_nomi/michi-app-updated"
```

### 3-Qadam: Bog'liqliklar (Dependencies) o'rnatish
Loyihaga zarur bo'lgan barcha kutubxonalarni (`lucide-react`, `i18next`, va boshqalar) bir zumda avtomatik o'rnatish buyrug'ini ishga tushiring:
```bash
npm install
```
*Agar Windows kompyuteringizda PowerShell skriptlarni bloklasa (`UnauthorizedAccess` xatoligi bersa), standard buyruqlar satri (Command Prompt - cmd.exe) orqali bajaring:*
```cmd
cmd.exe /c "npm install"
```

### 4-Qadam: Dasturni ishga tushirish (Dev Server)
Ilovani brauzerda ochish va kodlarni jonli test qilish uchun:
```bash
npm run dev
```
*Yoki cmd orqali:*
```cmd
cmd.exe /c "npm run dev"
```
Ishga tushgach, brauzeringizda **http://localhost:5173/** manzilini oching.

### 5-Qadam: Production Build yaratish (Ixtiyoriy)
Ilovani to'liq optimallashgan ishlab chiqarish holatiga keltirish va minifikasiya qilingan statik fayllarni hosil qilish uchun:
```bash
npm run build
```
*Yoki cmd orqali:*
```cmd
cmd.exe /c "npm run build"
```
Fayllar loyihaning `/dist` papkasida hosil bo'ladi.

---

## 🪵 Git Branchlar va Kodlarni Boshqarish

Ushbu loyihada siz yaratgan barcha o'zgarishlar **`main`** va **`c`** branchlarida to'liq birlashtirilgan. 

* Hozirgi holatni ko'rish buyrug'i:
  ```bash
  git branch
  ```
* Boshqa branchga o'tish buyrug'i (masalan, `c` branchiga):
  ```bash
  git checkout c
  ```
* Asosiy `main` branchga o'tish buyrug'i:
  ```bash
  git checkout main
  ```

---

## 🛠 Batafsil izohlar va Kodlar strukturasi (Comments & Code Guide)

Loyihaning barcha muhim fayllari mukammal, o'zbek tilidagi batafsil izohlar (comments) bilan boyitilgan:

1. **`src/components/DriverFeed.jsx`**:
   * *Goo-net uslubidagi horizontal ish e'lonlari.* 
   * Fayl boshida `MOCK_JOBS` massividagi Yaponiyadagi haydovchilar uchun zarur bo'lgan barcha mukammal xususiyatlar (salary, bonus, insurance, foreigners, housing, license) batafsil izohlangan.
2. **`src/components/DrivingAcademy.jsx`**:
   * *Avtomaktablar ro'yxati va batafsil sahifasi.*
   * Maktablarning horizontal layouts, dars tillari badge'lari, narx chegirmalari va do'stni taklif qilish (`Shoukai`) tizimi to'liq izohlar bilan tushuntirilgan.
3. **`src/components/JobDetail.jsx`**:
   * *Premium Bento-Dashboard layouts.*
   * Maosh Feature Card, Ish tartibi Bento guruhi, Imtiyozlar va Talablar dashboard list ro'yxatlari qanday bog'langani va tillar moslashuvchanligi izohlarda batafsil yozilgan.
4. **`src/i18n.js`**:
   * *Ko'p tilli tarjimalar tizimi (UZ/JA/EN).*
   * Yangi qo'shilgan 25+ kalitlar va ularning tillarga moslik ko'rsatkichlari izohlar bilan belgilangan.

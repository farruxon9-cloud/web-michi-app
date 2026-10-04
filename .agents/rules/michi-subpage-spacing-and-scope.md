# Rule: Sub-page Spacing Clearance & Scope Isolation Master ("Learn" Record)

> [!IMPORTANT]
> **BO'LAJAK BARCHA AI AGENTLAR UCHUN QAT'IY YO'RIQNOMA**:
> Ushbu hujjat foydalanuvchi bergan aniq buyruqlar, kelib chiqqan xatoliklar hamda ularni bartaraf etish uchun o'rganilgan (`Learn`) mantiqiy qoidalarning sahifalar bo'yicha to'liq va batafsil xaritasidir. Istalgan AI agent ushbu loyihada ish boshlaganda har bir sahifa uchun nima uchun aynan shu qoida o'rnatilganini bilishi va unga 100% amal qilishi shart.

---

## 📋 1. Sahifalar Bo'yicha Foydalanuvchi Buyruqlari, Xatoliklar va Learn Qoidalari

### 🤖 1.1. `AssistHeroShowcase.jsx` (Robot Showcase AI Sahifasi)
- **Foydalanuvchi Buyrug'i**:
  > *"birinchi rasmdagi ortga qaytish tugmasini ikkinchi rasmdagidek ko`rinishda qilib aynan uning tugan joyida turadigan tursin. roborcha bor sahifadagi ortga qaytish tugma biz yaratgan qoidalarimizdagidek ko`rinmayabdi. uni qolgan joylardagidek ko`rinishda qilib ber iltimos."*
- **Yuzaga Kelgan Xatolik**:
  `AssistHeroShowcase.jsx` robot AI sahifasidagi Orqaga qaytish tugmasi (`ArrowLeft`) oddiy flow ichida berilgan edi va `assist-social-badge` belgisi unga taqalib (`marginLeft: 52px`), boshqa sub-sahifalardagi (`プラットフォームについて` / `Settings` / `CompanyHome`) standart sticky pinned tugmaga va markazlashgan sarlavha dizayniga mos kelmayotgan edi.
- **Learn Qoidasi va Yechimi**:
  1. `AssistHeroShowcase.jsx` Orqaga qaytish tugmasi **1:1 standart sticky pinned dock** ga o'tkazildi:
     ```jsx
     <div style={{
       position: 'sticky', top: 0, left: 0, zIndex: 300,
       pointerEvents: 'none', marginBottom: '-40px', display: 'flex',
       alignItems: 'center', height: '40px', width: '40px'
     }}>
       <button type="button" onClick={onBack} style={{
         pointerEvents: 'auto', width: '40px', height: '40px', borderRadius: '50%',
         border: '1px solid var(--glass-border)', background: 'var(--card-bg)',
         backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
         color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
         boxShadow: '0 4px 14px rgba(0,0,0,0.1)', flexShrink: 0
       }}>
         <ArrowLeft size={18} />
       </button>
     </div>
     ```
  2. `assist-social-badge` ijtimoiy belgisi konteyner markaziga joylashtirildi (`margin: '0 auto 14px auto', alignSelf: 'center'`). Natijada robot sahifasi va barcha sub-sahifalar tugmasi bir xil 1:1 piksel-aniqlikda joylashadi.

---

### 📄 1.2. `プラットフォームについて` (Platforma Haqida / `activePage === 'about'`)
- **Foydalanuvchi Buyrug'i**:
  > *"プラットフォームについて sahifasidagi eng oxirgi konteyner pastki menyudan orasini ochib eng oxirgi yozuv bilan pastki menyuning orasini 12 px qilib ber. qolgan joylarda o`zgarish bo`lmasin. faqat shu yerni iltimos."*
- **Yuzaga Kelgan Xatolik**:
  `プラットフォームについて` sahifasi scroll qilinganda, mualliflik huquqi matni (`© 2026 Michi. All rights reserved.`) suzuvchi `BottomNav` menyusining ostiga kirib qolar edi.
- **Learn Qoidasi va Yechimi**:
  `activePage === 'about'` sahifasida mualliflik huquqi matnidan so'ng darhol **`86px`** trailing clearance spacer o'rnatilishi shart.

---

### ⚙️ 1.3. `Sozlamalar` (Settings / `activePage === 'settings'`)
- **Foydalanuvchi Buyrug'i**:
  > *"sozlamalarga kirganimda shu holat bo`lib qoldi. sozlamalarda sahifasining scroli ishlamayabdi ishlaganda ham doimgidek pastki menyudan 12 px masofada qotadigan bo`lsin. Bildirishnoma ovozlari va Profil sanoqlari ko'rinishi tugmalari ishlamayabdi."*
- **Yuzaga Kelgan Xatoliklar**:
  1. `.profile-container` klassida `overflow-y: auto` yo'qligi sababli sozlamalar sahifasi scroll bo'lmay qotib qolgan edi.
  2. Pastki sozlamalar elementi `BottomNav` ortida yashirinib qolayotgan edi.
  3. Toggle'lar bosilganda callback prop bo'lmagani sababli `TypeError: fn is not a function` xatoligi berayotgan edi.
- **Learn Qoidasi va Yechimi**:
  1. `.profile-container` klassiga `overflow-y: auto; -webkit-overflow-scrolling: touch;` qo'shildi.
  2. `activePage === 'settings'` trailing spacer o'lchami **`86px`** ga sozlandi.
  3. Safe default fallback parametrlar (`onLogout = () => {}`) va `localStorage` bilan ishlaydigan `useState` local fallbacklar joriy etildi.

---

### 🏢 1.4. `会社情報` (Kompaniya Ma'lumotlari / `activePage === 'personalInfo'`)
- **Foydalanuvchi Buyrug'i**:
  > *"会社情報 oxirgi konteynerni pastki menyudagi oraliq masofasini qoidalarimizdagidek qilib ber. 82 px qilamiz."*
- **Learn Qoidasi va Yechimi**:
  `activePage === 'personalInfo'` sahifasi konteyneri ostiga darhol **`82px`** trailing clearance spacer o'rnatildi.

---

### 📨 1.5. `受信した応募` va `紹介経由の応募` (Kelgan Arizalar & Tavsiya Arizalari)
- **Foydalanuvchi Buyrug'i**:
  > *"受信した応募, 紹介経由の応募, マイ掲載一覧. bu sahifalarni ham tekshirib chiq. ulardagi qoidalarni ham mosligini tahlil qil."*
- **Learn Qoidasi va Yechimi**:
  `applications` va `my_shoukai` sahifalarida trailing clearance spacer **`86px`** qilib belgilandi.

---

### 📋 1.6. `マイ掲載一覧` (Mening E'lonlarim Ro'yxati / `CompanyHome.jsx`)
- **Foydalanuvchi Buyrug'i**:
  > *"マイ掲載一覧 sahifasining eng oxirgi konteyneri va e`lon qo`shish tugmalarining pastki qismiga pastki menyu bilan orasini ochish uchun 12 px qqo`shamiz."*
- **Learn Qoidasi va Yechimi**:
  `CompanyHome.jsx` faylidagi barcha pastki bo'shliq spacer'lari `64px` dan **`76px`** ga (+12px) oshirildi.

---

### 🔍 1.7. Ish E'lonlari va Avtomaktablar Qidiruv Filtri (`DriverFeed.jsx` & `DrivingAcademy.jsx` Filter Drawers)
- **Foydalanuvchi Buyrug'i**:
  > *"ish e`lonlari filtr qismining ham qidiruv tugmasini va eng oxirgi konteynerning orasini 12 qilishimiz uchun ular orasiga biroz qo`shimcha masofa kerak ekan. ular bir biriga tegib qolmoqda."*
- **Learn Qoidasi va Yechimi**:
  `DriverFeed.jsx` va `DrivingAcademy.jsx` filtr sahifalaridagi trailing spacer balandligi `140px` dan **`160px`** ga oshirildi.

---

### 🏠 1.8. Asosiy Tablar (`Dashboard`, `DriverFeed`, `DrivingAcademy`)
- **Learn Qoidasi va Yechimi**:
  Asosiy tab konteynerlarida trailing spacer o'lchami **`92px`** qilib belgilandi.

---

### 🎙️ 1.9. Voice Assistant & STT Status Multilingual Localization (`VoiceAssistant.jsx` & `MichiDrawerHeader.jsx`)
- **Foydalanuvchi Buyrug'i**:
  > *"yapon tili tanlanganda yaponcha yozuvlar ko`rinsin"*
- **Yuzaga Kelgan Xatolik**:
  STT holati `listening` yoki `thinking` bo'lganda, `speechLang` yaponcha (`ja`) qilib tanlangan bo'lsa ham status text fallback sifatida o'zbekcha (`Tinglanmoqda... (Ovozingizni ayting)`) bo'lib ko'rinayotgan edi.
- **Learn Qoidasi va Yechimi**:
  1. `VoiceAssistant.jsx` va `MichiDrawerHeader.jsx` holat matnlarini har doim `speechLang` parametriga qarab chiqarishi shart:
     - `ja`: `聞き取り中... (音声で話しかけてください)` / `考え中...` / `準備完了`
     - `uz`: `Tinglanmoqda... (Ovozingizni ayting)` / `O'ylamoqda...` / `Tayyor`
     - `en`: `Listening... (Speak now)` / `Thinking...` / `Ready`
  2. `i18n.language` o'zgarganda foydalanuvchi alohida saqlamagan bo'lsa `speechLang` avtomatik ilova tili bilan sinxronlashadi.

---

### ⏱️ 1.10. Dynamic Reading Timer, No TTS Audio & AI Hub Chat History Rule (`VoiceAssistant.jsx`)
- **Foydalanuvchi Buyrug'i**:
  > *"shu savol va javoblar konteynerchasi vaqt rejmida ishlasin uzun textli savollar va uzun javoblar bo`lsa shunga mos sekinroq o`qiydigan odamlarning javoblarini o`qib tugatishi darajasida vaqtdan keyin avtomatik yo`qolsin. ai hub sahifasida esa saqlanadi uni hoxlagan vaqti ko`rsa bo`ladi. o`chirib tashlash ham shu shahifada bo`ladi. ai javoblarni o`qib bermasin faqat teks orqali javob beramiz."*
- **Learn Qoidasi va Yechimi**:
  1. **Ovozli (TTS Audio) Ijro Etish O'chirildi**: AI javoblari audio ovoz orqali o'qib berilmaydi (`window.speechSynthesis` ovozli o'qishi o'chirildi, faqat matn ko'rsatiladi).
  2. **Sekin O'qiydiganlar Uchun Dynamic Timer**: `calculateReadingDuration(questionText, answerText, speechLang)` har bir belgiga ~120ms (ja) yoki ~100ms (uz/en) + 5000ms baza beradi (minimum 8s, maksimum 40s). Progress bar timer tugagach top-right pufakcha avtomatik yo'qoladi.
  3. **AI Hub Chat Tarixi**: Barcha savol va javoblar Michi AI Hub (Side Drawer) bo'limida IndexedDB da doimiy saqlanadi. Foydalanuvchi xohlagan payti tarixni ko'rishi hamda "Tarixni tozalash" tugmasi orqali o'chirib tashlashi mumkin.

---

### ✈️ 1.11. Explicit Send Button Click Protocol for Michi AI API Queries (`VoiceAssistant.jsx`)
- **Foydalanuvchi Buyrug'i**:
  > *"endi hamma joyda textlarni yozadi. jo`natish tugmasini bosgandan keyingina api michi jp netga savollarni yuboradigan qilamiz. shunda hamma har xil tushinarsiz gaplarni ai orqali qidiruv qilishga to`g`ri kelmaydi va bu foydalanuvchilarning aniq savollariga aniq javoblar beradigan bo`ladi."*
- **Learn Qoidasi va Yechimi**:
  1. STT (`localSTT`) gapirilgan barcha gaplarni matn maydonlariga (`drawerInput` va `transcript`) real vaqt rejimida yozib beradi.
  2. Nutq tugaganda API (`michiApiService.sendChatMessage`) ga avtomatik so'rov yuborish butunlay to'xtatildi (`handleSendText` avto-chaqirig'i olib tashlandi).
  3. Foydalanuvchi yozilgan matnni ko'rib, kerak bo'lsa tahrirlab, **"Jo'natish" (`Send` / `送信`)** tugmasini bosgandagina API ga so'rov yuboriladi.

---

### 🎨 1.12. Premium Glass-Gradient User & AI Avatar Icons (`VoiceAssistant.jsx` & `VoiceAssistant.css`)
- **Foydalanuvchi Buyrug'i**:
  > *"savol bergan foydalanuvchining iconkisi va ai ning iconkisi zamonaviy va profesional premium ko`rinishda qilib ber iltimos."*
- **Learn Qoidasi va Yechimi**:
  1. Oddiy 6px nuqtachalar (`.bubble-dot`) o'rniga **22px x 22px 3D Glass-Gradient Avatar Belgilari (`.bubble-avatar`)** joriy etildi:
     - **Foydalanuvchi (`.user-avatar`)**: Iliq to'q sariq gradient (`#FF9500` -> `#FF5E00`), oq foydalanuvchi silueti (`<User size={12} color="#FFF" />`) hamda oyna chegarali soya (`box-shadow: 0 3px 10px rgba(255, 149, 0, 0.38)`).
     - **Michi AI (`.ai-avatar`)**: Cyberpunk ultra-premium gradient (`#6366F1` -> `#8B5CF6` -> `#EC4899`), oq robot belgisi (`<Bot size={12} color="#FFF" />`) va neon nurlanish.
     - **Eshitish (`.listening-avatar`)**: Zumrad yashil gradient (`#10B981` -> `#059669`), mikrafon belgisi (`<Mic size={12} />`) va breathing pulse.
     - **O'ylash (`.thinking-avatar`)**: Ultramarin ko'k gradient (`#3B82F6` -> `#1D4ED8`), porloq yulduzcha (`<Sparkles size={12} />`) va 360-darajali tekis rotatsiya.

---

### 🔀 1.13. On-Demand Branch Merge Protocol (Strict Explicit User Command Only)
- **Foydalanuvchi Buyrug'i**:
  > *"endi merge qilish haqida alohida bir donagina aytaman qolgan marta qilma iltimos."*
- **Learn Qoidasi va Yechimi**:
  1. AI Agentlar har bir bajarilgan topshiriqdan so'ng **avtomatik ravishda boshqa branchlarga (`start-1.0`, `start-1.0a`, `b`, `web`, va h.k.) merge bajarishi QAT'IYAN TAQIQLANADI**.
  2. Barcha ishlar faqat va faqat **`web-1`** branchida olib boriladi va saqlanadi.
  3. Branchlarni alohida merge qilish faqat va faqat foydalanuvchi alohida xabarda **aniq "merge qilib ber"** deb buyruq bergandagina amalga oshiriladi.

---

### 🚛 1.14. Jobs Central API Service Protocol (`michiJobsApiService.js`)
- **Foydalanuvchi Buyrug'i**:
  > *"Base API URL: https://api.michi.jp.net, Headers: Content-Type: application/json, Accept: application/json. GET /api/jobs (?prefecture=Tokyo&license=oogata&minSalary=350000&q=Sagawa), POST /api/jobs, GET /api/jobs/:id"*
- **Learn Qoidasi va Yechimi**:
  1. `michiJobsApiService.js` xizmati `https://api.michi.jp.net` serveriga `Content-Type: application/json` va `Accept: application/json` sarlavhalari bilan ulangan.
  2. `POST /api/jobs` e'loni serverga yuborilishidan oldin FAZA 1 dagi `validateJobPayload` middleware validatsiyasidan o'tkazilib, faqat to'g'ri e mekin e'lonlar yuboriladi. Noto'g'ri e'londa `400 Bad Request` xatoligi qaytariladi.
  3. `GET /api/jobs` uchun `buildJobsQueryUrl` yordamida `prefecture`, `license`, `minSalary` hamda `q` parametrlari to'g'ri qidiruv qatoriga o'giriladi.

---

### 📄 1.15. `履歴書` Rezyume Builder (`ResumeBuilder.jsx` / `activePage === 'resume_builder'`)
- **Foydalanuvchi Buyrug'i**:
  > *"rezyumeni yuklab olish va yoki ko`rish tugmalari pastki menyuning tagida qolib ketmoqda. scroll qilinganda qoida va sandartlarimizdagidek 12 px oraqli masofada to`xtash kerak edi."*
- **Yuzaga Kelgan Xatolik**:
  `ResumeBuilder.jsx` oxirida trailing spacer yo'q edi, shuning uchun `PDFダウンロード` / `別タブで表示` tugmalari bor oxirgi `.step-content` kartasi scroll oxirida `BottomNav` ostiga 60px kirib qolardi.
- **Learn Qoidasi va Yechimi**:
  1. `.resume-builder-container` ichida, `.resume-builder-body` dan keyin **`72px`** trailing clearance spacer o'rnatildi (konteynerning o'z `padding: 12px` i bilan birga).
  2. Playwright o'lchovi (oxirgi karta pastki cheti → `.bottom-nav` yuqori cheti): 390px va 1024px da **12px**, 320px da 18px.
  3. Spacer qiymatini taxmin qilmasdan, avval haqiqiy masofani o'lchab, keyin `spacer = joriy spacer + (12 - o'lchangan gap)` formulasi bilan hisoblash shart.

---

## 🛠️ 2. Bo'lajak AI Agentlar Uchun Qat'iy Ishlash Protokoli (`Agent Execution Checklist`)

Har bir AI agent loyihada topshiriq bajarayotganda quyidagi ketma-ketlikni ko'r-ko'rona buzmasdan bajarishi shart:

1. **Targeted Scope Rule**: Faqat foydalanuvchi so'ragan sahifa/komponent stilini o'zgartirish. Global `index.css` yoki boshqa sahifalarning CSS fayllariga tegish Taqiqlanadi.
2. **Standard Back Button Dock Rule**: Barcha sub-sahifalar va modallardagi Orqaga qaytish tugmasi yuqoridagi 1:1 sticky container (`40px x 40px`, `borderRadius: 50%`, `backdropFilter: blur(20px)`, `boxShadow: 0 4px 14px rgba(0,0,0,0.1)`) standartida bo'lishi shart.
3. **Clearance Math Rule**: Har bir masofa o'zgarganda `BottomNav` (76px balandlik) hamda fixed tugmalar balandligiga **12px visual gap** qo'shib spacer balandligini hisoblash.
4. **Defensive Code Standard**: Har bir prop uchun safe default fallback funksiyalar va `localStorage` fallbacklar qo mekin.
5. **Unit Test Verification**: Har bir o'zgarishdan so'ng `npm test -- --run` komandasini yurgizib, barcha vitest testlari 100% PASS berishini tekshirish (yoki `npm run check`).
6. **Learn Record & Map Persistence**: Yangi o'rganilgan qoidani ushbu faylga (`.agents/rules/michi-subpage-spacing-and-scope.md`), [AGENTS.md](file:///Users/kanoatovfarrux/michiappforjapan/AGENTS.md), [GEMINI.md](file:///Users/kanoatovfarrux/michiappforjapan/GEMINI.md) hamda [codebase_map.md](file:///Users/kanoatovfarrux/michiappforjapan/codebase_map.md) fayllariga yozib saqlash.
7. **Explicit Merge Command Protocol**: Barcha ishlar va commitlar faqat `web-1` branchida bajariladi. Foydalanuvchi alohida va aniq "merge qilib ber" deb so'ramaguncha boshqa branchlarga (`start-1.0`, `b`, `web`...) avtomatik merge qilish QAT'IYAN TAQIQLANADI!

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

## 🛠️ 2. Bo'lajak AI Agentlar Uchun Qat'iy Ishlash Protokoli (`Agent Execution Checklist`)

Har bir AI agent loyihada topshiriq bajarayotganda quyidagi ketma-ketlikni ko'r-ko'rona buzmasdan bajarishi shart:

1. **Targeted Scope Rule**: Faqat foydalanuvchi so'ragan sahifa/komponent stilini o'zgartirish. Global `index.css` yoki boshqa sahifalarning CSS fayllariga tegish Taqiqlanadi.
2. **Standard Back Button Dock Rule**: Barcha sub-sahifalar va modallardagi Orqaga qaytish tugmasi yuqoridagi 1:1 sticky container (`40px x 40px`, `borderRadius: 50%`, `backdropFilter: blur(20px)`, `boxShadow: 0 4px 14px rgba(0,0,0,0.1)`) standartida bo'lishi shart.
3. **Clearance Math Rule**: Har bir masofa o'zgarganda `BottomNav` (76px balandlik) hamda fixed tugmalar balandligiga **12px visual gap** qo'shib spacer balandligini hisoblash.
4. **Defensive Code Standard**: Har bir prop uchun safe default fallback funksiyalar va `localStorage` fallbacklar qo mekin.
5. **Unit Test Verification**: Har bir o'zgarishdan so'ng `npm test -- --run` komandasini yurgizib, barcha 90/90 vitest testlari 100% PASS berishini tekshirish.
6. **Learn Record & Map Persistence**: Yangi o'rganilgan qoidani ushbu faylga (`.agents/rules/michi-subpage-spacing-and-scope.md`), [AGENTS.md](file:///Users/kanoatovfarrux/michiappforjapan/AGENTS.md), [GEMINI.md](file:///Users/kanoatovfarrux/michiappforjapan/GEMINI.md) hamda [codebase_map.md](file:///Users/kanoatovfarrux/michiappforjapan/codebase_map.md) fayllariga yozib saqlash.

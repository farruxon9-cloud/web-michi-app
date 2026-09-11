# Page Specification Rule: Applications Sub-page (`Profile.jsx` -> `applications`)

Ushbu qoida **Arizalar va Murojaatlar (`applications` / `受信した応募`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Header & Back Button Geometry (Rule 70)
- **Sub-page Header**: `<div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>`
- **Back Button Clearance**: Ortga qaytish tugmasi ($\leftarrow$, top: 16px, height: 40px -> bottom edge: 56px) va sarlavha (`受信した応募`) matni o'rtasida strictly **5 px toza oraliq** ($56\text{px} + 5\text{px} = 61\text{px}$) ta'minlanadi. Tugma sarlavhaga TEGMAYDI.
- **Funnel Filter Container Top Margin**: `<div style={{ margin: '7px 16px 8px 16px' }}>` sarlavhadan pastga qo'shimcha **5 px** ochilib turadi.

---

## 🎯 2. Candidate Card & Inter-Container Spacing (Rule 69)
- **2-Row Responsive Grid Funnel Filters**: `新規応募`, `選考・面接`, `採用決定` (top row: `repeat(3, 1fr)`), `不採用`, `全件` (bottom row).
- **Candidate Card Padding**: `padding: 10px 14px; border-radius: 16px;`
- **Inter-Container Gap**: 1-konteyner va 2-konteyner (barcha kartochkalar) o'rtasidagi masofa strictly **`12px`** (`.applications-list { gap: 12px; }`). Takroriy double marginlar taqiqlanadi.
- **Automatic HR Sync**: `採用する` tugmasi bosilganda nomzod avtomatik HR ishchilar ro'yxatiga (`companyEmployees`) qo'shiladi.
- **Trailing Clearance Spacer (Rule 68)**: `<div style={{ height: '84px', minHeight: '84px', width: '100%', flexShrink: 0, clear: 'both' }} />` ro'yxat pastida joylashadi ($84\text{px} - 84\text{px} = 0\text{px}$ — `BottomNav` yuqori chegarasi bilan roppa-rosa parallel tutashadi).

---

## 🚫 3. Forbidden Patterns
1. **No Header Overlapping**: Never set `paddingTop` less than `61px` on `sub-page-header` as it causes the floating back button to collide with title text.
2. **No Double Margin Stack**: Never add inline `marginBottom: 12px` on cards when container already has flex `gap: 12px`.

---

## 📝 4. Xatoliklar va Learn Hujjatlashtiruvi (Page Mistakes & Learn Log)
- **Xatolik**: `applications` (`受信した応募`) sahifasida ortga qaytish tugmasi sarlavha matniga minib qolishi hamda nomzodlar kartochkasi oxirida pastki `BottomNav` paneli ustida keraksiz katta bo'shliq bo'lishi.
- **Tuzatish & Learn**:
  1. `sub-page-header` ga `paddingTop: '61px'` o'rnatilib, ortga qaytish tugmasi va sarlavha o'rtasida aniq 5px toza masofa yaratildi.
  2. Pastki bo'shliq strictly `84px` trailing clearance spacer bilan `BottomNav` ga 100% tutashtirildi. Nomzod qabul qilinganda (`採用する`) avtomatik HR xodimlari ro'yxatiga o'tishi ta'minlandi.


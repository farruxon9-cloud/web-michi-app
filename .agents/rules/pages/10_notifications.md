# Page Specification Rule: Notifications Sub-page (`Profile.jsx` -> `notifications` / `通知`)

Ushbu qoida **Bildirishnomalar va Xabarlar (`notifications` / `通知`)** sub-sahifasi uchun barcha layout, saralash, filtrlash va o'chirish spetsifikatsiyalarini belgilaydi.

---

## 📐 1. Header & Action Row Geometry (Rule 70)
- **Sub-page Header**: `<div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>`
- **Back Button Clearance**: Ortga qaytish tugmasi ($\leftarrow$, top: 16px, height: 40px -> bottom edge: 56px) va sarlavha (`通知`) matni o'rtasida strictly **5 px toza oraliq** ($56\text{px} + 5\text{px} = 61\text{px}$) ta'minlanadi.
- **Top Header Action Buttons**:
  - `すべて既読` (Mark All Read) - `onMarkAllRead`
  - `すべて消去` (Clear All) - `onClearAllNotifs` bilan tasdiq oynasi.

---

## 🧭 2. Categorization Track Filter Bar (Rule 72)
- **4-Tab Grid Filter Bar**:
  - `すべて`: Barcha bildirishnomalar ro'yxati
  - `未読`: FAQAT o'qilmagan xabarlar
  - `選考`: 面接 (Suhbat) va 採用 (Qabul) bildirishnomalari
  - `報酬`: 紹介報酬 (Shoukai mukofotlari) va 社内申請 xabarlari
- **Live Count Badges**: Har bir tabda mos xabarlar soni dinamik ko'rinadi.

---

## ⏰ 3. Chronological Sorting & Single Deletion (Rule 72 Invariant)
- **Strict Chronological Order (Newest at Top, Oldest at Bottom)**:
  `[...filteredNotifs].sort((a, b) => Number(b.id) - Number(a.id))`
  Yangi kelgan bildirishnomalar doim Ro'yxat boshida (yuqorida) ko'rinadi va eskilari eng pastga qarab joylashadi.
- **Individual Delete Button (`Trash2`)**: Har bir bildirishnoma kartochkasida `onDeleteNotif(notif.id)` orqali bittadan o'chirish tugmasi joylashtiriladi.
- **Category Badge & Left Border Accent**:
  - 🟣 `面接招待`: `#AF52DE`
  - 🟢 `採用決定` / `紹介報酬`: `#34C759`
  - 🔴 `不採用`: `#FF3B30`
  - 🔵 `お知らせ`: `#0A84FF`

---

## 📐 4. Spacing & Clearance Invariants
- **Inter-Container Gap (Rule 69)**: `.notif-list { gap: 12px; }` — Kartochkalar o'rtasida strictly **12 px** masofa bo'ladi.
- **Trailing Clearance Spacer (Rule 68)**: `<div style={{ height: '84px', minHeight: '84px', width: '100%', flexShrink: 0, clear: 'both' }} />` ro'yxat pastida joylashadi (`BottomNav` bilan parallel 0 px tutashadi).

---

## 🚫 5. Forbidden Patterns
1. **No Reversed Chrono Order**: Never display older notifications at the top; newest notifications MUST always sit at the top.
2. **No Double Spacing Overlap**: Never add inline `marginBottom` on notification cards when container already uses flex `gap: 12px`.

---

## 📝 6. Xatoliklar va Learn Hujjatlashtiruvi (Page Mistakes & Learn Log)
- **Xatolik**: Bildirishnomalar sahifasida (`notifications` / `通知`) bildirishnomalar tartibsiz ko'rinishi, eng yangi xabarlar tepada turmasligi, turiga qarab filtrlash yetishmasligi hamda xabarlarni bittadan va to'liq o'chirish imkoniyatining yo'qligi.
- **Tuzatish & Learn**:
  1. Bildirishnomalar strictly `[...filteredNotifs].sort((a, b) => Number(b.id) - Number(a.id))` xronologik tartibida saralandi (eng yangisi tepada, eskisi pastda).
  2. 4 qismli segmentli trek paneli (`すべて`, `未読`, `選考`, `報酬`) hamda har bir xabarga bittadan o'chirish (`Trash2`) va sarlavhaga to'liq o'chirish (`すべて消去`) tugmasi qo'shildi.
  3. `sub-page-header` ga `paddingTop: '61px'` va pastki `84px` clearance spacer o'rnatildi.


# Page Specification Rule: Applications Sub-page (`Profile.jsx` -> `applications`)

Ushbu qoida **Arizalar va Murojaatlar (`applications`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 96px;`

---

## 🎯 2. Candidate Card & Status Spec Invariants
- **Candidate Card Padding**: `padding: 14px; margin-bottom: 12px; border-radius: 16px;`
- **Status Pills**:
  - `statusSubmitted`: Grey/Blue badge (`提出済み` / `Topshirildi`)
  - `statusReviewing`: Amber/Yellow badge (`審査中` / `Ko'rib chiqilmoqda`)
  - `statusInterview`: Purple badge (`面接招待` / `Suhbatga taklif`)
  - `statusAccepted`: Green badge (`採用` / `Qabul qilindi`)
  - `statusRejected`: Red badge (`不採用` / `Rad etildi`)
- **Candidate Resume Modal / Inline Viewer**:
  - `viewResumeBtn` tugmasi orqali nomzodning to'liq ismi (`fullNameLabel`), telefoni, JLPT darajasi (`jlptVerified`), yashash manzillari tarixi va o'qish/ish tajribalari barcha 8 ta tilda vizualizatsiya qilinishi shart.
- **Company Funnel Pipeline Segmented Track Bar**: `新規応募` (New Resumes), `選考・面接` (In Review/Interview), `採用決定` (Hired), `不採用` (Rejected), `全件` (All) segmented buttons with live count badges and glowing active dot indicators.
- **Automatic HR Employee Sync**: Clicking `採用する` (`simulateAccept`) updates status to `accepted` AND automatically registers candidate into `companyEmployees` (HR Employee List) with role matching job title, instantly rendering in `employees` sub-page.
- **Trailing Clearance Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` MUST follow `.applications-list`. No matter how many application containers exist (1, 10, or 100), scrolling ALWAYS halts with exact **12px visual clearance gap (`96px - 84px = 12px`)** above `BottomNav` top edge (84px).

---

## 🚫 3. Forbidden Patterns
1. **No Mixed i18n Badges**: Status labels and resume modal titles must strictly use exact 8-language translation keys (`t('statusSubmitted')`, `t('candidateResume')`). No hardcoded Japanese or English fallback strings.

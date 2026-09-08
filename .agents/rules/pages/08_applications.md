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
- **HR Simulation Control Grid**:
  - Kompaniya HR hodimi har bir nomzod arizasining holatini real-vaqtda o'zgartira oladi (`simulateInterview`, `simulateAccept`, `simulateReject`).
- **Trailing Spacer**: `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`

---

## 🚫 3. Forbidden Patterns
1. **No Mixed i18n Badges**: Status labels and resume modal titles must strictly use exact 8-language translation keys (`t('statusSubmitted')`, `t('candidateResume')`). No hardcoded Japanese or English fallback strings.

# Page Specification Rule: Employee Management (`Profile.jsx` -> `employees`)

Ushbu qoida **Xodimlar Boshqaruvi va HR Tizimi (`従業員 (HR)`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container & Layout Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Inner List Container**: `<div className="applications-list" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>`
- **Trailing Clearance Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />`

---

## 📦 2. 2-Bento Card Structure Invariant
1. **Card 1 (`新しい従業員を追加` / Add Employee Card)**:
   - **Segmented Mode Switcher Tabs**: `[ 🆔 Michi ID Orqali ]` (Fast invite) vs `[ 📝 Qo'lda Kiritish ]` (Manual name & phone form).
   - **Glassmorphic Inputs**: Glass input wrappers with dedicated icons (`KeyRound`, `User`, `Phone`).
   - **Action CTA**: Full-width gradient button (`Send` / `Plus`).
2. **Card 2 (`すべての従業員` / Employees List Card)**:
   - **HR Filter Track Bar Invariant**: Segmented filter pills (`[ すべての従業員 ]`, `[ 確認済み ]`, `[ 承認待ち ]`).
     - **Strict 1-Row Unbroken Rendering**: Buttons and inner `<span>` elements must strictly specify `whiteSpace: 'nowrap'`, `flexShrink: 0`, and `lineHeight: '1.2'` to guarantee zero 2-line text wrapping on narrow mobile screens (`すべての従業` \n `員`).
     - **Lucide Vector Icons**: Use vector icons (`<Users />`, `<CheckCircle2 />`, `<Clock />`) with color accenting.
     - **Apple Glass Capsule Styling**: Translucent fill (`rgba(10, 132, 255, 0.14)`, `rgba(48, 209, 88, 0.14)`, `rgba(255, 159, 10, 0.14)`) and iOS 18 neon glow.
   - **Employee Bento Items**: Avatar initial, role badge (`Verified` / `Pending`), phone link (`📞 tel:`), and Michi ID badge.
   - **Empty State**: Glassmorphic centered icon badge (`<Users size={28} />`) with helpful subtext.

---

## 🚫 3. Forbidden Patterns
1. **No Unstructured Flat Inputs**: Never place un-grouped input fields directly on page background without glass subcard wrapper.
2. **No Pop-Up Disappearing Forms**: Michi ID vs Manual entry must be explicitly switched via segmented tabs, preventing unexpected form height jumps.
3. **No Multiline Pill Button Text Wrapping**: Filter pill labels must never wrap into 2 lines (`すべての従業` \n `員`). Always enforce `whiteSpace: 'nowrap'` and `flexShrink: 0`.


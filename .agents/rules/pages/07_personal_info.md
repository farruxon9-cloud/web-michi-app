# Page Specification Rule: Personal / Company Info (`Profile.jsx` -> `personalInfo`)

Ushbu qoida **Shaxsiy Ma'lumotlar / Kompaniya Profil** (`personalInfo`) sub-sahifasi uchun barcha layout va Glassmorphism sub-card spetsifikatsiyalarini belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `position: absolute; top: 0; left: 0; right: 0; bottom: 0;`
- **Scroll & Padding**: `overflow-y: auto; padding-bottom: 96px;`

---

## 🎨 2. Glassmorphism Sub-Group Cards Layout (`.profile-subcard`)
Personal info elements must NEVER be dumped into a single flat list. They MUST be grouped into 5 distinct elevated Glassmorphism Cards:

1. **Card Container (`.profile-subcard`)**:
   - `background: var(--card-bg);`
   - `backdrop-filter: blur(20px);`
   - `border: 1px solid var(--glass-border);`
   - `border-radius: 20px;`
   - `padding: 18px 16px;`
   - `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);`
   - `transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);`

2. **Subcard Header (`.profile-subcard-header`)**:
   - `display: flex; align-items: center; gap: 10px; padding-bottom: 12px;`
   - `border-bottom: 1px solid var(--glass-border);`
   - **Icon Wrap (`.profile-subcard-icon-wrap`)**: `width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center;`
   - **Title (`.profile-subcard-title`)**: `font-size: 15px; font-weight: 700; letter-spacing: -0.2px;`

3. **5 Standard Sub-Group Sections**:
   - 👤 **Basic Info (基本情報)**: Icon `User`, primary blue accent (`rgba(10, 132, 255, 0.1)`).
   - 📍 **Living Address History (現住所履歴)**: Icon `MapPin`, orange accent (`rgba(255, 149, 0, 0.12)`), `#0A84FF` current address badge pill.
   - 🎓 **Education History (学歴履歴)**: Icon `GraduationCap`, purple accent (`rgba(175, 82, 222, 0.12)`), `#34C759` currently studying badge pill.
   - 🪪 **Driver's Licenses (運転免許証)**: Icon `Award`, green accent (`rgba(52, 199, 89, 0.12)`), blue pill chips with `CheckCircle2` icons.
   - 📜 **Special Qualifications & JLPT (特殊技術・資格証明書)**: Icon `FileCheck`, pink accent (`rgba(255, 45, 85, 0.12)`), JLPT Green Verified Badge.

---

## 📝 3. Form Input Cards & Save CTA
- **Input Fields Padding**: `padding: 14px; margin-bottom: 12px;`
- **Save Changes CTA**: Full-width button with `padding: 14px; border-radius: 16px; font-weight: 700;`
- **Trailing Dock Clearance**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />`

---

## 🚫 4. Forbidden Patterns
1. **No Flat Wall of Text**: Never combine all personal info fields into a single unbroken container.
2. **No Double Colons**: Input labels must render clean text without embedded colons (`生年月日` not `生年月日：`).

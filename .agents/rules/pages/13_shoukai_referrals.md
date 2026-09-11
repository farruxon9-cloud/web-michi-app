# Page Specification Rule: Shoukai Referrals (`Profile.jsx` -> `my_shoukai`)

Ushbu qoida **Tavsiya va Shoukai Tizimi (`my_shoukai`)** sub-sahifasi uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Container Geometry
- **Outer Viewport**: `<div className="profile-container sub-page-view fade-in">`
- **Positioning**: `bottom: 0; padding-bottom: 96px;`

---

## 🎁 2. Referral Card & Link Share
- **Reward Banner**: `padding: 16px; border-radius: 20px; background: linear-gradient(135deg, rgba(94, 92, 230, 0.15), rgba(48, 209, 88, 0.15));`
- **Copy Link Button**: One-tap copy with toast notification.
- **Sub-Tabs Segmented Bar**: `未払い` (Pending), `支払完了` (Paid), `全件` (All) pill buttons with live count badges.
- **Interactive Detail Sheet**: Clicking any card opens `<selectedShoukaiApp>` modal sub-view sheet showing 🏢 Job & Fee, 👤 Candidate, 🏷️ Referrer Metadata, and 💳 Payment CTA.
- **Trailing Dock Spacer**: `<div style={{ height: '96px', minHeight: '96px', width: '100%', flexShrink: 0, clear: 'both' }} />` (Exact 12px visual gap above 84px BottomNav).

---

## 🚫 3. Forbidden Patterns
1. **No Hardcoded Currency**: Shoukai fee numbers must format dynamically using locale currency helpers (`¥50,000` / `50,000 JPY`).


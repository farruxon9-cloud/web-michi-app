# ShoukaiReferrals Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Sub-Page Viewport**: `.profile-container.sub-page-view.fade-in`
- **Tab Header**: 3 tabs (`Barchasi`, `Kutilmoqda`, `To'langan`), radius `14px`
- **Shoukai Card**: `padding: 14px 16px`, `border-radius: 18px`, reward text color `#FF9F0A`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Payout Status Toggle**:
   - Tapping "Tasdiqlash" triggers `onShoukaiPaid(id)` to update application referral payout state in memory and database.

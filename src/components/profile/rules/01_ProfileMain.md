# ProfileMain Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Header Card Geometry:
- **Card**: `.profile-header-card.squircle-card`, `border-radius: 24px`, `background: var(--card-bg)`, `padding: 16px`
- **Avatar Circle**: `width: 72px`, `height: 72px`, `border-radius: 50%`, `overflow: hidden`, `border: 2px solid var(--primary)`
- **Stats Row**: Border top `1px solid var(--glass-border)`, `padding-top: 12px`, `margin-top: 14px`

### Menu Item List Geometry:
- **Menu Item**: `display: flex; align-items: center; padding: 14px 16px; border-radius: 16px; margin-bottom: 8px;`
- **Icon Wrap**: `width: 36px`, `height: 36px`, `border-radius: 10px`, `background: rgba(10, 132, 255, 0.1)`
- **Menu Label**: `font-size: 14px; font-weight: 700; color: var(--text-main)`
- **Badge Pill**: `padding: 2px 8px`, `border-radius: 10px`, `font-size: 11px`, `font-weight: 800`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Avatar Upload Integration**:
   - Tapping the avatar circle triggers `fileInputRef.current.click()` to launch standard file chooser.
2. **Role-Based Menu Items**:
   - "Xodimlar boshqaruvi" (Employee management) menu item renders ONLY when `userRole === 'company'`.

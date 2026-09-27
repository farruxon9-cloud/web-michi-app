# BentoMyAdsCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Outer Card Geometry:
- **Card Class**: `.bento-my-ads-card`
- **Min Height**: `156px`
- **Inner Padding**: `12px 14px 14px`
- **Border Radius**: `24px` (`squircle`)
- **Background**: `var(--dash-card-bg); backdrop-filter: blur(20px);`
- **Border**: `1px solid var(--dash-card-border)`

### Company Role Variant (`Megaphone` Icon):
- **Icon Container (`.my-ads-icon`)**: `48x48px`, `border-radius: 14px`, `margin-bottom: 6px`, `background: linear-gradient(135deg, #ff9f0a, #ff3b30); box-shadow: 0 4px 12px rgba(255, 159, 10, 0.3)`
- **Hover Border Color**: `border-color: rgba(255, 159, 10, 0.4)`

### Driver/User Role Variant (`FileCheck` Icon):
- **Icon Container (`.my-apps-icon`)**: `48x48px`, `border-radius: 14px`, `margin-bottom: 6px`, `background: linear-gradient(135deg, #0a84ff, #5e5ce6); box-shadow: 0 4px 12px rgba(10, 132, 255, 0.35)`
- **Hover Border Color**: `border-color: rgba(10, 132, 255, 0.4)`

### Typography & Content:
- **Sub-label (`.my-ads-sub`)**: `font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 3px;`
- **Title (`.my-ads-title`)**: `font-size: 17px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- **Description (`.my-ads-desc`)**: `font-size: 11px; line-height: 1.35; color: var(--text-secondary); opacity: 0.8; display: -webkit-box; -webkit-line-clamp: 2;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Role-Based Dynamic Switching**:
   - MUST strictly check `userRole === 'company'` to display Company Ad Management ("Mening e'lonlarim"), otherwise display Driver Applications ("Mening arizalarim").
2. **Navigation Source Preservation**:
   - Click handler MUST invoke `setProfileActivePageSource('home')` before setting `setProfileActivePage('my_ads' | 'applications')` and `setActiveTab('profile')`. This guarantees the back button in Profile returns cleanly to the Home tab.

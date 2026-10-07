# CompanyHeader Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Header Dock**: `.feed-header.glass`, `padding: 14px 16px`
- **Logo Box**: `44x44px`, `border-radius: 14px`, `border: 1px solid rgba(10, 132, 255, 0.2)`
- **Add Posting Button**: `padding: 10px 16px`, `border-radius: 20px`, `background: linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)`, `font-size: 13px`, `font-weight: 800`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Posting Type Switcher**:
   - Switches between company jobs list (`activeTab === 'jobs'`) and driving academy list (`activeTab === 'schools'`).

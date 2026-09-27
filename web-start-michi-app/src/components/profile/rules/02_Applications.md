# Applications Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Sub-Page Viewport**: `.profile-container.sub-page-view.fade-in`
- **Pipeline Filter Chips**: Horizontal scroll row, chip radius `14px`, height `30px`, font size `12.5px`
- **Application Card**: `padding: 14px 16px`, `border-radius: 18px`, `border: 1px solid var(--glass-border)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Pipeline Filter Filtering**:
   - Tapping pipeline tabs filters `allApps` dynamically by `app.status` (`submitted`, `reviewing`, `interview`, `accepted`, `rejected`).

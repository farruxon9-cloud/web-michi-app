# Notifications Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Container Geometry:
- **Sub-Page Viewport**: `.profile-container.sub-page-view.fade-in`
- **Notification Item Card**: `padding: 12px 14px`, `border-radius: 16px`
- **Unread Card Styling**: `background: rgba(10, 132, 255, 0.08)`, `border: 1px solid rgba(10, 132, 255, 0.2)`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Delete Button Stop Propagation**:
   - Tapping delete icon triggers `e.stopPropagation()` so marking notification read is bypassed when deleting.

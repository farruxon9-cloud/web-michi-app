# JobDetailModal Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Modal Overlay & Container Geometry:
- **Overlay Class**: `.job-detail-modal-overlay`
- **Positioning**: `position: fixed; inset: 0; z-index: 99999;`
- **Backdrop**: `background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);`
- **Container Class**: `.job-detail-container`
- **Width**: `100%` on mobile, `max-width: 820px` centered on desktop (`@media (min-width: 768px)`).
- **Header Image**: `height: 240px; width: 100%; object-fit: cover;`

### Sticky Header Buttons:
- **Back & Bookmark Buttons**: `40x40px`, `border-radius: 50%`, `position: absolute; top: 16px; left: 16px` (Back), `right: 16px` (Bookmark).

### Action Button Order (Rule 16 Invariant):
- **Action Bar (`.job-detail-action-bar`)**: `position: relative` (NON-PINNED inside normal document flow at bottom of detail content).
- **Button Sequence**: `[ 応募する (Apply) ]` -> `[ 紹介 (Shoukai Referral) ]` -> `[ 📞 電話する (Call) ]` (Call button strictly at far-right end).

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Non-Pinned Action Bar Invariant (Rule 16)**:
   - Action bar MUST use `position: relative; margin-top: 24px; margin-bottom: 24px;` at the bottom of the job text. Sticky/pinned bottom action bars are STRICTLY PROHIBITED.
2. **Far-Right Call Button**:
   - Phone call button (`📞 電話する`) MUST strictly sit at the far-right end of the action button row.

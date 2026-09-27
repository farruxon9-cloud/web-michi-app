# JobFeedSearchHeader Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Sticky Wrapper & Header Geometry:
- **Wrapper Class**: `.feed-header-sticky-wrapper`
- **Positioning**: `position: relative` (Scrolls away naturally when scrolling down)
- **Margin Top**: `0px`
- **Padding**: `12px 14px`
- **Width**: `100%`

### Search Input Bar (`.feed-header`):
- **Search Box (`.search-box`)**: `height: 44px; border-radius: 22px; background: var(--card-bg); border: 1px solid var(--glass-border); padding: 0 14px; display: flex; align-items: center; gap: 10px; flex: 1;`
- **Search Icon**: `18px`, `color: var(--text-secondary)`
- **Search Input**: `font-size: 14px; color: var(--text-main); border: none; background: transparent; outline: none; width: 100%;`
- **Filter Button (`.filter-btn`)**: `width: 44px; height: 44px; border-radius: 50%; background: var(--card-bg); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0;`

### Segment Pills Row (`.segment-pills-row`):
- **Height**: `36px`
- **Flex Gap**: `8px`
- **Overflow**: `overflow-x: auto; scrollbar-width: none;`
- **Segment Pill (`.segment-pill`)**: `font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 18px; border: 1px solid var(--glass-border); background: var(--glass-bg); color: var(--text-secondary); white-space: nowrap;`
- **Active Pill (`.segment-pill.active`)**: `background: var(--text-main); color: var(--bg-color); border-color: var(--text-main);`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Relative Scroll Invariant (Rule 21)**:
   - Search bar MUST use `position: relative` so it scrolls away naturally when scrolling down, freeing screen real estate for job listings.
2. **Clear Search Button**:
   - Clicking clear button (`.clear-search-btn`) MUST set `searchQuery` to `''`.

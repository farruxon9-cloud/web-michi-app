# CalendarRow Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Horizontal Calendar Strip Geometry:
- **Container Class**: `.calendar-row`
- **Height**: `70px` (mobile), `80px` (tablet), `86px` (desktop)
- **Margin Top**: `12px` (`.dashboard-container > * + *`)
- **Gap**: `6px` between days (mobile), `12px` (desktop)
- **Day Card (`.calendar-day`)**: `flex: 1; border-radius: 16px; padding: 0 4px; border: 1px solid var(--dash-card-border);`

### Day Item Elements:
- **Day Name (`.day-name`)**: `font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;`
- **Day Number (`.day-num`)**: `font-size: 19px; font-weight: 800;` (mobile), `22px` (desktop)
- **Active Day (`.calendar-day.active`)**: `background: var(--text-main); color: var(--bg-color); border-color: var(--text-main); box-shadow: 0 8px 18px rgba(0,0,0,0.12);`

### Greeting Header & Digital Clock Geometry:
- **Row Class**: `.dash-greeting-row`
- **Margin Top**: `12px`
- **Padding**: `0 4px`
- **Greeting Title (`.greeting-title`)**: `font-size: 24px; font-weight: 800; letter-spacing: -0.02em;`
- **Greeting Line (`.greeting-line`)**: `flex: 1; height: 1px; border-bottom: 1px dashed var(--text-secondary); opacity: 0.25;`
- **Greeting Date (`.greeting-date`)**: `font-size: 12px; font-weight: 600; opacity: 0.8; letter-spacing: 0.2px;`
- **Time Pill (`.time-pill`)**: `font-size: 15px; font-weight: 800; padding: 8px 16px; border-radius: 24px; font-variant-numeric: tabular-nums;`

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **Today Index Invariant**:
   - The 7-day strip generates 3 days before today and 3 days after today. Today is strictly at `index === 3` and MUST have `.calendar-day.active`.
2. **Tabular Nums Invariant**:
   - `.time-pill` MUST strictly use `font-variant-numeric: tabular-nums` to prevent horizontal layout jank as minutes update.
3. **Locale Date Formatting**:
   - Date formats MUST use current `i18n.language` code (`uz-UZ`, `ja-JP`, `en-US`, `ru-RU`, `vi-VN`, `zh-CN`).

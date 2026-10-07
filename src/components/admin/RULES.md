# Admin Dashboard & Analytics Suite Architecture & Layout Rules

## Core Layout & Dimension Norms
- **Admin Layout Container (`.admin-dashboard-page`)**: Full width desktop/tablet view `max-width: 1200px` centered, `padding: 24px`.
- **KPI Metrics Grid**: 4-column responsive grid (`gap: 16px`):
  - Metric Card: `height: 120px`, `border-radius: 18px`, `padding: 20px`, background `var(--dash-card-bg)`.
- **Data Table View**: `width: 100%`, `border-collapse: separate`, `border-spacing: 0 8px`.

## Per-Component Spec Index (`rules/`)
1. [`admin_dashboard_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/admin/rules/admin_dashboard_spec.md) - Admin user verification, platform stat counters, job post moderation table.
2. [`assist_hero_showcase_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/admin/rules/assist_hero_showcase_spec.md) - Michi Assistant feature showcase banner and interactive interactive workflow demo.

## Bug Prevention & Learned Fixes
- **Admin Privilege Verification**: Always verify `userRole === 'admin'` before mounting administrative modification endpoints.
- **Large Table Virtualization**: Apply scroll bounds for user lists with over 100 items to maintain 60 FPS UI rendering.

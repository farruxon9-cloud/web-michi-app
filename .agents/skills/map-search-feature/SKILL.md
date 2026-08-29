---
name: map-search-feature
description: Architecture, Leaflet Leaflet tiles setup, bounding box query logic, and feature flag preservation for the E'lonlar Xaritasi Qidiruv Tizimi (Job Map Search / 求人マップ検索).
---

# 🗺️ Job Map Search Feature Skill (`map-search-feature`)

This skill documents the full architecture, design layout, feature flag controls, and GIS scaling logic for the **Job Map Search (求人マップ検索 / E'lonlar Xaritasi Qidiruv Tizimi)** feature in `DriverFeed.jsx`.

## ⚙️ 1. Feature Flag Toggle Control
- **Location:** `src/components/DriverFeed.jsx`
- **Constant:** `const ENABLE_MAP_SEARCH = false;`
- **Behavior:**
  - When `false`: Hides the map view toggle button (`.map-view-toggle-btn`), filter drawer map shortcut (`.btn-map-shortcut`), and `JobMapModal` component from the active UI.
  - When `true`: Instantly enables full real Leaflet map modal with CartoDB Voyager tiles and interactive job pins across Japan.

## 🎨 2. Component & CSS Architecture
- **Modal Component:** `JobMapModal` in `DriverFeed.jsx`.
- **CSS Styles:** `.job-map-modal-overlay` and `.job-map-modal-card` in `DriverFeed.css`.
- **In-App Mobile Frame Scoping:**
  - Portal target: `document.getElementById('root') || document.body`.
  - Responsive layout: Uses `position: fixed` on mobile screens and `position: absolute; border-radius: 48px;` inside `@media (min-width: 481px)` to stay 100% locked inside the smartphone mockup frame without overflowing into desktop browser margins.

## 🚀 3. Scaling Architecture for Millions of Pins (Future Roadmap)
1. **Spatial Indexing & BBox Queries:** Backend PostgreSQL + PostGIS `ST_MakeEnvelope` filtering by active map viewport bounds (`north, south, east, west`).
2. **Marker Clustering:** `supercluster` or backend `ST_ClusterDBSCAN` aggregating nearby pins into interactive cluster nodes (`🔴 Tokio: 142,500 jobs`).
3. **Vector Tiles (MVT/PBF):** Streaming binary vector tiles directly to WebGL Canvas layer for 60 FPS performance with 1,000,000+ pins.

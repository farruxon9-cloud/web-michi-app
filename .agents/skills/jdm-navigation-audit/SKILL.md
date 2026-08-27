---
name: jdm-navigation-audit
description: Dedicated Page Skill for MichiApp JDM Navigation & Offline Maps. Covers Leaflet map viewport, search bento overlay, GPS dead reckoning, turn-by-turn HUD, and truck height/weight restriction routing.
---

# 🗺️ JDM Navigation Page Audit Skill (`jdm-navigation-audit`)

This skill defines the complete visual structure, map layers, GPS mechanics, and button interactions for **JDM Navigation & Service Hub**.

## 📐 1. Visual Layout & Floating Overlays
- **Map Viewport:** `#map` container (`height: 100%`, `width: 100%`, `z-index: 1`).
- **Search & Filter Bento:** `.nav-search-card` (`position: absolute; top: 16px; left: 14px; right: 14px; z-index: 200; border-radius: 24px;`).
- **Turn-by-Turn Guidance HUD:** `.turn-hud-overlay` (`position: absolute; top: 80px; left: 14px; right: 14px; z-index: 210; border-radius: 20px;`).

## 🔘 2. Button & Action Registry
- **Search Location Input:** Real-time Nominatim / Overpass OSM search with debounced autocomplete.
- **Start GPS Navigation Button (`handleStartGuidance`):** Triggers `deadReckoning` worker loop and voice turn announcements (`turnInstructions`).
- **Vehicle Profile Selector (Truck / Heavy / EV / Sedan):** Filters Overpass routing restrictions based on weight/height limits.
- **Offline Map Downloader (`downloadOfflineTile`):** Pre-caches Mapbox/OSM raster tiles for remote Japanese mountain routes.

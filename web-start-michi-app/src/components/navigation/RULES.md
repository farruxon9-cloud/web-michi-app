# JDM Navigation Components Architectural Rules, Dimensions & Specification Index

This document serves as the master index for the modular components of the JDM Navigation Page (`JDMNavigation.jsx`). Each component has its own dedicated rules and layout geometry specification document inside `src/components/navigation/rules/`.

---

## 📐 General Navigation Layout Geometry & Global Norms

1. **Outer Viewport Canvas**:
   - Map canvas fills full 100% width and height of the screen container (`width: 100%; height: 100%`).
2. **Floating Controls & HUD Stack**:
   - Top Search Header uses `z-index: 300`.
   - Bottom HUD Dock uses `z-index: 350`.
   - POI Sheet uses `z-index: 450`.
   - Emergency Restrictions & Vehicle Modals use `z-index: 9999`.

---

## 📁 Component-Specific Specification Index

| # | Component Name | Source File | Dedicated Rules & Specs File | Layout Geometry & Main Invariant |
|---|---|---|---|---|
| **01** | **JDMMapContainer** | [`JDMMapContainer.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/JDMMapContainer.jsx) | [`01_JDMMapContainer.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/rules/01_JDMMapContainer.md) | MapLibre vector/satellite canvas, dynamic GPS bottom offset button stack, smooth bearing rotation. |
| **02** | **JDMNavSearchHeader** | [`JDMNavSearchHeader.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/JDMNavSearchHeader.jsx) | [`02_JDMNavSearchHeader.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/rules/02_JDMNavSearchHeader.md) | Start & dest input stack, vehicle pill trigger, avoid tolls/highways quick chips, debounced Osm Nominatim search. |
| **03** | **JDMNavBottomHUD** | [`JDMNavBottomHUD.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/JDMNavBottomHUD.jsx) | [`03_JDMNavBottomHUD.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/rules/03_JDMNavBottomHUD.md) | Turn instruction banner, `LaneIndicator`, ETA calculation (24h format), remaining distance/time, ETC toll badge. |
| **04** | **JDMRestrictionAlertModal** | [`JDMRestrictionAlertModal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/JDMRestrictionAlertModal.jsx) | [`04_JDMRestrictionAlertModal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/rules/04_JDMRestrictionAlertModal.md) | High-priority MLIT height/weight restriction warning modal (`z-index: 9999`). |
| **05** | **JDMVehiclePickerModal** | [`JDMVehiclePickerModal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/JDMVehiclePickerModal.jsx) | [`05_JDMVehiclePickerModal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/rules/05_JDMVehiclePickerModal.md) | Vehicle preset selector (Light, 4t, 10t, Trailer, Bike) with dimensions persistence in `localStorage`. |
| **06** | **JDMPOIModal** | [`JDMPOIModal.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/JDMPOIModal.jsx) | [`06_JDMPOIModal.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/navigation/rules/06_JDMPOIModal.md) | Nearby POI search popup sheet (`bottom: 90px`, `z-index: 450`). |

---

## 🚫 Critical Multi-Component Error Prevention Rules

1. **Dynamic GPS Control Button Offset**:
   - Map controls (locate, style, compass) MUST dynamically offset their bottom margin via `gpsBottomOffset` to avoid overlapping bottom HUD panels or search sheets.
2. **Pointer Events Scoping**:
   - Floating header and HUD overlays must use `pointer-events: none` on outer wrapper containers and `pointer-events: auto` on interactive buttons to permit smooth map panning.

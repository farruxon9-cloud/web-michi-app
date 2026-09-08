# Page Specification Rule: Recruitment Filter Drawer (`TownworkFilterDrawer.jsx`)

Ushbu qoida **Yapon Ish Qidiruv Filtr Darchasi (Townwork Filter Drawer)** uchun barcha layout va spetsifikatsiyalarni belgilaydi.

---

## 📐 1. Drawer Container Geometry
- **Drawer Viewport**: `position: fixed; inset: 0; z-index: 10000; display: flex; flex-direction: column; background: var(--bg-color);`
- **Header Geometry & Sticky Back-Button Invariant**: Header bo'limida ONLY ⬅️ Back button on the left (`40x40px`, `border-radius: 50%`, `ArrowLeft`) stays PINNED STICKY (`position: sticky; top: 16px; left: 16px; z-index: 300; height: 40px; margin-bottom: -40px;`). The Title (`詳細検索`) and Reset button (`リセット`) MUST reside in normal document flow and scroll away naturally as the user scrolls.
- **Header 1:1 Baseline & Centered Title Alignment Invariant**: Sticky Back Button konteyneri (`height: 40px; align-items: center; top: 0;`) va Sarlavha qatori (`minHeight: 40px; align-items: center; justify-content: center; position: relative; margin-bottom: 16px;`) 1:1 bir xil 40px balandlik va top: 0 offsetiga ega bo'lib, 3 ta element (`[Back]`, `[詳細検索]`, `[リセット]`) yagona gorizontal baseline bo'yicha 100% parallel tekislanishi va sarlavha matni to'liq ekran markazida aks etishi shart. Ustma-ust tushish (overlap) qat'iyan man etiladi.
- **Single Native Scroll Container Invariant**: `feed-container` har doim yagona native scroll container (`overflow-y: auto; padding: 16px 14px 96px 14px; position: relative;`) bo'lishi shart. Sarlavha uchun sun'iy nested `overflow: hidden` o'ramlar yaratish taqiqlanadi.

---

## 🟡 2. Townwork 3-Tab Header Invariant
- **3 Tab Headers**: `駅・路線` (Train Lines), `市区町村` (Municipalities/Districts), `現在地` (Current Location GPS Radius).
- **Tab Theme**: Townwork style signature yellow branding background (`background: #FFCC00; color: #000; font-weight: 800;`).

---

## 📂 3. Accordion State Invariant
- **Default State**: ALL 5 accordion sections (`isLocationSectionOpen`, `isStationsSectionOpen`, `isRadiusSectionOpen`, `isJobCatSectionOpen`, `isFeatureSectionOpen`) MUST default to `false` (collapsed) upon opening or resetting.

---

## ⚓ 4. Sticky Bottom Action Bar & Floating Dock Clearance Invariant
- **Footer Dock Position**: Floating Search CTA button (`{filteredJobs.length}件 検索`) at `position: fixed; bottom: 96px; height: 52px; z-index: 250;` (Top Edge = `148px`).
- **Exact 12px Clearance Invariant**: Scroll container padding bottom MUST be set to `padding-bottom: 160px` (`148px + 12px = 160px`).
- **No Redundant Spacer Anti-Pattern**: `padding-bottom: 160px` ustiga takroriy inline spacer divlar (`height: 64px`) qo'shish taqiqlanadi. Shunda akordeonlar yopiq yoki ochiq holatda bo'lishidan qat'i nazar scroll oxirida tugma ustida doim 100% exact 12px visual gap ta'minlanadi.

---

## 🚫 5. Forbidden Patterns
1. **No Auto-Expanded Sections**: Filter drawer must never open with sections auto-expanded by default.

# Home Page Components Architectural Rules, Dimensions & Specification Index

This document serves as the master index for the 8 modular components of the main Home Page (`Dashboard.jsx`). Each component has its own dedicated rules and layout geometry specification document inside `src/components/home/rules/`.

---

## 📐 General Home Page Layout Geometry & Global Norms

1. **Outer Viewport Margins**:
   - `.dashboard-container` padding: `14px` side margins on mobile, centered at `max-width: 820px` on desktop.
2. **Vertical Element Spacing Gap**:
   - `.dashboard-container > * + *`: Strictly `12px` (`margin-top: 12px` between stacked widgets).
3. **Bottom Clearance Spacer**:
   - `.dashboard-container` applies `padding-bottom: 96px` so content scrolls smoothly above the floating `BottomNav` bar (`bottom: 12px + 72px = 84px`).

---

## 📁 Component-Specific Specification Index

| # | Component Name | Source File | Dedicated Rules & Specs File | Layout Geometry & Main Invariant |
|---|---|---|---|---|
| **01** | **HeroCarousel** | [`HeroCarousel.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/HeroCarousel.jsx) | [`01_HeroCarousel.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/01_HeroCarousel.md) | Height `160px` (mobile) / `200px` (tablet), `diffX < 10px` tap check, `isPaused` timer stop. |
| **02** | **CalendarRow** | [`CalendarRow.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/CalendarRow.jsx) | [`02_CalendarRow.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/02_CalendarRow.md) | Height `70px`, Today at `index === 3` active, `tabular-nums` digital clock pill (`15px`). |
| **03** | **BentoAiCard** | [`BentoAiCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/03_BentoAiCard.md) | [`03_BentoAiCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/03_BentoAiCard.md) | Padding `16px 20px`, Radius `24px`, iOS switch `stopPropagation`, API key bypass activation. |
| **04** | **BentoQuickNav** | [`BentoQuickNav.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/BentoQuickNav.jsx) | [`04_BentoQuickNav.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/04_BentoQuickNav.md) | Min Height `115px`, Gap `12px`, 3-card equal width (`flex: 1 1 0`), haptic click sound. |
| **05** | **BentoInternationalCard** | [`BentoInternationalCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/BentoInternationalCard.jsx) | [`05_BentoInternationalCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/05_BentoInternationalCard.md) | Padding `20px 24px`, Live dot `6x6px` pulse, Tokutei Ginou SSW tags (`9.5px`). |
| **06** | **BentoMusicPlayerCard** | [`BentoMusicPlayerCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/BentoMusicPlayerCard.jsx) | [`06_BentoMusicPlayerCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/06_BentoMusicPlayerCard.md) | Full/Compact modes, Marquee track title (`marquee-scroll`), dynamic volume gradient. |
| **07** | **BentoMyAdsCard** | [`BentoMyAdsCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/BentoMyAdsCard.jsx) | [`07_BentoMyAdsCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/07_BentoMyAdsCard.md) | Min Height `156px`, Role switch (`company` Megaphone vs `driver` FileCheck), `setProfileActivePageSource('home')`. |
| **08** | **BentoJdmNavigationCard** | [`BentoJdmNavigationCard.jsx`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/BentoJdmNavigationCard.jsx) | [`08_BentoJdmNavigationCard.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/home/rules/08_BentoJdmNavigationCard.md) | Radius `16px`, Padding `10px 12px`, Floating "Tez orada" tag, 1-row horizontal scroll subtags. |

---

## 🚫 Critical Multi-Component Error Prevention Rules

1. **No Hardcoded Absolute Positions**:
   - Cards inside `.dashboard-container` MUST follow flex document flow with `margin-top: 12px`. Never apply absolute top/left coordinates that overlap stacked cards.
2. **Prop Drilling Safety**:
   - All handlers (`setActiveTab`, `onVoiceActivate`, `onVoiceToggle`, `onNavigateToInternational`, `onNavigateToJDM`) MUST be destructured safely with default fallbacks.
3. **Zero Horizontal Overflow**:
   - Text headers (`.dash-hero-title`, `.ai-card-title`, `.my-ads-title`) MUST include `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` to prevent text blowing past card padding on narrow devices.

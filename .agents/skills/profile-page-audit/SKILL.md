---
name: profile-page-audit
description: Dedicated Page Skill for MichiApp Profile & Settings page. Covers visual layout bounds, bento cards, sub-pages (Settings, Notifications, About, Resume Builder, Referral, Company Edit), Einstein 14px bottom clearance gap, subPageFlipUp animations, exact scroll restoration, and button interactions.
---

# 👤 Profile & Settings Page Audit Skill (`profile-page-audit`)

This skill defines the complete visual structure, spacing invariants, interactive buttons, and state mechanics for the **Profile (マイページ)** tab and all its sub-pages.

## 📐 1. Visual Layout & Spacing Standards
- **Outer Container:** `.profile-container` (`overflow-y: auto`, `box-sizing: border-box`, `padding-bottom: 96px` on main view, `0px` on sub-page view).
- **Sub-Page Entrance Animation:** `.subPageFlipUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)` applied ONLY to inner child wrappers (`.sub-page-header`, `.profile-menu`).
- **Bento Menu Card Spacing:** `.profile-menu { display: flex; flex-direction: column; gap: 14px; padding: 0 14px; }`.
- **Menu Group Cards:** `.menu-group { border-radius: 20px; border: 1px solid var(--glass-border); overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03); }`.
- **Einstein Bottom Clearance Spacer:** All sub-pages MUST include `<div style={{ height: '84px', minHeight: '84px', width: '100%', flexShrink: 0 }} />` as the final child inside `.profile-menu`. This produces an **exact 14px visual clearance gap** above `BottomNav`.

## 🔄 2. Scroll Restoration & Navigation Mechanics
- **Mount Scroll Lock:** Opening Profile tab resets `.profile-container.scrollTop = 0` (opened flush at top).
- **Vehicle Fleet Tab Centering:** Selecting a vehicle centers the tab horizontally via `container.scrollTo({ left: offset, behavior: 'smooth' })`. ZERO `scrollIntoView()` on target elements.
- **Exact Sub-Page Back Restoration:**
  - Before entering sub-page (Settings, Notifications, etc.), save main scroll position: `setSavedMainScroll(container.scrollTop)`.
  - When clicking Back (`handleBackToMain`), restore: `container.scrollTop = savedMainScroll`.

## 🔘 3. Button & Action Registry
- **Edit Company Profile (`handleOpenCompanyEdit`):** Opens company modal/sub-page for verified driver/company roles.
- **Change Language (`onChangeLanguage`):** Cycles through `ja`, `en`, `uz`, `ru`, `zh`.
- **Dark Mode Switch (`setDarkMode`):** Toggles `.dark-mode` class on document root.
- **Notification Sound Toggle (`setNotificationSound`):** Saved to localStorage `michi_notif_sound`.
- **Profile Badges Toggle (`setShowProfileBadges`):** Saved to localStorage `michi_show_badges`.
- **Sound Settings Buttons:** 4 options (`soundOn`, `vibration`, `silent`, `allOff`) saved to state `soundSettings`.

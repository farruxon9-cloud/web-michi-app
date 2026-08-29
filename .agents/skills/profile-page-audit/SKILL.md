---
name: profile-page-audit
description: Dedicated Page Skill for MichiApp Profile & Settings page. Covers visual layout bounds, bento cards, 10 sub-pages (Settings, Notifications, About, Assist AI Showcase, Resume Builder, Personal Info, Applications, Saved Items, Referral Shoukai, Employees, Company Ads), 14px bottom clearance gap, subPageFlipUp animations, exact scroll restoration, and button interactions.
---

# 👤 Profile & Settings Page Audit Skill (`profile-page-audit`)

This skill defines the complete visual structure, spacing invariants, interactive buttons, and state mechanics for the **Profile (マイページ)** tab and all its 10 sub-pages.

## 📐 1. Visual Layout & Spacing Standards
- **Outer Container:** `.profile-container.sub-page-view` (`overflow-y: auto`, `-webkit-overflow-scrolling: touch`, `padding-bottom: 12px !important`).
- **Sub-Page Entrance Animation:** `.subPageFlipUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)` applied ONLY to inner child wrappers (`.sub-page-header`, `.profile-menu`).
- **Bento Menu Card Spacing:** `.profile-menu { display: flex; flex-direction: column; gap: 14px; padding: 0 14px; }`.
- **Menu Group Cards:** `.menu-group { border-radius: 20px; border: 1px solid var(--glass-border); overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03); }`.
- **Single-Row Header Standard:** Back button (`←`) and Sub-Page Title aligned on the exact same horizontal flex row (`display: flex; align-items: center; justify-content: space-between;`). Title text has `flex: 1`, `text-align: center`, and `marginRight: '38px'` for 100% mathematical center alignment without vertical gaps.
- **14px Visual Gap Symmetry Spacer:** All sub-pages and the main Profile tab (immediately after `<button className="logout-btn">`) MUST include `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />` as the final child inside `.profile-container.sub-page-view`. This produces an **exact 14px visual clearance gap** above `BottomNav`, perfectly matching inter-card `gap: 14px`.

## 🔄 2. Scroll Restoration & Navigation Mechanics
- **Mount Scroll Lock:** Opening Profile tab resets `.profile-container.scrollTop = 0` (opened flush at top).
- **Vehicle Fleet Tab Centering:** Selecting a vehicle centers the tab horizontally via `container.scrollTo({ left: offset, behavior: 'smooth' })`. ZERO `scrollIntoView()` on target elements.
- **Exact Sub-Page Back Restoration:**
  - Before entering sub-page (Settings, Notifications, etc.), save main scroll position: `setSavedMainScroll(container.scrollTop)`.
  - When clicking Back (`handleBackToMain`), restore: `container.scrollTop = savedMainScroll`.

## 📱 3. Codified Blueprint for 10 Sub-Pages

### 1. `about` (`Michi (道) について`)
- **Header:** Single-row back button + centered title.
- **Bento Grid Structure (6 Modules):**
  - *Manifesto Quote Card (Span 2):* `MICHIマニフェスト` tag + Vision quote + `Michiエコシステムチーム` author badge.
  - *AI Flagship Card (Span 2):* `ASSIST. AI VISION 2026` tag + `Michi AI 音声アシスタント` title + 3 interactive pills (`音声操作`, `AIデモ`, `次世代AI`) + Sparkles icon badge (links to `assist_showcase`).
  - *Vision & Stats Cards (Span 1 each):* `Vision` corporate mission card + `10k+` active jobs shimmer stat counter.
  - *Corporate Guarantees Card (Span 2):* `信頼性と保証` green badge + Halal Capital Group legal backing text.
  - *Future Perks Card (Span 2):* `将来の特典` list with status pills (`statusSoon`, `statusPlan`).
  - *Companies & Support Stats Cards (Span 1 each):* `500+` Companies counter + `24/7` Support counter.
  - *Footer Contacts & Web Links:* 4 contact email cards + gradient `officialWebsite` link + copyright text.
- **Spacer:** `<div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />`.

### 2. `assist_showcase` (`Assist AI Showcase`)
- Ambient Spotlight glow orb + single-row header + interactive live voice simulator (`発話例:` / `Michi AI:`) + 3.8m truck clearance & resume generator showcase + Voice AI toggle CTA + 72px bottom spacer.

### 3. `settings` (`設定`)
- Language selector dropdown, Dark mode switch, Notification sound toggle, Profile badges toggle, 4-button Sound settings bento box + 72px bottom spacer.

### 4. `notifications` (`通知`)
- Unread count badge, Mark all read CTA, sorted notification items + 72px bottom spacer.

### 5. `personalInfo` (`個人情報`)
- Personal/company data cards, driver license badges, edit profile action + 72px bottom spacer.

### 6. `applications` (`応募履歴`)
- Status pills (`statusPending`, `statusAccepted`, `statusInterview`), application items + 72px bottom spacer.

### 7. `saved_items` (`保存した求人`)
- Saved jobs & driving school bookmarks with direct navigation overlays + 72px bottom spacer.

### 8. `my_shoukai` (`紹介インセンティブ`)
- Shoukai referral code banner, referral list, fee calculation badges, payment request CTA + 72px bottom spacer.

### 9. `employees` (`従業員管理`)
- HR employee management list, invite driver form, confirmation status + 72px bottom spacer.

### 10. `my_ads` (`求人管理`)
- Company job postings list, edit/delete actions, applicant counter + 72px bottom spacer.

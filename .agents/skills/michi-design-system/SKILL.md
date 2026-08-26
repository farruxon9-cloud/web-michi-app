---
name: michi-design-system
description: Michi App premium UI/UX design system: Color tokens, spacing guidelines, typography, bento cards, interactive elements, dark/light mode, and animations rules.
---

# Michi App Premium Design System & Guidelines

This design system defines the visual guidelines, CSS tokens, dimensions, typography, cards, buttons, and micro-animations for the **Michi** application (a premium Japanese platform for truck driver jobs and driving academy courses). 

Always consult and strictly adhere to these rules when building new pages, updating components, or tweaking UI layouts to ensure the app maintains its premium, ultra-aesthetic, iOS-like modernist feel.

---

## 🎨 1. Color Palette & Tokens

The application uses refined, sophisticated brand colors escaping over-saturation to deliver a clean, premium, glassmorphic look.

### Core Variables (`:root`)
- **Primary (Indigo):** `#5E5CE6` (iOS Premium Indigo) | Hover: `#4c4ac2`
  - *Light Variant:* `rgba(94, 92, 230, 0.08)` | Border: `rgba(94, 92, 230, 0.2)`
- **Secondary (Purple):** `#AF52DE` (iOS Premium Purple) | Hover: `#963ec4`
  - *Light Variant:* `rgba(175, 82, 222, 0.08)` | Border: `rgba(175, 82, 222, 0.2)`
- **Success (Green):** `#30D158` (iOS Premium Green) | Hover: `#24b043`
  - *Light Variant:* `rgba(48, 209, 88, 0.08)` | Border: `rgba(48, 209, 88, 0.2)`
- **Warning (Orange):** `#FF9F0A` (iOS Premium Amber/Orange) | Hover: `#e08800`
  - *Light Variant:* `rgba(255, 159, 10, 0.08)` | Border: `rgba(255, 159, 10, 0.2)`
- **Danger (Red):** `#FF453A` (iOS Premium Red) | Hover: `#e03227`
  - *Light Variant:* `rgba(255, 69, 58, 0.08)` | Border: `rgba(255, 69, 58, 0.2)`
- **Info (Blue):** `#0A84FF` (iOS Premium Blue) | Hover: `#0070d6`
  - *Light Variant:* `rgba(10, 132, 255, 0.08)` | Border: `rgba(10, 132, 255, 0.2)`

### Light & Dark Mode Token Specifications

| Token / Property | Light Mode (Active class: `.light-mode`) | Dark Mode (Active class: `.dark-mode`) |
| :--- | :--- | :--- |
| **Global Background (`--bg-color`)** | `#f5f7fa` | `#050510` |
| **Card Background (`--card-bg`)** | `rgba(255, 255, 255, 0.6)` | `rgba(20, 20, 26, 0.45)` |
| **Dashboard Card Bg (`--dash-card-bg`)** | `rgba(255, 255, 255, 0.65)` | `rgba(28, 28, 30, 0.7)` |
| **Dashboard Card Border (`--dash-card-border`)** | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.1)` |
| **Glass Background (`--glass-bg`)** | `rgba(255, 255, 255, 0.45)` | `rgba(20, 20, 26, 0.4)` |
| **Glass Border (`--glass-border`)** | `rgba(255, 255, 255, 0.8)` | `rgba(255, 255, 255, 0.06)` |
| **Main Text (`--text-main`)** | `#1C1C1E` | `#FFFFFF` |
| **Secondary Text (`--text-secondary`)** | `#6E6E73` | `#A1A1AA` |
| **Small Shadow (`--shadow-sm`)** | `0 4px 20px rgba(0, 0, 0, 0.03)` | `0 4px 12px rgba(0, 0, 0, 0.2)` |
| **Medium Shadow (`--shadow-md`)** | `0 8px 32px rgba(90, 85, 234, 0.06)` | `0 12px 30px rgba(0, 0, 0, 0.45)` |
| **Dashboard Card Shadow (`--dash-card-shadow`)** | `0 6px 20px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)` | `0 10px 30px rgba(0, 0, 0, 0.25)` |

---

## 🔤 2. Typography

The application uses clean, geometric fonts for excellent legibility and premium character.

- **Primary Font Family:** `'SF Pro Rounded', 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
  - Font weight hierarchy: `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold), `800` (Extra-Bold/Heavy).
- **Titles (H1-H6):** `font-weight: 700; letter-spacing: -0.02em;`
- **Dashboard Title Sizes:**
  - Hero Card Title: `22px` (Bold / `800`) | Line height: `1.2`
  - Greeting Title: `24px` (Bold / `800`)
  - Bento Header: `15px` (Bold / `800`) | Paragraph: `11px` (`opacity: 0.7`)

---

## 📐 3. Spacing, Layouts & Radii

To maintain the iOS squircle card grid appearance, layout proportions must be perfectly consistent.

### Container & Layout Rules
- **Container Max-Width:** `480px` (standard mobile width container centered on desktop layouts with box shadow `0 0 50px rgba(0,0,0,0.06)`).
- **Desktop Wrapper (min-width: 481px):**
  - Body Background: `#e5e5ea`
  - App root height: `90vh`
  - App root border-radius: `40px`
  - App root border: `8px solid #1c1c1e` (Phone mockup wrapper style)
- **Container Padding:** Standard container padding is `16px`.
- **Vertical Spacing:** Elements inside standard lists or feed wrappers should stack with `margin-top: 12px` or `gap: 12px`.

### Border Radii
- **Small Corners (`--radius-sm`):** `12px`
- **Medium Corners (`--radius-md`):** `20px`
- **Large Corners (`--radius-lg`):** `28px`
- **Full Rounded (`--radius-full`):** `9999px`

---

## 🃏 4. Bento Card & List Card Design

All cards in the application use glassmorphic layers with dynamic hover highlight effects.

### Bento Cards
- **Hero Carousel Card (`.dash-hero-card`):**
  - Border Radius: `24px`
  - Height: `160px`
  - Spacing: `20px` internal padding
  - Backdrop Blur: `24px` (Glass effect)
  - Layout: Flexbox, `justify-content: space-between`, `align-items: center`
- **Bento Icon Card (`.bento-icon-card`):**
  - Border Radius: `20px`
  - Padding: `14px 12px`
  - Layout: `flex-direction: column`, `justify-content: space-between`
  - Height: Auto (min-height `115px` for wrapping protection)
- **Bento Dark Card Variant (`.dark-card`):**
  - Background: `#2D2A26` (Premium dark warm charcoal)
  - Color: `#ffffff`
  - Border: `1px solid rgba(255, 255, 255, 0.08)`

### Squircle Glass highlight
Any glass element with a `.squircle` class approximating a premium asymmetric squircle must use:
- **Radius:** `border-radius: 24px 6px 24px 24px`
- **Hover transition:** `transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1)`
- **Hover state changes:**
  ```css
  .glass.squircle:hover {
    box-shadow: 0 12px 36px rgba(90, 85, 234, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
    border-color: rgba(90, 85, 234, 0.2);
  }
  ```

---

## 🔘 5. Buttons & Interactive Elements

Buttons must feel highly responsive, clicking should trigger physical micro-scaling feedback.

### Click/Active State Feedback
Every standard button or click target must scale slightly down on active click:
```css
button:active, .premium-btn:active {
  transform: scale(0.95);
  filter: brightness(0.92);
  transition: transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.12s ease;
}
```

### Premium Gradient Button (`.premium-btn`)
- **Background:** `linear-gradient(135deg, #0066cc, #8b5cf6)` (Royal blue to vibrant purple)
- **Text Color:** `#ffffff`
- **Radius:** `var(--radius-md)` (20px)
- **Shadow:** `0 4px 16px rgba(0, 102, 204, 0.25)`
- **Padding:** `8px 16px`
- **Hover Scale:** `transform: scale(1.02); box-shadow: 0 6px 24px rgba(0, 102, 204, 0.3);`

### Icon Button Wrapper (`.icon-btn`)
- **Dimensions:** `width: 40px; height: 40px;`
- **Radius:** `50%` (Circle)
- **Layout:** Flexbox, `align-items: center`, `justify-content: center`
- **Shadow:** `var(--shadow-sm)`

---

## 🖼️ 6. Branding & Icons

The AI core features are emphasized using gradients.

### Kanji Logotype
- **Class:** `.logo-kanji`
- **Gradient:** `linear-gradient(135deg, #0066cc, #8b5cf6)` (Royal Blue to Violet)
- **Shadow:** `0 4px 15px rgba(0, 102, 204, 0.4)`
- **Dimensions:** `width: 38px; height: 38px; border-radius: 10px`
- **Font Size:** `1.4rem`

### AI Gradient Indicator (Solid/Clean Purple Gradient)
All AI icons (e.g. AI Bento Card icon, voice assistant overlays, bottom voice assistant trigger glow) must share the unified solid premium gradient:
- **Gradient Style:** `linear-gradient(135deg, #6C5CE7, #8B5CF6)` (Refined modern purple gradient)
- **Border styling:** Keep background contrast visible. Use a solid black center inside icon circles where requested, with glowing borders using the purple gradient.

---

## ⚡ 7. Animations

Micro-animations make the glassmorphism elements feel responsive.

### Background Blobs
- **Floater Keyframes:**
  ```css
  @keyframes blob-float {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0, 0) scale(1); }
  }
  ```
- **Opacities:** `0.6` in Light Mode, `0.25` in Dark Mode.

### Card Fade & Slide transitions
- **Fade In:** `animation: fadeIn 0.4s ease-out forwards;`
- **Slide Up:** `animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;`

### Hand Waving Greeting Animation (`.greeting-icon`)
- **Animation:** `wave 2.5s infinite`
- **Transform-Origin:** `70% 70%`
- Rotation keys: `0% (0.0deg) -> 10% (14deg) -> 20% (-8deg) -> 30% (14deg) -> 40% (-4deg) -> 50% (10deg) -> 60%-100% (0.0deg)`.

---

## 💎 8. Glassmorphic Luxury Button & Compact Bento Tokens

### Standard Glassmorphic Action Button Style
All secondary and primary action buttons (Edit Vehicle, Create Resume PDF, Filter Badges) must use this exact token hierarchy:
```jsx
style={{
  background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.15) 0%, rgba(0, 132, 255, 0.15) 100%)',
  border: '1px solid rgba(48, 209, 88, 0.35)',
  color: 'var(--text-main)',
  padding: '6px 14px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: '0 2px 8px rgba(48, 209, 88, 0.12)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
}}
```

### Compact Bento Action Cards & Single-Row Subtag Rule
- **Padding:** `10px 12px` (tight, minimal vertical whitespace).
- **Subtag Row:** Subtag pills must be arranged in **1 single horizontal row**:
  `<div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap' }}>`
- **Subtag Pill Style:** `fontSize: '8.5px'`, `padding: '2px 5px'`, `borderRadius: '5px'`, `flexShrink: 0`.

### Full-Coverage Detail Containers & Bottom Dock Protection
- **Full Bottom Coverage:** Detail containers MUST have `bottom: 0`, `top: 64px`, `background: var(--bg-color)`, `z-index: 200`, and `padding-bottom: 96px`.
- **Background Bleed Prevention:** Never use `bottom: 84px` or leave open space under the detail view. Extending the container to `bottom: 0` ensures background list cards (`DriverFeed`) do NOT bleed through the glass of the floating Bottom Navigation Dock (`BottomNav`).
- **Un-Pinned Action Buttons:** Keep action buttons (`応募する`, `紹介`, `電話する`) in normal document flow at the end of the page scroll (`position: relative; margin: 24px 0; border-radius: 20px;`) with the Call button (`[ 📞 電話する ]`) positioned as the **last button on the far right**.

---

## 📐 10. Single Vertical Line Grid & Spacing Standard ("Devorlari Bir Chiziqda")

### Detail Views (Job Detail & Driving Academy) 12px Spacing & 14px Grid Invariants
- **Inter-Card Gap:** `12px` (`.detail-section`, `.shoukai-detail-block` -> `margin-bottom: 12px;`).
- **Action Bento Card Placement:** Inside detail body (`padding: 16px 14px 0 14px`) with `margin: 0; width: 100%;` -> places card side borders flush on the `14px` grid line, matching all upper cards and avoiding touching screen borders.
- **Bottom Dock Clearance:** `96px` (`.job-detail-container`, `.academy-container` -> `padding-bottom: 96px;`).
- **Mathematical Clearance Formula:** `(0px detail padding + 96px container) - 84px BottomNav top = 12px visual clearance`.
- **Unified Background:** `background: var(--bg-color);` on both detail scroll containers.

### Profile Page 12px Spacing & Logout Clearance Equation
- **Inter-Card Gap:** `12px` (`.profile-body { gap: 12px; }`).
- **Profile Menu Padding:** `padding: 0 14px 0 14px;` (`padding-bottom: 0px`).
- **Bottom Dock Clearance:** `96px` (`.profile-container { padding-bottom: 96px; }`).
- **Mathematical Formula:** `(0px menu padding + 96px container) - 84px BottomNav top = 12px visual clearance`.
- **No Inline Offsets:** Do NOT add inline `style={{ marginTop: '16px' }}` on child bento cards (`.resume-card`, `.vehicle-bento-card`). Rely strictly on parent `gap: 12px`.










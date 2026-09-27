# Authentication & Role Selection Suite Architecture & Layout Rules

## Core Layout & Dimension Norms
- **Viewport Container (`.role-select-overlay` / `.auth-container`)**:
  - Full screen flex overlay `width: 100%`, `min-height: 100dvh`, background `var(--dash-bg)`.
  - Max width on desktop view: `460px` centered container with card shadow `0 20px 60px rgba(0,0,0,0.5)`.
- **Role Selection Cards**:
  - Driver & Company Banners: `height: 180px`, `border-radius: 20px`, `padding: 24px`, background linear gradients.
  - Hover / Focus scale: `transform: translateY(-2px)`, active border halo `var(--brand-primary)`.
- **Input Fields**: `height: 48px`, `border-radius: 12px`, `padding: 0 16px`, `font-size: 15px`.
- **Z-Index Hierarchy**:
  - Base Auth Page: `z-index: 10`.
  - Email OTP Auth Modal: `z-index: 9999` (`var(--z-modal)`).

## Per-Component Spec Index (`rules/`)
1. [`role_select_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/auth/rules/role_select_spec.md) - Role choice screen (Haydovchi vs Ish beruvchi), guest mode toggle.
2. [`email_otp_modal_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/auth/rules/email_otp_modal_spec.md) - N8n & Gemini OTP verification popup modal.
3. [`driver_registration_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/auth/rules/driver_registration_spec.md) - Driver profile creation, Japanese license checkboxes (Futsu, Oogata, Forklift).
4. [`company_registration_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/auth/rules/company_registration_spec.md) - Corporate recruiter onboarding, company registration number, prefecture picker.
5. [`auth_security_lockout_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/auth/rules/auth_security_lockout_spec.md) - Brute-force protection, 5-attempt lockout timer, Captcha verification.

## Bug Prevention & Learned Fixes
- **State Preservation on Role Switch**: When user switches between 'driver' and 'company', clear role-specific sub-states while preserving verified email/phone token.
- **Lockout Timer Resiliency**: Store lockout timestamps in `localStorage.setItem('michi_auth_lockout_until')` to prevent users from bypassing failed attempt limits via page reload.
- **Password Mask Toggle**: Password fields must feature explicit aria-label accessible visibility toggles (`Eye` / `EyeOff` icons).

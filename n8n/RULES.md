# n8n Backend Automation & Workflow Integration Rules

## Core Workflow Specifications
- **Workflow 1: Auth & Lockout Monitoring (`workflow_1_auth_monitoring.json`)**:
  - Webhook Trigger: `/webhook/michi-auth-monitor`
  - Purpose: Tracks brute-force security alerts, logs failed login attempts, notifies admin Telegram channel on repeated IP lockouts.
- **Workflow 2: Email OTP Dispatch (`workflow_2_otp_email.json`)**:
  - Webhook Trigger: `/webhook/michi-otp-send`
  - Purpose: Sends 6-digit HTML email verification codes to drivers & corporate recruiters via SMTP / Resend API.
- **Workflow 3: Shoukai Verification (`workflow_3_shoukai_verification.json`)**:
  - Webhook Trigger: `/webhook/michi-shoukai-verify`
  - Purpose: Validates driver referral codes and processes reward payouts upon successful employer hire.

## Per-Workflow Spec Index (`rules/`)
1. [`n8n_auth_monitoring_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/n8n/rules/n8n_auth_monitoring_spec.md) - Security surveillance webhook spec.
2. [`n8n_otp_email_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/n8n/rules/n8n_otp_email_spec.md) - Email OTP dispatch webhook spec.
3. [`n8n_shoukai_verification_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/n8n/rules/n8n_shoukai_verification_spec.md) - Shoukai referral validation webhook spec.

## Security & Reliability Rules
- **Webhook Token Authentication**: All n8n inbound webhooks MUST validate header `X-Michi-Secret-Token` matching application environment secrets.
- **Failover SLA**: If n8n email dispatch times out (> 5s), fallback to secondary client-side demo OTP verification code without blocking user sign-up flow.

# Auth Security Lockout Specification

## Security Rules & Thresholds
- **Max Failed Attempts**: 5 consecutive incorrect passwords or OTP codes.
- **Lockout Duration**: 15 minutes (900 seconds) countdown.
- **Captcha Trigger**: Displays mathematical / image captcha after 3 failed attempts before enforcing total lockout.

## Button & Event Rules
- **Lockout Reset Timer**: Auto-refreshes remaining lockout duration every 1 second.
- **Unlock Request**: Prompts email reset link dispatch via `authSecurityService.js`.

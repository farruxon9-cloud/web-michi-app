# n8n OTP Email Specification

## Webhook Input Payload
```json
{
  "email": "driver@example.com",
  "otpCode": "658080",
  "lang": "uz"
}
```

## Email Template Rules
- Renders responsive Japanese/Uzbek HTML email card with 6-digit highlighted code.
- Sender: `Michi Japan <noreply@michi.app>`.

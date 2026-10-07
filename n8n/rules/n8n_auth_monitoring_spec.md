# n8n Auth Monitoring Specification

## Webhook Input Payload
```json
{
  "event": "LOCKOUT_ALERT",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1",
  "failedCount": 5,
  "timestamp": 1727420000000
}
```

## Action Pipeline
1. Validates `X-Michi-Secret-Token`.
2. Stores security alert in Postgres database.
3. Formats Telegram alert message to Admin operations team.

# Michi App — N8N Workflow Automation

Ushbu papka Michi App ilovasi uchun tayyorlangan N8N avtomatlashtirish ish oqimlarini (workflows) o'z ichiga oladi.

## Workflows Mundarijasi

### 1. `workflow_1_auth_monitoring.json`
- **Tavsif**: Kirish urinishlarini real vaqtda monitoring qiladi.
- **Trigger**: `POST /auth/failed-attempt`
- **Mantiq**: 
  - 10+ muvaffaqiyatsiz urinish bo'lsa, `admin@michi-app.com` ga xavfsizlik alerti yuboradi.
  - 30+ muvaffaqiyatsiz urinish (bot hujumi) bo'lsa, IP manzilini Supabase `blocked_ips` ro'yxatiga 24 soatga qo'shadi.

### 2. `workflow_2_otp_email.json`
- **Tavsif**: OTP tasdiqlash kodini generatsiya qiladi va email orqali yuboradi.
- **Trigger**: `POST /auth/send-otp`
- **Mantiq**:
  - Kriptografik 6 xonali OTP kod yaratadi.
  - Kodni Supabase'da 10 daqiqa yaroqlilik bilan saqlaydi.
  - SendGrid / Gmail vositasida foydalanuvchiga yuboradi va `{ success: true }` qaytaradi.

### 3. `workflow_3_shoukai_verification.json`
- **Tavsif**: Shoukai (Referral) to'lovlarini va arizalarni avtomatik tasdiqlaydi.
- **Trigger**: `POST /shoukai/verify`
- **Mantiq**:
  - Referral arizasini va to'lov holatini tekshiradi.
  - `shoukaiPaid = true` belgisini qo'yadi.
  - FCM (Firebase Cloud Messaging) orqali taklif etuvchiga jonli push notification yuboradi.

## Import Qilish Yo'riqnomasi

1. N8N boshqaruv paneliga kiring (`https://your-n8n-instance.com`).
2. **Workflows** -> **Import from File** bo'limini tanlang.
3. Kerakli `.json` faylini yuklang va sozlashingizni saqlang.

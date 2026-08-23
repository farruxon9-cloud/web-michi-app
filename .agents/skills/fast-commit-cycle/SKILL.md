---
name: fast-commit-cycle
description: >
  Tez va xatosiz commit jarayoni uchun standart siklni avtomatlashtirish.
  Test → Validate → Build → Commit ketma-ketligini bitta buyruqda bajaradi.
---

# ⚡ Fast Commit Cycle Skill

## Maqsad
Har bir o'zgarish uchun to'g'ri va xatosiz commit qilishni kafolatlash. Hech qachon testlar o'tmaguncha commit qilinmasligi kerak.

## Standart Commit Sikli

### 1-qadam: Test va Validatsiya
```bash
# Bitta buyruqda barcha tekshiruvlar
npm test && node scripts/validate_vehicle_db.mjs && npm run build
```

Agar bu buyruq `exit code 0` bilan tugasa — commit ruxsat etiladi.
Agar xatolik bo'lsa — **COMMIT TAQIQLANADI**.

### 2-qadam: Commit Message Formati
Commit xabari quyidagi formatda bo'lishi SHART:

```
<type>(<scope>): <qisqa tavsif> on <branch> branch
```

**Type turlari:**
| Type | Ishlatilishi |
|------|-------------|
| `feat` | Yangi funksiya qo'shilganda |
| `fix` | Xatolik tuzatilganda |
| `style` | Faqat UI/CSS o'zgarishi |
| `refactor` | Kod qayta ishlanganda (funksiya o'zgarmaydi) |
| `docs` | Hujjatlar yangilanganda |
| `test` | Test qo'shilganda |
| `chore` | Yordamchi vazifalar (build config, deps) |

**Scope turlari:**
| Scope | Qo'llanilishi |
|-------|--------------|
| `profile` | Profile.jsx va unga bog'liq |
| `picker` | JapaneseVehiclePickerModal |
| `services` | API servislar |
| `ui` | Umumiy UI/UX |
| `agents` | Agent qoidalari va skilllar |
| `nav` | Navigatsiya |
| `photos` | Rasmlar va media |
| `presets` | Preset ma'lumotlar |

### 3-qadam: Tezkor Buyruq
```bash
# Barcha tekshiruvlardan so'ng commit
git add . && git commit -m "feat(scope): tavsif on b1 branch"
```

## ⚠️ Taqiqlar
- **HECH QACHON** `git push` qilinmaydi (faqat foydalanuvchi so'rasa)
- **HECH QACHON** `main` branchiga merge qilinmaydi
- Testlar o'tmaguncha commit **TAQIQLANADI**

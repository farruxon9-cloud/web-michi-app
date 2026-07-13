---
name: voice-assistant-architecture
description: Michi AI Voice Assistant arxitekturasi, qoidalari va best practice'lari. VoiceAssistant.jsx ga o'zgartirish kiritilganda yoki yangi buyruq/oqim qo'shilganda ushbu skill'ni o'qing.
---

# Michi AI Voice Assistant — Arxitektura va Qoidalar

## Fayl Joylashuvi
- **VoiceAssistant.jsx**: `src/components/VoiceAssistant.jsx` — asosiy voice assistant komponenti (~3100+ qator)
- **voiceLexicon.js**: `src/utils/voiceLexicon.js` — local NLP pattern dictionary
- **App.jsx**: `src/App.jsx` — VoiceAssistant ga prop'lar uzatuvchi parent komponent

---

## 🏗️ Arxitektura Tuzilishi

### 1. Ikki Qatlamli Buyruq Aniqlash (Dual-Layer Command Detection)
VoiceAssistant buyruqlarni **ikki bosqichda** aniqlaydi:

1. **Local NLP (voiceLexicon.js)** — tez, offline, Levenshtein distance (75%+ threshold)
2. **Gemini AI (cloud)** — aqlli, kontekstli, JSON formatida javob qaytaradi

Local NLP natijasi Gemini natijasini **override** qilishi mumkin (`interceptLocalCommand` → `localOverride`).

### 2. Ikki Gemini Prompt (MUHIM!)
Tizimda **IKKITA** alohida Gemini prompt bor:
- **Text Prompt** (~line 2060): `processTextWithGemini` — matn kiritilganda ishlatiladi
- **Audio Prompt** (~line 2510): `processAudioWithGemini` — ovoz yozib olinganda ishlatiladi

> [!CAUTION]
> Yangi buyruq qo'shilganda **IKKALA** promptning `COMMAND RULES` bo'limini yangilash **SHART**! Aks holda Gemini yangi buyruqni tanimaydi.

### 3. Delayed vs Immediate Commands
```javascript
const isDelayedCommand = [
  'NAVIGATE_TO_HOME', 'NAVIGATE_TO_JOBS', ...navigatsiya buyruqlari
].includes(aiResult.command);
```
- **Delayed**: Navigatsiya buyruqlari — AI avval gapini tugatadi, 500ms kutadi, keyin sahifa almashtiradi
- **Immediate**: Musiqa buyruqlari — darhol bajariladi (MUSIC_PLAY, MUSIC_PAUSE, MUSIC_NEXT, MUSIC_PREV)

---

## 📝 Rezyume State Machine (processResumeFlow)

### Muhim Qoidalar:
1. `processResumeFlow` **async** funksiya (Gemini AI parser uchun)
2. Har bir maydon **ikki bosqichli**: `ask_*` → `confirm_*`
3. Oqim: ask_name → confirm_name → ask_furigana → ... → ask_personalrequests → confirm_personalrequests → finish

### isPositive / isNegative Pattern Matching
> [!WARNING]
> Qisqa so'zlar (3 belgi va kamroq) uchun **word boundary** regex ishlatilishi SHART!
> `"Shahzod".includes("ha")` → `true` bo'lib xato natija beradi.

```javascript
// TO'G'RI:
if (p.length <= 3) {
  const wordRegex = new RegExp(`(^|\\s|,|\\.)${p}($|\\s|,|\\.|!|\\?)`, 'i');
  return wordRegex.test(lowerText) || lowerText === p;
}
// XATO: lowerText.includes(p) — qisqa so'zlar uchun ISHLATMANG!
```

### Raqamli Maydonlar uchun Gemini Parser
Quyidagi maydonlar `parseResumeFieldWithGemini()` orqali Gemini AI ga yuboriladi:
- `ask_birthdate` → YYYY-MM-DD
- `ask_postalcode` → XXX-XXXX
- `ask_phone` → 080-1234-5678
- `ask_edu_start_year`, `ask_edu_end_year` → 4 xonali yil
- `ask_work_start_year`, `ask_work_end_year` → 4 xonali yil

Bu so'zlar bilan aytilgan raqamlarni ham to'g'ri parse qiladi (masalan: "to'qson beshinchi yil" → 1995).

### Oqim Nazorati (Cancel/Back/Skip/Repeat)
`processResumeFlow` boshida tekshiriladi (switch'dan oldin):
1. **Cancel**: `bekor qil`, `cancel`, `キャンセル` → oqimni to'xtatadi
2. **Back**: `ortga`, `back`, `戻る` → `getPreviousStep()` orqali oldingi savolga qaytadi
3. **Skip**: `o'tkaz`, `skip`, `スキップ` → keyingi savolga o'tadi
4. **Repeat**: `qayta`, `repeat`, `もう一度` → joriy savolni qayta o'qiydi

---

## 🎵 Audio Ducking Tizimi

```javascript
useEffect(() => {
  if (isActive && (status === 'listening' || status === 'speaking' || status === 'thinking')) {
    activeMusicPlayer.setVolume(0.01); // 1% ga pasaytiradi
  } else {
    activeMusicPlayer.setVolume(originalVolumeRef.current); // asl holatga qaytaradi
  }
}, [isActive, status]);
```

- `originalVolumeRef` — asl volume qiymatini saqlaydi
- Status `idle` ga o'tganda yoki overlay yopilganda volume qaytariladi

---

## 🧭 Yangi Buyruq Qo'shish Checklist

Yangi voice command qo'shishda quyidagi **barcha** joylarni yangilash kerak:

- [ ] `voiceLexicon.js` — patterns (uz, ja, en) va responses qo'shish
- [ ] **Birinchi** Gemini Prompt (`processTextWithGemini`) — COMMAND RULES bo'limi
- [ ] **Ikkinchi** Gemini Prompt (`processAudioWithGemini`) — COMMAND RULES bo'limi
- [ ] `executeVoiceCommand` switch/case — yangi case qo'shish
- [ ] `isDelayedCommand` ro'yxati — navigatsiya buyrug'i bo'lsa qo'shish
- [ ] `isNavigationCommand` ro'yxati — navigatsiya buyrug'i bo'lsa qo'shish
- [ ] App.jsx — agar yangi prop kerak bo'lsa, VoiceAssistant ga uzatish

---

## ⚠️ Profil Tekshiruvi (checkIsProfileComplete)

`APPLY_TO_CURRENT` buyrug'i bajarilishdan oldin profil to'liqligini tekshiradi:
- Agar profil to'liq bo'lmasa — AI ovozda tushuntiradi va avtomatik rezyume builder oqimini boshlaydi
- `checkIsProfileComplete()` — `executeVoiceCommand` ichida aniqlangan
- Tekshiriladigan maydonlar: fullName, birthDate, phone, address/addressHistory, education/educationHistory

---

## 🙏 Salomlashuv Tizimi

- `hasGreetedRef` — sessiya davomida faqat 1 marta salom berish uchun
- Vaqtga qarab (ertalab/kunduz/kechqurun/tun) va tilga qarab (uz/ja/en) salomlashish
- `isActive` useEffect ichida amalga oshiriladi

---

## 🔧 Prop'lar (App.jsx → VoiceAssistant)

Muhim prop'lar: `toggleDarkMode`, `setProfileActivePage`, `musicPlayer`, `profileData`, `jobs`, `schools`, `applications`, `setApplications`, `handleApplyJob`, `handleApplySchool`, `handleShoukai`

Yangi prop qo'shilganda:
1. VoiceAssistant signaturega qo'shish
2. Ref yaratish (`const propRef = useRef(prop); propRef.current = prop;`)
3. App.jsx da uzatish

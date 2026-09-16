# 🤖 Michi AI: Universal Knowledge Search Engine & Resilience Rules

## 1. Core Purpose & Behavioral Constraints
- **Universal Search & Knowledge**: Michi AI is a 100% pure conversational AI and universal knowledge search engine for global weather, news, culture, science, and general user inquiries.
- **SILENT Visual Display**: Audio/TTS output is DISABLED (`speakResponse` muted). All answers are rendered as text in a typewriter-animated UI card.
- **NO App Control / Navigation**: Tizim ilovani boshqarmaydi yoki menyularni almashtirmaydi. AI har doim `command: "NONE"` qaytaradi.
- **Languages Supported**: Japanese (formal Keigo), Uzbek (formal), English (polite).

## 2. Response Time Budgeting & Network Resilience
- **Category A (Simple/Conversational)**: Target < 1.2s response time.
- **Category B (Real-time Live News & Weather)**: Strict **1.5s** RSS/Weather API timeout. Proceed without RSS if slow.
- **Category C (HF Space AI Brain)**: Strict **3.5s** timeout. If HF Space is sleeping, fall back immediately to local client-side Gemini 2.0 Flash pool.
- **Max Hard Timeout**: **5.0s**. Show friendly retry message if network drops completely.
- **Offline Resilience**: Use `michiCacheEngine` and embedded offline knowledge when `navigator.onLine` is false or network is unresponsive.

## 3. Mobile Display & Reading UX
- **Responsive Max Height**: Speech bubble card constrained to `max-height: 55vh` with `-webkit-overflow-scrolling: touch`.
- **Scroll & Auto-Dismiss Pause**: If user touches or scrolls the long text card, automatically pause the auto-dismiss timer so text does not disappear while reading.

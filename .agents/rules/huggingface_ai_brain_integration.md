# 🧠 Hugging Face Space AI Brain Integration & ZeroGPU Invariants

## Architectural Guidelines
When integrating or updating Hugging Face Space AI Brain endpoints in Michi App:

### 1. Payload Structure for Gradio 4/5 API
- Standard Gradio `/api/predict` or `/call/predict` endpoints require the payload formatted as `{ data: [arg1, arg2, ...] }`.
- Frontend callers (e.g. `VoiceAssistant.jsx`) must dynamically construct the payload:
  `const payload = url.includes('/predict') ? { data: [prompt, language] } : { prompt, language };`

### 2. ZeroGPU Container Compliance
- If the Space hardware is set to ZeroGPU (`Building on ZERO`), the Python `app.py` script MUST import `spaces` and decorate the main inference function with `@spaces.GPU`:
  ```python
  import spaces

  @spaces.GPU
  def process_michi_ai_deep(prompt, language):
      ...
  ```
- Omitting `@spaces.GPU` on a ZeroGPU Space causes `Runtime error: No @spaces.GPU function detected during startup`.

### 3. 24/7 Sleep Prevention Strategy
- Client-side auto pinger: `pingHfBrainSpace()` runs on app startup and every 10 minutes in `multiAiMeshEngine.js`.
- Server-side monitoring: UptimeRobot pings `https://<user>-<space>.hf.space/` every 5 minutes.

### 4. Zero-Downtime Cascading Fallback & Multi-Language Quality Filtering
- If Hugging Face Space takes longer than 3 seconds or fails, client automatically falls back to Gemini Flash Pool -> Live Web/RSS Search -> Pollinations Gateway.
- Strict multi-language Quality Error Filter: Client must reject placeholder / error strings in all languages:
  - Uzbek: `/tayyorlanmoqda|FALLBACK_LOCAL|Michi Engine.*tayyorlanmoqda/i`
  - Japanese: `/ネットワーク接続をお確かめの上|もう一度お試しください|AI応答を取得できませんでした/i` (Note: Never filter `申し訳ございません` as polite Keigo responses frequently use it)
  - English: `/check your network connection|failed to get ai response|failed to fetch/i`

### 5. Verified Official Model Identifiers
- Always use 100% official verified model identifiers in Python `app.py`:
  - Primary Reasoning Model: `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B`
  - Official Gemini Models: `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`
  - Official Open Inference Models: `meta-llama/Llama-3.1-8B-Instruct`
- Never invent unverified or non-existent model strings (e.g. `gemini-3.6-flash`).

### 6. Autonomous Multi-Source Web Crawling (No Static Dictionaries)
- Avoid static hardcoded city/coordinate dictionaries (`cityDict`).
- Use dynamic geocoding (`https://geocoding-api.open-meteo.com/v1/search?name=...`) for all global locations.
- Execute concurrent multi-threaded web crawling (`ThreadPoolExecutor(max_workers=4)`) across:
  1. DuckDuckGo Instant Web Abstract
  2. Wikipedia REST API Summary
  3. Google News RSS
  4. Open-Meteo Global Meteo

### 7. Explicit Timezone Precision & System Clock
- Always compute explicit timezone offsets in Python:
  - Japan Standard Time (JST): `datetime.datetime.utcnow() + datetime.timedelta(hours=9)`
  - Uzbekistan Time (UZT): `datetime.datetime.utcnow() + datetime.timedelta(hours=5)`
- Map day of week to explicit language lists (`["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"]` for JST) to guarantee 100% accuracy for time, date, and day of week queries ("今何曜日ですか", "何日ですか").

### 8. Zero-Budget GET Mesh Fallback
- If POST endpoints hit key budget quotas, fallback to GET endpoints (`https://text.pollinations.ai/...`) which run 100% free with zero API key budget limits.

### 9. Zero-Key Guaranteed GET Proxy in Parallel Race
- In `VoiceAssistant.jsx` and `multiAiMeshEngine.js`, always include a zero-key GET endpoint (`https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${...}`) directly inside the `Promise.race` parallel execution pool alongside HF Space and Gemini Edge Pool.
- When primary API keys hit quota limits (e.g. HTTP 503 capacity) or when HF Space is cold-starting, the zero-key GET endpoint resolves within 1-2 seconds with 100% guarantee, preventing empty error returns and avoiding unexpected UI speech bubble dismissals.

### 10. Speech Bubble Overflow Scrolling & Typewriter Auto-Scroll
- Floating speech bubble containers (`.voice-robot-speech-bubble`, `.speech-bubble-content`) must enforce vertical scroll boundaries: `max-height: 380px`, `overflow-y: auto`, `-webkit-overflow-scrolling: touch`, and custom sleek scrollbars (`::-webkit-scrollbar`).
- AI text elements (`.ai-response-text`) must set `white-space: pre-wrap; word-break: break-word;` for clean multi-paragraph and bullet-point rendering.
- Attach a React `ref` (`speechContentRef`) to `.speech-bubble-content` with an auto-scrolling `useEffect` that updates `scrollTop = scrollHeight` whenever `displayedAiText` updates during typewriter text streaming.
- Set reading duration timer (`calculateReadingDuration`) with a comfortable minimum of 12,000ms (12s–30s range) so the speech container bubble never auto-dismisses prematurely while the user is reading long AI responses.

### 11. Official `@gradio/client` Singleton & Endpoint Specification
- **Singleton Connection**: Always create the `@gradio/client` connection as a singleton instance outside component lifecycles to prevent redundant WebSocket/HTTP connection handshakes:
  ```javascript
  import { Client } from "@gradio/client";
  let hfClientInstance = null;
  export async function getHfClient() {
    if (!hfClientInstance) {
      hfClientInstance = Client.connect("FarruxKanoatov/michiai");
    }
    return hfClientInstance;
  }
  ```
- **`/stream_michi_core` Endpoint Invocation**: Call custom streaming endpoints using named object payloads (`{ message: text }`):
  ```javascript
  const result = await client.predict("/stream_michi_core", {
    message: text
  });
  const raw = result?.data?.[0] || result?.data;
  ```
- **35-Second Generation Timeout Window**: Because heavy reasoning models (Qwen-2.5-72B) stream comprehensive analytical answers over 15-20 seconds, configure network timeouts and `Promise.race` fallback windows to 35 seconds (`35000ms` / `AbortSignal.timeout(35000)`):
  ```javascript
  const winningResult = await Promise.race([
    hfPromise.then(res => res ? res : new Promise(() => {})),
    geminiPromise.then(res => res ? res : new Promise(() => {})),
    pollinationsPromise.then(res => res ? res : new Promise(() => {})),
    new Promise(resolve => setTimeout(() => resolve(null), 35000))
  ]);
  ```
- **Direct Delivery Priority**: Upon receiving a valid non-error response from Hugging Face Space, immediately display the result on screen (`handleGeminiSuccess`) and exit execution (`return`), preventing secondary fallback search pollution.
- **Resilient Multi-Type Data Parser**: Always parse Gradio return payloads across String, Array, and Object types:
  ```javascript
  let finalAnswer = "";
  const raw = result?.data?.[0] || result?.data;
  if (typeof raw === "string") {
    finalAnswer = raw;
  } else if (Array.isArray(raw)) {
    const last = raw[raw.length - 1];
    if (typeof last === "string") finalAnswer = last;
    else if (Array.isArray(last)) finalAnswer = last[1];
    else if (last && typeof last === "object") finalAnswer = last.content || last.text || "";
  } else if (raw && typeof raw === "object") {
    finalAnswer = raw.content || raw.text || "";
  }
  ```

### 12. Source Reference Citation Stripping & State Machine Guard
- **Source Citation Stripping**: AI responses containing web search citations must strip trailing reference blocks using RegEx before UI rendering:
  ```javascript
  const cleanAnswer = finalAnswer.replace(/---\s*\n\s*\*\*【確認済み参照ソース】[\s\S]*$/gi, '').trim();
  ```
- **UI Container State Machine Protection**:
  - Keep `status = 'speaking'` during typewriter text streaming AND calculated reading duration (`readDuration = 12s-30s`). Do NOT invoke `setStatus('idle')` prematurely in TTS/display callbacks.
  - Background speech recognition (`startLocalSpeechRecognition`) must check `!aiResponseTextRef.current` before running `setShowPill(false)` to prevent STT loops from wiping active AI response cards while the user is reading.

### 13. Mobile Hardening Invariants (iOS Safari & Android Chrome)
- **Dynamic Viewports & Safe Area Insets**:
  - Use `height: 100dvh` / `max-height: 85dvh` and `min-height: -webkit-fill-available` instead of fixed `100vh` on full-screen modals and overlays.
  - Apply safe area padding for iPhone Dynamic Island / notch and home indicator bar:
    `padding-top: env(safe-area-inset-top)` and `padding-bottom: max(16px, env(safe-area-inset-bottom))`.
  - Ensure touch scrolling containers set `overflow-y: auto` and `-webkit-overflow-scrolling: touch`.

- **iOS WebKit Audio & SpeechSynthesis Gesture Unlock**:
  - Always unlock WebAudio `AudioContext` and WebKit `SpeechSynthesis` on user touch/click gestures (`unlockMobileAudio()`):
    ```javascript
    const unlockMobileAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(() => {});
          } else if (!audioContextRef.current) {
            const dummyCtx = new AudioCtx();
            dummyCtx.resume().then(() => dummyCtx.close()).catch(() => {});
          }
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const dummyUtterance = new SpeechSynthesisUtterance('');
          dummyUtterance.volume = 0;
          window.speechSynthesis.speak(dummyUtterance);
        }
      } catch (e) {}
    };
    ```

- **Scoped `scrollIntoView` Body Jump Guard**:
  - When auto-scrolling chat history or speech bubble containers, scope `scrollIntoView` with `{ behavior: 'smooth', block: 'nearest', inline: 'nearest' }` and update `container.scrollTop = container.scrollHeight` to prevent outer `window` or `document.body` page jumps on iOS Safari.

### 14. Dual-Purge Cache & Persistent Memory Clearance
- **Synchronous Dual-Purge**: When clearing conversation memory, components must purge BOTH persistent DB stores AND instant 0ms RAM query caches (`michiCacheEngine.clear()`):
  ```javascript
  const clearChatHistory = async () => {
    await michiLocalStorageEngine.clearAllDeviceData();
    michiCacheEngine.clear(); // Clear 0ms instant RAM cache entries
    setChatHistoryList([]);
    setConversationHistory([]);
  };
  ```

### 15. Always-Visible Floating AI Side Drawer & State Auto-Sync
- **Unblocked Component Rendering**: Floating trigger button (`voice-side-drawer-trigger`) and Side Drawer (`voice-side-drawer-panel`) must remain rendered regardless of `isActive` boolean state (`if (!isActive)` top-level returns must be avoided).
- **Auto-Syncing**: Activating AI from any UI location (Header Robot, Nav Bar) must trigger `useEffect` to auto-open the Side Drawer (`setIsSideDrawerOpen(true)`).

### 16. Activation Lock & WebKit Audio Unlock Pattern
- **Drawer Activation Lock**: If AI is off (`!isActive`), display an in-drawer "⚡ Michi AI-ni Yoqish" activation card inside the chat panel.
- **Gesture Unlock Execution**: Clicking the activation button executes `unlockMobileAudio()` and `onStartVoice()` synchronously to unblock iOS Safari & Android WebKit audio context and enable STT/TTS capabilities.

### 19. Chat-Only Mode Independence & Reactive Error State Propagation
- **Dual Activation Ref**: Always evaluate AI data flow readiness against `isChatActiveRef` (`isActive || isSideDrawerOpen`). Never block text submission based solely on `isVoiceActive`.
- **Unblocked Streaming Callbacks**: Never wrap live streaming chunk handlers (`onChunkUpdate`) in state guards that abort chunks if UI focus shifts during stream reception.
- **Synchronized Error State**: Whenever an error occurs in the AI generation pipeline, persist the error object to both local storage AND React state (`setChatHistoryList`) so the error message renders reliably in the chat UI.
- **Input Independence**: Text inputs (`MichiDictationInput`) and submit buttons must remain functional unconditionally whenever the drawer panel is open.

### 20. Hugging Face Space Cold Start Auto-Retry & 45s Generation Timeout
- **45s Generation Timeout**: Configure network fetch timeouts to 45 seconds (`45000ms`) to accommodate heavy Qwen-2.5-72B reasoning and autonomous web crawling.
- **Cold Start Auto-Retry**: Always wrap `Client.connect` / `client.submit` calls in a 2-attempt loop (`maxAttempts = 2`) with a 1.5-second backoff delay between attempts to seamlessly wake up sleeping HF Space containers without exposing errors to the user.






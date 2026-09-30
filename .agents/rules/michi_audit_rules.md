# Michi App Development, Architectural & Layout Rules

This file documents all technical, architectural, layout, and bug-fix rules learned during codebase audits and pair programming sessions.

---

## 1. Web Canvas & Responsive Layout Standard
- **820px Desktop Web Canvas (`src/index.css`)**: The application is built as an 820px max-width Desktop Web Application (`max-width: 820px; margin: 0 auto;` with glass ambient blobs in light mode and open side margins). NEVER restrict `#root` or `.app-layout` to a 430px narrow mobile shell frame unless explicitly requested by the user.
- **Vertical Scrolling Contract (`src/App.css`)**: `.main-content` MUST maintain `overflow-y: auto;` and `-webkit-overflow-scrolling: touch;`. Never set `.main-content` to `overflow: hidden`, as it locks vertical scrolling across all main views (`Dashboard`, `DriverFeed`, `DrivingAcademy`, `Profile`, `CompanyHome`).

---

## 2. Floating Bottom Navigation & Trailing Clearance Spacers
- **Standard Views Clearance**: `Dashboard.jsx`, `DriverFeed.jsx`, `DrivingAcademy.jsx`, and `CompanyHome.jsx` use a trailing clearance spacer of **`64px`**:
  ```jsx
  <div style={{ height: '64px', minHeight: '64px', width: '100%', flexShrink: 0, clear: 'both' }} />
  ```
- **Profile Page Exception (`Profile.jsx`)**: The Profile page uses a custom **`76px`** clearance spacer (`64px + 12px`), and the `.logout-btn` element has `marginTop: '12px'` to maintain a distinct 12px gap below the profile menu box.

---

## 3. Component Performance & State Management
- **Job Feed Flashing & Skeleton Fix (`DriverFeed.jsx`)**: 
  - In-memory job filtering over `MOCK_JOBS` must use `useMemo` for `filteredJobs`.
  - Default array props MUST use module-level constants (e.g., `const EMPTY_ARRAY = []`) instead of inline `[]` defaults to prevent reference shifts that trigger infinite re-render loops.
  - Never insert artificial loading delays (e.g., `setTimeout(..., 200)`) in client-side filter handlers.
- **Leaflet Map Modal (`JobMapModal` in `DriverFeed.jsx`)**:
  - Rendered via `createPortal` into `#root`.
  - Do NOT mutate `document.body.style.overflow` during modal lifecycles to prevent page scroll jumping on close.
  - Carto Voyager tile layer (`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/...`) and custom `🚛` pin markers must be preserved.

---

## 4. Michi AI Drawer & Trigger Alignment
- **Trigger Bounds (`MichiDrawerTrigger.jsx`)**: The floating AI trigger button `minY` bound is set to `110px` to prevent the trigger from sliding behind the `.global-header` (height: 56px).
- **Side Drawer Panel (`VoiceAssistant.css`)**: The Michi AI Hub drawer is styled as a right-aligned side panel (`max-width: 440px; right: 0; top: 0; bottom: 0;`) with a glassmorphism backdrop blur (`backdrop-filter: blur(16px);`), keeping the main page content visible on the left side.

---

## 5. Network & Timeout Security
- **AbortController Timeout**: External fetch requests (n8n webhooks, Gateway API) MUST include an `AbortController` timeout (15–25s).
- **Vite Dev Server Proxy**: Local browser requests to `api.michi.jp.net` must go through the Vite proxy (`/api` -> `https://api.michi.jp.net` with `changeOrigin: true`) to avoid CORS blocks.
- **HTTPS Enforcement**: Webhook endpoints must always use `https://`.

---

## 6. Gateway AI Integration (`api.michi.jp.net`)
- **Chat Endpoint**: AI requests use `POST https://api.michi.jp.net/api/chat` with body `{ "message": text }`.
- **Response Sanitization**: All AI responses must pass through `sanitizeMichiResponse()` to strip `<think>...</think>` tags and JSON role leaks before display.

---

## 7. 5-Language Localization (`ja`, `uz`, `en`, `ru`, `zh`)
- All UI text must provide 5-language coverage via dictionary objects (`DICT`) or `i18n.t()`.
- Always include fallback logic (`DICT[key]?.[lang] || DICT[key]?.uz || t(key, '')`).

---

## 8. Git & Workflow Protocol
- **Unit Test Requirement**: Every change must be validated against the full 20-file test suite (`npm test -- --run`).
- **CRITICAL GIT CONSTRAINT**: Code changes are committed locally on the working branch (`web-1`). NEVER execute `git push` under any circumstances.

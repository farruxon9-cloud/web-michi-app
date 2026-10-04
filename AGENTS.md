# AGENTS.md — Michi App (single source of truth for AI agents)

React 19 + Vite 8 + Capacitor 8 PWA. **Frontend only** — backend is `https://api.michi.jp.net` (never write backend code).
User writes in Uzbek → answer in Uzbek, short, with clickable `file://` links.

## 0. Token-minimal workflow (do this, in this order)
1. **Find the owner file** — open [docs/PAGE_MAP.md](docs/PAGE_MAP.md) (screen → file, CSS, tests, spacer).
2. **Ask the graph, not grep** — MCP `graphify` tools (`query_graph`, `get_node`, `get_neighbors`, `shortest_path`)
   or CLI `graphify query "<question>"`, `graphify explain "<Symbol>"`, `graphify path "A" "B"`.
3. **Read by line range only.** Files > 800 lines are listed in PAGE_MAP §3 — never read them whole.
4. **Structural search/replace** — `ast-grep` (`sg`) instead of regex for JSX/JS (e.g. `ast-grep -p '<ResumeBuilder $$$ />' src`).
5. **Edit only what was asked** (scope rule below). Then `npm run check` (or `npm run check:fast` while iterating).
6. UI change → Playwright screenshot + measure (see skill `michi-change`). Commit locally.

Full procedure: skill [.agents/skills/michi-change/SKILL.md](.agents/skills/michi-change/SKILL.md).

## 1. Hard rules
| Rule | Detail |
|---|---|
| Branch | Work on **`web-1`**. **`git push` and `git merge` only on the user's explicit command.** |
| Scope | Change only the requested screen/component. Never touch global `src/index.css` / `src/App.css`, main colors or classNames unless asked. State every visual change explicitly. |
| i18n | **7 locales**: `ja, uz, en, ru, zh, vi, ne` (`src/locales/*.js`). Every new key in all 7, no duplicates. `t('key', { name, defaultValue })`. |
| Design | Keep the user's design 1:1 ([user-design-fidelity](.agents/rules/user-design-fidelity.md)). |
| Security / API | [michi_api_security_invariants](.agents/rules/michi_api_security_invariants.md) — no secrets in bundle, all calls via `apiFetch`, no OTP bypass. |
| Honesty | Verify before claiming done. Report numbers (tests, measured px), not adjectives. |
| Mirror | `web-start-michi-app/` is synced automatically by the pre-commit hook. **Never edit it directly.** |
| Comments | Preserve existing comments/docstrings unrelated to the change. |

## 2. Layout contract (BottomNav clearance = 12px)
- Canvas: 820px max-width (`src/index.css`); `.main-content` keeps `overflow-y: auto`.
- Last element must stop **12px above the floating BottomNav**. Spacer pattern:
  `<div aria-hidden="true" style={{ height: 'Npx', minHeight: 'Npx', width: '100%', flexShrink: 0, clear: 'both' }} />`
- Current N per screen is in PAGE_MAP (column *Spacer*). **Never guess N: measure** the gap with Playwright, then
  `N = current N + (12 − measured gap)`.
- Fixed CTA docks: `left: 50%; transform: translateX(-50%)`, `bottom: 96px`. Filter drawers: 160px spacer.
- Per-page history and user quotes: [michi-subpage-spacing-and-scope](.agents/rules/michi-subpage-spacing-and-scope.md).

## 3. Commands
| Command | What |
|---|---|
| `npm run check` | lint (errors) + tests + i18n + build + bundle scan + PAGE_MAP — one compact table |
| `npm run check:fast` | same without build |
| `npm run map` | regenerate `docs/PAGE_MAP.md` |
| `npm run graph` | rebuild graph (AST, free). Also runs automatically after every commit |
| `npm run sync:web-start -- --status` | how far the mirror has diverged |
| `npm run hooks` | (re)install git hooks in a fresh clone |

Commit gate (pre-commit hook, automatic): eslint on staged files blocks on errors; scope warning; mirror sync.

## 4. Known pitfalls (short — details in `.agents/rules/`)
- React-compiler lint: do not pass ref-closure handlers through helper functions; write them inline.
- Playwright: click BottomNav via `page.mouse.click(x, y)`; menu items via `el.click()` in `page.evaluate`.
- Default props: module-level `const EMPTY_ARRAY = []`, memoize lists (`useMemo`) — avoids re-render loops.
- Modals: `createPortal` into `#root`; never mutate `document.body.style.overflow`.
- Optional callbacks need safe defaults (`onLogout = () => {}`).
- Learnings by phase: [michi_v1_1_learnings](.agents/rules/michi_v1_1_learnings.md), [michi_auth_faza_learnings](.agents/rules/michi_auth_faza_learnings.md), [michi_schema_api_learnings](.agents/rules/michi_schema_api_learnings.md).

## 5. Learn protocol
New rule from the user → add it to the matching file in `.agents/rules/` (quote the user, cause, fix).
If it changes a hard rule above, update this file too. Old long versions: `docs/archive/`.

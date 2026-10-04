---
name: michi-change
description: Step-by-step procedure for ANY code change in Michi App (bug fix, UI tweak, new feature). Use it before editing src/ so the change is scoped, verified and cheap in tokens.
---

# michi-change — scoped, verified, token-minimal edits

## 1. Locate (≤ 3 tool calls)
- Screen named by the user → `docs/PAGE_MAP.md` row → owner file + CSS + tests + spacer.
- Symbol / "who uses X" → MCP `graphify` `get_node` / `get_neighbors`, or `graphify explain "X"`.
- Exact text in UI (Japanese label) → it is a locale value: `grep -n "<text>" src/locales/ja.js` → key → `grep -rn "'<key>'" src --include=*.jsx`.
- JSX/JS pattern → `ast-grep -p '<pattern>' src` (e.g. `ast-grep -p 'useEffect($$$)' src/components/Profile.jsx`).

## 2. Read narrowly
- `view_file` with StartLine/EndLine around the hit (±40 lines). Never open a > 800-line file whole.

## 3. Edit within scope
- Touch only the owner file(s). No global CSS, no color/className changes unless asked.
- New UI text → key in all 7 locales (`ja uz en ru zh vi ne`), fallback `t('key', { defaultValue })`.
- Spacing to BottomNav: measure first, then `N = current + (12 − gap)` (AGENTS.md §2).

## 4. Verify
- `npm run check:fast` while iterating; `npm run check` before commit (must say ALL GREEN).
- UI change: Playwright from `scratch_e2e/` (repo-local; delete after). Viewports 390×844, 320×640, 1024×560; light + dark when colors change.
  Measure with `getBoundingClientRect()`; look at the screenshot yourself.
- Compare against a fresh baseline from HEAD, not an old screenshot folder.

## 5. Commit (local only)
- `git add <exact files>` (never `git add -A`), conventional message: `fix(resume): …`, `style(profile): …`.
- Pre-commit hook: blocks eslint errors, warns on scope creep, syncs `web-start-michi-app/` (if it reports *pending*, mention it to the user).
- Post-commit hook rebuilds the graph automatically.
- Never push / merge without an explicit user command.

## 6. Report to the user (Uzbek, short)
What changed (file links), measured numbers, screenshot, open questions. State any visual change explicitly.

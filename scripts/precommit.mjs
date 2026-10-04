#!/usr/bin/env node
/**
 * Pre-commit gate (installed by `npm run hooks`). Fast: only looks at staged files.
 *   1. eslint --quiet on staged .js/.jsx  → BLOCKS on errors
 *   2. scope guard                          → WARNS (never blocks): many files, or global CSS touched
 *   3. mirror sync to web-start-michi-app/  → patch replay, staged into the same commit
 * Skip in an emergency with:  git commit --no-verify
 */
import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const staged = sh('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR']).stdout.split('\n').filter(Boolean);
const live = staged.filter((f) => !f.startsWith('web-start-michi-app/'));

// 1. lint staged source
const js = live.filter((f) => /^src\/.*\.(jsx?|mjs)$/.test(f));
if (js.length) {
  const r = sh('npx', ['eslint', '--quiet', ...js]);
  if (r.status !== 0) {
    console.error(`${r.stdout}${r.stderr}\n[pre-commit] ❌ eslint errors in staged files — fix them (or git commit --no-verify).`);
    process.exit(1);
  }
}

// 2. scope guard (warn only)
const srcFiles = live.filter((f) => f.startsWith('src/') && !/\/locales\//.test(f) && !/\.test\./.test(f));
const warn = [];
if (srcFiles.length > 6) warn.push(`${srcFiles.length} source files in one commit — is this one task?`);
for (const g of ['src/index.css', 'src/App.css']) if (live.includes(g)) warn.push(`global ${g} changed — only allowed on explicit request`);
if (warn.length) console.warn(`[pre-commit] ⚠️  scope: ${warn.join(' | ')}`);

// 3. mirror sync
const s = sh('node', ['scripts/sync_web_start.mjs', '--staged']);
if (s.stdout.trim()) console.log(s.stdout.trim());
if (s.status !== 0) console.warn(`[pre-commit] ⚠️  mirror sync failed: ${s.stderr.trim().split('\n').pop()}`);

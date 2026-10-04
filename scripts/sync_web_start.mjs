#!/usr/bin/env node
/**
 * Keep web-start-michi-app/ in sync with the live app, WITHOUT wiping its own extra files.
 *
 * The mirror is not a byte copy: it has ~43 files of its own (SideNav, academy/, admin/, ...).
 * So we never rsync/overwrite. Instead we replay the *patch* of each change onto the mirror:
 *   live change in src/foo.jsx  →  same hunk applied to web-start-michi-app/src/foo.jsx
 * Hunks that do not apply cleanly (mirror diverged there) are skipped and listed in
 * web-start-michi-app/SYNC_PENDING.md for a human/agent to port by hand.
 *
 * Usage:
 *   node scripts/sync_web_start.mjs --staged          # pre-commit hook: staged changes → mirror, then git add
 *   node scripts/sync_web_start.mjs --range A..B      # replay commits A..B onto the mirror
 *   node scripts/sync_web_start.mjs --status          # how far the mirror has diverged (file counts)
 */
import { spawnSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIRROR = 'web-start-michi-app';
const PATHS = ['src', 'public', 'index.html', 'vite.config.js', 'eslint.config.js'];
const PENDING = join(ROOT, MIRROR, 'SYNC_PENDING.md');

const git = (args, input) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024 });
const args = process.argv.slice(2);

if (!existsSync(join(ROOT, MIRROR))) { console.log(`[sync] ${MIRROR}/ not found — skipped`); process.exit(0); }

if (args.includes('--status')) {
  const r = spawnSync('diff', ['-rq', 'src', `${MIRROR}/src`], { cwd: ROOT, encoding: 'utf8' });
  const out = r.stdout.trim().split('\n').filter(Boolean);
  console.log(`[sync] differing: ${out.filter((l) => l.startsWith('Files')).length}, only-in-live: ${out.filter((l) => l.startsWith('Only in src')).length}, only-in-mirror: ${out.filter((l) => l.startsWith(`Only in ${MIRROR}`)).length}`);
  process.exit(0);
}

const rangeIdx = args.indexOf('--range');
const diffArgs = args.includes('--staged')
  ? ['diff', '--cached', '--binary', '--', ...PATHS]
  : rangeIdx >= 0 ? ['diff', '--binary', args[rangeIdx + 1], '--', ...PATHS] : null;
if (!diffArgs) { console.log('usage: --staged | --range A..B | --status'); process.exit(2); }

const patch = git(diffArgs).stdout;
if (!patch.trim()) process.exit(0); // nothing under synced paths changed

// Split into per-file patches so one diverged file does not block the rest.
const files = patch.split(/^(?=diff --git )/m).filter((p) => p.startsWith('diff --git'));
const applied = [];
const pending = [];
for (const p of files) {
  const name = (p.match(/^diff --git a\/(\S+)/) || [])[1];
  const opts = ['apply', '--whitespace=nowarn', `--directory=${MIRROR}`];
  const ok = git([...opts, '--check', '-'], p).status === 0;
  if (ok && git([...opts, '-'], p).status === 0) applied.push(name);
  else pending.push(name);
}

if (pending.length) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const head = existsSync(PENDING) ? readFileSync(PENDING, 'utf8') : '# Mirror sync: port these by hand\n\nAuto-written by scripts/sync_web_start.mjs. The mirror diverged here, so the patch did not apply. Port the change, then delete the line.\n\n';
  writeFileSync(PENDING, head + pending.map((f) => `- [ ] ${stamp} \`${f}\``).join('\n') + '\n');
}
if (args.includes('--staged')) git(['add', '--', MIRROR]);
console.log(`[sync] ${MIRROR}: applied ${applied.length}${pending.length ? `, pending ${pending.length} (see ${MIRROR}/SYNC_PENDING.md)` : ''}`);

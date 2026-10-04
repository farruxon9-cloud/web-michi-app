#!/usr/bin/env node
/**
 * One-command verification gate for agents and humans:  npm run check   (or: npm run check -- --fast)
 *
 * Runs, in order, and prints ONE compact table (low token cost):
 *   1. eslint src --quiet            (errors only; warnings are known backlog)
 *   2. vitest run
 *   3. i18n validator (7 locales, missing keys)
 *   4. vite build                    (skipped with --fast)
 *   5. dist bundle: no console.log, no leaked API keys   (skipped with --fast)
 *   6. docs/PAGE_MAP.md regenerated
 * Exit code 1 if any step fails; the failing step's last lines are printed.
 */
import { spawnSync } from 'child_process';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FAST = process.argv.includes('--fast');

const run = (cmd, args) => {
  const t = Date.now();
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: false, env: { ...process.env, FORCE_COLOR: '0', CI: '1' } });
  return { ok: r.status === 0, out: `${r.stdout || ''}${r.stderr || ''}`, ms: Date.now() - t };
};
const tail = (s, n = 15) => s.trim().split('\n').slice(-n).join('\n');

const steps = [
  ['lint', () => run('npx', ['eslint', 'src', '--quiet']), (o) => (o.ok ? '0 errors' : 'errors')],
  ['test', () => run('npx', ['vitest', 'run']), (o) => (o.out.match(/Tests\s+(.+)/) || [])[1]?.trim() || '?'],
  ['i18n', () => run('node', ['scripts/validate_i18n.mjs']), (o) => (o.ok ? '7 locales OK' : 'missing keys')],
];
if (!FAST) {
  steps.push(['build', () => run('npx', ['vite', 'build']), (o) => (o.ok ? 'OK' : 'failed')]);
  steps.push(['bundle', () => {
    const dir = join(ROOT, 'dist', 'assets');
    if (!existsSync(dir)) return { ok: false, out: 'dist/assets missing', ms: 0 };
    const bad = [];
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.js'))) {
      const s = readFileSync(join(dir, f), 'utf8');
      if (s.includes('console.log')) bad.push(`${f}: console.log`);
      if (/AIza[0-9A-Za-z_-]{30}|gsk_[A-Za-z0-9]{20}|sk-[A-Za-z0-9]{20}|hf_[A-Za-z0-9]{20}/.test(s)) bad.push(`${f}: secret-like string`);
    }
    return { ok: bad.length === 0, out: bad.join('\n'), ms: 0 };
  }, (o) => (o.ok ? 'clean' : 'dirty')]);
}
steps.push(['page-map', () => run('node', ['scripts/gen_page_map.mjs']), (o) => (o.ok ? 'regenerated' : 'failed')]);

let failed = 0;
const rows = [];
for (const [name, fn, summary] of steps) {
  const o = fn();
  rows.push(`${o.ok ? '✅' : '❌'} ${name.padEnd(9)} ${summary(o).padEnd(28)} ${(o.ms / 1000).toFixed(1)}s`);
  if (!o.ok) { failed++; rows.push(tail(o.out).replace(/^/gm, '    │ ')); }
}
console.log(rows.join('\n'));
console.log(failed ? `\n${failed} step(s) failed` : `\nALL GREEN${FAST ? ' (fast: build skipped)' : ''}`);
process.exit(failed ? 1 : 0);

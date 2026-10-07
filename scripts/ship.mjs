#!/usr/bin/env node
/**
 * npm run ship — bitta buyruq bilan hamma joyga chiqarish.
 *
 *   1. test + build (xato bo'lsa hech narsa push qilinmaydi)   [--skip-checks bilan o'tkazib yuborish mumkin]
 *   2. origin  web-1  ← joriy web-1 (monorepo)
 *   3. web-start-michi-app/ papkasining snapshot'i (sayt ildizi sifatida, .agents'siz):
 *        origin        web   (michiappforjapan)
 *        web-michi-app web   (GitHub → Cloudflare Pages avtomatik deploy → web.michi.jp.net)
 *        web-michi-app web-1 (sinov/zaxira)
 *   4. lokal s va s1 branchlariga web-1 ni merge qiladi (bo'lsa)
 *
 * Force-push yo'q: har bir snapshot oldingi commit ustiga yangi commit bo'lib tushadi.
 * Joriy branch va ishchi papkaga tegmaydi (vaqtinchalik index ishlatadi).
 *
 *   npm run ship                 # hammasi
 *   npm run ship -- --dry-run    # faqat nima qilinishini ko'rsatadi
 *   npm run ship -- --skip-checks
 */
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const SKIP = args.includes('--skip-checks');
const SRC_BRANCH = 'web-1';
const PREFIX = 'web-start-michi-app';
const EXCLUDE = ['.agents'];

const run = (cmd, a, opts = {}) => {
  const r = spawnSync(cmd, a, { cwd: opts.cwd || APP, encoding: 'utf8', env: { ...process.env, ...(opts.env || {}) }, stdio: opts.inherit ? 'inherit' : 'pipe' });
  if (r.status !== 0 && !opts.allowFail) {
    console.error(`\n✖ ${cmd} ${a.join(' ')}\n${r.stderr || r.stdout || ''}`);
    process.exit(1);
  }
  return (r.stdout || '').trim();
};
const git = (a, opts) => run('git', a, opts);
const ROOT = git(['rev-parse', '--show-toplevel']);
const g = (a, opts = {}) => git(a, { cwd: ROOT, ...opts });
const step = (s) => console.log(`\n▶ ${s}`);
const push = (remote, sha, branch) => {
  if (DRY) return console.log(`  (dry) git push ${remote} ${sha.slice(0, 7)}:${branch}`);
  g(['push', remote, `${sha}:refs/heads/${branch}`]);
  console.log(`  ✓ ${remote}/${branch} ← ${sha.slice(0, 7)}`);
};

// 0. Holatni tekshirish
if (g(['rev-parse', '--abbrev-ref', 'HEAD']) !== SRC_BRANCH) { console.error(`✖ ${SRC_BRANCH} branchida turing.`); process.exit(1); }
if (g(['status', '--porcelain', '--', PREFIX])) { console.error('✖ Commit qilinmagan o\'zgarishlar bor. Avval commit qiling.'); process.exit(1); }

// 1. Tekshiruv
if (!SKIP) {
  step('Testlar');
  run('npx', ['vitest', 'run'], { inherit: true });
  step('Build');
  const out = mkdtempSync(join(tmpdir(), 'michi-ship-'));
  run('npx', ['vite', 'build', '--outDir', out], { inherit: true });
  rmSync(out, { recursive: true, force: true });
}

// 2. Monorepo
step('origin/web-1');
const head = g(['rev-parse', 'HEAD']);
push('origin', head, SRC_BRANCH);

// 3. Sayt snapshot'i
step('Sayt snapshot (web-start-michi-app → ildiz)');
g(['fetch', '-q', 'origin', 'web']);
g(['fetch', '-q', 'web-michi-app']);
const idxDir = mkdtempSync(join(tmpdir(), 'michi-idx-'));
const env = { GIT_INDEX_FILE: join(idxDir, 'index') };
g(['read-tree', `${head}:${PREFIX}`], { env });
for (const ex of EXCLUDE) g(['rm', '--cached', '-r', '-q', '--ignore-unmatch', ex], { env });
const tree = g(['write-tree'], { env });
rmSync(idxDir, { recursive: true, force: true });

const short = head.slice(0, 7);
const snapshot = (parent, msg) => {
  if (g(['rev-parse', `${parent}^{tree}`]) === tree) return null; // o'zgarish yo'q
  return g(['commit-tree', tree, '-p', parent, '-m', msg]);
};

const originWeb = g(['rev-parse', 'origin/web']);
const wmaWeb = g(['rev-parse', 'web-michi-app/web']);
const ancestor = (a, b) => spawnSync('git', ['merge-base', '--is-ancestor', a, b], { cwd: ROOT }).status === 0;
let webParent = originWeb;
if (!ancestor(wmaWeb, originWeb)) {
  if (ancestor(originWeb, wmaWeb)) webParent = wmaWeb;
  else { console.error('✖ origin/web va web-michi-app/web ajralib ketgan. Qo\'lda tekshiring.'); process.exit(1); }
}
const webCommit = snapshot(webParent, `deploy(web): publish ${PREFIX} at ${SRC_BRANCH} ${short}`);
if (webCommit) {
  push('web-michi-app', webCommit, 'web'); // → Cloudflare Pages
  push('origin', webCommit, 'web');
} else console.log('  = web allaqachon yangi');

const wma1 = snapshot('web-michi-app/web-1', `sync: ${PREFIX} at ${SRC_BRANCH} ${short}`);
if (wma1) push('web-michi-app', wma1, 'web-1'); else console.log('  = web-michi-app/web-1 allaqachon yangi');

// 4. Lokal s / s1
step('Lokal s, s1');
for (const b of ['s', 's1']) {
  if (spawnSync('git', ['rev-parse', '--verify', '-q', b], { cwd: ROOT }).status !== 0) continue;
  if (ancestor(head, b)) { console.log(`  = ${b} allaqachon yangi`); continue; }
  if (DRY) { console.log(`  (dry) merge ${SRC_BRANCH} → ${b}`); continue; }
  const wt = join(dirname(ROOT), `_ship_${b}`);
  g(['worktree', 'add', '-q', wt, b]);
  const r = spawnSync('git', ['merge', '-q', '--no-edit', '-m', `merge: merge ${SRC_BRANCH} into ${b}`, SRC_BRANCH], { cwd: wt, encoding: 'utf8' });
  if (r.status !== 0) { spawnSync('git', ['merge', '--abort'], { cwd: wt }); console.log(`  ⚠ ${b}: konflikt — o'tkazib yuborildi`); }
  else console.log(`  ✓ ${b} ← ${SRC_BRANCH}`);
  g(['worktree', 'remove', '--force', wt]);
}

console.log('\n✅ Tayyor. Cloudflare 1–3 daqiqada https://web.michi.jp.net ni yangilaydi.');

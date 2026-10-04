#!/usr/bin/env node
/**
 * Install git hooks for this clone (hooks live in .git/, so each clone runs this once):  npm run hooks
 *   pre-commit   → scripts/precommit.mjs (lint staged, scope warning, mirror sync)
 *   post-commit / post-checkout → graphify (AST graph auto-update, free, no LLM)
 */
import { writeFileSync, chmodSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hook = join(ROOT, '.git', 'hooks', 'pre-commit');
writeFileSync(hook, '#!/bin/sh\n# Installed by scripts/install_hooks.mjs\nexec node scripts/precommit.mjs\n');
chmodSync(hook, 0o755);
console.log('pre-commit  → scripts/precommit.mjs');

const g = spawnSync('graphify', ['hook', 'install'], { cwd: ROOT, encoding: 'utf8' });
console.log(g.status === 0 ? 'post-commit/post-checkout → graphify update (AST)' : 'graphify not found: pip install graphifyy  (graph auto-update skipped)');

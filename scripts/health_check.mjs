#!/usr/bin/env node
/**
 * MichiApp Health Check Script
 * 
 * Loyihaning toliq sogligini bir buyruqda tekshiradi:
 * 1. Git holati (branch, uncommitted ozgarishlar)
 * 2. Unit testlar (Vitest)
 * 3. Vehicle Database validatsiya
 * 4. Production build
 * 5. Fayl tuzilishi (test gap tekshiruvi)
 * 
 * Ishlatish: node scripts/health_check.mjs
 */

import { execSync } from "child_process";
import { readdirSync, existsSync, statSync } from "fs";
import { join } from "path";

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

let totalChecks = 0;
let passedChecks = 0;
const warnings = [];
const errors = [];

function pass(msg) {
  totalChecks++;
  passedChecks++;
  console.log(`${GREEN}✅ ${msg}${RESET}`);
}

function fail(msg) {
  totalChecks++;
  errors.push(msg);
  console.log(`${RED}❌ ${msg}${RESET}`);
}

function warn(msg) {
  warnings.push(msg);
  console.log(`${YELLOW}⚠️  ${msg}${RESET}`);
}

function header(title) {
  console.log(`\n${CYAN}${BOLD}== ${title} ==${RESET}`);
}

// ══════════════════════════════════════════════
console.log(`${BOLD}${CYAN}`);
console.log("══════════════════════════════════════════════");
console.log("  🏥 MichiApp Health Check");
console.log("══════════════════════════════════════════════");
console.log(RESET);

// 1. GIT HOLATI
header("1. Git Holati");
try {
  const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
  if (branch === "b1" || branch === "b") {
    pass(`Branch: ${branch}`);
  } else if (branch === "main") {
    warn(`Branch: ${branch} — ehtiyot, main branchdasiz!`);
    pass(`Branch tekshirildi: ${branch}`);
  } else {
    pass(`Branch: ${branch}`);
  }

  const status = execSync("git status --short", { encoding: "utf-8" }).trim();
  if (status) {
    const lines = status.split("\n");
    warn(`${lines.length} ta commit qilinmagan fayl mavjud`);
  } else {
    pass("Barcha fayllar commit qilingan");
  }
} catch (e) {
  fail("Git holati tekshirib bolmadi: " + e.message);
}

// 2. UNIT TESTLAR
header("2. Unit Testlar (Vitest)");
try {
  const testOutput = execSync("npm test 2>&1", { encoding: "utf-8" });
  const testMatch = testOutput.match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/);
  if (testMatch) {
    const [, passed, total] = testMatch;
    if (passed === total) {
      pass(`Vitest: ${passed}/${total} test passed`);
    } else {
      fail(`Vitest: ${passed}/${total} test — some failed!`);
    }
  } else {
    pass("Vitest testlar muvaffaqiyatli");
  }
} catch (e) {
  fail("Vitest testlar buzildi!");
}

// 3. DATABASE VALIDATSIYA
header("3. Vehicle Database Validatsiya");
try {
  const dbOutput = execSync("node scripts/validate_vehicle_db.mjs 2>&1", { encoding: "utf-8" });
  if (dbOutput.includes("BARCHA TEKSHIRUVLAR")) {
    pass("Vehicle DB: Barcha tekshiruvlar passed");
  } else {
    fail("Vehicle DB: Tekshiruvlar buzildi");
  }
} catch (e) {
  fail("Vehicle DB validatsiya xatolik bilan tugadi");
}

// 4. PRODUCTION BUILD
header("4. Production Build");
try {
  const buildOutput = execSync("npm run build 2>&1", { encoding: "utf-8" });
  if (buildOutput.includes("built in")) {
    pass("Vite production build muvaffaqiyatli");

    // Bundle hajmini tekshirish
    const sizeMatch = buildOutput.match(/index-\S+\.js\s+([\d,]+(?:\.\d+)?)\s+kB/);
    if (sizeMatch) {
      const sizeKB = parseFloat(sizeMatch[1].replace(",", ""));
      if (sizeKB > 3000) {
        warn(`JS bundle hajmi: ${sizeKB.toFixed(0)} KB — code-splitting tavsiya etiladi`);
      } else {
        pass(`JS bundle hajmi: ${sizeKB.toFixed(0)} KB`);
      }
    }
  } else {
    fail("Build muvaffaqiyatsiz tugadi");
  }
} catch (e) {
  fail("Production build xatolik bilan tugadi!");
}

// 5. TEST GAP TEKSHIRUVI
header("5. Test Gap Tekshiruvi");
try {
  function scanDir(dir) {
    const gaps = [];
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        gaps.push(...scanDir(fullPath));
      }

      if (item.endsWith(".jsx") && !item.endsWith(".test.jsx") && !item.startsWith("App") && !item.startsWith("main")) {
        const testFile = item.replace(".jsx", ".test.jsx");
        const testPath = join(dir, testFile);
        if (!existsSync(testPath)) {
          gaps.push(item);
        }
      }
    }
    return gaps;
  }

  const gaps = scanDir("src/components");
  if (gaps.length === 0) {
    pass("Barcha komponentlar uchun test fayllari mavjud");
  } else if (gaps.length <= 3) {
    warn(`${gaps.length} ta komponent uchun test topilmadi: ${gaps.join(", ")}`);
    pass("Test gap tekshiruvi tugadi");
  } else {
    warn(`${gaps.length} ta komponent uchun test topilmadi`);
    pass("Test gap tekshiruvi tugadi");
  }
} catch (e) {
  warn("Test gap tekshiruvi bajarib bolmadi: " + e.message);
}

// YAKUNIY NATIJA
console.log(`\n${BOLD}${CYAN}`);
console.log("══════════════════════════════════════════════");
console.log("  YAKUNIY NATIJA");
console.log("══════════════════════════════════════════════");
console.log(RESET);

console.log(`${GREEN}Passed: ${passedChecks}/${totalChecks}${RESET}`);
if (warnings.length > 0) {
  console.log(`${YELLOW}Warnings: ${warnings.length}${RESET}`);
  warnings.forEach(w => console.log(`   ${YELLOW}• ${w}${RESET}`));
}
if (errors.length > 0) {
  console.log(`${RED}Errors: ${errors.length}${RESET}`);
  errors.forEach(e => console.log(`   ${RED}• ${e}${RESET}`));
}

console.log("");
if (errors.length === 0) {
  console.log(`${GREEN}${BOLD}🎉 LOYIHA SOGLOM — ishga kirishish mumkin!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}🚨 XATOLIKLAR ANIQLANDI — avval tuzating!${RESET}\n`);
  process.exit(1);
}

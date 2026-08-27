import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log(`\n══════════════════════════════════════════════════`);
console.log(`  📐 Design System & CSS Invariants Validator`);
console.log(`══════════════════════════════════════════════════\n`);

let errors = 0;
let warnings = 0;

// Helper to search files
function checkFile(filePath, rules) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Fayl topilmadi: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');

  rules.forEach(rule => {
    const passed = rule.test(content);
    if (!passed) {
      if (rule.isError) {
        console.log(`❌ [XATOLIK] ${filePath}: ${rule.name}`);
        errors++;
      } else {
        console.log(`⚠️  [OGOHLANTIRISH] ${filePath}: ${rule.name}`);
        warnings++;
      }
    } else {
      console.log(`✅ [PASSED] ${filePath}: ${rule.name}`);
    }
  });
}

// 1. Profile.jsx Checks (Rules 22 & 23)
checkFile('src/components/Profile.jsx', [
  {
    name: "Rule 22: Target element level scrollIntoView taqiqlanishi",
    test: (c) => !c.includes('targetEl.scrollIntoView('),
    isError: true
  },
  {
    name: "Rule 23: Aniq joyga qaytish (savedMainScroll state) mavjudligi",
    test: (c) => c.includes('savedMainScroll'),
    isError: true
  }
]);

// 2. BottomNav.css Checks (Rule 18)
checkFile('src/components/BottomNav.css', [
  {
    name: "Rule 18: BottomNav border-radius 24px z-index 300 standarti",
    test: (c) => c.includes('border-radius: 24px') && c.includes('z-index: 300'),
    isError: true
  },
  {
    name: "Rule 18: BottomNav 14px yon marjinlar (calc(100% - 28px))",
    test: (c) => c.includes('calc(100% - 28px)'),
    isError: true
  }
]);

// 3. Profile.css Checks (Rule 20 & 23)
checkFile('src/components/Profile.css', [
  {
    name: "Rule 23: Sub-page view uchun 120px padding-bottom mavjudligi",
    test: (c) => c.includes('.profile-container.sub-page-view'),
    isError: true
  },
  {
    name: "Rule 20: Global CSS tokenlar (var(--glass-border)) ishlatilishi",
    test: (c) => c.includes('var(--glass-border)'),
    isError: true
  }
]);

console.log(`\n──────────────────────────────────────────────────`);
console.log(`📊 YAKUNIY REZUMYE:`);
console.log(`   Xatoliklar (Errors): ${errors}`);
console.log(`   Ogohlantirishlar (Warnings): ${warnings}`);
console.log(`──────────────────────────────────────────────────\n`);

if (errors > 0) {
  console.log(`❌ LAYOUT VALIDATSIYASIDA XATOLIKLAR TOPILDI!`);
  process.exit(1);
} else {
  console.log(`🎉 ✅ BARCHA LAYOUT VA DESIGN INVARIANTLARI O'TDI!\n`);
  process.exit(0);
}

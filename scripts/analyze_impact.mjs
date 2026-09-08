import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

const query = process.argv[2];
if (!query) {
  console.log(`${colors.cyan}${colors.bold}⚠️ Impact & Risk CLI Analysis Tool${colors.reset}`);
  console.log(`Fayl yoki komponent nomini kiriting! Masalan:`);
  console.log(`  node scripts/analyze_impact.mjs "VerifiedBadge"`);
  console.log(`  node scripts/analyze_impact.mjs "Profile"`);
  console.log(`  node scripts/analyze_impact.mjs "BottomNav"`);
  process.exit(1);
}

const queryClean = path.basename(query).replace(/\.(jsx|js|tsx|ts|css)$/, '');

function getFiles(dir, ext = [], exclude = ['node_modules', 'dist', '.git', 'brain', 'build']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (exclude.includes(file)) return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath, ext, exclude));
    } else {
      if (ext.length === 0 || ext.some(e => file.endsWith(e))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 1. Find target file with priority (.jsx/.js > .css)
const allSrcFiles = getFiles(path.join(PROJECT_ROOT, 'src'), ['.jsx', '.js', '.tsx', '.ts', '.css']);

const matchingTargets = allSrcFiles.filter(f => path.basename(f, path.extname(f)).toLowerCase() === queryClean.toLowerCase());
matchingTargets.sort((a, b) => {
  const isACss = a.endsWith('.css');
  const isBCss = b.endsWith('.css');
  if (isACss && !isBCss) return 1;
  if (!isACss && isBCss) return -1;
  return 0;
});

const targetFile = matchingTargets[0] 
  || allSrcFiles.find(f => path.basename(f).toLowerCase().includes(queryClean.toLowerCase()));

if (!targetFile) {
  console.log(`${colors.red}❌ Fayl topilmadi: "${query}"${colors.reset}`);
  process.exit(1);
}

const targetBaseName = path.basename(targetFile, path.extname(targetFile));
const targetRelPath = path.relative(PROJECT_ROOT, targetFile);
const targetContent = fs.readFileSync(targetFile, 'utf8');
const targetLines = targetContent.split('\n').length;
const targetSize = targetContent.length;

// 2. Find Importers (Reverse dependencies) with exact module name matching
const importers = [];
const safeTargetName = escapeRegExp(targetBaseName);
const importRegex = new RegExp(`import(?:[\\s\\S]*?from\\s+)?['"][^'"]*\\/${safeTargetName}(?:\\.[a-zA-Z]+)?['"]`);
const dynamicImportRegex = new RegExp(`import\\s*\\(\\s*['"][^'"]*\\/${safeTargetName}(?:\\.[a-zA-Z]+)?['"]\\s*\\)`);

allSrcFiles.forEach(file => {
  if (file === targetFile || file.endsWith('.css')) return;
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(targetBaseName)) {
      if (importRegex.test(content) || dynamicImportRegex.test(content) || content.includes(`<${targetBaseName}`)) {
        importers.push({
          file,
          relPath: path.relative(PROJECT_ROOT, file),
          baseName: path.basename(file),
          isTest: file.includes('.test.') || file.includes('.spec.') || file.includes('/tests/')
        });
      }
    }
  } catch (err) {
    // Ignore unreadable files
  }
});

// 3. Find Bug History in past_mistakes.md
const pastMistakesPath = path.join(PROJECT_ROOT, '.agents', 'rules', 'past_mistakes.md');
const matchingBugs = [];
if (fs.existsSync(pastMistakesPath)) {
  const mistakesContent = fs.readFileSync(pastMistakesPath, 'utf8');
  const bugSections = mistakesContent.split(/(?=## 🚫 \d+\.)/);
  bugSections.forEach(section => {
    if (section.startsWith('## 🚫') && section.toLowerCase().includes(targetBaseName.toLowerCase())) {
      const titleLine = section.split('\n')[0].replace('## 🚫 ', '').trim();
      if (titleLine) matchingBugs.push(titleLine);
    }
  });
}

// 4. Find Associated Rules in .agents/rules/
const rulesFiles = getFiles(path.join(PROJECT_ROOT, '.agents', 'rules'), ['.md']);
const matchingRules = [];
rulesFiles.forEach(ruleFile => {
  try {
    const ruleContent = fs.readFileSync(ruleFile, 'utf8');
    if (ruleContent.toLowerCase().includes(targetBaseName.toLowerCase())) {
      matchingRules.push({
        relPath: path.relative(PROJECT_ROOT, ruleFile),
        baseName: path.basename(ruleFile)
      });
    }
  } catch (err) {}
});

// 5. Risk Assessment Calculation based on production code importers
const prodImporters = importers.filter(i => !i.isTest);
let riskLevel = 'LOW';
let riskBadge = `${colors.cyan}[⚪ LOW RISK]${colors.reset}`;

if (prodImporters.length >= 5 || matchingBugs.length >= 3 || targetLines > 1500) {
  riskLevel = 'CRITICAL';
  riskBadge = `${colors.red}${colors.bold}[🔴 CRITICAL RISK]${colors.reset}`;
} else if (prodImporters.length >= 3 || matchingBugs.length >= 1 || targetLines > 800) {
  riskLevel = 'HIGH';
  riskBadge = `${colors.yellow}${colors.bold}[🟡 HIGH RISK]${colors.reset}`;
} else if (prodImporters.length >= 2) {
  riskLevel = 'MEDIUM';
  riskBadge = `${colors.green}${colors.bold}[🟢 MEDIUM RISK]${colors.reset}`;
}

// Output Results
console.log(`\n════════════════════════════════════════════════════════════`);
console.log(` ⚠️ O'ZGARTIRISH TA'SIR DOIRASI TAHLILI (IMPACT MATRIX) `);
console.log(`════════════════════════════════════════════════════════════\n`);

console.log(`📌 Fayl: ${colors.green}${colors.bold}${targetBaseName}${colors.reset} (${targetRelPath})`);
console.log(`📊 Hajmi: ${colors.yellow}${targetLines} qator${colors.reset} (${targetSize} bayt)`);
console.log(`🚨 Xavf Darajasi: ${riskBadge}\n`);

console.log(`${colors.cyan}${colors.bold}🔗 IMPORT QILGAN KOMPONENTLAR (${importers.length} ta, ${prodImporters.length} ta prod):${colors.reset}`);
if (importers.length > 0) {
  importers.forEach(imp => {
    console.log(`  → ${colors.green}${imp.baseName}${colors.reset} (${imp.relPath})${imp.isTest ? ' 🧪 [TEST]' : ''}`);
  });
} else {
  console.log(`  *Hech qanday komponent import qilmaydi (Mustaqil yoki Root)*`);
}

console.log(`\n${colors.red}${colors.bold}📋 BUG TARIXI (past_mistakes.md) (${matchingBugs.length} ta):${colors.reset}`);
if (matchingBugs.length > 0) {
  matchingBugs.forEach(bug => {
    console.log(`  → ${colors.red}🚫 ${bug}${colors.reset}`);
  });
} else {
  console.log(`  *Ushbu fayl bo'yicha ilgarigi buglar qayd etilmagan*`);
}

console.log(`\n${colors.magenta}${colors.bold}📜 TEGISHLI SISTEMA QOIDALARI (.agents/rules/) (${matchingRules.length} ta):${colors.reset}`);
if (matchingRules.length > 0) {
  matchingRules.forEach(rule => {
    console.log(`  → ${colors.magenta}📜 ${rule.baseName}${colors.reset} (${rule.relPath})`);
  });
} else {
  console.log(`  *Alohida maxsus qoidalar belgilanmagan*`);
}

console.log(`\n${colors.yellow}${colors.bold}🛡️ XAVFSIZLIK VA SIFAT TAVSIYALARI:${colors.reset}`);
let stepNum = 1;
if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
  console.log(`  ${stepNum++}. ⚠️ Ushbu fayl ${importers.length} ta joyda ishlatilgan. O'zgartirgandan so'ng ALBATTA barcha importer komponentlarni tekshiring!`);
  if (matchingBugs.length > 0) {
    console.log(`  ${stepNum++}. 🔴 past_mistakes.md dagi #${matchingBugs[0].split('.')[0]} bug tartibini o'qib chiqishingiz shart.`);
  }
  console.log(`  ${stepNum++}. 🧪 O'zgartirish kiritgach: \`npm run test\` buyrug'ini ishga tushiring.`);
} else {
  console.log(`  ${stepNum++}. ✅ Xavf darajasi past/o'rta. Standard unit test va verification yetarli.`);
}

console.log(`\n────────────────────────────────────────────────────────────\n`);

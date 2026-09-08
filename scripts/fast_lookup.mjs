import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colors
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

const rawArgs = process.argv.slice(2);
let categoryFilter = null;
let query = null;

for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i].startsWith('--')) {
    categoryFilter = rawArgs[i].substring(2).toLowerCase();
  } else if (!query) {
    query = rawArgs[i];
  }
}

if (!query || query === 'help' || query === '-h') {
  console.log(`\n${colors.cyan}${colors.bold}🔍 Michi Fast Lookup CLI Tool${colors.reset}`);
  console.log(`Foydalanish:`);
  console.log(`  npm run find -- "so'rovingiz"                 # Barcha bo'limlardan qidirish`);
  console.log(`  npm run find -- --comp "Vehicle"             # Faqat React komponentlardan qidirish`);
  console.log(`  npm run find -- --i18n "免許"                # Faqat i18n tarjimalari va kalitlaridan`);
  console.log(`  npm run find -- --state "darkMode"           # Faqat App.jsx global state-laridan`);
  console.log(`  npm run find -- --rules "BottomNav"          # Faqat .agents/rules va past_mistakes-dan`);
  console.log(`  npm run find -- --utils "format"             # Faqat util funksiyalaridan`);
  console.log(`\nImkoniyatlar: ${colors.green}0.05-0.10s tezlik${colors.reset}, 3 tildagi i18n matnlari, line matching\n`);
  process.exit(0);
}

function shouldSearchCategory(name) {
  if (!categoryFilter) return true;
  if (categoryFilter === name) return true;
  if (name === 'comp' && (categoryFilter === 'component' || categoryFilter === 'components')) return true;
  if (name === 'rules' && (categoryFilter === 'rule' || categoryFilter === 'bugs' || categoryFilter === 'past_mistakes')) return true;
  if (name === 'utils' && (categoryFilter === 'util' || categoryFilter === 'data')) return true;
  if (name === 'tests' && categoryFilter === 'test') return true;
  return false;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const queryLower = query.toLowerCase();
const safeQuery = escapeRegExp(query);
const queryRegex = new RegExp(safeQuery, 'i');
let startTime = Date.now();
let totalResults = 0;

// --- Helper Functions ---
function getFiles(dir, ext = [], exclude = []) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (exclude.includes(file)) return;
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat && stat.isDirectory() && !stat.isSymbolicLink()) {
      results = results.concat(getFiles(filePath, ext, exclude));
    } else if (!stat.isSymbolicLink()) {
      if (ext.length === 0 || ext.some(e => file.endsWith(e))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const fileCache = new Map();
function getLines(filePath) {
  if (fileCache.has(filePath)) return fileCache.get(filePath);
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  fileCache.set(filePath, lines);
  return lines;
}

function highlight(text, term) {
  if (!term) return text;
  const safeTerm = escapeRegExp(term);
  const regex = new RegExp(`(${safeTerm})`, 'gi');
  return text.replace(regex, `${colors.bold}$1${colors.reset}`);
}

function printSectionHeader(title, count) {
  if (count > 0) {
    console.log(`\n${colors.cyan}${title} (${count} ta)${colors.reset}`);
  }
}

function getRelativePath(fullPath) {
  return path.relative(PROJECT_ROOT, fullPath);
}

// --- 1. React Components ---
const jsxFiles = [
  ...getFiles(path.join(PROJECT_ROOT, 'src', 'components'), ['.jsx', '.tsx']),
  ...getFiles(path.join(PROJECT_ROOT, 'src', 'pages'), ['.jsx', '.tsx']),
  path.join(PROJECT_ROOT, 'src', 'App.jsx')
].filter(fs.existsSync);

let componentsResults = [];
if (shouldSearchCategory('comp')) {
  jsxFiles.forEach(file => {
    const fileName = path.basename(file);
    const relPath = getRelativePath(file);
    const lines = getLines(file);
    let matches = [];

    for (let i = 0; i < lines.length; i++) {
      if (queryRegex.test(lines[i])) {
        matches.push({ lineNum: i + 1, content: lines[i].trim() });
        if (matches.length >= 3) break;
      }
    }

    if (queryRegex.test(fileName) || matches.length > 0) {
      componentsResults.push({ fileName, relPath, matches });
    }
  });

  printSectionHeader('📦 KOMPONENTLAR', componentsResults.length);
  componentsResults.forEach(res => {
    totalResults++;
    console.log(`  → ${colors.green}${res.fileName}${colors.reset} (${res.relPath})`);
    res.matches.forEach(m => {
      console.log(`    ${colors.yellow}L${m.lineNum}${colors.reset}: ${highlight(m.content, query)}`);
    });
  });
}

// --- 2. State variables (App.jsx) ---
const appJsxPath = path.join(PROJECT_ROOT, 'src', 'App.jsx');
let stateResults = [];
if (shouldSearchCategory('state') && fs.existsSync(appJsxPath)) {
  const lines = getLines(appJsxPath);
  lines.forEach((line, i) => {
    if (line.includes('useState') && queryRegex.test(line)) {
      const match = line.match(/const\s+\[(.*?),/);
      const stateName = match ? match[1].trim() : 'unknown';
      stateResults.push({ name: stateName, lineNum: i + 1, type: 'useState' });
    }
  });
  printSectionHeader('📊 STATE (App.jsx)', stateResults.length);
  stateResults.forEach(res => {
    totalResults++;
    console.log(`  → ${highlight(res.name, query)} (${res.type}) — ${colors.yellow}L${res.lineNum}${colors.reset}`);
  });
}

// --- 3. i18n keys and translations ---
if (shouldSearchCategory('i18n')) {
  const localesDir = path.join(PROJECT_ROOT, 'src', 'locales');
  let i18nMatches = new Map(); // key -> { ja, en, uz, usages: [] }

  function parseLocaleFile(filePath) {
    const data = {};
    if (!fs.existsSync(filePath)) return data;
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /(?:"([^"]+)"|'([^']+)'|([\w.-]+))\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const key = match[1] || match[2] || match[3];
      const val = match[4] !== undefined ? match[4] : (match[5] !== undefined ? match[5] : match[6]);
      if (key && val !== undefined) {
        data[key] = val.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, ' ');
      }
    }
    return data;
  }

  const jaData = parseLocaleFile(path.join(localesDir, 'ja.js'));
  const enData = parseLocaleFile(path.join(localesDir, 'en.js'));
  const uzData = parseLocaleFile(path.join(localesDir, 'uz.js'));

  // Find matches in any locale
  const allKeys = new Set([...Object.keys(jaData), ...Object.keys(enData), ...Object.keys(uzData)]);
  allKeys.forEach(key => {
    const ja = jaData[key] || '';
    const en = enData[key] || '';
    const uz = uzData[key] || '';
    
    if (queryRegex.test(key) || queryRegex.test(ja) || queryRegex.test(en) || queryRegex.test(uz)) {
      i18nMatches.set(key, { ja, en, uz, usages: [] });
    }
  });

  // Find usages in JSX (O(lines) optimized scanner)
  if (i18nMatches.size > 0) {
    jsxFiles.forEach(file => {
      const fileName = path.basename(file);
      const lines = getLines(file);
      lines.forEach((line, i) => {
        const lineRegex = /\bt\(['"]([\w.]+)['"]/g;
        let m;
        while ((m = lineRegex.exec(line)) !== null) {
          const k = m[1];
          if (i18nMatches.has(k)) {
            const val = i18nMatches.get(k);
            const usageStr = `${fileName}:${colors.yellow}L${i + 1}${colors.reset}`;
            if (!val.usages.includes(usageStr)) {
              val.usages.push(usageStr);
            }
          }
        }
      });
    });
  }

  printSectionHeader('🔤 i18n KALITLARI', i18nMatches.size);
  i18nMatches.forEach((val, key) => {
    totalResults++;
    console.log(`  → ${highlight(key, query)}: 🇯🇵 ${highlight(val.ja, query)} | 🇬🇧 ${highlight(val.en, query)} | 🇺🇿 ${highlight(val.uz, query)}`);
    val.usages.slice(0, 3).forEach(usage => {
      console.log(`    ↳ ${usage}`);
    });
  });
}

// --- 4. Data/DB files & 5. Utility functions ---
if (shouldSearchCategory('utils')) {
  function searchModuleFiles(dir, title) {
    const files = getFiles(dir, ['.js', '.ts']);
    let results = [];
    
    files.forEach(file => {
      const fileName = path.basename(file);
      const relPath = getRelativePath(file);
      const lines = getLines(file);
      let matched = false;
      
      if (queryRegex.test(fileName)) matched = true;
      
      let exportMatches = [];
      lines.forEach(line => {
        if (line.includes('export ')) {
          if (queryRegex.test(line)) {
            matched = true;
            exportMatches.push(line.trim());
          }
        }
      });
      
      if (matched) {
        results.push({ fileName, relPath, linesCount: lines.length, exports: exportMatches.slice(0, 2) });
      }
    });
    
    printSectionHeader(title, results.length);
    results.forEach(res => {
      totalResults++;
      console.log(`  → ${colors.green}${res.fileName}${colors.reset} (${res.relPath}) — ${res.linesCount} qator`);
      res.exports.forEach(exp => {
        console.log(`    ${highlight(exp, query)}`);
      });
    });
  }

  searchModuleFiles(path.join(PROJECT_ROOT, 'src', 'data'), '📊 DATA/DB');
  searchModuleFiles(path.join(PROJECT_ROOT, 'src', 'utils'), '🛠 UTILS');
}

// --- 6. Test files ---
if (shouldSearchCategory('tests')) {
  const testFiles = [
    ...getFiles(path.join(PROJECT_ROOT, 'tests'), ['.js', '.jsx', '.ts', '.tsx']),
    ...getFiles(path.join(PROJECT_ROOT, 'src'), ['.test.js', '.test.jsx', '.spec.js', '.spec.jsx'])
  ];
  let testResults = [];
  testFiles.forEach(file => {
    const fileName = path.basename(file);
    const relPath = getRelativePath(file);
    const lines = getLines(file);
    let matched = false;
    let matches = [];
    
    if (queryRegex.test(fileName)) matched = true;
    
    lines.forEach((line, i) => {
      if (/(it|test|describe)\s*\(/.test(line) && queryRegex.test(line)) {
        matched = true;
        matches.push(`L${i+1}: ${line.trim()}`);
      }
    });
    
    if (matched) {
      testResults.push({ fileName, relPath, matches: matches.slice(0, 2) });
    }
  });
  printSectionHeader('🧪 TESTLAR', testResults.length);
  testResults.forEach(res => {
    totalResults++;
    console.log(`  → ${colors.green}${res.fileName}${colors.reset} (${res.relPath})`);
    res.matches.forEach(m => console.log(`    ${colors.yellow}${highlight(m, query)}${colors.reset}`));
  });
}

// --- 7. CSS classes ---
if (shouldSearchCategory('comp')) {
  const cssFiles = getFiles(path.join(PROJECT_ROOT, 'src'), ['.css']);
  let cssResults = [];
  cssFiles.forEach(file => {
    const fileName = path.basename(file);
    const relPath = getRelativePath(file);
    const lines = getLines(file);
    
    lines.forEach((line, i) => {
      // Basic match for class name - with correct operator grouping
      if (line.includes('.') && (line.includes('{') || queryRegex.test(line))) {
         const classMatch = line.match(/\.([a-zA-Z0-9_-]+)/g);
         if (classMatch) {
           classMatch.forEach(cls => {
             if (queryRegex.test(cls)) {
               cssResults.push(`  → ${highlight(cls, query)} (${fileName}:${colors.yellow}L${i+1}${colors.reset})`);
             }
           });
         }
      }
    });
  });
  const uniqueCssResults = [...new Set(cssResults)].slice(0, 10);
  printSectionHeader('🎨 CSS KLASSLAR', uniqueCssResults.length);
  uniqueCssResults.forEach(res => {
    totalResults++;
    console.log(res);
  });
}

// --- 8. Agent Rules ---
if (shouldSearchCategory('rules')) {
  const rulesDir = path.join(PROJECT_ROOT, '.agents', 'rules');
  const rulesFiles = getFiles(rulesDir, ['.md'], ['past_mistakes.md']);
  let rulesResults = [];
  rulesFiles.forEach(file => {
    const fileName = path.basename(file);
    const relPath = getRelativePath(file);
    const lines = getLines(file);
    let matches = [];
    
    lines.forEach((line, i) => {
      if (queryRegex.test(line)) {
        matches.push({ lineNum: i + 1, content: line.trim() });
      }
    });
    
    if (matches.length > 0 || queryRegex.test(fileName)) {
      rulesResults.push({ fileName, relPath, matches: matches.slice(0, 3) });
    }
  });
  printSectionHeader('📜 QOIDALAR', rulesResults.length);
  rulesResults.forEach(res => {
    totalResults++;
    console.log(`  → ${colors.green}${res.fileName}${colors.reset} (${res.relPath})`);
    res.matches.forEach(m => {
      console.log(`    ${colors.yellow}L${m.lineNum}${colors.reset}: ${highlight(m.content, query)}`);
    });
  });

  // --- 9. Past Mistakes ---
  const pastMistakesPath = path.join(rulesDir, 'past_mistakes.md');
  let mistakesResults = [];
  if (fs.existsSync(pastMistakesPath)) {
    const lines = getLines(pastMistakesPath);
    lines.forEach(line => {
      if (line.startsWith('#') && queryRegex.test(line)) {
        mistakesResults.push(line.trim());
      }
    });
  }
  printSectionHeader('📋 O\'XSHASH BUGLAR (past_mistakes.md)', mistakesResults.length);
  mistakesResults.forEach(res => {
    totalResults++;
    console.log(`  → ${colors.red}${highlight(res, query)}${colors.reset}`);
  });
}

// --- 10. Props drilling ---
if (shouldSearchCategory('comp') || shouldSearchCategory('state')) {
  let propsResults = [];
  if (fs.existsSync(appJsxPath)) {
    const lines = getLines(appJsxPath);
    lines.forEach((line, i) => {
      if (line.includes(`<`) && queryRegex.test(line)) {
        const propMatch = new RegExp(`\\s+${safeQuery}[=\\s>]`, 'i');
        if (propMatch.test(line)) {
           propsResults.push(`L${i+1}: ${line.trim()}`);
        }
      }
    });
  }
  printSectionHeader('🔗 PROPS (App.jsx)', propsResults.length);
  propsResults.forEach(res => {
    totalResults++;
    console.log(`  → ${highlight(res, query)}`);
  });
}

// --- 11. Impact & Risk Summary ---
if (componentsResults.length > 0) {
  const topComp = componentsResults[0].fileName.replace(/\.(jsx|js)$/, '');
  console.log(`\n${colors.cyan}⚠️ TA'SIR DOIRASI VA XAVF HISOBO TI:${colors.reset}`);
  console.log(`  💡 "${topComp}" uchun to'liq ta'sir doirasi va xavfsizlik tavsiyalarini ko'rish:`);
  console.log(`     ${colors.yellow}npm run impact -- "${topComp}"${colors.reset}`);
}

const endTime = Date.now();
const elapsed = ((endTime - startTime) / 1000).toFixed(2);

console.log(`\n────────────────────────────`);
console.log(`📊 Jami: ${totalResults} ta natija (${elapsed}s)`);

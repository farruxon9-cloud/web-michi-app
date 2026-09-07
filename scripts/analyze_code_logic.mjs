import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

console.log('══════════════════════════════════════════════');
console.log('  🧠 MichiApp Logical Reasoning & Code Logic Analysis');
console.log('══════════════════════════════════════════════\n');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(filePath, files);
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
        files.push(filePath);
      }
    }
  }
  return files;
}

const allJsFiles = getFiles(srcDir);
const fileContents = {};
allJsFiles.forEach(file => {
  fileContents[file] = fs.readFileSync(file, 'utf8');
});

let warnings = 0;
let passedChecks = 0;

// 1. Circular Import Detection
console.log('== 1. Circular Import Analysis (Aylanma Importlar) ==');
const importGraph = {};
allJsFiles.forEach(file => {
  const relative = path.relative(srcDir, file);
  const content = fileContents[file];
  const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
  const targetImports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const impPath = match[1];
    if (impPath.startsWith('.')) {
      const resolved = path.normalize(path.join(path.dirname(file), impPath));
      const targetRel = path.relative(srcDir, resolved);
      targetImports.push(targetRel);
    }
  }
  importGraph[relative] = targetImports;
});

let cyclesFound = 0;
Object.keys(importGraph).forEach(nodeA => {
  (importGraph[nodeA] || []).forEach(nodeB => {
    const baseB = Object.keys(importGraph).find(k => k.startsWith(nodeB) || k.split('.')[0] === nodeB.split('.')[0]);
    if (baseB && importGraph[baseB] && importGraph[baseB].some(target => target.split('.')[0] === nodeA.split('.')[0])) {
      if (nodeA < baseB) { // Avoid duplicate report
        console.log(`⚠️  Circular Import Detected: [${nodeA}] <---> [${baseB}]`);
        cyclesFound++;
      }
    }
  });
});

if (cyclesFound === 0) {
  console.log('✅ Aylanma importlar yo\'q — tizim grafigi toza');
  passedChecks++;
} else {
  warnings += cyclesFound;
}

// 2. Unused Utility & Data Exports Check
console.log('\n== 2. Unused Export Analysis (Ishlatilmagan Eksportlar) ==');
const exportsMap = [];

allJsFiles.forEach(file => {
  const relative = path.relative(srcDir, file);
  if (relative.startsWith('data/') || relative.startsWith('utils/')) {
    const content = fileContents[file];
    const funcExportRegex = /export\s+function\s+(\w+)/g;
    const constExportRegex = /export\s+const\s+(\w+)\s*=/g;
    let match;
    while ((match = funcExportRegex.exec(content)) !== null) {
      exportsMap.push({ name: match[1], file: relative });
    }
    while ((match = constExportRegex.exec(content)) !== null) {
      if (match[1] !== 'default') {
        exportsMap.push({ name: match[1], file: relative });
      }
    }
  }
});

let unusedCount = 0;
exportsMap.forEach(exp => {
  let isUsed = false;
  Object.keys(fileContents).forEach(f => {
    if (f.endsWith(exp.file)) return;
    if (fileContents[f].includes(exp.name)) {
      isUsed = true;
    }
  });
  if (!isUsed) {
    // Check if it's tested in test files
    const isTested = Object.keys(fileContents).some(f => f.includes('.test.') && fileContents[f].includes(exp.name));
    if (!isTested) {
      console.log(`ℹ️  Potentsial ishlatilmagan eksport: [${exp.name}] (${exp.file})`);
      unusedCount++;
    }
  }
});

if (unusedCount === 0) {
  console.log('✅ Barcha data va util eksportlari faol ishlatilmoqda');
  passedChecks++;
} else {
  console.log(`⚠️  ${unusedCount} ta eksport boshqa komponentlarda to'g'ridan-to'g me'yorida ishlatilmaydi (yoki dynamic import/test uchun)`);
}

// 3. Component Size & Complexity Check
console.log('\n== 3. Component Size & Complexity Metric (Komponentlar Balandligi) ==');
const largeComponents = [];
allJsFiles.forEach(file => {
  const relative = path.relative(srcDir, file);
  if (relative.startsWith('components/')) {
    const lines = fileContents[file].split('\n').length;
    if (lines > 2000) {
      largeComponents.push({ file: relative, lines });
    }
  }
});

if (largeComponents.length === 0) {
  console.log('✅ Barcha komponentlar sig\'imi me\'yorida');
  passedChecks++;
} else {
  largeComponents.forEach(c => {
    console.log(`⚠️  Yirik komponent: [${c.file}] (${c.lines} qator) — kelajakda modullashtirish tavsiya etiladi`);
  });
}

// 4. Invariant Rule Alignment Check
console.log('\n== 4. Invariant Rule Alignment (UI Qoidalarining Kodda Qo\'llanilishi) ==');
const profileCss = fs.readFileSync(path.join(srcDir, 'components/Profile.css'), 'utf8');
if (profileCss.includes('padding-bottom: 104px') || profileCss.includes('padding-bottom: 96px') || profileCss.includes('padding-bottom: 24px !important')) {
  console.log('✅ Rule 7 & 40 (Profile Sub-Page Bottom Dock Clearance & Live Scroll): PASSED');
  passedChecks++;
} else {
  console.log('❌ Rule 7 & 40 Violation: Profile sub-page clearance padding-bottom is not set');
  warnings++;
}

console.log('\n══════════════════════════════════════════════');
console.log(`  YAKUNIY MANTIQIY TAHLIL NATIJASI: ${passedChecks} Check Passed, ${warnings} Warnings`);
console.log('══════════════════════════════════════════════\n');

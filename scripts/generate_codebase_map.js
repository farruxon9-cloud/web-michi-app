import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- Codebase Map Skanerlash Boshlandi ---');
console.log('Project Root:', projectRoot);

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== 'brain' && file !== 'build') {
        getFiles(filePath, files);
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.css') || file.endsWith('.md')) {
        files.push(filePath);
      }
    }
  }
  return files;
}

const srcFiles = getFiles(path.join(projectRoot, 'src'));
const scriptFiles = getFiles(path.join(projectRoot, 'scripts'));
const testFiles = getFiles(path.join(projectRoot, 'tests'));
const ruleFiles = getFiles(path.join(projectRoot, '.agents', 'rules'));
const allFiles = [...srcFiles, ...scriptFiles, ...testFiles, ...ruleFiles];

const map = {
  components: {},
  styles: {},
  tests: {},
  data: {},
  utils: {},
  services: {},
  scripts: {},
  rules: {},
  root: {}
};

function extractComponentInfo(content, filename) {
  const funcRegex = /export\s+(?:default\s+)?function\s+(\w+)\s*\(([^)]*)\)/;
  let match = funcRegex.exec(content);
  
  if (!match) {
    const arrowRegex = /export\s+const\s+(\w+)\s*=\s*(?:React\.memo\()?\(?([^)]*)\)?\s*=>/;
    match = arrowRegex.exec(content);
  }
  
  if (!match) {
    const defaultExportName = path.basename(filename, path.extname(filename));
    const defaultFuncRegex = new RegExp(`function\\s+(${defaultExportName})\\s*\\(([^)]*)\\)`);
    match = defaultFuncRegex.exec(content);
  }

  if (match) {
    const compName = match[1];
    const propsStr = match[2].trim();
    const props = [];
    if (propsStr.startsWith('{') && propsStr.includes('}')) {
      const rawProps = propsStr
        .replace(/[{}]/g, '')
        .split(',')
        .map(p => p.trim().split('=')[0].trim())
        .filter(p => p && !p.startsWith('...'));
      props.push(...rawProps);
    } else if (propsStr) {
      props.push(propsStr);
    }
    return { name: compName, props };
  }
  return null;
}

function extractUtilityExports(content) {
  const exports = [];
  const funcExportRegex = /export\s+function\s+(\w+)/g;
  const constExportRegex = /export\s+const\s+(\w+)\s*=/g;
  
  let match;
  while ((match = funcExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  while ((match = constExportRegex.exec(content)) !== null) {
    if (match[1] !== 'default') {
      exports.push(match[1]);
    }
  }
  return [...new Set(exports)];
}

// ══════════════════════════════════════════════
// FAZA 1: State & Data-Flow Extraction
// ══════════════════════════════════════════════
function extractStateFlow() {
  const appJsxPath = path.join(projectRoot, 'src', 'App.jsx');
  if (!fs.existsSync(appJsxPath)) return { states: [], propFlows: [] };
  const appContent = fs.readFileSync(appJsxPath, 'utf8');
  const appLines = appContent.split('\n');

  // 1a. Extract all useState declarations
  const states = [];
  const useStateRegex = /const\s+\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=\s*useState\s*\(([^)]*)?\)/;
  appLines.forEach((line, idx) => {
    const match = useStateRegex.exec(line);
    if (match) {
      const stateName = match[1];
      const setterName = match[2];
      let defaultVal = (match[3] || '').trim();
      if (defaultVal.length > 40) defaultVal = defaultVal.substring(0, 37) + '...';

      // Check localStorage sync
      const lsSync = appContent.includes(`localStorage.getItem`) && 
        (appContent.includes(`'michi_${stateName.toLowerCase()}'`) ||
         appContent.includes(`"michi_${stateName.toLowerCase()}"`))
        ? true : false;
      // Also check broader patterns
      const lsSyncBroad = appLines.some(l => 
        l.includes('localStorage') && (l.includes(stateName) || l.includes(setterName))
      );

      states.push({
        name: stateName,
        setter: setterName,
        defaultValue: defaultVal || 'undefined',
        line: idx + 1,
        localStorageSync: lsSync || lsSyncBroad
      });
    }
  });

  // 1b. Extract prop flows: which components receive which state/handler
  const propFlows = [];
  const jsxComponentRegex = /<(\w+)\s+([^>]*(?:(?!\/>)[^>])*)\/?>/g;
  let cMatch;
  while ((cMatch = jsxComponentRegex.exec(appContent)) !== null) {
    const compName = cMatch[1];
    if (compName[0] !== compName[0].toUpperCase()) continue; // skip html elements
    const propsStr = cMatch[2];
    const propNames = [];
    const propRegex = /(\w+)\s*=\s*\{/g;
    let pMatch;
    while ((pMatch = propRegex.exec(propsStr)) !== null) {
      if (pMatch[1] !== 'key' && pMatch[1] !== 'className' && pMatch[1] !== 'style' && pMatch[1] !== 'ref') {
        propNames.push(pMatch[1]);
      }
    }
    if (propNames.length > 0) {
      // Merge if same component already listed
      const existing = propFlows.find(f => f.component === compName);
      if (existing) {
        propNames.forEach(p => { if (!existing.props.includes(p)); });
        propNames.forEach(p => { if (!existing.props.includes(p)) existing.props.push(p); });
      } else {
        propFlows.push({ component: compName, props: propNames });
      }
    }
  }

  return { states, propFlows };
}

// ══════════════════════════════════════════════
// FAZA 2: Reverse i18n Index Extraction
// ══════════════════════════════════════════════
function extractI18nIndex() {
  const localesDir = path.join(projectRoot, 'src', 'locales');
  const localeFiles = { ja: 'ja.js', en: 'en.js', uz: 'uz.js' };
  const dictionaries = {};

  // 2a. Parse locale files to extract key-value pairs
  const kvRegex = /(?:"([^"]+)"|'([^']+)'|([\w.-]+))\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)/g;
  for (const [lang, filename] of Object.entries(localeFiles)) {
    const filePath = path.join(localesDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const dict = {};
    let m;
    kvRegex.lastIndex = 0; // Reset regex state between files!
    while ((m = kvRegex.exec(content)) !== null) {
      const key = m[1] || m[2] || m[3];
      const val = m[4] !== undefined ? m[4] : (m[5] !== undefined ? m[5] : m[6]);
      if (key && val !== undefined) {
        dict[key] = val.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, ' ');
      }
    }
    dictionaries[lang] = dict;
  }

  // 2b. Scan JSX files for t('key') usage with line numbers
  const tKeyUsage = {}; // key -> [{ file, line }]
  const compDir = path.join(projectRoot, 'src');
  function scanForTKeys(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !['node_modules', 'dist', '.git', 'locales'].includes(item)) {
        scanForTKeys(fullPath);
      } else if (item.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        const tRegex = /\bt\(['"]([\w.]+)['"]/g;
        lines.forEach((line, idx) => {
          let m;
          const lineRegex = /\bt\(['"]([\w.]+)['"]/g;
          while ((m = lineRegex.exec(line)) !== null) {
            const key = m[1];
            if (!tKeyUsage[key]) tKeyUsage[key] = [];
            const relPath = path.relative(projectRoot, fullPath);
            // Avoid duplicate entries for same file+line
            if (!tKeyUsage[key].some(e => e.file === relPath && e.line === idx + 1)) {
              tKeyUsage[key].push({ file: relPath, line: idx + 1 });
            }
          }
        });
      }
    }
  }
  scanForTKeys(compDir);

  // 2c. Build page-grouped index
  const pageGroups = {};
  for (const [key, usages] of Object.entries(tKeyUsage)) {
    for (const usage of usages) {
      const fileName = path.basename(usage.file, '.jsx');
      if (!pageGroups[fileName]) pageGroups[fileName] = [];
      pageGroups[fileName].push({
        key,
        ja: (dictionaries.ja || {})[key] || '',
        en: (dictionaries.en || {})[key] || '',
        uz: (dictionaries.uz || {})[key] || '',
        file: usage.file,
        line: usage.line
      });
    }
  }

  return { dictionaries, tKeyUsage, pageGroups };
}

// ══════════════════════════════════════════════
// FAZA 3: Impact & Risk Matrix Calculation
// ══════════════════════════════════════════════
function calculateImpactMatrix(componentMap, utilMap, dataMap, serviceMap = {}) {
  // 3a. Build reverse dependency map (who imports this?)
  const reverseDepMap = {}; // fileName -> [importerFileName]
  const allSourceFiles = [
    ...Object.values(componentMap),
    ...Object.values(utilMap),
    ...Object.values(dataMap),
    ...Object.values(serviceMap)
  ];

  // Scan all source files for imports
  const srcDir = path.join(projectRoot, 'src');
  function scanImports(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !['node_modules', 'dist', '.git'].includes(item)) {
        scanImports(fullPath);
      } else if (item.endsWith('.jsx') || (item.endsWith('.js') && !item.includes('.test.'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
        let m;
        while ((m = importRegex.exec(content)) !== null) {
          const impSource = m[1];
          if (impSource.startsWith('.')) {
            const parts = impSource.split('/');
            const importedBase = parts[parts.length - 1].split('.')[0];
            if (!reverseDepMap[importedBase]) reverseDepMap[importedBase] = [];
            const importerRel = path.relative(projectRoot, fullPath);
            if (!reverseDepMap[importedBase].includes(importerRel)) {
              reverseDepMap[importedBase].push(importerRel);
            }
          }
        }
      }
    }
  }
  scanImports(srcDir);
  // Also check App.jsx in src root
  const appPath = path.join(projectRoot, 'src', 'App.jsx');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
    let m;
    while ((m = importRegex.exec(appContent)) !== null) {
      const impSource = m[1];
      if (impSource.startsWith('.')) {
        const parts = impSource.split('/');
        const importedBase = parts[parts.length - 1].split('.')[0];
        if (!reverseDepMap[importedBase]) reverseDepMap[importedBase] = [];
        if (!reverseDepMap[importedBase].includes('src/App.jsx')) {
          reverseDepMap[importedBase].push('src/App.jsx');
        }
      }
    }
  }

  // 3b. Parse past_mistakes.md for bug frequency per file
  const bugCounts = {}; // keyword/filename -> count
  const pastMistakesPath = path.join(projectRoot, '.agents', 'rules', 'past_mistakes.md');
  let pastMistakesContent = '';
  if (fs.existsSync(pastMistakesPath)) {
    pastMistakesContent = fs.readFileSync(pastMistakesPath, 'utf8');
    // Extract each bug section
    const bugSections = pastMistakesContent.split(/## 🚫 \d+\./).filter(s => s.trim());
    bugSections.forEach(section => {
      // Check which files/components are mentioned
      const allKeys = [
        ...Object.keys(componentMap).map(k => k.split('.')[0]),
        ...Object.keys(utilMap).map(k => k.split('.')[0]),
        'App', 'BottomNav', 'MapLibre', 'i18n'
      ];
      allKeys.forEach(key => {
        if (section.toLowerCase().includes(key.toLowerCase())) {
          bugCounts[key] = (bugCounts[key] || 0) + 1;
        }
      });
    });
  }

  // 3c. Calculate risk level for each component/util
  const riskItems = [];
  const allItems = [
    ...Object.entries(componentMap).map(([k, v]) => ({ name: k.split('.')[0], type: 'component', data: v })),
    ...Object.entries(utilMap).map(([k, v]) => ({ name: k.split('.')[0], type: 'util', data: v })),
    ...Object.entries(serviceMap).map(([k, v]) => ({ name: k.split('.')[0], type: 'service', data: v })),
    ...Object.entries(dataMap).map(([k, v]) => ({ name: k.split('.')[0], type: 'data', data: v })),
  ];

  allItems.forEach(item => {
    const importers = reverseDepMap[item.name] || [];
    const bugs = bugCounts[item.name] || 0;
    const lines = item.data.lines || 0;
    let riskLevel = 'LOW';
    let riskEmoji = '⚪';

    if (importers.length >= 5 || bugs >= 3 || lines > 1500) {
      riskLevel = 'CRITICAL';
      riskEmoji = '🔴';
    } else if (importers.length >= 3 || bugs >= 1 || lines > 800) {
      riskLevel = 'HIGH';
      riskEmoji = '🟡';
    } else if (importers.length >= 2) {
      riskLevel = 'MEDIUM';
      riskEmoji = '🟢';
    }

    riskItems.push({
      name: item.name,
      type: item.type,
      path: item.data.path,
      lines,
      importerCount: importers.length,
      importers: importers.slice(0, 8),
      bugCount: bugs,
      riskLevel,
      riskEmoji
    });
  });

  // Sort by risk level
  const riskOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  riskItems.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel] || b.importerCount - a.importerCount);

  return { reverseDepMap, bugCounts, riskItems };
}

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(projectRoot, file);
  const name = path.basename(file);
  
  const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  const linesCount = content.split('\n').length;
  const sizeBytes = content.length;

  const fileData = {
    path: relativePath,
    name,
    imports,
    size: sizeBytes,
    lines: linesCount
  };

  if (relativePath.startsWith('src/components/')) {
    if (name.includes('.test.')) {
      map.tests[name] = fileData;
    } else if (name.endsWith('.css')) {
      map.styles[name] = fileData;
    } else if (name.endsWith('.jsx') || name.endsWith('.js')) {
      const compInfo = extractComponentInfo(content, name);
      fileData.componentName = compInfo ? compInfo.name : name.split('.')[0];
      fileData.props = compInfo ? compInfo.props : [];
      map.components[name] = fileData;
    }
  } else if (relativePath.startsWith('src/data/')) {
    fileData.exports = extractUtilityExports(content);
    map.data[name] = fileData;
  } else if (relativePath.startsWith('src/utils/')) {
    if (name.includes('.test.')) {
      map.tests[name] = fileData;
    } else {
      fileData.exports = extractUtilityExports(content);
      map.utils[name] = fileData;
    }
  } else if (relativePath.startsWith('src/services/')) {
    if (name.includes('.test.')) {
      map.tests[name] = fileData;
    } else {
      fileData.exports = extractUtilityExports(content);
      map.services[name] = fileData;
    }
  } else if (relativePath.startsWith('tests/')) {
    map.tests[name] = fileData;
  } else if (relativePath.startsWith('scripts/')) {
    map.scripts[name] = fileData;
  } else if (relativePath.startsWith('.agents/rules/')) {
    map.rules[name] = fileData;
  } else if (relativePath.startsWith('src/')) {
    if (name.endsWith('.jsx') || name.endsWith('.js')) {
      const compInfo = extractComponentInfo(content, name);
      if (compInfo) {
        fileData.component = compInfo;
      }
    }
    map.root[name] = fileData;
  }
});

const dependencyLinks = [];
const componentNames = Object.values(map.components).map(c => c.componentName);

Object.values(map.components).forEach(comp => {
  comp.imports.forEach(imp => {
    const parts = imp.split('/');
    const importedName = parts[parts.length - 1].split('.')[0];
    if (componentNames.includes(importedName) && comp.componentName !== importedName) {
      dependencyLinks.push(`  ${comp.componentName} --> ${importedName}`);
    }
  });
});

const appFile = map.root['App.jsx'];
if (appFile && appFile.component) {
  appFile.imports.forEach(imp => {
    const parts = imp.split('/');
    const importedName = parts[parts.length - 1].split('.')[0];
    if (componentNames.includes(importedName)) {
      dependencyLinks.push(`  App --> ${importedName}`);
    }
  });
}

const uniqueLinks = [...new Set(dependencyLinks)].sort();

let md = `# Michi Ilovasi: Loyiha Arxitekturasi va Mundarija Xaritasi (Codebase Map)

> [!NOTE]
> Ushbu xarita loyihadagi barcha komponentlar bog'liqligi, ma'lumotlar bazalari, utilitlar va skriptlarni avtomatik skanerlash orqali yaratilgan. Oxirgi yangilangan vaqti: **${new Date().toLocaleString('uz-UZ')}**.

---

## 📂 Loyiha Fayllari Statistikasi
* **Jami skanerlangan fayllar:** ${allFiles.length} ta
* **React Komponentlari:** ${Object.keys(map.components).length} ta
* **Komponent Stillari (CSS):** ${Object.keys(map.styles).length} ta
* **Geografiya va Ma'lumotlar Bazalari (data):** ${Object.keys(map.data).length} ta
* **Unit Testlar (Vitest):** ${Object.keys(map.tests).length} ta
* **Yordamchi Funksiyalar (utils):** ${Object.keys(map.utils).length} ta
* **Tashqi API va Xizmatlar (services):** ${Object.keys(map.services).length} ta
* **Avtomatizatsiya Skriptlari (scripts):** ${Object.keys(map.scripts).length} ta
* **Tizim va UI Qoidalari (.agents/rules):** ${Object.keys(map.rules).length} ta
* **Boshqa asosiy fayllar (src/ root):** ${Object.keys(map.root).length} ta

---

## 📊 Komponentlar O'zaro Bog'liqlik Grafigi (Dependency Graph)

\`\`\`mermaid
graph TD
  App[App.jsx]
${uniqueLinks.join('\n')}
  
  style App fill:#5E5CE6,stroke:#333,stroke-width:2px,color:#fff
\`\`\`

---

## 🧩 Asosiy React Komponentlari (Components)

`;

Object.keys(map.components).sort().forEach(key => {
  const info = map.components[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### 📦 [${info.componentName}](file://${absPath})\n`;
  md += `* **Fayl yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n`;
  
  const baseName = key.split('.')[0];
  const cssFile = `${baseName}.css`;
  const testFile = `${baseName}.test.jsx`;
  
  if (map.styles[cssFile]) {
    const cssPath = path.resolve(projectRoot, map.styles[cssFile].path);
    md += `* **Komponent Stillari:** 🎨 [${cssFile}](file://${cssPath})\n`;
  }
  if (map.tests[testFile]) {
    const testPath = path.resolve(projectRoot, map.tests[testFile].path);
    md += `* **Unit Testlari:** 🧪 [${testFile}](file://${testPath})\n`;
  }

  md += `* **Qabul qiladigan parametrlari (Props):**\n`;
  if (info.props && info.props.length > 0) {
    info.props.forEach(prop => {
      md += `  - \`${prop}\`\n`;
    });
  } else {
    md += `  - *Parametrlar mavjud emas*\n`;
  }
  
  md += `* **Import qilgan bog'liqliklari:**\n`;
  if (info.imports.length > 0) {
    info.imports.forEach(imp => {
      md += `  - \`${imp}\`\n`;
    });
  } else {
    md += `  - *Bog'liqliklar mavjud emas*\n`;
  }
  md += `\n`;
});

md += `\n---\n\n## 🗄️ Ma'lumotlar Bazalari va Modullar (Data Services)\n\n`;

Object.keys(map.data).sort().forEach(key => {
  const info = map.data[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### 🗄️ [${key}](file://${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n`;
  md += `* **Eksport qilingan obyektlar/strukturalar:**\n`;
  if (info.exports && info.exports.length > 0) {
    info.exports.forEach(exp => {
      md += `  - \`${exp}\`\n`;
    });
  } else {
    md += `  - *Eksportlar aniqlanmadi*\n`;
  }
  md += `\n`;
});

md += `\n---\n\n## 🛠️ Yordamchi Funksiyalar (Utils)\n\n`;

Object.keys(map.utils).sort().forEach(key => {
  const info = map.utils[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### ⚙️ [${key}](file://${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n`;
  md += `* **Eksport qilingan funksiyalari:**\n`;
  if (info.exports && info.exports.length > 0) {
    info.exports.forEach(exp => {
      md += `  - \`${exp}()\`\n`;
    });
  } else {
    md += `  - *Eksportlar aniqlanmadi*\n`;
  }
  md += `* **Importlari:** ${info.imports.map(i => `\`${i}\``).join(', ') || '*Yo\'q*'}\n\n`;
});

md += `\n---\n\n## 🔌 Tashqi API va Xizmatlar Modullari (Services)\n\n`;

Object.keys(map.services).sort().forEach(key => {
  const info = map.services[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### 🔌 [${key}](file://${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n`;
  md += `* **Eksport qilingan funksiyalari:**\n`;
  if (info.exports && info.exports.length > 0) {
    info.exports.forEach(exp => {
      md += `  - \`${exp}()\`\n`;
    });
  } else {
    md += `  - *Eksportlar aniqlanmadi*\n`;
  }
  md += `* **Importlari:** ${info.imports.map(i => `\`${i}\``).join(', ') || '*Yo\'q*'}\n\n`;
});

md += `\n---\n\n## 🤖 Avtomatizatsiya va Tekshiruv Skriptlari (Scripts)\n\n`;

Object.keys(map.scripts).sort().forEach(key => {
  const info = map.scripts[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### 🛠️ [${key}](file://${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n\n`;
});

md += `\n---\n\n## 📜 Tizim va UI Invariant Qoidalari (.agents/rules)\n\n`;

Object.keys(map.rules).sort().forEach(key => {
  const info = map.rules[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### 📜 [${key}](file://${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator)\n\n`;
});

// ══════════════════════════════════════════════
// YANGI BO'LIM: State & Data-Flow Xaritasi
// ══════════════════════════════════════════════
console.log('--- Faza 1: State & Data-Flow Mapping ---');
const stateFlow = extractStateFlow();

md += `\n---\n\n## 🔄 State & Data-Flow Xaritasi (App.jsx Global State Registry)\n\n`;

if (stateFlow.states.length > 0) {
  md += `### Global State Ro'yxati\n\n`;
  md += `| # | State Nomi | Setter | Default | Satr | localStorage Sync |\n`;
  md += `|---|---|---|---|---|---|\n`;
  stateFlow.states.forEach((s, i) => {
    const lsIcon = s.localStorageSync ? '✅' : '—';
    const defVal = s.defaultValue.replace(/\|/g, '\\|');
    md += `| ${i + 1} | \`${s.name}\` | \`${s.setter}\` | \`${defVal}\` | L${s.line} | ${lsIcon} |\n`;
  });
  md += `\n`;
}

if (stateFlow.propFlows.length > 0) {
  md += `### Prop-Drilling Zanjiri (App.jsx → Komponentlar)\n\n`;
  md += `| Komponent | Qabul qilgan Proplar soni | Asosiy Proplar |\n`;
  md += `|---|---|---|\n`;
  stateFlow.propFlows
    .sort((a, b) => b.props.length - a.props.length)
    .forEach(flow => {
      const topProps = flow.props.slice(0, 6).map(p => `\`${p}\``).join(', ');
      const suffix = flow.props.length > 6 ? ` +${flow.props.length - 6} ta` : '';
      md += `| **${flow.component}** | ${flow.props.length} | ${topProps}${suffix} |\n`;
    });
  md += `\n`;

  // Mermaid prop-drilling graph (top 10 by prop count)
  md += `#### Prop-Drilling Mermaid Grafik\n\n`;
  md += `\`\`\`mermaid\ngraph LR\n`;
  stateFlow.propFlows
    .sort((a, b) => b.props.length - a.props.length)
    .slice(0, 12)
    .forEach(flow => {
      md += `  App["App.jsx"] -->|"${flow.props.length} prop"| ${flow.component}\n`;
    });
  md += `\n  style App fill:#5E5CE6,stroke:#333,stroke-width:2px,color:#fff\n`;
  md += `\`\`\`\n\n`;
}

// ══════════════════════════════════════════════
// YANGI BO'LIM: Reverse i18n Index
// ══════════════════════════════════════════════
console.log('--- Faza 2: Reverse i18n Index ---');
const i18nIndex = extractI18nIndex();

md += `\n---\n\n## 🔤 Reverse i18n Index — Ekran Matni → Kod Xaritasi\n\n`;
md += `> Ushbu bo'lim har bir i18n kalitining 3 tildagi tarjimasini va aynan qaysi komponentda ishlatilishini ko'rsatadi.\n\n`;

const sortedPages = Object.keys(i18nIndex.pageGroups).sort();
if (sortedPages.length > 0) {
  // Group statistics
  const totalKeys = Object.keys(i18nIndex.tKeyUsage).length;
  md += `**Jami ishlatilgan i18n kalitlar:** ${totalKeys} ta, **${sortedPages.length}** ta komponentda tarqalgan\n\n`;

  sortedPages.forEach(pageName => {
    const entries = i18nIndex.pageGroups[pageName];
    // Deduplicate by key
    const seen = new Set();
    const unique = entries.filter(e => {
      if (seen.has(e.key)) return false;
      seen.add(e.key);
      return true;
    });
    if (unique.length === 0) return;

    md += `### 📄 ${pageName} (${unique.length} ta kalit)\n\n`;
    md += `| i18n Key | 🇯🇵 Yapon | 🇬🇧 English | 🇺🇿 O'zbek | Satr |\n`;
    md += `|---|---|---|---|---|\n`;
    unique.slice(0, 30).forEach(entry => {
      const ja = (entry.ja || '—').substring(0, 25).replace(/\|/g, '/');
      const en = (entry.en || '—').substring(0, 25).replace(/\|/g, '/');
      const uz = (entry.uz || '—').substring(0, 25).replace(/\|/g, '/');
      md += `| \`${entry.key}\` | ${ja} | ${en} | ${uz} | L${entry.line} |\n`;
    });
    if (unique.length > 30) {
      md += `| ... | *+${unique.length - 30} ta kalit* | | | |\n`;
    }
    md += `\n`;
  });
} else {
  md += `*i18n kalitlar topilmadi*\n\n`;
}

// ══════════════════════════════════════════════
// YANGI BO'LIM: Impact & Risk Matrix
// ══════════════════════════════════════════════
console.log('--- Faza 3: Impact & Risk Matrix ---');
const impactMatrix = calculateImpactMatrix(map.components, map.utils, map.data, map.services);

md += `\n---\n\n## ⚠️ Impact & Risk Matrix — O'zgartirish Ta'sir Doirasi\n\n`;
md += `> Har bir fayl uchun avtomatik hisoblangan xavf darajasi: kimlar import qiladi + bug tarixi + fayl hajmi asosida.\n\n`;

const riskGroups = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
impactMatrix.riskItems.forEach(item => {
  riskGroups[item.riskLevel].push(item);
});

if (riskGroups.CRITICAL.length > 0) {
  md += `### 🔴 CRITICAL Risk (O'zgartirishdan oldin ALBATTA past_mistakes.md o'qing)\n\n`;
  md += `| Fayl | Turi | Qatorlar | Ishlatilgan joylar | Bug tarixi | Importerlar |\n`;
  md += `|---|---|---|---|---|---|\n`;
  riskGroups.CRITICAL.forEach(item => {
    const importerList = item.importers.map(i => path.basename(i)).join(', ');
    md += `| **${item.name}** | ${item.type} | ${item.lines} | ${item.importerCount}x | ${item.bugCount} ta bug | ${importerList} |\n`;
  });
  md += `\n`;
}

if (riskGroups.HIGH.length > 0) {
  md += `### 🟡 HIGH Risk\n\n`;
  md += `| Fayl | Turi | Qatorlar | Ishlatilgan joylar | Bug tarixi | Importerlar |\n`;
  md += `|---|---|---|---|---|---|\n`;
  riskGroups.HIGH.forEach(item => {
    const importerList = item.importers.map(i => path.basename(i)).join(', ');
    md += `| **${item.name}** | ${item.type} | ${item.lines} | ${item.importerCount}x | ${item.bugCount} ta bug | ${importerList} |\n`;
  });
  md += `\n`;
}

if (riskGroups.MEDIUM.length > 0) {
  md += `### 🟢 MEDIUM Risk\n\n`;
  md += `| Fayl | Turi | Ishlatilgan joylar | Importerlar |\n`;
  md += `|---|---|---|---|\n`;
  riskGroups.MEDIUM.forEach(item => {
    const importerList = item.importers.map(i => path.basename(i)).join(', ');
    md += `| ${item.name} | ${item.type} | ${item.importerCount}x | ${importerList} |\n`;
  });
  md += `\n`;
}

if (riskGroups.LOW.length > 0) {
  md += `### ⚪ LOW Risk\n\n`;
  md += `| Fayl | Turi | Ishlatilgan joylar |\n`;
  md += `|---|---|---|\n`;
  riskGroups.LOW.forEach(item => {
    md += `| ${item.name} | ${item.type} | ${item.importerCount}x |\n`;
  });
  md += `\n`;
}

// Risk summary
md += `### 📊 Risk Xulosasi\n\n`;
md += `| Daraja | Soni |\n`;
md += `|---|---|\n`;
md += `| 🔴 CRITICAL | ${riskGroups.CRITICAL.length} |\n`;
md += `| 🟡 HIGH | ${riskGroups.HIGH.length} |\n`;
md += `| 🟢 MEDIUM | ${riskGroups.MEDIUM.length} |\n`;
md += `| ⚪ LOW | ${riskGroups.LOW.length} |\n`;
md += `| **JAMI** | **${impactMatrix.riskItems.length}** |\n\n`;

const outputPath = path.join(projectRoot, 'codebase_map.md');
fs.writeFileSync(outputPath, md);
console.log('--- Codebase Map muvaffaqiyatli yangilandi! ---');
console.log(`--- Yangi bo'limlar: State Flow (${stateFlow.states.length} state), i18n Index (${Object.keys(i18nIndex.tKeyUsage).length} key), Impact Matrix (${impactMatrix.riskItems.length} item) ---`);
console.log('Fayl:', outputPath);

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
const ruleFiles = getFiles(path.join(projectRoot, '.agents', 'rules'));
const allFiles = [...srcFiles, ...scriptFiles, ...ruleFiles];

const map = {
  components: {},
  styles: {},
  tests: {},
  data: {},
  utils: {},
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
  md += `### 📦 [${info.componentName}](file:///${absPath})\n`;
  md += `* **Fayl yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n`;
  
  const baseName = key.split('.')[0];
  const cssFile = `${baseName}.css`;
  const testFile = `${baseName}.test.jsx`;
  
  if (map.styles[cssFile]) {
    const cssPath = path.resolve(projectRoot, map.styles[cssFile].path);
    md += `* **Komponent Stillari:** 🎨 [${cssFile}](file:///${cssPath})\n`;
  }
  if (map.tests[testFile]) {
    const testPath = path.resolve(projectRoot, map.tests[testFile].path);
    md += `* **Unit Testlari:** 🧪 [${testFile}](file:///${testPath})\n`;
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
  md += `### 🗄️ [${key}](file:///${absPath})\n`;
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
  md += `### ⚙️ [${key}](file:///${absPath})\n`;
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
  md += `### 🛠️ [${key}](file:///${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n\n`;
});

md += `\n---\n\n## 📜 Tizim va UI Invariant Qoidalari (.agents/rules)\n\n`;

Object.keys(map.rules).sort().forEach(key => {
  const info = map.rules[key];
  const absPath = path.resolve(projectRoot, info.path);
  md += `### 📜 [${key}](file:///${absPath})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator)\n\n`;
});

const outputPath = path.join(projectRoot, 'codebase_map.md');
fs.writeFileSync(outputPath, md);
console.log('--- Codebase Map muvaffaqiyatli yangilandi! ---');
console.log('Fayl:', outputPath);

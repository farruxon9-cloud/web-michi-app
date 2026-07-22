import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

console.log('Skanerlash boshlandi:', srcDir);

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getFiles(filePath, files);
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        files.push(filePath);
      }
    }
  }
  return files;
}

const allFiles = getFiles(srcDir);
const map = {
  components: {},
  utils: {},
  root: {}
};

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(projectRoot, file);
  const name = path.basename(file);
  
  // Find imports
  const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Find component exports
  const componentRegex = /export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)/;
  const compMatch = componentRegex.exec(content);
  
  let componentInfo = null;
  if (compMatch) {
    const compName = compMatch[1];
    const propsStr = compMatch[2].trim();
    // Parse props from destructuring
    const props = [];
    if (propsStr.startsWith('{') && propsStr.endsWith('}')) {
      const propNames = propsStr
        .slice(1, -1)
        .split(',')
        .map(p => p.trim().split('=')[0].trim())
        .filter(p => p && !p.startsWith('...'));
      props.push(...propNames);
    }
    componentInfo = { name: compName, props };
  }

  const fileData = {
    path: relativePath,
    name,
    imports,
    component: componentInfo,
    size: content.length,
    lines: content.split('\n').length
  };

  if (relativePath.startsWith('src/components/')) {
    map.components[name] = fileData;
  } else if (relativePath.startsWith('src/utils/')) {
    map.utils[name] = fileData;
  } else {
    map.root[name] = fileData;
  }
});

// Generate Markdown Map
let md = `# Michi Ilovasi: Loyiha Arxitekturasi Xaritasi (Codebase Map)

> [!NOTE]
> Ushbu xarita loyihadagi barcha komponentlar bog'liqligi va parametrlarini avtomatik tahlil qilish orqali yaratilgan. U yangi dasturchilar va AI yordamchilarga loyihaning to'liq tuzilishini bir soniyada tushunishga yordam beradi.

---

## 📂 Loyiha Fayllari Statistikasi
* **Jami skanerlangan fayllar:** ${allFiles.length} ta
* **Komponentlar soni:** ${Object.keys(map.components).length} ta
* **Yordamchi funksiyalar (utils):** ${Object.keys(map.utils).length} ta

---

## 🧩 Asosiy Komponentlar (Components)

`;

Object.keys(map.components).sort().forEach(key => {
  const info = map.components[key];
  md += `### 📦 [${info.name || info.name === null ? info.name : key}](file:///${path.resolve(projectRoot, info.path)})\n`;
  md += `* **Fayl yo'li:** \`${info.path}\` (${info.lines} qator, ${info.size} bayt)\n`;
  if (info.component) {
    md += `* **Qabul qiladigan parametrlari (Props):**\n`;
    if (info.component.props.length > 0) {
      info.component.props.forEach(prop => {
        md += `  - \`${prop}\`\n`;
      });
    } else {
      md += `  - *Parametrlar mavjud emas*\n`;
    }
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

md += `\n---\n\n## 🛠️ Yordamchi Funksiyalar va Konfiguratsiyalar (Utils & Root)\n\n`;

Object.keys(map.root).sort().forEach(key => {
  const info = map.root[key];
  md += `### 📄 [${key}](file:///${path.resolve(projectRoot, info.path)})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator)\n`;
  md += `* **Importlari:** ${info.imports.map(i => `\`${i}\``).join(', ') || '*Yo\'q*'}\n\n`;
});

Object.keys(map.utils).sort().forEach(key => {
  const info = map.utils[key];
  md += `### ⚙️ [${key}](file:///${path.resolve(projectRoot, info.path)})\n`;
  md += `* **Yo'li:** \`${info.path}\` (${info.lines} qator)\n`;
  md += `* **Importlari:** ${info.imports.map(i => `\`${i}\``).join(', ') || '*Yo\'q*'}\n\n`;
});

const outputPath = path.join(projectRoot, 'codebase_map.md');
fs.writeFileSync(outputPath, md);
console.log('Loyiha xaritasi muvaffaqiyatli yaratildi:', outputPath);

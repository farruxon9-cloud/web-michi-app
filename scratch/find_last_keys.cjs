const fs = require('fs');
const content = fs.readFileSync('src/i18n.js', 'utf8');

const languages = ['uz', 'ja', 'en', 'vi', 'zh'];
for (const lang of languages) {
  const regex = new RegExp(`\\b${lang}:\\s*\\{\\s*translation:\\s*\\{`, 'g');
  const match = regex.exec(content);
  if (match) {
    console.log(`Found ${lang} at index ${match.index}`);
    // Find closing braces
    let braceCount = 2;
    let i = match.index + match[0].length;
    let lastSlice = '';
    while (braceCount > 0 && i < content.length) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 1) {
          lastSlice = content.slice(i - 100, i);
        }
      }
      i++;
    }
    console.log(`End of ${lang} translation block:`);
    console.log(lastSlice);
    console.log('---');
  } else {
    console.log(`Could not find ${lang}`);
  }
}

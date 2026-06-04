import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('typeLogistics')) {
    console.log(`--- Line ${index + 1} ---`);
    for (let i = Math.max(0, index - 2); i < Math.min(lines.length, index + 8); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
});

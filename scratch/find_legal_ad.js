import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('legalAd:')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

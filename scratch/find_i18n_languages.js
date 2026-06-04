import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

const regex = /const\s+resources\s*=\s*\{([\s\S]*?)\n\};/;
const match = content.match(regex);
if (match) {
  const keysStr = match[1];
  // Parse the top-level keys
  const langRegex = /^\s*([a-z]{2}):\s*\{/gm;
  let m;
  const languages = [];
  while ((m = langRegex.exec(keysStr)) !== null) {
    languages.push(m[1]);
  }
  console.log("Languages found:", languages);
} else {
  console.log("Could not find resources object");
}

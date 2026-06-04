import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

// Find all language keys by regex
const keys = [];
const regex = /resources:\s*\{([\s\S]*?)\}\s*,\s*lng:/;
const match = content.match(regex);
if (match) {
  console.log("Found resources block");
  // Let's print the first 1000 characters of resources block to see key names
  console.log(match[1].substring(0, 1000));
} else {
  // Let's print the first 500 characters of the file
  console.log(content.substring(0, 500));
}

import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\components\\Dashboard.css', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('music') || line.includes('player') || line.includes('bento-music-card')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\components\\DrivingAcademy.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('apply') || line.includes('Apply') || line.includes('sticky') || line.includes('telefon') || line.includes('phone')) {
    if (index > 400 && index < 750) { // arbitrary ranges to find detail view
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  }
});

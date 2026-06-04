import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\components\\CompanyHome.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('isDrivingSchool') && index > 100) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

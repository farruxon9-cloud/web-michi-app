import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\components\\Profile.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes("userRole === 'company'") || line.includes("userRole === 'school'") || line.includes("companyEmployees") || line.includes("savedItems")) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

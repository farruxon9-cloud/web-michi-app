import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

const regex = /typeLogistics/i;
console.log("Index of typeLogistics:", content.search(regex));

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('typeLogistics') || line.includes('typeDrivingSchool') || line.includes('Logistika')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});

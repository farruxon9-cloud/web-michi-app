import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\components\\Profile.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('isEditing') || line.includes('fullName') || line.includes('edit-form') || line.includes('companyType')) {
    if (index > 400 && index < 650) { // check edit block
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  }
});

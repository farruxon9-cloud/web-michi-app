const fs = require('fs');
const buffer = fs.readFileSync('src/components/Profile.jsx');
const isUtf16Le = buffer[0] === 0xff && buffer[1] === 0xfe;
console.log('Profile.jsx UTF-16LE:', isUtf16Le);

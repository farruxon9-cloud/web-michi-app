const fs = require('fs');

function detectAndPrint() {
  const filePath = 'src/i18n.js';
  const buffer = fs.readFileSync(filePath);
  
  // Check if it's UTF-16LE
  const isUtf16Le = buffer[0] === 0xff && buffer[1] === 0xfe;
  const isUtf16Be = buffer[0] === 0xfe && buffer[1] === 0xff;
  
  console.log('Buffer length:', buffer.length);
  console.log('BOM LE:', isUtf16Le, 'BOM BE:', isUtf16Be);
  
  let content = '';
  if (isUtf16Le) {
    content = buffer.toString('utf16le');
    console.log('Read as UTF-16LE successfully');
  } else {
    content = buffer.toString('utf8');
    console.log('Read as UTF-8 successfully');
  }
  
  console.log('First 10 lines:');
  console.log(content.split('\n').slice(0, 10).join('\n'));
}

detectAndPrint();

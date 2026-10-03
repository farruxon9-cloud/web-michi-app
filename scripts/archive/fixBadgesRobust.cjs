const fs = require('fs');

function addWhiteSpacetoCSS(filePath, className) {
  let css = fs.readFileSync(filePath, 'utf8');
  let regex = new RegExp(`(\\.${className}\\s*\\{[^}]*?)(\\})`);
  
  if (!css.includes('white-space: nowrap') || !css.match(new RegExp(`\\.${className}\\s*\\{[^}]*white-space:\\s*nowrap`))) {
    css = css.replace(regex, '$1  white-space: nowrap;\n$2');
    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`Updated ${className} in ${filePath}`);
  } else {
    console.log(`Already updated ${className} in ${filePath}`);
  }
}

addWhiteSpacetoCSS('src/components/DriverFeed.css', 'job-type-badge');
addWhiteSpacetoCSS('src/components/JobDetail.css', 'detail-type-badge');

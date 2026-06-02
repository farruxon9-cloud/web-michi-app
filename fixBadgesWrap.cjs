const fs = require('fs');

let driverCss = fs.readFileSync('src/components/DriverFeed.css', 'utf8');
if (!driverCss.includes('white-space: nowrap') && driverCss.includes('.job-type-badge {')) {
  driverCss = driverCss.replace(
    '.job-type-badge {\r\n  position: absolute;',
    '.job-type-badge {\r\n  position: absolute;\r\n  white-space: nowrap;'
  );
  driverCss = driverCss.replace(
    '.job-type-badge {\n  position: absolute;',
    '.job-type-badge {\n  position: absolute;\n  white-space: nowrap;'
  );
  fs.writeFileSync('src/components/DriverFeed.css', driverCss, 'utf8');
}

let jobDetailCss = fs.readFileSync('src/components/JobDetail.css', 'utf8');
if (!jobDetailCss.includes('white-space: nowrap') && jobDetailCss.includes('.detail-type-badge {')) {
  jobDetailCss = jobDetailCss.replace(
    '.detail-type-badge {\r\n  position: absolute;',
    '.detail-type-badge {\r\n  position: absolute;\r\n  white-space: nowrap;'
  );
  jobDetailCss = jobDetailCss.replace(
    '.detail-type-badge {\n  position: absolute;',
    '.detail-type-badge {\n  position: absolute;\n  white-space: nowrap;'
  );
  fs.writeFileSync('src/components/JobDetail.css', jobDetailCss, 'utf8');
}

console.log("Added white-space: nowrap to badges");

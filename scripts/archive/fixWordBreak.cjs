const fs = require('fs');

// Fix DriverFeed.css
let driverCss = fs.readFileSync('src/components/DriverFeed.css', 'utf8');
const oldDriverTitle = `.job-card-title {\r\n  font-size: 14px;\r\n  font-weight: 700;\r\n  line-height: 1.3;\r\n  margin: 0;\r\n  display: -webkit-box;\r\n  -webkit-line-clamp: 2;\r\n  -webkit-box-orient: vertical;\r\n  overflow: hidden;\r\n}`;
const oldDriverTitleLF = `.job-card-title {\n  font-size: 14px;\n  font-weight: 700;\n  line-height: 1.3;\n  margin: 0;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}`;

const newDriverTitle = `.job-card-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;
}`;

if (driverCss.includes(oldDriverTitle)) {
  driverCss = driverCss.replace(oldDriverTitle, newDriverTitle);
} else if (driverCss.includes(oldDriverTitleLF)) {
  driverCss = driverCss.replace(oldDriverTitleLF, newDriverTitle);
} else {
  // Try more generic replace
  driverCss = driverCss.replace('overflow: hidden;\r\n}', 'overflow: hidden;\r\n  word-break: break-all;\r\n  overflow-wrap: anywhere;\r\n  white-space: normal;\r\n}');
  driverCss = driverCss.replace('overflow: hidden;\n}', 'overflow: hidden;\n  word-break: break-all;\n  overflow-wrap: anywhere;\n  white-space: normal;\n}');
}

fs.writeFileSync('src/components/DriverFeed.css', driverCss, 'utf8');

// Fix JobDetail.css
let detailCss = fs.readFileSync('src/components/JobDetail.css', 'utf8');
const oldDetailTitle = `.detail-title {\r\n  font-size: 22px;\r\n  line-height: 1.2;\r\n  margin-bottom: 6px;\r\n  word-break: break-word;\r\n  overflow-wrap: break-word;\r\n}`;
const oldDetailTitleLF = `.detail-title {\n  font-size: 22px;\n  line-height: 1.2;\n  margin-bottom: 6px;\n  word-break: break-word;\n  overflow-wrap: break-word;\n}`;

const newDetailTitle = `.detail-title {
  font-size: 22px;
  line-height: 1.2;
  margin-bottom: 6px;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;
}`;

if (detailCss.includes(oldDetailTitle)) {
  detailCss = detailCss.replace(oldDetailTitle, newDetailTitle);
} else if (detailCss.includes(oldDetailTitleLF)) {
  detailCss = detailCss.replace(oldDetailTitleLF, newDetailTitle);
}

fs.writeFileSync('src/components/JobDetail.css', detailCss, 'utf8');
console.log('Fixed CSS');

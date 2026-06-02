const fs = require('fs');

let css = fs.readFileSync('src/components/JobDetail.css', 'utf8');

// Fix detail-type-badge
css = css.replace(
`.detail-type-badge {\r\n  position: absolute;\r\n  bottom: 16px;\r\n  left: 16px;`,
`.detail-type-badge {\r\n  position: absolute;\r\n  bottom: 48px;\r\n  left: 16px;`
);

css = css.replace(
`.detail-type-badge {\n  position: absolute;\n  bottom: 16px;\n  left: 16px;`,
`.detail-type-badge {\n  position: absolute;\n  bottom: 48px;\n  left: 16px;`
);

// Fix detail-title
css = css.replace(
`.detail-title {\r\n  font-size: 22px;\r\n  line-height: 1.2;\r\n  margin-bottom: 6px;\r\n  word-break: break-word;\r\n  overflow-wrap: break-word;\r\n}`,
`.detail-title {\r\n  font-size: 22px;\r\n  line-height: 1.2;\r\n  margin-bottom: 6px;\r\n  word-break: break-all;\r\n  overflow-wrap: anywhere;\r\n  white-space: normal;\r\n}`
);

css = css.replace(
`.detail-title {\n  font-size: 22px;\n  line-height: 1.2;\n  margin-bottom: 6px;\n  word-break: break-word;\n  overflow-wrap: break-word;\n}`,
`.detail-title {\n  font-size: 22px;\n  line-height: 1.2;\n  margin-bottom: 6px;\n  word-break: break-all;\n  overflow-wrap: anywhere;\n  white-space: normal;\n}`
);

fs.writeFileSync('src/components/JobDetail.css', css, 'utf8');
console.log('Fixed CSS');

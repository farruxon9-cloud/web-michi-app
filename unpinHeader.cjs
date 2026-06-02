const fs = require('fs');

let css = fs.readFileSync('src/components/RoleSelect.css', 'utf8');

css = css.replace(
`.auth-card {
  padding: 24px 20px;
  box-shadow: var(--shadow-md);
  margin-top: 10px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
}`,
`.auth-card {
  padding: 24px 20px;
  box-shadow: var(--shadow-md);
  margin-top: 10px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  overflow-y: auto;
}`);

css = css.replace(
`.auth-card {\r\n  padding: 24px 20px;\r\n  box-shadow: var(--shadow-md);\r\n  margin-top: 10px;\r\n  max-height: 80vh;\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: var(--card-bg);\r\n}`,
`.auth-card {\r\n  padding: 24px 20px;\r\n  box-shadow: var(--shadow-md);\r\n  margin-top: 10px;\r\n  max-height: 80vh;\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: var(--card-bg);\r\n  overflow-y: auto;\r\n}`);


css = css.replace(
`.auth-form-scroll {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 30px;
}`,
`.auth-form-scroll {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 4px;
  padding-bottom: 30px;
}`);

css = css.replace(
`.auth-form-scroll {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 20px;\r\n  overflow-y: auto;\r\n  padding-right: 4px;\r\n  padding-bottom: 30px;\r\n}`,
`.auth-form-scroll {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 20px;\r\n  padding-right: 4px;\r\n  padding-bottom: 30px;\r\n}`);

css = css.replace('.btn-primary {\n  background: #111113;', '.btn-primary {\n  flex-shrink: 0; /* fix */\n  min-height: 52px; /* fix */\n  display: flex; align-items: center; justify-content: center;\n  background: #111113;');
css = css.replace('.btn-primary {\r\n  background: #111113;', '.btn-primary {\r\n  flex-shrink: 0; /* fix */\r\n  min-height: 52px; /* fix */\r\n  display: flex; align-items: center; justify-content: center;\r\n  background: #111113;');

fs.writeFileSync('src/components/RoleSelect.css', css, 'utf8');
console.log('Fixed CSS');

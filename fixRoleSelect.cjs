const fs = require('fs');

let css = fs.readFileSync('src/components/RoleSelect.css', 'utf8');
if (!css.includes('padding-bottom: 30px;')) {
  css = css.replace('.auth-form-scroll {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 20px;\r\n  overflow-y: auto;\r\n  padding-right: 4px;\r\n}', 
                    '.auth-form-scroll {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  overflow-y: auto;\n  padding-right: 4px;\n  padding-bottom: 30px;\n}');
  // Also try LF
  css = css.replace('.auth-form-scroll {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  overflow-y: auto;\n  padding-right: 4px;\n}', 
                    '.auth-form-scroll {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  overflow-y: auto;\n  padding-right: 4px;\n  padding-bottom: 30px;\n}');
  fs.writeFileSync('src/components/RoleSelect.css', css, 'utf8');
  console.log('Fixed CSS');
}

let code = fs.readFileSync('src/components/RoleSelect.jsx', 'utf8');

if (code.includes('agreeAllTerms')) {
  code = code.replace(
    /const \[agreeAllTerms, setAgreeAllTerms\] = useState\(false\);\s+const allLegalAccepted = agreeAllTerms;/,
    "const [agreeLabor, setAgreeLabor] = useState(false);\n  const [agreeVisa, setAgreeVisa] = useState(false);\n  const [agreeAd, setAgreeAd] = useState(false);\n  const allLegalAccepted = agreeLabor && agreeVisa && agreeAd;"
  );

  const newChecklist = `<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input type="checkbox" checked={agreeLabor} onChange={(e) => setAgreeLabor(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {t("legalLabor", "Yaponiya Mehnat standarti qonuniga rioya qilishga roziman.")}
                  </span>
                </label>
                <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input type="checkbox" checked={agreeVisa} onChange={(e) => setAgreeVisa(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {t("legalVisa", "Chet el fuqarolari uchun tegishli viza maqomini taqdim etishga roziman.")}
                  </span>
                </label>
                <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input type="checkbox" checked={agreeAd} onChange={(e) => setAgreeAd(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {t("legalAd", "Ma'lumotlarimdan reklama maqsadida foydalanishga rozilik bildiraman.")}
                  </span>
                </label>
              </div>`;

  const startIndex = code.indexOf('<label className="terms-checkbox" style={{ alignItems: \'flex-start\', gap: \'10px\' }}>');
  const endIndexStr = '</label>';
  const endIndex = code.indexOf(endIndexStr, startIndex) + endIndexStr.length;

  if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + newChecklist + code.substring(endIndex);
    fs.writeFileSync('src/components/RoleSelect.jsx', code, 'utf8');
    console.log('Fixed JSX');
  } else {
    console.log('Could not find JSX block');
  }
}

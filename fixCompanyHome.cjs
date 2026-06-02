const fs = require('fs');
let content = fs.readFileSync('src/components/CompanyHome.jsx', 'utf8');

const oldStyle = `style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(90, 85, 234, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '13px',`;

const newStyle = `style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(0, 0, 0, 0.1)',
                  background: isSelected ? 'rgba(90, 85, 234, 0.15)' : '#ffffff',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  boxShadow: isSelected ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                  fontSize: '13px',`;

content = content.replace(oldStyle, newStyle);
fs.writeFileSync('src/components/CompanyHome.jsx', content, 'utf8');
console.log('Fixed style in CompanyHome.jsx');

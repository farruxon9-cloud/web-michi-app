const fs = require('fs');

let css = fs.readFileSync('src/components/RoleSelect.css', 'utf8');
if (!css.includes('flex-shrink: 0; /* fix */')) {
  css = css.replace('.btn-primary {\n  background: #111113;', '.btn-primary {\n  flex-shrink: 0; /* fix */\n  min-height: 52px; /* fix */\n  display: flex; align-items: center; justify-content: center;\n  background: #111113;');
  
  css = css.replace('.btn-primary {\r\n  background: #111113;', '.btn-primary {\r\n  flex-shrink: 0; /* fix */\r\n  min-height: 52px; /* fix */\r\n  display: flex; align-items: center; justify-content: center;\r\n  background: #111113;');
  
  fs.writeFileSync('src/components/RoleSelect.css', css, 'utf8');
  console.log('Fixed CSS flex-shrink');
}

let jsx = fs.readFileSync('src/components/RoleSelect.jsx', 'utf8');

// Fix the button positioning and auth-card relative
let oldHeader = `<div className="auth-card glass squircle">
          <button className="icon-btn" onClick={() => setAuthStep('login')}>
            <ArrowLeft size={20} />
          </button>
          <div className="auth-header">`;

let newHeader = `<div className="auth-card glass squircle" style={{ position: 'relative' }}>
          <button className="icon-btn glass" onClick={() => setAuthStep('login')} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
            <ArrowLeft size={20} />
          </button>
          <div className="auth-header" style={{ marginTop: '30px' }}>`;

if (jsx.includes(oldHeader)) {
  jsx = jsx.replace(oldHeader, newHeader);
  console.log('Fixed Header');
} else {
    // Try without exact match
    oldHeader = `<div className="auth-card glass squircle">
          <button className="icon-btn" onClick={() => setAuthStep('login')}>
            <ArrowLeft size={20} />
          </button>
          <div className="auth-header">`;
    console.log("Could not find exact header match, maybe spacing differs.");
}

// Add marginBottom to the final submit button to ensure it can scroll past the bottom edge
let oldButton = `<button 
              type="submit" 
              className={\`btn-primary squircle \${!allLegalAccepted ? 'btn-disabled' : ''}\`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px' }}
            >`;
let newButton = `<button 
              type="submit" 
              className={\`btn-primary squircle \${!allLegalAccepted ? 'btn-disabled' : ''}\`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px', marginBottom: '20px' }}
            >`;
if (jsx.includes(oldButton)) {
  jsx = jsx.replace(oldButton, newButton);
  console.log('Fixed Button marginBottom');
}

fs.writeFileSync('src/components/RoleSelect.jsx', jsx, 'utf8');

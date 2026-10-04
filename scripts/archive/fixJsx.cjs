const fs = require('fs');

let jsx = fs.readFileSync('src/components/RoleSelect.jsx', 'utf8');

jsx = jsx.replace(
`<div className="auth-card glass squircle">
          <button className="icon-btn" onClick={() => setAuthStep('login')}>
            <ArrowLeft size={20} />
          </button>
          <div className="auth-header">`,
`<div className="auth-card glass squircle" style={{ position: 'relative' }}>
          <button className="icon-btn glass" onClick={() => setAuthStep('login')} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
            <ArrowLeft size={20} />
          </button>
          <div className="auth-header" style={{ marginTop: '30px' }}>`);

jsx = jsx.replace(
`<div className="auth-card glass squircle">\r\n          <button className="icon-btn" onClick={() => setAuthStep('login')}>\r\n            <ArrowLeft size={20} />\r\n          </button>\r\n          <div className="auth-header">`,
`<div className="auth-card glass squircle" style={{ position: 'relative' }}>\r\n          <button className="icon-btn glass" onClick={() => setAuthStep('login')} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>\r\n            <ArrowLeft size={20} />\r\n          </button>\r\n          <div className="auth-header" style={{ marginTop: '30px' }}>`);

jsx = jsx.replace(
`className={\`btn-primary squircle \${!allLegalAccepted ? 'btn-disabled' : ''}\`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px' }}`,
`className={\`btn-primary squircle \${!allLegalAccepted ? 'btn-disabled' : ''}\`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px', marginBottom: '20px' }}`);

jsx = jsx.replace(
`className={\`btn-primary squircle \${!allLegalAccepted ? 'btn-disabled' : ''}\`}\r\n              disabled={!allLegalAccepted}\r\n              style={{ marginTop: '10px' }}`,
`className={\`btn-primary squircle \${!allLegalAccepted ? 'btn-disabled' : ''}\`}\r\n              disabled={!allLegalAccepted}\r\n              style={{ marginTop: '10px', marginBottom: '20px' }}`);

fs.writeFileSync('src/components/RoleSelect.jsx', jsx, 'utf8');
console.log('Fixed RoleSelect.jsx');

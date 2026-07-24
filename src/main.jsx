import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n'; // Import i18n setup
import './index.css'

// Global visual error logger for client-side debugging
if (typeof window !== 'undefined') {
  const showVisualError = (msg) => {
    let container = document.getElementById('debug-error-console');
    if (!container) {
      container = document.createElement('div');
      container.id = 'debug-error-console';
      container.style.position = 'fixed';
      container.style.top = '10px';
      container.style.left = '10px';
      container.style.right = '10px';
      container.style.zIndex = '999999';
      container.style.background = 'rgba(255, 59, 48, 0.95)';
      container.style.color = '#fff';
      container.style.padding = '12px';
      container.style.borderRadius = '8px';
      container.style.fontSize = '11px';
      container.style.fontFamily = 'monospace';
      container.style.maxHeight = '200px';
      container.style.overflowY = 'auto';
      container.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
      container.style.pointerEvents = 'auto';
      
      const closeBtn = document.createElement('button');
      closeBtn.innerText = '✕';
      closeBtn.style.float = 'right';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.color = '#fff';
      closeBtn.style.fontWeight = 'bold';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.marginLeft = '8px';
      closeBtn.onclick = () => container.remove();
      container.appendChild(closeBtn);

      const title = document.createElement('strong');
      title.innerText = '⚠️ Global Debug Console:';
      title.style.display = 'block';
      title.style.marginBottom = '6px';
      container.appendChild(title);

      document.body.appendChild(container);
    }
    const p = document.createElement('p');
    p.style.margin = '4px 0';
    p.innerText = msg;
    container.appendChild(p);
  };

  window.addEventListener('error', (event) => {
    showVisualError(`Runtime error: ${event.message} at ${event.filename}:${event.lineno}`);
  });
  window.addEventListener('unhandledrejection', (event) => {
    showVisualError(`Promise rejection: ${event.reason}`);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

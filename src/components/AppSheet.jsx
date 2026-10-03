import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Bottom sheet rendered inside the app column (#root), so it looks identical
 * on phones and on desktop browsers (where the app is a centered 480px column).
 */
export function getModalRoot() {
  if (typeof document === 'undefined') return null;
  return document.getElementById('root') || document.body;
}

export default function AppSheet({ open, onClose, title, children, id, labelledBy }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const root = getModalRoot();
  const titleId = labelledBy || (id ? `${id}-title` : undefined);

  const node = (
    <div
      className="app-modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="app-modal-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} id={id}>
        {title && (
          <h3 id={titleId} style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );

  return root ? createPortal(node, root) : node;
}

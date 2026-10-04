import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getModalRoot } from './AppSheet';

const floatingStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  margin: '0 auto',
  bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
  zIndex: 8500,
  width: 'calc(100% - 32px)',
  maxWidth: '440px',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px 10px 16px',
  borderRadius: '16px',
  background: 'rgba(28, 28, 30, 0.92)',
  color: '#FFFFFF',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  animation: 'sheet-up 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
};

function portal(node) {
  const root = getModalRoot();
  return root ? createPortal(node, root) : node;
}

/**
 * "Hidden · Undo" snackbar. Auto-closes after `duration` ms.
 * Change `toastKey` to restart the timer for a new action.
 */
export function UndoToast({ open, toastKey, message, actionLabel, onAction, onClose, duration = 5000 }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => onCloseRef.current?.(), duration);
    return () => clearTimeout(timer);
  }, [open, toastKey, duration]);

  if (!open) return null;
  return portal(
    <div role="status" aria-live="polite" style={floatingStyle} id="undo-toast">
      <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>{message}</span>
      {actionLabel && (
        <button
          type="button"
          id="undo-toast-action"
          onClick={onAction}
          style={{ border: 'none', background: 'transparent', color: '#0A84FF', fontWeight: 800, fontSize: '14px', padding: '6px 8px', cursor: 'pointer' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/** Sticky bar shown while multi-select mode is active. */
export function SelectionBar({ open, count, actionLabel, cancelLabel, onAction, onCancel }) {
  if (!open) return null;
  return portal(
    <div role="toolbar" aria-label={actionLabel} style={{ ...floatingStyle, padding: '8px', gap: '8px' }} id="selection-bar">
      <button
        type="button"
        id="selection-bar-cancel"
        onClick={onCancel}
        style={{ flex: 1, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFFFF', borderRadius: '12px', padding: '10px', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        id="selection-bar-action"
        disabled={count === 0}
        onClick={onAction}
        style={{ flex: 1.4, border: 'none', background: count === 0 ? 'rgba(255,59,48,0.4)' : '#FF3B30', color: '#FFFFFF', borderRadius: '12px', padding: '10px', fontWeight: 800, fontSize: '13.5px', cursor: count === 0 ? 'default' : 'pointer' }}
      >
        {actionLabel} ({count})
      </button>
    </div>
  );
}

export default UndoToast;

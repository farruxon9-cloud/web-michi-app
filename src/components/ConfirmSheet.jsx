import AppSheet from './AppSheet';

const btnBase = {
  padding: '12px 14px',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, opacity 0.15s ease',
};

/**
 * In-app confirmation bottom sheet (replaces window.confirm, which looks foreign on
 * mobile/PWA and is blocked in some in-app browsers).
 */
export default function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
  id = 'confirm-sheet',
}) {
  return (
    <AppSheet open={open} onClose={onCancel} title={title} id={id}>
      {message && (
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          {message}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          type="button"
          id={`${id}-cancel`}
          onClick={onCancel}
          style={{ ...btnBase, border: '1px solid var(--glass-border)', background: 'var(--glass-bg, transparent)', color: 'var(--text-main)' }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          id={`${id}-confirm`}
          autoFocus
          onClick={onConfirm}
          style={{ ...btnBase, border: 'none', background: danger ? '#FF3B30' : '#0A84FF', color: '#FFFFFF' }}
        >
          {confirmLabel}
        </button>
      </div>
    </AppSheet>
  );
}

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { api, ApiError } from '../api';

// ---------- toasts ----------
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
/** push(msg, kind = 'ok', { ms, action: { label, onClick } }) — an action toast stays `ms` (default 4.2 s). */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const drop = useCallback((id) => setItems((x) => x.filter((i) => i.id !== id)), []);
  const push = useCallback((msg, kind = 'ok', opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, msg, kind, action: opts.action || null }]);
    setTimeout(() => drop(id), opts.ms || 4200);
  }, [drop]);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className={`toast is-${i.kind}${i.action ? ' has-action' : ''}`}>
            <span>{i.msg}</span>
            {i.action && <button type="button" className="toast-action" onClick={() => { drop(i.id); i.action.onClick(); }}>{i.action.label}</button>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const errText = (e, t) => {
  if (e instanceof ApiError) {
    if (e.status === 403 && e.code === 'NO_PERMISSION') return t('noPerm');
    return e.message;
  }
  return String((e && e.message) || e);
};

// ---------- data loading ----------
/** GET with loading/error state; `reload()` refetches. Keeps previous data while reloading. */
export function useApi(path, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    if (!path) return undefined;
    setState((s) => ({ ...s, loading: true, error: null }));
    api('GET', path)
      .then((data) => { if (alive) setState({ data, error: null, loading: false }); })
      .catch((error) => { if (alive) setState((s) => ({ ...s, error, loading: false })); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);
  return { ...state, reload: () => setTick((x) => x + 1) };
}

export function Loading() {
  const { t } = useT();
  return <div className="center"><span className="spinner" aria-hidden="true" />{t('loading')}</div>;
}

export function ErrorBox({ error, onRetry }) {
  const { t } = useT();
  return (
    <div className="alert alert-bad row-between" role="alert">
      <span>{errText(error, t)}</span>
      {onRetry && <button type="button" className="btn btn-sm" onClick={onRetry}>{t('retry')}</button>}
    </div>
  );
}

export function Empty({ children }) {
  const { t } = useT();
  return <div className="empty">{children || t('empty')}</div>;
}

/** The endpoint is not deployed yet (backend rolls out separately) → 404. */
export const isMissing = (e) => e instanceof ApiError && e.status === 404;

export function Unavailable() {
  const { t } = useT();
  return (
    <div className="empty unavailable">
      <div className="unavailable-icon" aria-hidden="true">⏳</div>
      <strong>{t('notAvailable')}</strong>
      <div className="small">{t('notAvailableSub')}</div>
    </div>
  );
}

/** Load error for list pages: 404 → "not available yet", anything else → error box with retry. */
export function LoadError({ error, onRetry }) {
  if (!error) return null;
  return isMissing(error) ? <Unavailable /> : <ErrorBox error={error} onRetry={onRetry} />;
}

/** setInterval that always calls the latest `fn`; pauses while the tab is hidden. */
export function useInterval(fn, ms) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  useEffect(() => {
    if (!ms) return undefined;
    const id = setInterval(() => { if (!document.hidden) ref.current(); }, ms);
    return () => clearInterval(id);
  }, [ms]);
}

// ---------- layout bits ----------
export function PageHead({ title, sub, children }) {
  return (
    <header className="adm-head">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="row">{children}</div>}
    </header>
  );
}

export function Seg({ value, onChange, options, label }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'is-on' : ''} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, id }) {
  const [v, setV] = useState(value);
  const timer = useRef(null);
  useEffect(() => setV(value), [value]);
  return (
    <input
      id={id}
      className="input input-search"
      type="search"
      value={v}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(e) => {
        setV(e.target.value);
        clearTimeout(timer.current);
        const nv = e.target.value;
        timer.current = setTimeout(() => onChange(nv), 300);
      }}
    />
  );
}

export function Pager({ page, size, total, onPage }) {
  const { t } = useT();
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pager">
      <span>{t('total')}: {total}</span>
      <div className="row">
        <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>{t('prev')}</button>
        <span className="mono">{page} / {pages}</span>
        <button type="button" className="btn btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>{t('next')}</button>
      </div>
    </div>
  );
}

export const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(typeof v === 'number' ? v : String(v));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};
export const fmtYen = (n) => `¥${(Number(n) || 0).toLocaleString('ja-JP')}`;

export function Badge({ kind = '', children }) {
  return <span className={`badge${kind ? ` badge-${kind}` : ''}`}>{children}</span>;
}

const STATUS_KIND = { active: 'ok', verified: 'ok', paid: 'ok', closed: '', hidden: 'warn', pending: 'warn', open: 'bad', in_progress: 'accent', eligible: 'accent', rejected: 'bad', disabled: 'bad', cancelled: '', none: '', expired: 'warn', answered: 'accent', dismissed: '', actioned: 'ok', scheduled: 'warn' };
export function StatusBadge({ value, label }) {
  return <Badge kind={STATUS_KIND[value] ?? ''}>{label || value}</Badge>;
}

export function Switch({ checked, onChange, label, id }) {
  return <button id={id} type="button" role="switch" aria-checked={Boolean(checked)} aria-label={label} className="switch" onClick={() => onChange(!checked)} />;
}

// ---------- modal / drawer ----------
export function Modal({ title, sub, children, onClose, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { width: 'min(720px, 100%)' } : undefined}>
        <h3>{title}</h3>
        {sub && <p className="modal-sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

export function Drawer({ title, children, onClose, actions }) {
  const { t } = useT();
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay drawer-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h3>{title}</h3>
          <div className="row">{actions}<button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label={t('close')}>✕</button></div>
        </div>
        {children}
      </aside>
    </div>
  );
}

/**
 * Confirm a write action. Collects a reason (audit) and, for sensitive actions, a fresh 2FA code.
 * `run({ reason, totp, ...extra })` performs the request; errors stay inside the dialog.
 */
export function ConfirmAction({ title, sub, danger, needReason = true, needTotp = false, confirmLabel, onClose, run, children, extraValid = true }) {
  const { t } = useT();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [totp, setTotp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const valid = (!needReason || reason.trim().length >= 3) && (!needTotp || /^\d{6}$/.test(totp)) && extraValid;
  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await run({ reason: reason.trim(), totp });
      toast(t('done'));
      onClose(true);
    } catch (ex) {
      setErr(ex);
      setBusy(false);
    }
  };
  return (
    <Modal title={title} sub={sub} onClose={() => onClose(false)}>
      <form onSubmit={submit}>
        {children}
        {needReason && (
          <div className="field">
            <label htmlFor="confirm-reason">{t('reason')}</label>
            <textarea id="confirm-reason" className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} autoFocus />
          </div>
        )}
        {needTotp && (
          <div className="field">
            <label htmlFor="confirm-totp">{t('totpPrompt')}</label>
            <input id="confirm-totp" className="input code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={totp} onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))} />
          </div>
        )}
        {err && <ErrorBox error={err} />}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={() => onClose(false)}>{t('cancel')}</button>
          <button type="submit" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} disabled={!valid || busy}>
            {busy && <span className="spinner" style={{ width: 14, height: 14 }} aria-hidden="true" />}{confirmLabel || t('confirm')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

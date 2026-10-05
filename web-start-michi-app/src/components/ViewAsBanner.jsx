import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isViewAs, viewAsExpiresAt, endViewAs } from '../services/viewAsSession';
import './ViewAsBanner.css';

const fmt = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Red read-only bar shown only in an admin "view as user" tab. Ends the view when the token expires. */
export default function ViewAsBanner({ name }) {
  const { t } = useTranslation();
  const [left, setLeft] = useState(() => viewAsExpiresAt() - Date.now());
  const active = isViewAs() || left > 0;

  useEffect(() => {
    if (!viewAsExpiresAt()) return undefined;
    const id = setInterval(() => {
      const ms = viewAsExpiresAt() - Date.now();
      setLeft(ms);
      if (ms <= 0) { clearInterval(id); endViewAs(); window.location.replace(window.location.pathname); }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    document.documentElement.classList.add('is-view-as');
    return () => document.documentElement.classList.remove('is-view-as');
  }, [active]);

  if (!active) return null;
  const exit = () => { endViewAs(); window.close(); window.location.replace(window.location.pathname); };
  return (
    <div className="view-as-banner" role="status" aria-live="polite">
      <span className="view-as-dot" aria-hidden="true" />
      <span className="view-as-text">
        <strong>{t('viewAsTitle')}</strong>
        {name ? ` · ${name}` : ''} · {t('viewAsReadOnly')} · <span className="view-as-time">{fmt(left)}</span>
      </span>
      <button type="button" id="view-as-exit" className="view-as-exit" onClick={exit}>{t('viewAsExit')}</button>
    </div>
  );
}

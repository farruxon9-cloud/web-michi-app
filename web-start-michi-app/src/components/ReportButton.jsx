import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import AppSheet from './AppSheet';
import { apiFetch } from '../services/apiClient';
import { getStoredToken } from '../services/authService';
import { API_BASE_URL } from '../config/api';
import './ReportButton.css';

export const REPORT_REASONS = ['spam', 'fraud', 'wrong_info', 'offensive', 'illegal', 'other'];

/**
 * "Report" (通報) link + sheet. Sends POST /api/reports → admin panel queue (admin.michi.jp.net → 通報).
 * One open report per user per target on the server, so repeated taps never flood the queue.
 * @param {{ targetType: 'job'|'school'|'user'|'company', targetId: string }} props
 */
export default function ReportButton({ targetType, targetId }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState('');
  const loggedIn = Boolean(getStoredToken());

  const close = () => { setOpen(false); if (state === 'sent') { setReason(''); setNote(''); } };
  const submit = async (e) => {
    e.preventDefault();
    if (!reason || state === 'sending') return;
    setState('sending');
    setErr('');
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/reports`, { method: 'POST', body: JSON.stringify({ targetType, targetId: String(targetId), reason, note: note.trim() }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('reportFailed'));
      }
      setState('sent');
    } catch (ex) {
      setErr((ex && ex.message) || t('reportFailed'));
      setState('error');
    }
  };

  if (!targetId) return null;
  return (
    <>
      <button type="button" id={`report-${targetType}-${targetId}`} className="report-link" onClick={() => { setState(state === 'sent' ? 'sent' : 'idle'); setOpen(true); }}>
        <Flag size={14} aria-hidden="true" /> {t('reportListing')}
      </button>
      <AppSheet open={open} onClose={close} title={t('reportTitle')} id="report-sheet">
        {!loggedIn ? (
          <p className="report-msg">{t('reportLoginRequired')}</p>
        ) : state === 'sent' ? (
          <p className="report-msg report-msg-ok" role="status">✓ {t('reportSent')}</p>
        ) : (
          <form onSubmit={submit} className="report-form">
            <div className="report-reasons" role="radiogroup" aria-label={t('reportTitle')}>
              {REPORT_REASONS.map((r) => (
                <button key={r} type="button" role="radio" aria-checked={reason === r} className={`report-reason${reason === r ? ' is-on' : ''}`} onClick={() => setReason(r)}>
                  {t(`reportReason_${r}`)}
                </button>
              ))}
            </div>
            <textarea className="report-note" value={note} maxLength={1000} rows={3} placeholder={t('reportNotePlaceholder')} aria-label={t('reportNotePlaceholder')} onChange={(e) => setNote(e.target.value)} />
            {state === 'error' && <p className="report-msg report-msg-bad" role="alert">{err}</p>}
            <button type="submit" className="report-submit" disabled={!reason || state === 'sending'}>{t('reportSubmit')}</button>
          </form>
        )}
      </AppSheet>
    </>
  );
}

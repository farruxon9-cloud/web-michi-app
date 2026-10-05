// src/components/profile/SupportPage.jsx
// Help / Support (profile → ヘルプ・サポート): my tickets, new ticket, conversation with reply + close.
//   GET  /api/support/tickets            → my ticket summaries
//   POST /api/support/tickets            { subject, category, body } → 201 ticket (limit 5/day)
//   GET  /api/support/tickets/:id        → ticket with messages[{ from:'user'|'admin', body, at }]
//   POST /api/support/tickets/:id/messages { body }   ·   POST /api/support/tickets/:id/close
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, LifeBuoy, Plus, Send, MessageCircle } from 'lucide-react';
import { listMyTickets, getTicket, createTicket, replyTicket, closeTicket, isNotDeployed } from '../../services/accountApi';
import { TICKET_CATEGORIES, TICKET_SUBJECT_MAX, TICKET_BODY_MAX, validateTicketDraft, formatDate } from '../../utils/trustHelpers';
import '../trust.css';

const STATUS_CHIP = { open: 'info', answered: 'ok', closed: 'muted' };
const fmtTime = (v) => {
  const ts = Date.parse(v);
  return Number.isFinite(ts) ? new Date(ts).toLocaleString() : '';
};

export default function SupportPage({ t, handleBackToMain }) {
  const [view, setView] = useState('list'); // 'list' | 'new' | 'thread'
  const [tickets, setTickets] = useState(null); // null = loading
  const [unavailable, setUnavailable] = useState(false);
  const [listError, setListError] = useState('');
  const [current, setCurrent] = useState(null);
  const [draft, setDraft] = useState({ subject: '', category: 'other', body: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadList = useCallback(async () => {
    setListError('');
    try {
      setTickets(await listMyTickets());
    } catch (err) {
      setTickets([]);
      if (isNotDeployed(err)) setUnavailable(true);
      else setListError(t('supportLoadFailed', '読み込めませんでした。'));
    }
  }, [t]);
  useEffect(() => { loadList(); }, [loadList]);

  const openTicket = async (id) => {
    setError('');
    setReply('');
    setView('thread');
    setCurrent(null);
    try { setCurrent(await getTicket(id)); } catch { setError(t('supportLoadFailed', '読み込めませんでした。')); }
  };

  const goBack = () => {
    if (view === 'list') { handleBackToMain(); return; }
    setView('list');
    setError('');
    loadList();
  };

  const submitNew = async () => {
    const errs = validateTicketDraft(draft);
    setFieldErrors(errs);
    if (Object.keys(errs).length || busy) return;
    setBusy(true);
    setError('');
    try {
      const ticket = await createTicket({ subject: draft.subject.trim(), category: draft.category, body: draft.body.trim() });
      setDraft({ subject: '', category: 'other', body: '' });
      if (ticket && ticket.id) { setCurrent(ticket); setView('thread'); } else { setView('list'); loadList(); }
    } catch (err) {
      setError(err && err.status === 429 ? t('supportDailyLimit', '本日の問い合わせ上限に達しました。明日もう一度お試しください。') : t('supportSendFailed', '送信できませんでした。'));
    }
    setBusy(false);
  };

  const sendReply = async () => {
    const body = reply.trim();
    if (!body || !current || busy) return;
    setBusy(true);
    setError('');
    try {
      const updated = await replyTicket(current.id, body);
      setCurrent(updated && updated.messages ? updated : { ...current, status: 'open', messages: [...(current.messages || []), { from: 'user', body, at: new Date().toISOString() }] });
      setReply('');
    } catch { setError(t('supportSendFailed', '送信できませんでした。')); }
    setBusy(false);
  };

  const doClose = async () => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const updated = await closeTicket(current.id);
      setCurrent(updated && updated.id ? updated : { ...current, status: 'closed' });
    } catch { setError(t('supportSendFailed', '送信できませんでした。')); }
    setBusy(false);
  };

  const title = view === 'new' ? t('supportNewTicket', '新しい問い合わせ') : view === 'thread' ? (current?.subject || t('supportTitle', 'ヘルプ・サポート')) : t('supportTitle', 'ヘルプ・サポート');

  return (
    <div className="profile-container sub-page-view fade-in" id="support-page">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={goBack} aria-label={t('back', '戻る')}><ArrowLeft size={20} /></button>
      </div>
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '8px' }}>
        <h2 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h2>
      </div>

      {view === 'list' && (
        <>
          {unavailable ? (
            <div className="trust-empty"><LifeBuoy size={28} color="#0A84FF" />{t('supportUnavailable', 'サポート機能は準備中です。')}</div>
          ) : (
            <>
              <div style={{ padding: '0 16px 12px' }}>
                <button type="button" className="trust-btn-primary" id="support-new-btn" onClick={() => { setFieldErrors({}); setError(''); setView('new'); }}>
                  <Plus size={18} /> {t('supportNewTicket', '新しい問い合わせ')}
                </button>
              </div>
              {listError && <p className="trust-notice bad" style={{ margin: '0 16px 12px' }} role="alert">{listError}</p>}
              {tickets === null ? null : tickets.length === 0 ? (
                <div className="trust-empty"><MessageCircle size={28} color="#0A84FF" />{t('supportEmpty', 'まだ問い合わせはありません。困ったことがあればお気軽にどうぞ。')}</div>
              ) : (
                <div className="support-list">
                  {tickets.map((tk) => (
                    <button type="button" key={tk.id} className="support-ticket-row" onClick={() => openTicket(tk.id)} data-testid="support-ticket-row">
                      <strong>{tk.subject}</strong>
                      <span className="support-ticket-meta">
                        <span className={`trust-chip ${STATUS_CHIP[tk.status] || 'muted'}`}>{t(`ticketStatus_${tk.status || 'open'}`)}</span>
                        <span>{t(`ticketCat_${tk.category || 'other'}`)}</span>
                        <span>· {formatDate(tk.updatedAt || tk.createdAt)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {view === 'new' && (
        <div className="profile-menu" style={{ paddingTop: 4 }}>
          <div className="trust-card">
            <label className="trust-field">
              <span>{t('supportSubject', '件名')}</span>
              <input className="trust-input" id="support-subject" maxLength={TICKET_SUBJECT_MAX} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
              {fieldErrors.subject && <span className="trust-field-error">{t('supportFieldRequired', '入力してください')}</span>}
            </label>
            <label className="trust-field">
              <span>{t('supportCategory', 'カテゴリ')}</span>
              <select className="trust-select" id="support-category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {TICKET_CATEGORIES.map((c) => <option key={c} value={c}>{t(`ticketCat_${c}`)}</option>)}
              </select>
            </label>
            <label className="trust-field">
              <span>{t('supportMessage', 'お問い合わせ内容')}</span>
              <textarea className="trust-textarea" id="support-message" maxLength={TICKET_BODY_MAX} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              {fieldErrors.body && <span className="trust-field-error">{t('supportFieldRequired', '入力してください')}</span>}
            </label>
            {error && <p className="trust-notice bad" role="alert">{error}</p>}
            <button type="button" className="trust-btn-primary" id="support-submit" onClick={submitNew} disabled={busy}>
              <Send size={16} /> {busy ? t('sending', '送信中…') : t('supportSend', '送信')}
            </button>
          </div>
        </div>
      )}

      {view === 'thread' && (
        <>
          {current && (
            <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`trust-chip ${STATUS_CHIP[current.status] || 'muted'}`}>{t(`ticketStatus_${current.status || 'open'}`)}</span>
              <span className="trust-chip muted">{t(`ticketCat_${current.category || 'other'}`)}</span>
            </div>
          )}
          <div className="support-thread" aria-live="polite">
            {(current?.messages || []).map((m, i) => (
              <div key={`${m.at}-${i}`} className={`support-msg ${m.from === 'admin' ? 'admin' : 'user'}`}>
                {m.from === 'admin' && <span className="support-msg-from">{t('supportFromMichi', 'Michiサポート')}</span>}
                <span>{m.body}</span>
                <time>{fmtTime(m.at)}</time>
              </div>
            ))}
          </div>
          {error && <p className="trust-notice bad" style={{ margin: '12px 16px 0' }} role="alert">{error}</p>}
          {current && current.status !== 'closed' && (
            <div className="support-composer">
              <textarea className="trust-textarea" id="support-reply" style={{ minHeight: 80 }} maxLength={TICKET_BODY_MAX} placeholder={t('supportReplyPlaceholder', '返信を入力…')} value={reply} onChange={(e) => setReply(e.target.value)} />
              <div className="support-actions">
                <button type="button" className="trust-btn" id="support-close" onClick={doClose} disabled={busy}>{t('supportCloseTicket', '解決済みにする')}</button>
                <button type="button" className="trust-btn-primary" id="support-reply-send" onClick={sendReply} disabled={busy || !reply.trim()} style={{ padding: '8px 12px', fontSize: 13 }}>
                  <Send size={14} /> {t('supportSend', '送信')}
                </button>
              </div>
            </div>
          )}
          {current && current.status === 'closed' && <p className="trust-notice info" style={{ margin: '12px 16px 0' }}>{t('supportClosedNote', 'この問い合わせは終了しました。')}</p>}
        </>
      )}

      {/* 86px clearance spacer above the floating BottomNav */}
      <div style={{ height: '86px', minHeight: '86px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}

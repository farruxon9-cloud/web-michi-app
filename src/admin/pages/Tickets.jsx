import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, ErrorBox, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, Badge, StatusBadge, Drawer, useToast, errText } from '../components/ui';

const STATUSES = ['open', 'answered', 'closed'];

function TicketDrawer({ id, onClose, onChanged }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/tickets/${id}`);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState('');
  const end = useRef(null);
  const tk = data ? (data.ticket || data) : null;
  const user = data ? (data.user || (tk && tk.user)) : null;
  const msgs = (tk && tk.messages) || [];

  useEffect(() => { if (end.current && end.current.scrollIntoView) end.current.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  const reply = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || busy) return;
    setBusy('reply');
    try {
      await api('POST', `/tickets/${id}/reply`, { body: text });
      setBody('');
      toast(t('replySent'));
      reload(); onChanged();
    } catch (ex) { toast(errText(ex, t), 'bad'); }
    setBusy('');
  };
  const setStatus = async (status) => {
    setBusy(status);
    try {
      await api('POST', `/tickets/${id}/status`, { status });
      toast(t('done'));
      reload(); onChanged();
    } catch (ex) { toast(errText(ex, t), 'bad'); }
    setBusy('');
  };

  return (
    <Drawer title={tk ? tk.subject : t('loading')} onClose={onClose}>
      {loading && !data && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {tk && (
        <>
          <div className="row" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
            <StatusBadge value={tk.status} label={t(`tk_${tk.status}`)} />
            {tk.category && <Badge kind="accent">{t(`tc_${tk.category}`)}</Badge>}
            <span className="small muted">{fmtDate(tk.createdAt)}</span>
          </div>
          {user && (
            <dl className="kv" style={{ marginBottom: 6 }}>
              <dt>{t('name')}</dt><dd>{user.fullName || user.companyName || '—'}</dd>
              <dt>{t('email')}</dt><dd>{user.email || '—'}</dd>
              {user.role && <><dt>{t('role')}</dt><dd><Badge kind="accent">{t(user.role)}</Badge></dd></>}
              <dt>ID</dt><dd className="mono">{user.id || tk.userId}</dd>
            </dl>
          )}
          <div className="section-title">{t('conversation')}</div>
          <div className="chat" aria-live="polite">
            {msgs.length === 0 && <Empty />}
            {msgs.map((m, i) => (
              <div key={`${m.at}-${i}`} className={`chat-msg is-${m.from === 'admin' ? 'admin' : 'user'}`}>
                <div className="chat-bubble pre">{m.body}</div>
                <div className="chat-meta">{m.from === 'admin' ? t('support') : t('customer')} · {fmtDate(m.at)}</div>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form onSubmit={reply} className="mt">
            <div className="field">
              <label htmlFor="ticket-reply">{t('reply')}</label>
              <textarea id="ticket-reply" className="textarea" rows={4} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('replyPlaceholder')} />
              <span className="small muted" style={{ alignSelf: 'flex-end' }}>{body.length} / 4000</span>
            </div>
            <div className="row-between" style={{ flexWrap: 'wrap' }}>
              <div className="action-row">
                {STATUSES.filter((s) => s !== tk.status).map((s) => (
                  <button key={s} type="button" className={`btn btn-sm${s === 'closed' ? ' btn-ghost' : ''}`} disabled={Boolean(busy)} onClick={() => setStatus(s)}>→ {t(`tk_${s}`)}</button>
                ))}
              </div>
              <button id="ticket-send" type="submit" className="btn btn-primary" disabled={!body.trim() || Boolean(busy)}>
                {busy === 'reply' && <span className="spinner" style={{ width: 14, height: 14 }} aria-hidden="true" />}{t('sendReply')}
              </button>
            </div>
          </form>
        </>
      )}
    </Drawer>
  );
}

export default function Tickets() {
  const { t } = useT();
  const [status, setStatus] = useState('open');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, error, loading, reload } = useApi(`/tickets?page=${page}&size=25&status=${status}&q=${encodeURIComponent(q)}`);
  const items = (data && data.items) || [];

  return (
    <>
      <PageHead title={t('nav_tickets')} sub={t('ticketsSub')}>
        <button type="button" className="btn btn-sm" onClick={reload}>↻ {t('reload')}</button>
      </PageHead>
      <div className="adm-toolbar">
        <SearchBox id="tickets-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={`${t('search')}: ${t('subject')} / email / ID`} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[...STATUSES.map((s) => [s, t(`tk_${s}`)]), ['all', t('all')]]} />
      </div>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>{t('subject')}</th><th>{t('category')}</th><th>{t('status')}</th><th>{t('updated')}</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={4}><Empty /></td></tr>}
                {items.map((x) => (
                  <tr key={x.id} className="is-click" tabIndex={0} onClick={() => setOpen(x.id)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(x.id); }}>
                    <td>
                      <div className="cell-main">{x.subject}</div>
                      <div className="cell-sub">{(x.user && (x.user.email || x.user.fullName)) || x.userEmail || x.userId}{x.messagesCount ? ` · 💬 ${x.messagesCount}` : ''}</div>
                    </td>
                    <td>{x.category ? <Badge kind="accent">{t(`tc_${x.category}`)}</Badge> : '—'}</td>
                    <td><StatusBadge value={x.status} label={t(`tk_${x.status}`)} /></td>
                    <td className="small">{fmtDate(x.updatedAt || x.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page || page} size={data.size || 25} total={data.total ?? items.length} onPage={setPage} />
        </>
      )}
      {open && <TicketDrawer id={open} onClose={() => setOpen(null)} onChanged={reload} />}
    </>
  );
}

import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, PageHead, Badge, Seg, SearchBox, Pager, Drawer, ConfirmAction, useToast, errText, fmtDate, Empty } from '../components/ui';

/** Email monitoring (Phase 4): funnel, rates, daily bars, top errors, AI report, message log, suppression list. */
const STATUS_KIND = { delivered: 'ok', opened: 'ok', clicked: 'accent', bounced: 'bad', complained: 'bad', failed: 'bad', unsubscribed: 'warn', suppressed: 'warn', delivery_delayed: 'warn' };
const FILTERS = ['all', 'handed_off', 'sent', 'delivered', 'opened', 'clicked', 'delivery_delayed', 'bounced', 'complained', 'unsubscribed', 'failed', 'suppressed'];
const MANUAL = ['manual', 'do_not_contact', 'invalid'];

export default function Messages({ admin }) {
  const { t } = useT();
  const [days, setDays] = useState('7');
  const canSend = admin.perms.includes('outreach.send');
  return (
    <>
      <PageHead title={t('nav_messages')} sub={t('messagesSub')}>
        <Seg value={days} onChange={setDays} options={[['7', '7d'], ['30', '30d'], ['90', '90d']]} label="days" />
      </PageHead>
      <Insights days={days} />
      <MessageLog />
      <Suppressions canSend={canSend} />
    </>
  );
}

function Insights({ days }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/outreach/insights?days=${days}`);
  const st = useApi('/outreach/status');
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const runSummary = async () => {
    setBusy(true);
    try { const r = await api('POST', '/outreach/insights/summary', { days: Number(days) }); setSummary(r.summary); } catch (e) { toast(errText(e, t), 'bad'); }
    setBusy(false);
  };
  if (loading && !data) return <Loading />;
  if (error) return <LoadError error={error} onRetry={reload} />;
  if (!data) return null;
  const f = data.funnel;
  const max = Math.max(1, ...data.byDay.map((d) => d.total));
  const has = f.handedOff > 0;
  const rates = [['msgRateDelivery', data.rates.delivery, has && data.rates.delivery < 95], ['msgRateOpen', data.rates.open, false], ['msgRateClick', data.rates.click, false], ['msgRateBounce', data.rates.bounce, data.rates.bounce > 2], ['msgRateComplaint', data.rates.complaint, data.rates.complaint > 0.1]];
  const funnel = [['total', f.total], ['handed_off', f.handedOff], ['delivered', f.delivered], ['opened', f.opened], ['clicked', f.clicked]];
  return (
    <>
      <div className="grid grid-kpi">
        <div className="card kpi"><div className="kpi-label">{t('n8nHealth')}</div><div className="kpi-value">{st.data ? (st.data.n8n && st.data.n8n.ok ? '🟢' : '🔴') : '—'}</div><div className="kpi-sub">{st.data ? `${t('outboundToday')}: ${st.data.today.sent} / ${st.data.today.cap}` : ''}</div></div>
        {rates.map(([k, v, bad]) => (
          <div key={k} className="card kpi"><div className="kpi-label">{t(k)}</div><div className={`kpi-value${bad ? ' text-bad' : ''}`}>{v}%</div></div>
        ))}
      </div>
      <div className="grid grid-2 mt">
        <section className="card">
          <div className="funnel">
            {funnel.map(([k, v]) => {
              const pct = f.total ? Math.round((v / f.total) * 100) : 0;
              return (
                <div key={k} className="funnel-row">
                  <span className="funnel-label">{k === 'total' ? t('total') : t(`ms_${k}`)}</span>
                  <div className="funnel-track"><i style={{ width: `${Math.max(v ? 2 : 0, pct)}%`, background: 'var(--accent, #4f46e5)' }} /></div>
                  <span className="funnel-val mono">{v}<span className="muted"> · {pct}%</span></span>
                </div>
              );
            })}
          </div>
          <div className="chip-row">
            {['bounced', 'complained', 'unsubscribed', 'failed', 'suppressed'].map((k) => <Badge key={k} kind={f[k] ? STATUS_KIND[k] : ''}>{t(`ms_${k}`)}: {f[k]}</Badge>)}
          </div>
          {data.topErrors.length > 0 && (
            <>
              <h3 className="section-title">{t('msgTopErrors')}</h3>
              <ul className="small" style={{ paddingLeft: 18 }}>{data.topErrors.map((e) => <li key={e.error}><span className="mono">{e.error}</span> × {e.count}</li>)}</ul>
            </>
          )}
        </section>
        <section className="card">
          <h3 className="section-title" style={{ marginTop: 0 }}>{t('msgByDay')}</h3>
          {data.byDay.length === 0 ? <Empty>{t('empty')}</Empty> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
              {data.byDay.map((d) => (
                <div key={d.day} title={`${d.day}: ${d.total} / ${d.delivered} / ${d.opened} / ${d.failed}`} style={{ flex: 1, maxWidth: 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ height: `${(d.failed / max) * 100}%`, background: 'var(--bad, #e11d48)', borderRadius: '4px 4px 0 0' }} />
                  <div style={{ height: `${((d.total - d.failed) / max) * 100}%`, background: 'var(--accent, #4f46e5)', opacity: 0.85 }} />
                  <div className="small muted" style={{ textAlign: 'center', fontSize: 10 }}>{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
          <div className="row-between mt">
            <strong>🤖 {t('msgAiSummary')}</strong>
            <button type="button" className="btn btn-sm" disabled={busy || !f.total} onClick={runSummary}>{busy && <span className="spinner" style={{ width: 12, height: 12 }} />}{t('msgAiRun')}</button>
          </div>
          {summary && <div className="pre small mt" style={{ whiteSpace: 'pre-wrap' }}>{summary}</div>}
        </section>
      </div>
    </>
  );
}

function MessageLog() {
  const { t } = useT();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, error, loading, reload } = useApi(`/outreach/messages?status=${status}&q=${encodeURIComponent(q)}&page=${page}&size=25`);
  const detail = useApi(open ? `/outreach/messages/${open}` : null);
  return (
    <section className="card mt">
      <div className="row-between" style={{ flexWrap: 'wrap', gap: 8 }}>
        <h3 className="section-title" style={{ margin: 0 }}>{t('msgLog')}</h3>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <select className="select" style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label={t('status')}>
            {FILTERS.map((k) => <option key={k} value={k}>{k === 'all' ? t('all') : t(`ms_${k}`)}</option>)}
          </select>
          <SearchBox id="msg-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('search')} />
        </div>
      </div>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (data.items.length === 0 ? <Empty>{t('empty')}</Empty> : (
        <>
          <div className="tbl-wrap mt">
            <table className="tbl">
              <thead><tr><th>{t('msgTo')}</th><th>{t('msgSubject')}</th><th>{t('msgKind')}</th><th>{t('status')}</th><th>{t('created')}</th></tr></thead>
              <tbody>
                {data.items.map((m) => (
                  <tr key={m.id} className="has-action" style={{ cursor: 'pointer' }} onClick={() => setOpen(m.id)}>
                    <td className="mono small">{m.to}</td>
                    <td><div className="cell-main">{m.subject}</div>{m.error && <div className="cell-sub text-bad">{m.error}</div>}</td>
                    <td className="small">{m.kind}</td>
                    <td><Badge kind={STATUS_KIND[m.status] || ''}>{t(`ms_${m.status}`)}</Badge></td>
                    <td className="small">{fmtDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      ))}
      {open && (
        <Drawer title={t('msgEvents')} onClose={() => setOpen(null)}>
          {detail.loading && !detail.data ? <Loading /> : detail.data && (
            <div>
              <p><b>{detail.data.message.subject}</b></p>
              <p className="small mono">{detail.data.message.to} · {detail.data.message.id}</p>
              <p className="small muted">{detail.data.message.preview}</p>
              <ul className="feed">
                {detail.data.events.map((e, i) => <li key={i} className="feed-item"><Badge kind={STATUS_KIND[e.type] || ''}>{t(`ms_${e.type}`)}</Badge> <span className="small">{fmtDate(e.at)} · {e.source}</span>{e.detail && <div className="small muted">{e.detail}</div>}</li>)}
              </ul>
            </div>
          )}
        </Drawer>
      )}
    </section>
  );
}

function Suppressions({ canSend }) {
  const { t } = useT();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('do_not_contact');
  const [remove, setRemove] = useState(null);
  const { data, error, loading, reload } = useApi(`/outreach/suppressions?q=${encodeURIComponent(q)}&page=${page}&size=25`);
  const add = async () => {
    try { await api('POST', '/outreach/suppressions', { email: email.trim(), reason }); setEmail(''); toast(t('done')); reload(); } catch (e) { toast(errText(e, t), 'bad'); }
  };
  return (
    <section className="card mt">
      <div className="row-between" style={{ flexWrap: 'wrap', gap: 8 }}>
        <h3 className="section-title" style={{ margin: 0 }}>{t('supList')} {data ? `· ${data.total}` : ''}</h3>
        <SearchBox id="sup-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('search')} />
      </div>
      {canSend && (
        <div className="row mt" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 280 }} type="email" placeholder="email@example.jp" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="select" style={{ width: 'auto' }} value={reason} onChange={(e) => setReason(e.target.value)} aria-label={t('supReason')}>{MANUAL.map((k) => <option key={k} value={k}>{t(`sup_${k}`)}</option>)}</select>
          <button type="button" className="btn btn-sm" disabled={!/^\S+@\S+\.\S+$/.test(email.trim())} onClick={add}>＋ {t('supAdd')}</button>
        </div>
      )}
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (data.items.length === 0 ? <Empty>{t('empty')}</Empty> : (
        <>
          <div className="tbl-wrap mt">
            <table className="tbl">
              <thead><tr><th>{t('email')}</th><th>{t('supReason')}</th><th>{t('created')}</th><th /></tr></thead>
              <tbody>
                {data.items.map((s) => (
                  <tr key={s.id}>
                    <td className="mono small">{s.email}</td>
                    <td><Badge kind={MANUAL.includes(s.reason) ? '' : 'bad'}>{t(`sup_${s.reason}`)}</Badge></td>
                    <td className="small">{fmtDate(s.createdAt)}</td>
                    <td>{canSend && s.removable && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRemove(s)}>{t('supRemove')}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      ))}
      {remove && (
        <ConfirmAction title={`${t('supRemove')}: ${remove.email}`} onClose={(ok) => { setRemove(null); if (ok) reload(); }}
          run={({ reason: r }) => api('DELETE', `/outreach/suppressions/${remove.id}`, { reason: r })} />
      )}
    </section>
  );
}

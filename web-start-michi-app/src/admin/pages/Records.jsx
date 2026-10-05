import { useState } from 'react';
import { useT } from '../i18n';
import { api, download } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, Badge, StatusBadge, ConfirmAction, useToast, errText } from '../components/ui';
import { ListingDrawer } from './Listings';

export function Applications({ admin }) {
  const { t } = useT();
  const toast = useToast();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const { data, error, loading, reload } = useApi(`/applications?page=${page}&size=25&status=${status}&q=${encodeURIComponent(q)}`);
  const exportCsv = async () => {
    setBusy(true);
    try { await download('/applications/export.csv', `michi-applications-${new Date().toISOString().slice(0, 10)}.csv`); } catch (e) { toast(errText(e, t), 'bad'); }
    setBusy(false);
  };

  return (
    <>
      <PageHead title={t('nav_applications')}>
        {admin.perms.includes('applications.export') && <button id="apps-export" type="button" className="btn" disabled={busy} onClick={exportCsv}>⬇ {t('exportCsv')}</button>}
      </PageHead>
      <div className="adm-toolbar">
        <SearchBox id="apps-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('search')} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['all', t('all')], ...['submitted', 'reviewed', 'interview', 'accepted', 'hired', 'rejected', 'withdrawn'].map((s) => [s, s])]} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>{t('applicant')}</th><th>{t('target')}</th><th>{t('type')}</th><th>{t('status')}</th><th>{t('created')}</th></tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
                {data.items.map((a) => (
                  <tr key={a.id}>
                    <td><div className="cell-main">{a.applicantName || '—'}</div><div className="cell-sub">{a.applicantEmail}</div></td>
                    <td><div className="cell-main">{a.targetTitle}</div><div className="cell-sub mono">{a.targetId}</div></td>
                    <td><Badge kind="accent">{a.type}</Badge></td>
                    <td><Badge>{a.status}</Badge></td>
                    <td className="small">{fmtDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}

export function Reports({ admin }) {
  const { t } = useT();
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [target, setTarget] = useState(null);
  const { data, error, loading, reload } = useApi(`/reports?page=${page}&size=25&status=${status}`);
  const canListing = admin.perms.includes('listings.moderate');
  const change = (r, next) => setDialog({
    title: t(`rp_${next}`), needReason: next === 'closed',
    run: ({ reason }) => api('POST', `/reports/${r.id}`, { status: next, note: reason }),
  });

  return (
    <>
      <PageHead title={t('nav_reports')} />
      <div className="adm-toolbar">
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['open', t('rp_open')], ['in_progress', t('rp_in_progress')], ['closed', t('rp_closed')], ['all', t('all')]]} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          {data.items.length === 0 ? <Empty /> : (
            <div className="card-grid">
              {data.items.map((r) => (
                <article key={r.id} className="card">
                  <div className="row-between">
                    <Badge kind="bad">{t(`rr_${r.reason}`)}</Badge>
                    <StatusBadge value={r.status} label={t(`rp_${r.status}`)} />
                  </div>
                  <dl className="kv" style={{ marginTop: 10 }}>
                    <dt>{t('target')}</dt><dd><Badge kind="accent">{r.targetType}</Badge> <span className="mono small">{r.targetId}</span></dd>
                    <dt>{t('created')}</dt><dd>{fmtDate(r.createdAt)}</dd>
                    {r.note && <><dt>{t('note')}</dt><dd className="pre">{r.note}</dd></>}
                    {r.handledAt && <><dt>{t('when')}</dt><dd className="small muted">{fmtDate(r.handledAt)}</dd></>}
                  </dl>
                  <div className="action-row" style={{ marginTop: 12 }}>
                    {canListing && (r.targetType === 'job' || r.targetType === 'school') && (
                      <button type="button" className="btn btn-sm" onClick={() => setTarget({ type: r.targetType === 'job' ? 'jobs' : 'schools', id: r.targetId })}>{t('openTarget')}</button>
                    )}
                    {r.status === 'open' && <button type="button" className="btn btn-sm" onClick={() => change(r, 'in_progress')}>{t('rp_in_progress')}</button>}
                    {r.status !== 'closed' && <button type="button" className="btn btn-sm btn-ok" onClick={() => change(r, 'closed')}>{t('rp_closed')}</button>}
                    {r.status === 'closed' && <button type="button" className="btn btn-sm" onClick={() => change(r, 'open')}>{t('rp_open')}</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
      {target && <ListingDrawer type={target.type} id={target.id} admin={admin} onClose={() => setTarget(null)} onChanged={reload} />}
    </>
  );
}

export function Audit() {
  const { t } = useT();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useApi(`/audit?page=${page}&size=50&q=${encodeURIComponent(q)}`);
  return (
    <>
      <PageHead title={t('nav_audit')} />
      <div className="adm-toolbar">
        <SearchBox id="audit-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={`${t('search')}: ${t('action')} / ${t('actor')} / ID`} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>{t('when')}</th><th>{t('actor')}</th><th>{t('action')}</th><th>{t('target')}</th><th>{t('reason').split('（')[0].split(' (')[0]}</th></tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
                {data.items.map((e) => (
                  <tr key={e.id}>
                    <td className="small mono">{fmtDate(e.at)}</td>
                    <td><div className="cell-main">{e.actorEmail || '—'}</div><div className="cell-sub">{e.ip || ''}</div></td>
                    <td><Badge kind={/delete|disable|reject|revoke/.test(e.action) ? 'bad' : 'accent'}>{e.action}</Badge></td>
                    <td className="small"><span className="muted">{e.targetType || ''}</span> <span className="mono">{e.targetId || ''}</span></td>
                    <td className="small pre">{e.reason || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}

import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, StatusBadge, ConfirmAction } from '../components/ui';

/** Media links point at api.michi.jp.net; the admin domain proxies /api/media same-origin (CSP-friendly). */
export const sameOriginMedia = (url) => {
  const m = /\/api\/media\/([A-Za-z0-9_-]+)/.exec(String(url || ''));
  return m ? `/api/media/${m[1]}` : '';
};

export default function Companies({ admin }) {
  const { t } = useT();
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const { data, error, loading, reload } = useApi(`/companies?page=${page}&size=20&status=${status}&q=${encodeURIComponent(q)}`);
  const canVerify = admin.perms.includes('companies.verify');

  const open = (c, next) => setDialog({
    title: `${t(next === 'verified' ? 'approve' : next === 'rejected' ? 'reject' : 'revokeBadge')} · ${c.companyName || c.email}`,
    danger: next !== 'verified',
    run: ({ reason }) => api('POST', `/companies/${c.id}/verification`, { status: next, note: reason }),
  });

  return (
    <>
      <PageHead title={t('nav_companies')} />
      <div className="adm-toolbar">
        <SearchBox id="companies-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('search')} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['pending', t('vStatus_pending')], ['verified', t('vStatus_verified')], ['rejected', t('vStatus_rejected')], ['none', t('vStatus_none')], ['all', t('all')]]} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          {data.items.length === 0 ? <Empty /> : (
            <div className="card-grid">
              {data.items.map((c) => {
                const v = c.verification || { status: 'none' };
                const docs = (v.docs || []).map(sameOriginMedia).filter(Boolean);
                return (
                  <article key={c.id} className="card">
                    <div className="row-between">
                      <div>
                        <div className="cell-main">{c.companyName || '—'}</div>
                        <div className="cell-sub">{c.email}</div>
                      </div>
                      <StatusBadge value={v.status} label={t(`vStatus_${v.status}`)} />
                    </div>
                    <dl className="kv" style={{ marginTop: 10 }}>
                      <dt>{t('requested')}</dt><dd>{fmtDate(v.requestedAt)}</dd>
                      <dt>{t('listings')}</dt><dd>{c.counts ? c.counts.jobs + c.counts.schools : 0}</dd>
                      {v.note && <><dt>{t('note')}</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{v.note}</dd></>}
                      {v.reviewedAt && <><dt>{t('moderationNote')}</dt><dd className="small muted">{fmtDate(v.reviewedAt)}</dd></>}
                    </dl>
                    {docs.length > 0 && (
                      <>
                        <div className="section-title">{t('documents')}</div>
                        <div className="doc-row">
                          {docs.map((src) => (
                            <a key={src} href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={t('documents')} loading="lazy" /></a>
                          ))}
                        </div>
                      </>
                    )}
                    {canVerify && (
                      <div className="action-row" style={{ marginTop: 12 }}>
                        {v.status !== 'verified' && <button type="button" className="btn btn-sm btn-ok" onClick={() => open(c, 'verified')}>{t('approve')}</button>}
                        {v.status === 'pending' && <button type="button" className="btn btn-sm btn-danger" onClick={() => open(c, 'rejected')}>{t('reject')}</button>}
                        {v.status === 'verified' && <button type="button" className="btn btn-sm btn-danger" onClick={() => open(c, 'none')}>{t('revokeBadge')}</button>}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </>
  );
}

import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, Badge, StatusBadge, ConfirmAction, useToast, errText } from '../components/ui';

/** Media links point at api.michi.jp.net; the admin domain proxies /api/media same-origin (CSP-friendly). */
export const sameOriginMedia = (url) => {
  const m = /\/api\/media\/([A-Za-z0-9_-]+)/.exec(String(url || ''));
  return m ? `/api/media/${m[1]}` : '';
};

/** Eligibility keys from the backend (emailVerified, companyName, phone, address, listing). */
const MISSING_KEYS = ['emailVerified', 'companyName', 'phone', 'address', 'listing'];

const UNDO_MS = 10000;

export default function Companies({ admin }) {
  const { t } = useT();
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState('');
  const { data, error, loading, reload } = useApi(`/companies?page=${page}&size=20&status=${status}&q=${encodeURIComponent(q)}`);
  const canVerify = admin.perms.includes('companies.verify');

  // Reject / revoke keep the reason dialog (the note is shown to the company).
  const open = (c, next) => setDialog({
    title: `${t(next === 'rejected' ? 'reject' : 'revokeBadge')} · ${c.companyName || c.email}`,
    danger: true,
    run: ({ reason }) => api('POST', `/companies/${c.id}/verification`, { status: next, note: reason }),
  });

  const undo = async (c) => {
    try {
      await api('POST', `/companies/${c.id}/verification/undo`, {});
      toast(t('undone'));
    } catch (e) {
      toast(e && e.code === 'UNDO_EXPIRED' ? t('undoExpired') : errText(e, t), 'bad');
    }
    reload();
  };

  // One click, no dialog: approve then offer Undo for ~10 s (backend allows 60 s).
  const approve = async (c) => {
    if (busy) return;
    setBusy(c.id);
    try {
      await api('POST', `/companies/${c.id}/verification`, { status: 'verified' });
      toast(`${t('approvedToast')} · ${c.companyName || c.email}`, 'ok', { ms: UNDO_MS, action: { label: t('undo'), onClick: () => undo(c) } });
      reload();
    } catch (e) {
      toast(errText(e, t), 'bad');
    }
    setBusy('');
  };

  return (
    <>
      <PageHead title={t('nav_companies')} sub={t('companiesSub')} />
      <div className="adm-toolbar">
        <SearchBox id="companies-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('search')} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['pending', t('vStatus_pending')], ['verified', t('vStatus_verified')], ['expired', t('vStatus_expired')], ['rejected', t('vStatus_rejected')], ['none', t('vStatus_none')], ['all', t('all')]]} />
      </div>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <>
          {data.items.length === 0 ? <Empty /> : (
            <div className="card-grid">
              {data.items.map((c) => {
                const v = c.verification || { status: 'none' };
                const docs = (v.docs || []).map(sameOriginMedia).filter(Boolean);
                const el = c.eligibility || null;
                const missing = el ? (el.missing || []) : [];
                const jobs = c.jobsCount ?? (c.counts ? c.counts.jobs + c.counts.schools : 0);
                return (
                  <article key={c.id} className="card" id={`company-${c.id}`}>
                    <div className="row-between">
                      <div style={{ minWidth: 0 }}>
                        <div className="cell-main">{c.companyName || c.fullName || '—'}</div>
                        <div className="cell-sub">{c.email}</div>
                      </div>
                      <StatusBadge value={v.status} label={t(`vStatus_${v.status}`)} />
                    </div>
                    <div className="chip-row">
                      {v.reason === 'name_changed' && <Badge kind="warn">✎ {t('reason_name_changed')}</Badge>}
                      {el && (el.eligible
                        ? <Badge kind="ok">✓ {t('eligible')}</Badge>
                        : missing.map((m) => <Badge key={m} kind="bad">✕ {MISSING_KEYS.includes(m) ? t(`miss_${m}`) : m}</Badge>))}
                      {c.reportsOpen > 0 && <Badge kind="bad">🚩 {c.reportsOpen}</Badge>}
                    </div>
                    <dl className="kv" style={{ marginTop: 10 }}>
                      <dt>{t('requested')}</dt><dd>{fmtDate(v.requestedAt)}</dd>
                      <dt>{t('jobsCount')}</dt><dd>{jobs}</dd>
                      <dt>{t('reportsOpen')}</dt><dd>{c.reportsOpen ?? 0}</dd>
                      {v.verifiedAt && <><dt>{t('verifiedAt')}</dt><dd>{fmtDate(v.verifiedAt)}</dd></>}
                      {v.expiresAt && <><dt>{t('expiresAt')}</dt><dd className={v.status === 'expired' ? 'text-warn' : ''}>{fmtDate(v.expiresAt)}</dd></>}
                      {v.note && <><dt>{t('note')}</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{v.note}</dd></>}
                      {v.reviewedAt && <><dt>{t('reviewedAt')}</dt><dd className="small muted">{fmtDate(v.reviewedAt)}</dd></>}
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
                        {v.status !== 'verified' && (
                          <button id={`approve-${c.id}`} type="button" className="btn btn-sm btn-ok" disabled={busy === c.id} onClick={() => approve(c)} title={el && !el.eligible ? t('notEligibleHint') : undefined}>
                            {busy === c.id && <span className="spinner" style={{ width: 12, height: 12 }} aria-hidden="true" />}⭐ {t('approve')}
                          </button>
                        )}
                        {v.status === 'pending' && <button type="button" className="btn btn-sm btn-danger" onClick={() => open(c, 'rejected')}>{t('reject')}</button>}
                        {(v.status === 'verified' || v.status === 'expired') && <button type="button" className="btn btn-sm btn-danger" onClick={() => open(c, 'none')}>{t('revokeBadge')}</button>}
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

import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { api, fetchBlobUrl } from '../api';
import { useApi, Loading, LoadError, Empty, PageHead, Seg, Pager, fmtDate, Badge, StatusBadge, Modal, useToast, ErrorBox } from '../components/ui';

const LICENSE_TYPES = ['futsu', 'junchugata', 'chugata', 'ogata', 'ogata_tokushu', 'kenin', 'futsu2', 'chugata2', 'ogata2'];

/** Private licence image: fetched with auth → blob URL (revoked on unmount). */
function PrivateImage({ id, alt, onOpen }) {
  const { t } = useT();
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let url = '';
    let alive = true;
    setSrc(''); setFailed(false);
    fetchBlobUrl(`/media/${encodeURIComponent(id)}`)
      .then((u) => { url = u; if (alive) setSrc(u); else URL.revokeObjectURL(u); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [id]);
  if (failed) return <div className="lic-img is-empty">{t('imageUnavailable')}</div>;
  if (!src) return <div className="lic-img is-empty"><span className="spinner" aria-hidden="true" /></div>;
  return <button type="button" className="lic-img" onClick={() => onOpen(src)} aria-label={alt}><img src={src} alt={alt} /></button>;
}

function Decide({ item, status, onClose }) {
  const { t } = useT();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const reject = status === 'rejected';
  const valid = !reject || note.trim().length >= 3;
  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true); setErr(null);
    try {
      const n = note.trim();
      await api('POST', `/licenses/${item.uid}`, { status, ...(n ? { note: n, reason: n } : { reason: 'license approved' }) });
      toast(t('done'));
      onClose(true);
    } catch (ex) { setErr(ex); setBusy(false); }
  };
  return (
    <Modal title={`${t(reject ? 'reject' : 'approveLicense')} · ${item.name}`} sub={t(reject ? 'licRejectSub' : 'licApproveSub')} onClose={() => onClose(false)}>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="lic-note">{t(reject ? 'noteRequired' : 'noteOptional')}</label>
          <textarea id="lic-note" className="textarea" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} autoFocus />
        </div>
        {err && <ErrorBox error={err} />}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={() => onClose(false)}>{t('cancel')}</button>
          <button type="submit" className={`btn ${reject ? 'btn-danger' : 'btn-primary'}`} disabled={!valid || busy}>{t(reject ? 'reject' : 'approveLicense')}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Licenses() {
  const { t } = useT();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [decide, setDecide] = useState(null);
  const [zoom, setZoom] = useState('');
  const { data, error, loading, reload } = useApi(`/licenses?page=${page}&size=20&status=${status}`);
  const raw = (data && data.items) || [];
  // Accept both { userId, fullName, license:{...} } and flat rows.
  const items = raw.map((x) => {
    const l = x.license || x;
    return { uid: x.userId || x.id, name: x.fullName || x.name || x.email || x.userId || x.id, email: x.email || '', l };
  });

  return (
    <>
      <PageHead title={t('nav_licenses')} sub={t('licensesSub')} />
      <div className="adm-toolbar">
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['pending', t('vStatus_pending')], ['verified', t('lic_verified')], ['rejected', t('vStatus_rejected')], ['expired', t('vStatus_expired')], ['all', t('all')]]} />
      </div>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <>
          {items.length === 0 ? <Empty /> : (
            <div className="card-grid">
              {items.map((x) => (
                <article key={x.uid} className="card">
                  <div className="row-between">
                    <div style={{ minWidth: 0 }}>
                      <div className="cell-main">{x.name}</div>
                      {x.email && <div className="cell-sub">{x.email}</div>}
                    </div>
                    <StatusBadge value={x.l.status} label={x.l.status === 'verified' ? t('lic_verified') : t(`vStatus_${x.l.status}`)} />
                  </div>
                  <div className="lic-body">
                    {x.l.imageId ? <PrivateImage id={x.l.imageId} alt={t('licenseImage')} onOpen={setZoom} /> : <div className="lic-img is-empty small">{t('imageDeleted')}</div>}
                    <dl className="kv kv-tight">
                      <dt>{t('type')}</dt><dd><Badge kind="accent">{LICENSE_TYPES.includes(x.l.type) ? t(`lt_${x.l.type}`) : (x.l.type || '—')}</Badge></dd>
                      <dt>{t('expiresAt')}</dt><dd>{x.l.expiresAt || '—'}</dd>
                      <dt>{t('submitted')}</dt><dd className="small">{fmtDate(x.l.submittedAt)}</dd>
                      {x.l.note && <><dt>{t('note')}</dt><dd className="pre small">{x.l.note}</dd></>}
                    </dl>
                  </div>
                  {x.l.status === 'pending' && (
                    <div className="action-row" style={{ marginTop: 12 }}>
                      <button type="button" className="btn btn-sm btn-ok" onClick={() => setDecide({ item: x, status: 'verified' })}>✓ {t('approveLicense')}</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => setDecide({ item: x, status: 'rejected' })}>{t('reject')}</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          <Pager page={data.page || page} size={data.size || 20} total={data.total ?? items.length} onPage={setPage} />
          <p className="small muted">🔒 {t('licPrivacy')}</p>
        </>
      )}
      {decide && <Decide {...decide} onClose={(ch) => { setDecide(null); if (ch) reload(); }} />}
      {zoom && (
        <Modal title={t('licenseImage')} wide onClose={() => setZoom('')}>
          <img src={zoom} alt={t('licenseImage')} style={{ width: '100%', borderRadius: 12 }} />
          <div className="modal-actions"><button type="button" className="btn" onClick={() => setZoom('')}>{t('close')}</button></div>
        </Modal>
      )}
    </>
  );
}

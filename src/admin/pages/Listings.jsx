import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, Badge, StatusBadge, Drawer, ConfirmAction } from '../components/ui';
import { sameOriginMedia } from './Companies';

const EDITABLE = { jobs: ['title', 'company', 'description', 'salary'], schools: ['name', 'description', 'price'] };
const LABEL = { title: 'title', name: 'title', company: 'company', description: 'description', salary: 'salary', price: 'salary' };

function EditDialog({ type, listing, onClose }) {
  const { t } = useT();
  const fields = EDITABLE[type];
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map((k) => [k, listing[k] == null ? '' : String(listing[k])])));
  const changed = fields.filter((k) => vals[k] !== (listing[k] == null ? '' : String(listing[k])));
  return (
    <ConfirmAction
      title={t('editText')}
      extraValid={changed.length > 0}
      onClose={onClose}
      run={({ reason }) => api('PATCH', `/listings/${type}/${listing.id}`, { ...Object.fromEntries(changed.map((k) => [k, vals[k]])), reason })}
    >
      {fields.map((k) => (
        <div className="field" key={k}>
          <label htmlFor={`edit-${k}`}>{t(LABEL[k])}</label>
          {k === 'description'
            ? <textarea id={`edit-${k}`} className="textarea" rows={6} maxLength={5000} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
            : <input id={`edit-${k}`} className="input" maxLength={200} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />}
        </div>
      ))}
    </ConfirmAction>
  );
}

export function ListingDrawer({ type, id, admin, onClose, onChanged }) {
  const { t } = useT();
  const { data, error, loading, reload } = useApi(`/listings/${type}/${id}`);
  const [dialog, setDialog] = useState(null);
  const s = data && data.summary;
  const x = data && data.listing;
  const done = (ch) => { setDialog(null); if (ch) { reload(); onChanged(); } };
  const setStatus = (status) => setDialog({
    title: t(status === 'active' ? 'restore' : status === 'hidden' ? 'hide' : 'reject'),
    danger: status !== 'active',
    run: ({ reason }) => api('POST', `/listings/${type}/${id}/status`, { status, reason }),
  });
  const img = s && sameOriginMedia(s.image);

  return (
    <Drawer title={s ? s.title : t('loading')} onClose={onClose}>
      {loading && !data && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {s && (
        <>
          <div className="row" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
            <Badge kind="accent">{t(type)}</Badge>
            <StatusBadge value={s.status} label={t(`st_${s.status}`)} />
            {s.authorVerified && <Badge kind="ok">⭐</Badge>}
            {s.reports > 0 && <Badge kind="bad">🚩 {s.reports}</Badge>}
            {s.flags.map((f) => <Badge key={f} kind="warn">{t(`flag_${f}`)}</Badge>)}
          </div>
          {s.moderation && s.moderation.reason && (
            <div className="alert alert-warn"><strong>{t('moderationNote')}:</strong> {s.moderation.reason} <span className="small muted">· {fmtDate(s.moderation.at)}</span></div>
          )}
          <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
            {img && <img className="thumb" style={{ width: 88, height: 88 }} src={img} alt="" />}
            <dl className="kv" style={{ flex: 1 }}>
              <dt>ID</dt><dd className="mono">{s.id}</dd>
              <dt>{t('company')}</dt><dd>{s.company || '—'}</dd>
              <dt>{t('salary')}</dt><dd>{String(s.salary || '—')}</dd>
              <dt>都道府県</dt><dd>{s.prefecture || '—'}</dd>
              <dt>{t('author')}</dt><dd>{s.authorEmail || '—'}</dd>
              <dt>{t('created')}</dt><dd>{fmtDate(s.createdAt)}</dd>
            </dl>
          </div>
          <div className="section-title">{t('description')}</div>
          <div className="card pre small">{x.description || '—'}</div>

          <div className="section-title">{t('actions')}</div>
          <div className="action-row">
            {s.status !== 'active' && <button type="button" className="btn btn-sm btn-ok" onClick={() => setStatus('active')}>{t('restore')}</button>}
            {s.status !== 'hidden' && <button type="button" className="btn btn-sm" onClick={() => setStatus('hidden')}>{t('hide')}</button>}
            {s.status !== 'rejected' && <button type="button" className="btn btn-sm btn-danger" onClick={() => setStatus('rejected')}>{t('reject')}</button>}
            {admin.perms.includes('listings.edit') && <button type="button" className="btn btn-sm" onClick={() => setDialog('edit')}>{t('editText')}</button>}
          </div>

          {data.audit.length > 0 && (
            <>
              <div className="section-title">{t('nav_audit')}</div>
              <div className="feed">{data.audit.map((e) => (
                <div key={e.id} className="feed-item"><span className="feed-dot" /><div><strong>{e.action}</strong> · {e.actorEmail}<div className="small muted">{fmtDate(e.at)} · {e.reason}</div></div></div>
              ))}</div>
            </>
          )}
        </>
      )}
      {dialog === 'edit' && x && <EditDialog type={type} listing={x} onClose={done} />}
      {dialog && dialog !== 'edit' && <ConfirmAction {...dialog} onClose={done} />}
    </Drawer>
  );
}

export default function Listings({ admin }) {
  const { t } = useT();
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, error, loading, reload } = useApi(`/listings?page=${page}&size=25&type=${type}&status=${status}&q=${encodeURIComponent(q)}`);

  return (
    <>
      <PageHead title={t('nav_listings')} />
      <div className="adm-toolbar">
        <SearchBox id="listings-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={`${t('search')}: ${t('title')} / ID`} />
        <Seg label={t('type')} value={type} onChange={(v) => { setType(v); setPage(1); }} options={[['all', t('all')], ['jobs', t('jobs')], ['schools', t('schools')]]} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['all', t('all')], ['reported', t('st_reported')], ['flagged', t('st_flagged')], ['active', t('st_active')], ['expired', t('st_expired')], ['hidden', t('st_hidden')], ['rejected', t('st_rejected')]]} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>{t('title')}</th><th>{t('type')}</th><th>{t('status')}</th><th>{t('author')}</th><th>{t('created')}</th></tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
                {data.items.map((l) => (
                  <tr key={`${l.type}:${l.id}`} className="is-click" tabIndex={0} onClick={() => setOpen(l)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(l); }}>
                    <td>
                      <div className="cell-main">{l.title || '—'} {l.authorVerified && '⭐'}</div>
                      <div className="cell-sub">{l.company}{l.prefecture ? ` · ${l.prefecture}` : ''}</div>
                    </td>
                    <td><Badge kind="accent">{t(l.type)}</Badge></td>
                    <td>
                      <StatusBadge value={l.status} label={t(`st_${l.status}`)} />
                      {l.reports > 0 && <> <Badge kind="bad">🚩 {l.reports}</Badge></>}
                      {l.flags.length > 0 && <> <Badge kind="warn" >⚠ {l.flags.length}</Badge></>}
                    </td>
                    <td className="small">{l.authorEmail || '—'}</td>
                    <td className="small">{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
      {open && <ListingDrawer type={open.type} id={open.id} admin={admin} onClose={() => setOpen(null)} onChanged={reload} />}
    </>
  );
}

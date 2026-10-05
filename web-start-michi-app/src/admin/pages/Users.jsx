import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, Badge, StatusBadge, Drawer, ConfirmAction, useToast } from '../components/ui';

const can = (admin, p) => admin.perms.includes(p);

/** YYYY-MM-DD for tomorrow (local) — the earliest selectable suspension end. */
const tomorrow = () => { const d = new Date(Date.now() + 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/** Suspend: reason + optional end date (empty = permanent). `until` = end of that day, Japan time. */
function SuspendDialog({ id, onClose }) {
  const { t } = useT();
  const [until, setUntil] = useState('');
  return (
    <ConfirmAction
      title={t('suspend')}
      sub={t('suspendSub')}
      danger
      confirmLabel={t('suspend')}
      onClose={onClose}
      run={({ reason }) => api('POST', `/users/${id}/disable`, { reason, ...(until ? { until: new Date(`${until}T23:59:59+09:00`).toISOString() } : {}) })}
    >
      <div className="field">
        <label htmlFor="suspend-until">{t('suspendUntil')}</label>
        <input id="suspend-until" className="input" type="date" min={tomorrow()} value={until} onChange={(e) => setUntil(e.target.value)} />
        <span className="small muted">{until ? `${t('suspendUntil')}: ${until} 23:59 JST` : t('permanent')}</span>
      </div>
    </ConfirmAction>
  );
}

export function UserDrawer({ id, admin, onClose, onChanged }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/users/${id}`);
  const [dialog, setDialog] = useState(null);
  const [contact, setContact] = useState(null);
  const u = data && data.user;
  const done = (changed) => { setDialog(null); if (changed) { reload(); onChanged(); } };

  const dialogs = {
    reveal: { title: t('reveal'), run: async ({ reason }) => setContact(await api('POST', `/users/${id}/reveal`, { reason })) },
    enable: { title: t('enable'), run: ({ reason }) => api('POST', `/users/${id}/enable`, { reason }) },
    sessions: { title: t('revokeSessions'), danger: true, run: ({ reason }) => api('POST', `/users/${id}/revoke-sessions`, { reason }) },
    impersonate: {
      title: t('impersonate'), needTotp: true,
      run: async ({ reason, totp }) => {
        const r = await api('POST', '/impersonate', { userId: id, reason, totp });
        window.open(r.url, '_blank', 'noopener,noreferrer');
        toast(t('impersonateOpened'));
      },
    },
    delete: { title: t('deleteUser'), sub: t('deleteWarn'), danger: true, needTotp: true, run: async ({ reason, totp }) => { await api('DELETE', `/users/${id}`, { reason, totp }); onClose(); onChanged(); } },
  };

  return (
    <Drawer title={u ? (u.fullName || u.email) : t('loading')} onClose={onClose}>
      {loading && !data && <Loading />}
      {error && <ErrorBox error={error} onRetry={reload} />}
      {u && (
        <>
          <div className="row" style={{ flexWrap: 'wrap', marginBottom: 14 }}>
            <Badge kind="accent">{t(u.role)}</Badge>
            {u.adminRole && <Badge kind="warn">{u.adminRole}</Badge>}
            {u.disabled ? <StatusBadge value="disabled" label={t('disabled')} /> : <StatusBadge value="active" label={t('active')} />}
            {u.verification && <StatusBadge value={u.verification.status} label={t(`vStatus_${u.verification.status}`)} />}
          </div>
          {u.disabled && (
            <div className="alert alert-bad">
              {u.disabledReason && <div>{u.disabledReason}</div>}
              <div className="small">{t('suspendUntil')}: {u.disabledUntil ? fmtDate(u.disabledUntil) : t('permanent')}</div>
            </div>
          )}
          <dl className="kv">
            <dt>ID</dt><dd className="mono">{u.id}</dd>
            <dt>{t('email')}</dt><dd>{contact ? contact.email : u.email} {u.emailVerified && <Badge kind="ok">✓</Badge>}</dd>
            <dt>Tel</dt><dd>{contact ? (contact.phone || '—') : (u.phone || '—')}</dd>
            <dt>{t('created')}</dt><dd>{fmtDate(u.createdAt)}</dd>
            <dt>{t('lastLogin')}</dt><dd>{fmtDate(u.lastLoginAt)}</dd>
            <dt>{t('activeSessions')}</dt><dd>{data.activeSessions}</dd>
            {data.profile.prefecture && <><dt>都道府県</dt><dd>{data.profile.prefecture}</dd></>}
            {data.profile.nationality && <><dt>国籍</dt><dd>{data.profile.nationality}</dd></>}
          </dl>

          <div className="section-title">{t('actions')}</div>
          <div className="action-row">
            {can(admin, 'users.pii.reveal') && !contact && <button type="button" className="btn btn-sm" onClick={() => setDialog('reveal')}>{t('reveal')}</button>}
            {can(admin, 'preview.impersonate') && !u.adminRole && !u.disabled && <button type="button" className="btn btn-sm" onClick={() => setDialog('impersonate')}>👁 {t('impersonate')}</button>}
            {can(admin, 'users.sessions.revoke') && u.id !== admin.id && <button type="button" className="btn btn-sm" onClick={() => setDialog('sessions')}>{t('revokeSessions')}</button>}
            {can(admin, 'users.disable') && u.id !== admin.id && (u.disabled
              ? <button type="button" className="btn btn-sm btn-ok" onClick={() => setDialog('enable')}>{t('enable')}</button>
              : <button id="user-suspend" type="button" className="btn btn-sm btn-danger" onClick={() => setDialog('disable')}>{t('suspend')}</button>)}
            {can(admin, 'users.delete') && !u.adminRole && u.id !== admin.id && <button type="button" className="btn btn-sm btn-danger" onClick={() => setDialog('delete')}>{t('deleteUser')}</button>}
          </div>

          <div className="section-title">{t('listings')} ({data.listings.length})</div>
          {data.listings.length === 0 ? <Empty /> : (
            <div className="feed">{data.listings.map((l) => (
              <div key={l.id} className="feed-item row-between"><span>{l.title} <span className="small muted">· {t(l.type)}</span></span><StatusBadge value={l.status} label={t(`st_${l.status}`)} /></div>
            ))}</div>
          )}

          {can(admin, 'applications.read') && (
            <>
              <div className="section-title">{t('applications')} ({data.applications.length})</div>
              {data.applications.length === 0 ? <Empty /> : (
                <div className="feed">{data.applications.map((a) => (
                  <div key={a.id} className="feed-item row-between"><span className="mono">{a.targetId}</span><span className="row"><Badge>{a.status}</Badge><span className="small muted">{fmtDate(a.createdAt)}</span></span></div>
                ))}</div>
              )}
            </>
          )}

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
      {dialog === 'disable' && <SuspendDialog id={id} onClose={done} />}
      {dialog && dialog !== 'disable' && <ConfirmAction {...dialogs[dialog]} onClose={done} />}
    </Drawer>
  );
}

export default function Users({ admin }) {
  const { t } = useT();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const path = `/users?page=${page}&size=25&role=${role}&status=${status}&q=${encodeURIComponent(q)}`;
  const { data, error, loading, reload } = useApi(path);

  return (
    <>
      <PageHead title={t('nav_users')} />
      <div className="adm-toolbar">
        <SearchBox id="users-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={`${t('search')}: email / ${t('name')} / ID`} />
        <Seg label={t('filterRole')} value={role} onChange={(v) => { setRole(v); setPage(1); }} options={[['all', t('all')], ['driver', t('driver')], ['company', t('company')], ['admin', t('admin')]]} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[['all', t('all')], ['active', t('active')], ['disabled', t('disabled')]]} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>{t('name')}</th><th>{t('role')}</th><th>{t('status')}</th><th>{t('created')}</th><th>{t('lastLogin')}</th></tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
                {data.items.map((u) => (
                  <tr key={u.id} className="is-click" tabIndex={0} onClick={() => setOpen(u.id)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(u.id); }}>
                    <td><div className="cell-main">{u.fullName || '—'}</div><div className="cell-sub">{u.email}</div></td>
                    <td><Badge kind="accent">{t(u.role)}</Badge> {u.adminRole && <Badge kind="warn">{u.adminRole}</Badge>}</td>
                    <td>{u.disabled ? <StatusBadge value="disabled" label={t('disabled')} /> : <StatusBadge value="active" label={t('active')} />}
                      {u.disabled && u.disabledUntil && <div className="cell-sub">→ {fmtDate(u.disabledUntil)}</div>}
                      {u.verification && u.verification.status !== 'none' && <> <StatusBadge value={u.verification.status} label={t(`vStatus_${u.verification.status}`)} /></>}</td>
                    <td className="small">{fmtDate(u.createdAt)}</td>
                    <td className="small">{fmtDate(u.lastLoginAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
      {open && <UserDrawer id={open} admin={admin} onClose={() => setOpen(null)} onChanged={reload} />}
    </>
  );
}

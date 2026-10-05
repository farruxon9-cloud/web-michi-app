import { Fragment, useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, fmtDate, Badge, StatusBadge, ConfirmAction } from '../components/ui';

const fmtUptime = (s) => {
  const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60);
  return `${d ? `${d}d ` : ''}${h}h ${m}m`;
};

export function System({ admin }) {
  const { t } = useT();
  const { data, error, loading, reload } = useApi('/system');
  const [dialog, setDialog] = useState(null);
  if (loading && !data) return <Loading />;
  return (
    <>
      <PageHead title={t('nav_system')}>
        <button type="button" className="btn" onClick={reload}>↻ {t('reload')}</button>
        {admin.perms.includes('system.backup') && (
          <button id="backup-now" type="button" className="btn btn-primary" onClick={() => setDialog({ title: t('backupNow'), needReason: false, needTotp: true, run: ({ totp }) => api('POST', '/system/backup', { totp }) })}>💾 {t('backupNow')}</button>
        )}
      </PageHead>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid grid-kpi" style={{ marginBottom: 14 }}>
            <div className="card kpi"><div className="kpi-label">{t('status')}</div><div className="kpi-value" style={{ fontSize: 20 }}>{data.dbOk ? <Badge kind="ok">{t('dbOk')}</Badge> : <Badge kind="bad">DB ✕</Badge>}</div><div className="kpi-sub">Node {data.node}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('uptime')}</div><div className="kpi-value">{fmtUptime(data.uptimeSec)}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('memory')}</div><div className="kpi-value">{data.rssMb} MB</div><div className="kpi-sub">heap {data.heapMb} MB</div></div>
          </div>
          <div className="grid grid-2">
            <section className="card">
              <h2>{t('records')}</h2>
              <dl className="kv">
                {Object.entries(data.records).filter(([k]) => !/token|otp|session/i.test(k)).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd className="mono">{v}</dd></Fragment>)}
              </dl>
            </section>
            <section className="card">
              <h2>{t('backups')}</h2>
              {data.backups.length === 0 ? <Empty /> : (
                <div className="feed">{data.backups.map((b) => (
                  <div key={b.name} className="feed-item row-between"><span className="mono small">{b.name}</span><span className="small muted">{b.sizeKb} KB · {fmtDate(b.at)}</span></div>
                ))}</div>
              )}
            </section>
          </div>
        </>
      )}
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </>
  );
}

function MySessions() {
  const { t } = useT();
  const { data, error, loading, reload } = useApi('/sessions');
  const [dialog, setDialog] = useState(null);
  return (
    <section className="card">
      <h2>{t('mySessions')}</h2>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (data.items.length === 0 ? <Empty /> : (
        <div className="feed">{data.items.map((s) => (
          <div key={s.id} className="feed-item row-between">
            <div style={{ minWidth: 0 }}>
              <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{s.ua || '—'}</div>
              <div className="small muted">{s.ip} · {fmtDate(s.lastSeenAt)}</div>
            </div>
            <div className="row">
              {s.current ? <Badge kind="accent">{t('current')}</Badge> : s.active ? <StatusBadge value="active" label={t('active')} /> : <Badge>—</Badge>}
              {s.active && !s.current && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog({ title: t('revoke'), danger: true, needReason: false, run: () => api('POST', `/sessions/${s.id}/revoke`, {}) })}>{t('revoke')}</button>}
            </div>
          </div>
        ))}</div>
      ))}
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </section>
  );
}

export function Admins({ admin }) {
  const { t } = useT();
  const { data, error, loading, reload } = useApi('/admins');
  const [dialog, setDialog] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('moderator');
  const grantable = data ? data.roles.filter((r) => r !== 'super_admin') : [];

  return (
    <>
      <PageHead title={t('nav_admins')} sub={t('superOnlyCli')} />
      {error && <ErrorBox error={error} onRetry={reload} />}
      <div className="grid grid-2">
        <section className="card">
          <h2>{t('nav_admins')}</h2>
          {loading && !data ? <Loading /> : data && (
            <div className="feed">{data.items.map((a) => (
              <div key={a.id} className="feed-item row-between">
                <div style={{ minWidth: 0 }}>
                  <strong>{a.fullName || a.email}</strong>
                  <div className="small muted">{a.email} · {t('lastLogin')}: {fmtDate(a.lastAdminLoginAt)}</div>
                </div>
                <div className="row">
                  <Badge kind={a.adminRole === 'super_admin' ? 'warn' : 'accent'}>{a.adminRole}</Badge>
                  <Badge kind={a.totpEnabled ? 'ok' : 'bad'}>{t('twofa')} {a.totpEnabled ? t('on') : t('off')}</Badge>
                  {a.adminRole !== 'super_admin' && a.id !== admin.id && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => setDialog({ title: `${t('revokeRole')}: ${a.email}`, danger: true, needTotp: true, run: ({ reason, totp }) => api('DELETE', `/admins/${a.id}`, { reason, totp }) })}>{t('revokeRole')}</button>
                  )}
                </div>
              </div>
            ))}</div>
          )}
          <div className="section-title">{t('grantRole')}</div>
          <div className="form-grid">
            <div className="field"><label htmlFor="grant-email">{t('email')}</label><input id="grant-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="field"><label htmlFor="grant-role">{t('role')}</label>
              <select id="grant-role" className="select" value={role} onChange={(e) => setRole(e.target.value)}>{grantable.map((r) => <option key={r} value={r}>{r}</option>)}</select>
            </div>
          </div>
          <button id="grant-btn" type="button" className="btn btn-primary" disabled={!/^\S+@\S+\.\S+$/.test(email)} onClick={() => setDialog({
            title: `${t('grantRole')}: ${email} → ${role}`, needTotp: true,
            run: async ({ reason, totp }) => { await api('POST', '/admins', { email: email.trim(), adminRole: role, reason, totp }); setEmail(''); },
          })}>{t('grantRole')}</button>
          <div className="small muted mt">{t('recoveryLeft')}: <strong>{admin.recoveryCodesLeft ?? '—'}</strong></div>
        </section>
        <MySessions />
      </div>
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </>
  );
}

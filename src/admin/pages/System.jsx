import { Fragment, useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, fmtDate, Badge, StatusBadge, ConfirmAction, useToast, errText, isMissing } from '../components/ui';

const fmtUptime = (s) => {
  const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60);
  return `${d ? `${d}d ` : ''}${h}h ${m}m`;
};

const fmtBytes = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0; let x = v;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i += 1; }
  return `${x.toFixed(x >= 100 || i === 0 ? 0 : 1)} ${u[i]}`;
};

function ConfiguredBadge({ on }) {
  const { t } = useT();
  if (on === undefined) return <Badge>—</Badge>;
  return on ? <Badge kind="ok">✓ {t('configured')}</Badge> : <Badge kind="warn">{t('notConfigured')}</Badge>;
}

/** Outbound email via n8n (only for admins with outreach.read). */
function OutboundRow({ canSend }) {
  const { t } = useT();
  const toast = useToast();
  const { data, reload } = useApi('/outreach/status');
  const [busy, setBusy] = useState(false);
  const ready = Boolean(data && data.configured && data.configured.outbound && data.configured.secret);
  const sendTest = async () => {
    setBusy(true);
    try {
      await api('POST', '/outreach/test', {});
      toast(t('outboundTestSent'));
    } catch (e) {
      toast(isMissing(e) ? t('notAvailable') : errText(e, t), 'bad');
    }
    setBusy(false);
    reload();
  };
  return (
    <div className="flag-row">
      <div>
        <strong>{t('outbound')}</strong>
        <div className="small muted">{t('outboundSub')}</div>
        {data && (
          <div className="small muted">
            {t('outboundToday')}: {data.today ? `${data.today.sent} / ${data.today.cap}` : '—'} · {t('outboundSuppressed')}: {data.suppressions ?? 0} · {t('outboundLastEvent')}: {data.lastEventAt ? fmtDate(data.lastEventAt) : '—'}
          </div>
        )}
      </div>
      <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <ConfiguredBadge on={data ? ready : undefined} />
        {canSend && (
          <button id="outbound-test" type="button" className="btn btn-sm" disabled={busy || !ready} onClick={sendTest}>
            {busy && <span className="spinner" style={{ width: 12, height: 12 }} aria-hidden="true" />}✉ {t('outboundTest')}
          </button>
        )}
      </div>
    </div>
  );
}

export function System({ admin }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi('/system');
  const [dialog, setDialog] = useState(null);
  const [tgBusy, setTgBusy] = useState(false);
  const canBackup = admin.perms.includes('system.backup');

  const telegramTest = async () => {
    setTgBusy(true);
    try {
      const r = await api('POST', '/system/telegram-test', {});
      if (r && r.ok === false) toast(t('telegramFail'), 'bad'); else toast(t('telegramSent'));
    } catch (e) {
      toast(isMissing(e) ? t('notAvailable') : errText(e, t), 'bad');
    }
    setTgBusy(false);
  };

  if (loading && !data) return <Loading />;
  // Backups: legacy array of files, or the new summary object.
  const list = data && Array.isArray(data.backups) ? data.backups : (data && data.backups && Array.isArray(data.backups.items) ? data.backups.items : []);
  const sum = data && data.backups && !Array.isArray(data.backups) ? data.backups : null;
  const disk = data && data.disk;
  const diskPct = disk && disk.totalBytes ? Math.round((1 - disk.freeBytes / disk.totalBytes) * 100) : null;
  return (
    <>
      <PageHead title={t('nav_system')}>
        <button type="button" className="btn" onClick={reload}>↻ {t('reload')}</button>
        {canBackup && (
          <button id="backup-now" type="button" className="btn btn-primary" onClick={() => setDialog({ title: t('backupNow'), needReason: false, needTotp: true, run: ({ totp }) => api('POST', '/system/backup', { totp }) })}>💾 {t('backupNow')}</button>
        )}
      </PageHead>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <>
          <div className="grid grid-kpi" style={{ marginBottom: 14 }}>
            <div className="card kpi"><div className="kpi-label">{t('status')}</div><div className="kpi-value" style={{ fontSize: 20 }}>{data.dbOk ? <Badge kind="ok">{t('dbOk')}</Badge> : <Badge kind="bad">DB ✕</Badge>}</div><div className="kpi-sub">Node {data.node}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('uptime')}</div><div className="kpi-value">{fmtUptime(data.uptimeSec || 0)}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('memory')}</div><div className="kpi-value">{data.rssMb ?? '—'} MB</div><div className="kpi-sub">heap {data.heapMb ?? '—'} MB</div></div>
            {disk && (
              <div className="card kpi">
                <div className="kpi-label">{t('disk')}</div>
                <div className="kpi-value">{fmtBytes(disk.freeBytes)}</div>
                <div className="kpi-sub">{t('diskFree')} / {fmtBytes(disk.totalBytes)}</div>
                {diskPct !== null && <div className="meter" aria-label={`${diskPct}%`}><i className={diskPct > 90 ? 'is-bad' : diskPct > 75 ? 'is-warn' : ''} style={{ width: `${diskPct}%` }} /></div>}
              </div>
            )}
            {data.errors24h !== undefined && (
              <div className="card kpi"><div className="kpi-label">{t('errors24h')}</div><div className={`kpi-value${data.errors24h > 0 ? ' text-bad' : ''}`}>{data.errors24h}</div></div>
            )}
          </div>
          <div className="grid grid-2">
            <section className="card">
              <h2>{t('integrations')}</h2>
              <div className="flag-row">
                <div><strong>Telegram</strong><div className="small muted">{t('telegramSub')}</div></div>
                <div className="row" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <ConfiguredBadge on={data.telegram ? Boolean(data.telegram.configured) : undefined} />
                  {canBackup && (
                    <button id="telegram-test" type="button" className="btn btn-sm" disabled={tgBusy || (data.telegram && !data.telegram.configured)} onClick={telegramTest}>
                      {tgBusy && <span className="spinner" style={{ width: 12, height: 12 }} aria-hidden="true" />}✈ {t('telegramTest')}
                    </button>
                  )}
                </div>
              </div>
              <div className="flag-row">
                <div><strong>{t('mailer')}</strong><div className="small muted">{t('mailerSub')}</div></div>
                <ConfiguredBadge on={data.mailer ? Boolean(data.mailer.configured) : undefined} />
              </div>
              {admin.perms.includes('outreach.read') && <OutboundRow canSend={admin.perms.includes('outreach.send')} />}
            </section>
            <section className="card">
              <h2>{t('backups')}</h2>
              {sum && (
                <dl className="kv" style={{ marginBottom: list.length ? 10 : 0 }}>
                  <dt>{t('backupLatest')}</dt><dd>{fmtDate(sum.latestAt)}</dd>
                  <dt>{t('backupSize')}</dt><dd>{fmtBytes(sum.latestSizeBytes)}</dd>
                  <dt>{t('backupCount')}</dt><dd>{sum.count ?? '—'}</dd>
                </dl>
              )}
              {!sum && list.length === 0 ? <Empty /> : list.length > 0 && (
                <div className="feed">{list.map((b) => (
                  <div key={b.name} className="feed-item row-between"><span className="mono small">{b.name}</span><span className="small muted">{b.sizeKb ?? Math.round((b.sizeBytes || 0) / 1024)} KB · {fmtDate(b.at)}</span></div>
                ))}</div>
              )}
            </section>
            <section className="card">
              <h2>{t('records')}</h2>
              <dl className="kv">
                {Object.entries(data.records || {}).filter(([k]) => !/token|otp|session/i.test(k)).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd className="mono">{v}</dd></Fragment>)}
              </dl>
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

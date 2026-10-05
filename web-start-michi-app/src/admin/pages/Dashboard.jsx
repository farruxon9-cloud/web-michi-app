import { useT } from '../i18n';
import { useApi, Loading, ErrorBox, PageHead, fmtDate } from '../components/ui';

function Kpi({ label, value, sub }) {
  return (
    <div className="card kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value ?? '—'}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

const SERIES = [['signups', '#6d8cff'], ['applications', '#34d399'], ['listings', '#a46bff']];

function Bars({ daily }) {
  const { t } = useT();
  const max = Math.max(1, ...daily.map((d) => d.signups + d.applications + d.listings));
  return (
    <>
      <div className="bars" role="img" aria-label={t('chart14')}>
        {daily.map((d) => (
          <div className="bar-col" key={d.day} title={`${d.day}: ${SERIES.map(([k]) => `${t(k)} ${d[k]}`).join(' · ')}`}>
            <div className="bar-stack">
              {SERIES.map(([k, c]) => <div key={k} className="bar-seg" style={{ height: `${(d[k] / max) * 100}%`, background: c }} />)}
            </div>
            <span className="bar-day">{d.day.slice(8)}</span>
          </div>
        ))}
      </div>
      <div className="legend">{SERIES.map(([k, c]) => <span key={k}><i style={{ background: c }} />{t(k)}</span>)}</div>
    </>
  );
}

export default function Dashboard() {
  const { t } = useT();
  const { data, error, loading, reload } = useApi('/stats');
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBox error={error} onRetry={reload} />;
  const s = data;
  return (
    <>
      <PageHead title={t('nav_dashboard')} sub={fmtDate(s.serverTime)}>
        <button type="button" className="btn btn-sm" onClick={reload}>{t('reload')}</button>
      </PageHead>
      <div className="grid grid-kpi">
        <Kpi label={t('kpiUsers')} value={s.users.total} sub={`${t('kpiDrivers')} ${s.users.drivers} · ${t('kpiCompanies')} ${s.users.companies}`} />
        <Kpi label={t('kpiNew7')} value={s.users.new7d} sub={`30d: ${s.users.new30d}`} />
        <Kpi label={t('kpiJobs')} value={s.jobs.active || 0} sub={`${t('st_hidden')} ${s.jobs.hidden || 0} · ${t('st_rejected')} ${s.jobs.rejected || 0}`} />
        <Kpi label={t('kpiSchools')} value={s.schools.active || 0} sub={`${t('st_hidden')} ${s.schools.hidden || 0}`} />
        <Kpi label={t('kpiApps7')} value={s.applications.last7d} sub={`${t('total')} ${s.applications.total}`} />
        <Kpi label={t('kpiReports')} value={s.reports.open} sub={`${t('total')} ${s.reports.total}`} />
        <Kpi label={t('kpiPendingVerify')} value={s.users.pendingVerification} sub={`⭐ ${s.users.verifiedCompanies}`} />
      </div>
      <div className="grid grid-2 mt">
        <section className="card">
          <h2>{t('chart14')}</h2>
          <Bars daily={s.daily} />
        </section>
        <section className="card">
          <h2>{t('appStatus')}</h2>
          {Object.keys(s.applications.byStatus).length === 0 ? <div className="empty">{t('empty')}</div> : (
            <div className="feed">
              {Object.entries(s.applications.byStatus).map(([k, v]) => (
                <div key={k} className="feed-item row-between"><span>{k}</span><strong className="mono">{v}</strong></div>
              ))}
            </div>
          )}
          {s.recentAudit.length > 0 && (
            <>
              <h2 className="mt">{t('recentActivity')}</h2>
              <div className="feed">
                {s.recentAudit.map((e) => (
                  <div key={e.id} className="feed-item">
                    <span className="feed-dot" aria-hidden="true" />
                    <div><div><strong>{e.action}</strong> <span className="muted">· {e.actorEmail}</span></div><div className="small muted">{fmtDate(e.at)}{e.reason ? ` · ${e.reason}` : ''}</div></div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

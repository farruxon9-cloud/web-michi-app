import { useState } from 'react';
import { useT } from '../i18n';
import { useApi, Loading, LoadError, PageHead, Seg } from '../components/ui';

const C = { signupsDriver: '#6d8cff', signupsCompany: '#a46bff', jobs: '#fbbf24', applications: '#34d399', tickets: '#f87171' };
const H = 100;

/** A few evenly spaced x-axis labels (MM-DD). */
function Axis({ days }) {
  const n = days.length;
  if (!n) return null;
  const idx = [...new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])];
  return (
    <div className="chart-axis">
      {idx.map((i) => <span key={i} style={{ left: `${((i + 0.5) / n) * 100}%` }}>{String(days[i].date || '').slice(5)}</span>)}
    </div>
  );
}

function Legend({ keys }) {
  const { t } = useT();
  return <div className="legend">{keys.map((k) => <span key={k}><i style={{ background: C[k] }} />{t(`an_${k}`)}</span>)}</div>;
}

/** Stacked bars in a stretchable SVG (no deps). */
function StackedBars({ days, keys, label }) {
  const { t } = useT();
  const max = Math.max(1, ...days.map((d) => keys.reduce((s, k) => s + (Number(d[k]) || 0), 0)));
  const w = 10;
  return (
    <figure className="chart" aria-label={label}>
      <div className="chart-max small muted">{max}</div>
      <svg viewBox={`0 0 ${days.length * w} ${H}`} preserveAspectRatio="none" className="chart-svg" role="img" aria-label={label}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={days.length * w} y1={H * g} y2={H * g} className="chart-grid" vectorEffect="non-scaling-stroke" />)}
        {days.map((d, i) => {
          let y = H;
          return (
            <g key={d.date}>
              <title>{`${d.date}: ${keys.map((k) => `${t(`an_${k}`)} ${Number(d[k]) || 0}`).join(' · ')}`}</title>
              <rect x={i * w} y="0" width={w} height={H} fill="transparent" />
              {keys.map((k) => {
                const h = ((Number(d[k]) || 0) / max) * (H - 2);
                y -= h;
                return h > 0 ? <rect key={k} x={i * w + w * 0.15} y={y} width={w * 0.7} height={h} fill={C[k]} rx="1" /> : null;
              })}
            </g>
          );
        })}
      </svg>
      <Axis days={days} />
      <Legend keys={keys} />
    </figure>
  );
}

/** Multi-series line chart in a stretchable SVG. */
function Lines({ days, keys, label }) {
  const { t } = useT();
  const max = Math.max(1, ...days.flatMap((d) => keys.map((k) => Number(d[k]) || 0)));
  const n = days.length;
  const x = (i) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v) => H - 3 - ((Number(v) || 0) / max) * (H - 6);
  return (
    <figure className="chart" aria-label={label}>
      <div className="chart-max small muted">{max}</div>
      <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="chart-svg" role="img" aria-label={label}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2="100" y1={H * g} y2={H * g} className="chart-grid" vectorEffect="non-scaling-stroke" />)}
        {keys.map((k) => (
          <g key={k}>
            <polygon points={`0,${H} ${days.map((d, i) => `${x(i)},${y(d[k])}`).join(' ')} 100,${H}`} fill={C[k]} opacity="0.08" />
            <polyline points={days.map((d, i) => `${x(i)},${y(d[k])}`).join(' ')} fill="none" stroke={C[k]} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </g>
        ))}
        {days.map((d, i) => (
          <rect key={d.date} x={x(i) - 50 / Math.max(1, n)} y="0" width={100 / Math.max(1, n)} height={H} fill="transparent">
            <title>{`${d.date}: ${keys.map((k) => `${t(`an_${k}`)} ${Number(d[k]) || 0}`).join(' · ')}`}</title>
          </rect>
        ))}
      </svg>
      <Axis days={days} />
      <Legend keys={keys} />
    </figure>
  );
}

function Funnel({ f }) {
  const { t } = useT();
  const steps = ['companies', 'eligible', 'pending', 'verified', 'expired'];
  const top = Math.max(1, Number(f.companies) || 0);
  return (
    <div className="funnel">
      {steps.map((k) => {
        const v = Number(f[k]) || 0;
        const pct = Math.round((v / top) * 100);
        return (
          <div key={k} className="funnel-row">
            <span className="funnel-label">{t(`fn_${k}`)}</span>
            <div className="funnel-track"><i className={`is-${k}`} style={{ width: `${Math.max(v ? 2 : 0, pct)}%` }} /></div>
            <span className="funnel-val mono">{v}{k !== 'companies' && <span className="muted"> · {pct}%</span>}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const { t } = useT();
  const [days, setDays] = useState(30);
  const { data, error, loading, reload } = useApi(`/analytics?days=${days}`);
  const series = (data && data.days) || [];
  const totals = (data && data.totals) || {};
  const sum = (k) => series.reduce((s, d) => s + (Number(d[k]) || 0), 0);

  return (
    <>
      <PageHead title={t('nav_analytics')} sub={t('analyticsSub')}>
        <Seg label={t('period')} value={String(days)} onChange={(v) => setDays(Number(v))} options={[['30', t('days30')], ['90', t('days90')], ['180', t('days180')]]} />
      </PageHead>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="grid grid-kpi">
            {['users', 'drivers', 'companies', 'jobs', 'activeJobs', 'applications'].map((k) => (
              <div key={k} className="card kpi"><div className="kpi-label">{t(`tot_${k}`)}</div><div className="kpi-value">{totals[k] ?? '—'}</div></div>
            ))}
          </div>
          <div className="grid grid-kpi mt">
            {['signupsDriver', 'signupsCompany', 'jobs', 'applications', 'tickets'].map((k) => (
              <div key={k} className="card kpi kpi-mini"><div className="kpi-label"><i className="dot" style={{ background: C[k] }} />{t(`an_${k}`)}</div><div className="kpi-value">{sum(k)}</div><div className="kpi-sub">{t('lastNDays').replace('{n}', days)}</div></div>
            ))}
          </div>
          <div className="grid grid-2 mt">
            <section className="card">
              <h2>{t('signups')}</h2>
              <StackedBars days={series} keys={['signupsDriver', 'signupsCompany']} label={t('signups')} />
            </section>
            <section className="card">
              <h2>{t('activity')}</h2>
              <Lines days={series} keys={['jobs', 'applications', 'tickets']} label={t('activity')} />
            </section>
            <section className="card">
              <h2>{t('verifyFunnel')}</h2>
              <Funnel f={data.funnel || {}} />
            </section>
          </div>
        </>
      )}
    </>
  );
}

import { Fragment, useState } from 'react';
import { useT } from '../i18n';
import { useApi, Loading, LoadError, Empty, PageHead, Badge, fmtDate, useInterval, Switch } from '../components/ui';

const REFRESH_MS = 30000;

const yes = (v) => (v ? <Badge kind="ok">✓</Badge> : <Badge>—</Badge>);

export default function AiMonitor() {
  const { t } = useT();
  const [auto, setAuto] = useState(true);
  const { data, error, loading, reload } = useApi('/ai');
  const [at, setAt] = useState(() => Date.now());
  useInterval(() => { reload(); setAt(Date.now()); }, auto ? REFRESH_MS : 0);

  const eng = (data && data.engine) || {};
  const llm = eng.llm || {};
  const providers = Object.entries(llm);
  const fast = eng.providers || [];
  const deep = eng.deepProviders || [];
  const quota = (data && data.quota) || {};
  const legacy = (data && data.legacy) || {};

  return (
    <>
      <PageHead title={t('nav_ai')} sub={`${t('aiSub')} · ${t('updated')} ${new Date(at).toLocaleTimeString()}`}>
        <label className="row small muted" htmlFor="ai-auto">{t('autoRefresh')} 30s <Switch id="ai-auto" label={t('autoRefresh')} checked={auto} onChange={setAuto} /></label>
        <button type="button" className="btn btn-sm" onClick={() => { reload(); setAt(Date.now()); }}>↻ {t('reload')}</button>
      </PageHead>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="grid grid-kpi">
            <div className="card kpi"><div className="kpi-label">{t('aiEngine')}</div><div className="kpi-value" style={{ fontSize: 20 }}>{eng.enabled === false ? <Badge kind="bad">{t('off')}</Badge> : <Badge kind="ok">{t('on')}</Badge>}</div><div className="kpi-sub">{t('webSearch')}: {eng.webSearch ? t('on') : t('off')}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('aiProviders')}</div><div className="kpi-value">{fast.length}</div><div className="kpi-sub">deep {deep.length}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('kbChunks')}</div><div className="kpi-value">{eng.kbChunks ?? '—'}</div></div>
            <div className="card kpi"><div className="kpi-label">{t('aiCache')}</div><div className="kpi-value">{(data.cache && data.cache.size) ?? legacy.cached ?? '—'}</div></div>
          </div>
          <section className="card mt">
            <h2>{t('aiProviders')}</h2>
            {providers.length === 0 ? <Empty /> : (
              <div className="tbl-wrap" style={{ border: 0, background: 'transparent' }}>
                <table className="tbl">
                  <thead><tr><th>{t('provider')}</th><th>{t('status')}</th><th className="num">OK</th><th className="num">{t('fail')}</th><th className="num">429</th><th>{t('lastOk')}</th><th>{t('lastError')}</th></tr></thead>
                  <tbody>
                    {providers.map(([name, s]) => {
                      const total = (s.ok || 0) + (s.fail || 0);
                      const rate = total ? Math.round(((s.ok || 0) / total) * 100) : null;
                      return (
                        <tr key={name}>
                          <td>
                            <div className="cell-main">{name}</div>
                            <div className="cell-sub">{[fast.includes(name) && 'fast', deep.includes(name) && 'deep'].filter(Boolean).join(' · ')}</div>
                          </td>
                          <td>
                            {s.coolingDownSec > 0 ? <Badge kind="warn">❄ {t('cooldown')} {s.coolingDownSec}s</Badge> : <Badge kind="ok">{t('ready')}</Badge>}
                            {rate !== null && <div className="meter" style={{ marginTop: 6, maxWidth: 120 }}><i className={rate < 70 ? 'is-bad' : rate < 90 ? 'is-warn' : ''} style={{ width: `${rate}%` }} /></div>}
                          </td>
                          <td className="num mono">{s.ok || 0}</td>
                          <td className="num mono">{s.fail || 0}</td>
                          <td className="num mono">{s.rateLimited || 0}</td>
                          <td className="small">{s.lastOkAt ? fmtDate(s.lastOkAt) : '—'}</td>
                          <td className="small muted" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.lastError || ''}>{s.lastError || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <div className="grid grid-2 mt">
            <section className="card">
              <h2>{t('aiQuota')}</h2>
              <dl className="kv">
                {Object.entries(quota).map(([k, v]) => <Fragment key={k}><dt>{t(`q_${k}`) === `q_${k}` ? k : t(`q_${k}`)}</dt><dd className="mono">{String(v)} / {t('perDay')}</dd></Fragment>)}
              </dl>
            </section>
            <section className="card">
              <h2>{t('aiLegacy')}</h2>
              <dl className="kv">
                <dt>Hugging Face</dt><dd>{yes(legacy.hf)}</dd>
                <dt>Groq</dt><dd>{yes(legacy.groq)}</dd>
              </dl>
            </section>
          </div>
        </>
      )}
    </>
  );
}

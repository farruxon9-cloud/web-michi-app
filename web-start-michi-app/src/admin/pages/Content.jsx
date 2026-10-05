import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, Seg, Pager, fmtDate, Badge, StatusBadge, Switch, ConfirmAction, useToast, errText } from '../components/ui';

/** The main app's 7 locales (announcement text per language; app falls back to en → ja). */
const APP_LANGS = [['ja', '日本語'], ['en', 'English'], ['uz', 'Oʻzbek'], ['vi', 'Tiếng Việt'], ['ne', 'नेपाली'], ['zh', '中文'], ['ru', 'Русский']];

export function Notifications() {
  const { t } = useT();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', lang: 'all' });
  const [dialog, setDialog] = useState(null);
  const { data, error, loading, reload } = useApi(`/notifications?page=${page}&size=20`);
  const valid = form.title.trim().length >= 2 && form.body.trim().length >= 2;

  return (
    <>
      <PageHead title={t('nav_notifications')} sub={t('inAppOnly')} />
      <div className="grid grid-2">
        <section className="card">
          <h2>{t('newBroadcast')}</h2>
          <div className="field"><label htmlFor="ntf-title">{t('title')}</label><input id="ntf-title" className="input" maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label htmlFor="ntf-body">{t('body')}</label><textarea id="ntf-body" className="textarea" rows={5} maxLength={1000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="field"><span className="small muted">{t('audience')}</span>
            <Seg label={t('audience')} value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} options={[['all', t('aud_all')], ['driver', t('aud_driver')], ['company', t('aud_company')]]} />
          </div>
          <div className="field"><label htmlFor="ntf-lang">Lang</label>
            <select id="ntf-lang" className="select" value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}>
              <option value="all">{t('all')}</option>
              {APP_LANGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <button id="ntf-send" type="button" className="btn btn-primary" disabled={!valid} onClick={() => setDialog({
            title: `${t('send')}: ${form.title}`, needReason: false,
            run: async () => { await api('POST', '/notifications', form); setForm({ title: '', body: '', audience: 'all', lang: 'all' }); },
          })}>📣 {t('send')}</button>
        </section>
        <section className="card">
          <h2>{t('nav_notifications')}</h2>
          {error && <ErrorBox error={error} onRetry={reload} />}
          {loading && !data ? <Loading /> : data && (data.items.length === 0 ? <Empty /> : (
            <>
              <div className="feed">
                {data.items.map((n) => (
                  <div key={n.id} className="feed-item row-between" style={{ alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong>{n.title}</strong>
                      <div className="small pre">{n.body}</div>
                      <div className="row small muted" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                        <Badge kind="accent">{t(`aud_${n.audience}`)}</Badge><Badge>{n.lang}</Badge>{fmtDate(n.createdAt)}
                      </div>
                    </div>
                    {n.active
                      ? <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog({ title: `${t('withdraw')}: ${n.title}`, danger: true, needReason: false, run: () => api('DELETE', `/notifications/${n.id}`) })}>{t('withdraw')}</button>
                      : <StatusBadge value="closed" label={t('withdraw')} />}
                  </div>
                ))}
              </div>
              <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
            </>
          ))}
        </section>
      </div>
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </>
  );
}

export function Content({ admin }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi('/settings');
  const [flags, setFlags] = useState({});
  const [ann, setAnn] = useState({ enabled: false, text: {}, link: '' });
  const [busy, setBusy] = useState('');
  const canFlags = admin.perms.includes('flags.edit');
  const canContent = admin.perms.includes('content.edit');

  useEffect(() => {
    if (!data) return;
    setFlags(data.flags || {});
    const a = (data.content && data.content.announcement) || {};
    setAnn({ enabled: Boolean(a.enabled), text: a.text || {}, link: a.link || '' });
  }, [data]);

  // Missing flag = feature on (the app's default); only an explicit false hides it. Maintenance defaults off.
  const isOn = (k) => (k === 'maintenance' ? flags[k] === true : flags[k] !== false);

  const saveFlags = async (next) => {
    setBusy('flags');
    try {
      const r = await api('PUT', '/settings/flags', { flags: next, reason: 'flags toggle' });
      setFlags(r.flags);
      toast(t('saved'));
    } catch (e) { toast(errText(e, t), 'bad'); reload(); }
    setBusy('');
  };
  const saveAnn = async () => {
    setBusy('ann');
    try {
      const link = ann.link.trim();
      if (link && !/^https:\/\//.test(link)) throw new Error('https:// …');
      const content = { ...(data.content || {}), announcement: { enabled: ann.enabled, text: ann.text, link } };
      await api('PUT', '/settings/content', { content, reason: 'announcement' });
      toast(t('saved'));
      reload();
    } catch (e) { toast(errText(e, t), 'bad'); }
    setBusy('');
  };

  if (loading && !data) return <Loading />;
  return (
    <>
      <PageHead title={t('nav_content')} />
      {error && <ErrorBox error={error} onRetry={reload} />}
      {data && (
        <div className="grid grid-2">
          <section className="card">
            <h2>{t('flagsTitle')}</h2>
            <p className="small muted" style={{ marginTop: -6 }}>{t('flagsSub')}</p>
            {(data.flagKeys || []).map((k) => (
              <div key={k} className="flag-row">
                <div>
                  <strong>{t(`fl_${k}`)}</strong>
                  {k === 'maintenance' && isOn(k) && <> <Badge kind="bad">ON</Badge></>}
                </div>
                <Switch id={`flag-${k}`} label={t(`fl_${k}`)} checked={isOn(k)} onChange={(v) => { if (canFlags && !busy) saveFlags({ ...flags, [k]: v }); }} />
              </div>
            ))}
            {!canFlags && <div className="alert alert-warn mt">{t('noPerm')}</div>}
          </section>

          <section className="card">
            <h2>{t('announceTitle')}</h2>
            <div className="flag-row">
              <strong>{t('enabled')}</strong>
              <Switch id="ann-enabled" label={t('enabled')} checked={ann.enabled} onChange={(v) => setAnn({ ...ann, enabled: v })} />
            </div>
            {APP_LANGS.map(([k, l]) => (
              <div className="field" key={k}>
                <label htmlFor={`ann-${k}`}>{l}{k === 'ja' || k === 'en' ? ' *' : ''}</label>
                <input id={`ann-${k}`} className="input" maxLength={200} value={ann.text[k] || ''} onChange={(e) => setAnn({ ...ann, text: { ...ann.text, [k]: e.target.value } })} />
              </div>
            ))}
            <div className="field"><label htmlFor="ann-link">{t('link')}</label><input id="ann-link" className="input" type="url" placeholder="https://" value={ann.link} onChange={(e) => setAnn({ ...ann, link: e.target.value })} /></div>
            <button id="ann-save" type="button" className="btn btn-primary" disabled={!canContent || busy === 'ann' || (ann.enabled && !(ann.text.ja || ann.text.en))} onClick={saveAnn}>{t('save')}</button>
          </section>
        </div>
      )}
    </>
  );
}

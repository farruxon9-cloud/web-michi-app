import { useEffect, useMemo, useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, PageHead, Badge, useToast, errText, useInterval, ConfirmAction, Empty, fmtDate } from '../components/ui';

/** Email campaigns (Phase 3): blocks editor, recipients, Guard, preview, test, start/pause/cancel. */
const BLOCKS = ['title', 'text', 'button', 'divider', 'signature'];
const LANGS = [['ja', '日本語'], ['uz', 'Oʻzbek'], ['en', 'English'], ['ru', 'Русский']];
const CMP_KIND = { draft: '', sending: 'accent', paused: 'warn', done: 'ok', cancelled: '' };
const VERDICT_KIND = { pass: 'ok', warn: 'warn', block: 'bad' };
const fill = (s, vars) => Object.entries(vars).reduce((a, [k, v]) => a.replace(`{${k}}`, v), s);

export default function Campaigns({ admin }) {
  const [openId, setOpenId] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('id'));
  const open = (id) => {
    window.location.hash = id ? `#/campaigns?id=${id}` : '#/campaigns';
    setOpenId(id);
  };
  return openId ? <Editor id={openId} admin={admin} onBack={() => open(null)} /> : <List admin={admin} onOpen={open} />;
}

function List({ admin, onOpen }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi('/outreach/campaigns');
  const canSend = admin.perms.includes('outreach.send');
  useInterval(() => { if (data && data.items.some((c) => c.status === 'sending')) reload(); }, 15000);
  const create = async () => {
    try {
      const r = await api('POST', '/outreach/campaigns', { name: `${t('nav_campaigns')} ${new Date().toLocaleDateString('ja-JP')}`, lang: 'ja', blocks: [{ type: 'title', text: '' }, { type: 'text', text: '' }] });
      onOpen(r.campaign.id);
    } catch (e) { toast(errText(e, t), 'bad'); }
  };
  return (
    <>
      <PageHead title={t('nav_campaigns')} sub={t('campaignsSub')}>
        {data && <Badge kind="accent">{t('cmpBudget')}: {data.budgetToday}</Badge>}
        {canSend && <button id="cmp-new" type="button" className="btn btn-primary" onClick={create}>＋ {t('cmpNew')}</button>}
      </PageHead>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (data.items.length === 0 ? <Empty>{t('empty')}</Empty> : (
        <div className="tbl-wrap card">
          <table className="tbl">
            <thead><tr><th>{t('name')}</th><th>{t('status')}</th><th>{t('cmpGuard')}</th><th className="num">{t('ms_sent')}</th><th className="num">{t('ms_delivered')}</th><th className="num">{t('ms_opened')}</th><th className="num">{t('ms_clicked')}</th><th>{t('created')}</th></tr></thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c.id} className="has-action" onClick={() => onOpen(c.id)} style={{ cursor: 'pointer' }}>
                  <td><div className="cell-main">{c.name}</div><div className="cell-sub">{c.subject || '—'}</div></td>
                  <td><Badge kind={CMP_KIND[c.status]}>{t(`cmp_${c.status}`)}</Badge>{c.waiting === 'daily_cap' && <div className="cell-sub">{t('cmpWaitingCap')}</div>}</td>
                  <td>{c.guard ? <Badge kind={c.guard.stale ? 'warn' : VERDICT_KIND[c.guard.verdict]}>{c.guard.stale ? t('cmpGuardStale') : t(`verdict_${c.guard.verdict}`)}{c.guard.score != null && !c.guard.stale ? ` · ${c.guard.score}` : ''}</Badge> : <span className="muted small">{t('cmpGuardNone')}</span>}</td>
                  <td className="num mono">{c.stats.sent}/{c.stats.total}</td>
                  <td className="num mono">{c.stats.delivered}</td>
                  <td className="num mono">{c.stats.opened}</td>
                  <td className="num mono">{c.stats.clicked}</td>
                  <td className="small">{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

function BlockEditor({ blocks, onChange, disabled }) {
  const { t } = useT();
  const set = (i, patch) => onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const move = (i, d) => { const n = [...blocks]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div>
      {blocks.map((b, i) => (
        <div key={i} className="card" style={{ padding: 12, marginBottom: 8 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <Badge>{t(`blk_${b.type}`)}</Badge>
            <div className="row">
              <button type="button" className="btn btn-ghost btn-sm" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label="up">↑</button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={disabled || i === blocks.length - 1} onClick={() => move(i, 1)} aria-label="down">↓</button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={disabled} onClick={() => onChange(blocks.filter((_, j) => j !== i))} aria-label="remove">✕</button>
            </div>
          </div>
          {b.type === 'title' && <input className="input" value={b.text || ''} maxLength={200} disabled={disabled} onChange={(e) => set(i, { text: e.target.value })} />}
          {(b.type === 'text' || b.type === 'signature') && <textarea className="textarea" rows={b.type === 'text' ? 5 : 2} value={b.text || ''} maxLength={5000} disabled={disabled} onChange={(e) => set(i, { text: e.target.value })} />}
          {b.type === 'button' && (
            <div className="form-grid">
              <input className="input" placeholder={t('cmpBtnLabel')} value={b.label || ''} maxLength={80} disabled={disabled} onChange={(e) => set(i, { label: e.target.value })} />
              <input className="input mono" placeholder="https://web.michi.jp.net/" value={b.url || ''} maxLength={500} disabled={disabled} onChange={(e) => set(i, { url: e.target.value })} />
            </div>
          )}
        </div>
      ))}
      <div className="chip-row">
        {BLOCKS.map((k) => <button key={k} type="button" className="chip-btn" disabled={disabled} onClick={() => onChange([...blocks, k === 'button' ? { type: k, label: '', url: 'https://web.michi.jp.net/' } : k === 'divider' ? { type: k } : { type: k, text: '' }])}>＋ {t(`blk_${k}`)}</button>)}
      </div>
      <p className="small muted mt">{'{{company}} · {{name}}'}</p>
    </div>
  );
}

function GuardResult({ g }) {
  const { t } = useT();
  if (!g) return null;
  return (
    <div className="mt">
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <Badge kind={VERDICT_KIND[g.verdict]}>{t(`verdict_${g.verdict}`)}</Badge>
        {g.score != null && <Badge>{t('cmpAiScore')}: {g.score}</Badge>}
      </div>
      <ul className="small" style={{ paddingLeft: 18, margin: '8px 0' }}>
        {g.issues.map((x, i) => <li key={i} className={x.severity === 'error' ? 'text-bad' : x.severity === 'warn' ? 'text-warn' : 'muted'}>{x.source === 'ai' ? '🤖 ' : ''}{x.message}</li>)}
      </ul>
      {g.ai && (g.ai.suggestedSubject || g.ai.suggestedFix) && (
        <details className="small"><summary>{t('cmpSuggest')}</summary>
          {g.ai.suggestedSubject && <p><b>{t('msgSubject')}:</b> {g.ai.suggestedSubject}</p>}
          {g.ai.suggestedFix && <pre className="pre" style={{ whiteSpace: 'pre-wrap' }}>{g.ai.suggestedFix}</pre>}
        </details>
      )}
    </div>
  );
}

function Editor({ id, admin, onBack }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/outreach/campaigns/${id}`);
  const canSend = admin.perms.includes('outreach.send');
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState('');
  const [guard, setGuard] = useState(null);
  const [previews, setPreviews] = useState(null);
  const [pv, setPv] = useState(0);
  const [csv, setCsv] = useState('');
  const [brief, setBrief] = useState('');
  const [draft, setDraft] = useState(null);
  const [ack, setAck] = useState(false);
  const [dialog, setDialog] = useState(null);
  const c = data && data.campaign;
  const editable = c && ['draft', 'paused'].includes(c.status) && canSend;

  useEffect(() => { if (c && !dirty) setForm({ name: c.name, subject: c.subject, lang: c.lang, purpose: c.purpose, blocks: c.blocks, utm: c.utm || {} }); }, [c, dirty]);
  useInterval(() => { if (c && c.status === 'sending' && !dirty) reload(); }, 10000);
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true); };

  const run = async (key, fn, okMsg) => {
    setBusy(key);
    try { const r = await fn(); if (okMsg) toast(okMsg); return r; } catch (e) { toast(errText(e, t), 'bad'); return null; } finally { setBusy(''); }
  };
  const save = () => run('save', async () => { await api('PUT', `/outreach/campaigns/${id}`, form); setDirty(false); setGuard(null); reload(); }, t('saved'));
  const saveIfDirty = async () => { if (dirty) await save(); };
  const check = () => run('check', async () => { await saveIfDirty(); const g = await api('POST', `/outreach/campaigns/${id}/check`, {}); setGuard(g); setAck(false); reload(); });
  const preview = () => run('preview', async () => { await saveIfDirty(); const r = await api('POST', `/outreach/campaigns/${id}/preview`, {}); setPreviews(r.previews); setPv(0); });
  const test = () => run('test', async () => { await saveIfDirty(); await api('POST', `/outreach/campaigns/${id}/test`, {}); }, t('outboundTestSent'));
  const aiDraft = () => run('ai', async () => { const r = await api('POST', `/outreach/campaigns/${id}/ai-draft`, { brief, lang: form.lang }); setDraft(r); });
  const applyDraft = () => { setForm((f) => ({ ...f, subject: draft.subject || f.subject, blocks: draft.blocks })); setDirty(true); setDraft(null); };
  const addRecipients = (body) => run('rcp', async () => {
    const r = await api('POST', `/outreach/campaigns/${id}/recipients`, body);
    const x = r.csv || r.companies || r.manual || { added: 0, duplicates: 0, suppressed: 0 };
    toast(fill(t('cmpAdded'), { a: x.added, d: x.duplicates, s: x.suppressed, i: r.invalid || 0 }));
    setCsv('');
    reload();
  });
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; f.text().then((s) => setCsv(s.slice(0, 2 * 1024 * 1024))); e.target.value = ''; };
  const lifecycle = (action, body) => run(action, async () => { await api('POST', `/outreach/campaigns/${id}/${action}`, body || {}); reload(); }, t('done'));

  const savedGuard = c && c.guard;
  const guardOk = savedGuard && !savedGuard.stale && !dirty && (savedGuard.verdict === 'pass' || (savedGuard.verdict === 'warn' && ack));
  const stats = c ? c.stats : null;
  const statRows = useMemo(() => (stats ? ['pending', 'sent', 'delivered', 'opened', 'clicked', 'suppressed', 'failed', 'bounced', 'unsubscribed'] : []), [stats]);

  if (loading && !data) return <Loading />;
  if (error) return <LoadError error={error} onRetry={reload} />;
  if (!c || !form) return null;

  return (
    <>
      <PageHead title={form.name || t('nav_campaigns')} sub={<span><Badge kind={CMP_KIND[c.status]}>{t(`cmp_${c.status}`)}</Badge>{c.waiting === 'daily_cap' && <span className="small muted"> · {t('cmpWaitingCap')}</span>}{c.pausedReason === 'errors' && <span className="small text-bad"> · {t('cmpPausedErrors')}</span>}</span>}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← {t('cmpBack')}</button>
        {dirty && <Badge kind="warn">● {t('unsaved')}</Badge>}
        {editable && <button id="cmp-save" type="button" className="btn btn-primary" disabled={!dirty || busy === 'save'} onClick={save}>{t('save')}</button>}
      </PageHead>

      <div className="grid grid-2">
        <section className="card">
          <div className="form-grid">
            <div className="field"><label htmlFor="cmp-name">{t('cmpName')}</label><input id="cmp-name" className="input" value={form.name} maxLength={120} disabled={!editable} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="field"><label htmlFor="cmp-lang">{t('cmpLang')}</label>
              <select id="cmp-lang" className="select" value={form.lang} disabled={!editable} onChange={(e) => set('lang', e.target.value)}>{LANGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </div>
          </div>
          <div className="field"><label htmlFor="cmp-subject">{t('subject')}</label><input id="cmp-subject" className="input" value={form.subject} maxLength={200} disabled={!editable} onChange={(e) => set('subject', e.target.value)} /><span className="small muted" style={{ alignSelf: 'flex-end' }}>{form.subject.length} / 78</span></div>
          <div className="field"><label htmlFor="cmp-purpose">{t('cmpPurpose')}</label><input id="cmp-purpose" className="input" value={form.purpose} maxLength={300} disabled={!editable} onChange={(e) => set('purpose', e.target.value)} /></div>
          <h3 className="section-title">{t('cmpBlocks')}</h3>
          <BlockEditor blocks={form.blocks} disabled={!editable} onChange={(b) => set('blocks', b)} />
          <details className="mt"><summary className="small">{t('cmpUtm')}</summary>
            <div className="form-grid mt">
              {['source', 'medium', 'campaign'].map((k) => <input key={k} className="input mono" placeholder={`utm_${k}`} value={(form.utm && form.utm[k]) || ''} disabled={!editable} onChange={(e) => set('utm', { ...form.utm, [k]: e.target.value })} />)}
            </div>
          </details>
          {editable && (
            <div className="card mt" style={{ padding: 12 }}>
              <strong>🤖 {t('cmpAi')}</strong>
              <textarea className="textarea mt" rows={3} placeholder={t('cmpAiBrief')} value={brief} maxLength={2000} onChange={(e) => setBrief(e.target.value)} />
              <button type="button" className="btn btn-sm mt" disabled={brief.trim().length < 10 || busy === 'ai'} onClick={aiDraft}>{busy === 'ai' && <span className="spinner" style={{ width: 12, height: 12 }} />}{t('cmpAiRun')}</button>
              {draft && (
                <div className="mt small">
                  <p><b>{draft.subject}</b></p>
                  {draft.blocks.map((b, i) => <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{b.text || b.label}</p>)}
                  <button type="button" className="btn btn-primary btn-sm" onClick={applyDraft}>{t('cmpAiApply')}</button>
                </div>
              )}
            </div>
          )}
        </section>

        <div>
          <section className="card">
            <h3 className="section-title" style={{ marginTop: 0 }}>{t('cmpRecipients')} · {stats.total}</h3>
            <div className="chip-row" style={{ marginTop: 0 }}>
              {statRows.filter((k) => stats[k]).map((k) => <Badge key={k}>{t(`ms_${k}`)}: {stats[k]}</Badge>)}
            </div>
            {editable && (
              <>
                <textarea className="textarea mt" rows={4} placeholder={t('cmpCsv')} value={csv} onChange={(e) => setCsv(e.target.value)} />
                <div className="row mt" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <label className="btn btn-sm">📄 {t('cmpCsvFile')}<input type="file" accept=".csv,.txt,text/csv" hidden onChange={onFile} /></label>
                  <button type="button" className="btn btn-sm btn-primary" disabled={!csv.trim() || busy === 'rcp'} onClick={() => addRecipients({ csv })}>{t('cmpAddCsv')}</button>
                  <button type="button" className="btn btn-sm" disabled={busy === 'rcp'} onClick={() => addRecipients({ companies: 'all' })}>{t('cmpAddCompanies')}</button>
                  <button type="button" className="btn btn-sm" disabled={busy === 'rcp'} onClick={() => addRecipients({ companies: 'verified' })}>{t('cmpAddVerified')}</button>
                  {stats.total > stats.sent && <button type="button" className="btn btn-sm btn-ghost" onClick={() => run('clr', async () => { await api('DELETE', `/outreach/campaigns/${id}/recipients`); reload(); }, t('done'))}>{t('cmpClear')}</button>}
                </div>
              </>
            )}
            {data.recipients.length > 0 && (
              <div className="tbl-wrap mt" style={{ maxHeight: 220, overflow: 'auto' }}>
                <table className="tbl"><tbody>
                  {data.recipients.slice(0, 100).map((r) => <tr key={r.id}><td className="small mono">{r.email}</td><td className="small">{r.company}</td><td><Badge>{t(`ms_${r.delivery || r.status}`)}</Badge></td></tr>)}
                </tbody></table>
              </div>
            )}
          </section>

          <section className="card mt">
            <div className="row-between">
              <h3 className="section-title" style={{ margin: 0 }}>🛡 {t('cmpGuard')}</h3>
              {canSend && <button id="cmp-check" type="button" className="btn btn-sm btn-primary" disabled={busy === 'check' || !form.subject} onClick={check}>{busy === 'check' && <span className="spinner" style={{ width: 12, height: 12 }} />}{t('cmpCheck')}</button>}
            </div>
            {!guard && savedGuard && <p className="small mt">{savedGuard.stale || dirty ? <span className="text-warn">{t('cmpGuardStale')}</span> : <><Badge kind={VERDICT_KIND[savedGuard.verdict]}>{t(`verdict_${savedGuard.verdict}`)}</Badge> {savedGuard.score != null && `· ${t('cmpAiScore')} ${savedGuard.score}`} · {fmtDate(savedGuard.checkedAt)}</>}</p>}
            {!guard && !savedGuard && <p className="small muted mt">{t('cmpGuardNone')}</p>}
            <GuardResult g={guard} />
          </section>

          <section className="card mt">
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-sm" disabled={busy === 'preview'} onClick={preview}>👁 {t('cmpPreview')}</button>
              {canSend && <button type="button" className="btn btn-sm" disabled={busy === 'test'} onClick={test}>✉ {t('cmpTest')}</button>}
              {editable && savedGuard && savedGuard.verdict === 'warn' && !savedGuard.stale && !dirty && (
                <label className="small row" style={{ gap: 6 }}><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />{t('cmpAck')}</label>
              )}
              {editable && <button id="cmp-start" type="button" className="btn btn-sm btn-ok" disabled={!guardOk || !stats.pending} onClick={() => setDialog('start')}>▶ {t('cmpStart')}</button>}
              {canSend && c.status === 'sending' && <button type="button" className="btn btn-sm" onClick={() => lifecycle('pause')}>⏸ {t('cmpPause')}</button>}
              {canSend && ['draft', 'sending', 'paused'].includes(c.status) && c.status !== 'draft' && <button type="button" className="btn btn-sm btn-danger" onClick={() => setDialog('cancel')}>{t('cmpCancel')}</button>}
              {canSend && c.status === 'draft' && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDialog('delete')}>🗑 {t('cmpDelete')}</button>}
            </div>
            {previews && (
              <div className="mt">
                <div className="seg" role="tablist">{previews.map((p, i) => <button key={i} type="button" className={pv === i ? 'is-on' : ''} onClick={() => setPv(i)}>{p.to}</button>)}</div>
                <p className="small mt"><b>{previews[pv].subject}</b></p>
                <iframe title="preview" sandbox="" srcDoc={previews[pv].html} style={{ width: '100%', height: 520, border: '1px solid var(--line, #e2e8f0)', borderRadius: 12, background: '#fff' }} />
              </div>
            )}
          </section>
        </div>
      </div>

      {dialog === 'start' && (
        <ConfirmAction title={t('cmpStart')} sub={fill(t('cmpStartConfirm'), { n: stats.pending })} needReason={false} confirmLabel={t('cmpStart')} onClose={() => setDialog(null)}
          run={async () => { await api('POST', `/outreach/campaigns/${id}/start`, { acknowledgeWarnings: ack }); reload(); }} />
      )}
      {dialog === 'cancel' && (
        <ConfirmAction title={t('cmpCancel')} danger needReason={false} confirmLabel={t('cmpCancel')} onClose={() => setDialog(null)}
          run={async () => { await api('POST', `/outreach/campaigns/${id}/cancel`, {}); reload(); }} />
      )}
      {dialog === 'delete' && (
        <ConfirmAction title={t('cmpDelete')} danger needReason={false} confirmLabel={t('cmpDelete')} onClose={(ok) => { setDialog(null); if (ok) onBack(); }}
          run={() => api('DELETE', `/outreach/campaigns/${id}`)} />
      )}
    </>
  );
}

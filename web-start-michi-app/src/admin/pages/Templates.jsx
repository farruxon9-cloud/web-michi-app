import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, PageHead, Badge, useToast, errText } from '../components/ui';

/** Template keys and the main app's 7 languages (spec M). */
const KEYS = ['verification.approved', 'verification.rejected', 'verification.expiring', 'listing.expiring', 'ticket.replied', 'license.approved', 'license.rejected'];
const LANGS = [['ja', '日本語'], ['uz', 'Oʻzbek'], ['en', 'English'], ['ru', 'Русский'], ['zh', '中文'], ['vi', 'Tiếng Việt'], ['ne', 'नेपाली']];
const PLACEHOLDERS = ['name', 'companyName', 'note', 'date', 'days', 'title'];
const MAX_SUBJECT = 200;
const MAX_BODY = 5000;

const tplKey = (k) => `tpl_${k.replace('.', '_')}`;

export default function Templates({ admin }) {
  const { t } = useT();
  const toast = useToast();
  const { data, error, loading, reload } = useApi('/settings/templates');
  const [tpl, setTpl] = useState({});
  const [key, setKey] = useState(KEYS[0]);
  const [lang, setLang] = useState('ja');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);
  const canEdit = admin.perms.includes('content.edit');
  const keys = (data && Array.isArray(data.keys) && data.keys.length ? data.keys : KEYS);

  useEffect(() => {
    if (!data) return;
    const src = data.templates || data.emailTemplates || (Array.isArray(data) ? {} : data);
    setTpl(src && typeof src === 'object' && !Array.isArray(src) ? JSON.parse(JSON.stringify(src)) : {});
    setDirty(false);
  }, [data]);

  const cur = (tpl[key] && tpl[key][lang]) || { subject: '', body: '' };
  const set = (field, value) => {
    setTpl((p) => ({ ...p, [key]: { ...(p[key] || {}), [lang]: { subject: '', body: '', ...((p[key] || {})[lang] || {}), [field]: value } } }));
    setDirty(true);
  };
  const filled = (k, l) => { const x = tpl[k] && tpl[k][l]; return Boolean(x && (x.subject || '').trim() && (x.body || '').trim()); };

  const insert = (ph) => {
    const token = `{{${ph}}}`;
    const el = bodyRef.current;
    const body = cur.body || '';
    if (el && typeof el.selectionStart === 'number') {
      const s = el.selectionStart; const e = el.selectionEnd;
      set('body', (body.slice(0, s) + token + body.slice(e)).slice(0, MAX_BODY));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + token.length, s + token.length); });
    } else set('body', (body + token).slice(0, MAX_BODY));
  };

  const save = async () => {
    setBusy(true);
    try {
      // Drop empty language entries so the server falls back (ja → en) instead of sending blank mail.
      const clean = Object.fromEntries(Object.entries(tpl).map(([k, v]) => [k, Object.fromEntries(Object.entries(v || {}).filter(([, x]) => x && ((x.subject || '').trim() || (x.body || '').trim())))]).filter(([, v]) => Object.keys(v).length));
      await api('PUT', '/settings/templates', { templates: clean, reason: 'email templates' });
      toast(t('saved'));
      setDirty(false);
      reload();
    } catch (e) { toast(errText(e, t), 'bad'); }
    setBusy(false);
  };

  return (
    <>
      <PageHead title={t('nav_templates')} sub={t('templatesSub')}>
        {dirty && <Badge kind="warn">● {t('unsaved')}</Badge>}
        <button id="tpl-save" type="button" className="btn btn-primary" disabled={!canEdit || !dirty || busy || (cur.subject || '').length > MAX_SUBJECT} onClick={save}>{t('save')}</button>
      </PageHead>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <div className="tpl-layout">
          <nav className="card tpl-keys" aria-label={t('templateKey')}>
            {keys.map((k) => (
              <button key={k} type="button" className={`tpl-key${k === key ? ' is-on' : ''}`} onClick={() => setKey(k)}>
                <span>{t(tplKey(k)) === tplKey(k) ? k : t(tplKey(k))}</span>
                <span className="tpl-count">{LANGS.filter(([l]) => filled(k, l)).length}/{LANGS.length}</span>
              </button>
            ))}
          </nav>
          <section className="card">
            <div className="row-between" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
              <div><h2 style={{ margin: 0 }}>{t(tplKey(key)) === tplKey(key) ? key : t(tplKey(key))}</h2><div className="mono small muted">{key}</div></div>
            </div>
            <div className="seg tpl-langs" role="tablist" aria-label="Language">
              {LANGS.map(([l, label]) => (
                <button key={l} id={`tpl-lang-${l}`} type="button" role="tab" aria-selected={lang === l} className={lang === l ? 'is-on' : ''} onClick={() => setLang(l)}>
                  <i className={`fill-dot${filled(key, l) ? ' is-on' : ''}`} aria-hidden="true" />{label}
                </button>
              ))}
            </div>
            <div className="field mt">
              <label htmlFor="tpl-subject">{t('subject')}</label>
              <input id="tpl-subject" className="input" maxLength={MAX_SUBJECT} value={cur.subject || ''} disabled={!canEdit} onChange={(e) => set('subject', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="tpl-body">{t('body')}</label>
              <textarea id="tpl-body" ref={bodyRef} className="textarea" rows={10} maxLength={MAX_BODY} value={cur.body || ''} disabled={!canEdit} onChange={(e) => set('body', e.target.value)} />
              <span className="small muted" style={{ alignSelf: 'flex-end' }}>{(cur.body || '').length} / {MAX_BODY}</span>
            </div>
            <div className="small muted" style={{ marginBottom: 6 }}>{t('placeholders')}</div>
            <div className="chip-row" style={{ marginTop: 0 }}>
              {PLACEHOLDERS.map((p) => <button key={p} type="button" className="chip-btn mono" disabled={!canEdit} onClick={() => insert(p)} title={t(`ph_${p}`)}>{`{{${p}}}`}</button>)}
            </div>
            <p className="small muted mt">{t('templatesFallback')}</p>
          </section>
        </div>
      )}
    </>
  );
}

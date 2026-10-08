import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, auth, clearSession, hasSession, setLogoutHandler } from './api';
import { I18nCtx, makeT, LANGS, useT } from './i18n';
import { ToastProvider, Loading, isMissing, useInterval } from './components/ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Companies from './pages/Companies';
import Listings from './pages/Listings';
import { Applications, Reports, Audit } from './pages/Records';
import Referrals from './pages/Referrals';
import { Notifications, Content } from './pages/Content';
import Preview from './pages/Preview';
import { System, Admins } from './pages/System';
import Tickets from './pages/Tickets';
import Fraud from './pages/Fraud';
import Analytics from './pages/Analytics';
import Licenses from './pages/Licenses';
import AiMonitor from './pages/AiMonitor';
import Deletions from './pages/Deletions';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import Messages from './pages/Messages';

/** Pages, the permission that unlocks each, and its icon. Order = sidebar order. */
const PAGES = [
  ['dashboard', 'dashboard.view', '◎', Dashboard],
  ['analytics', 'dashboard.view', '📈', Analytics],
  ['users', 'users.read', '👥', Users],
  ['companies', 'companies.verify', '⭐', Companies],
  ['licenses', 'licenses.review', '🪪', Licenses],
  ['listings', 'listings.moderate', '🗂', Listings],
  ['applications', 'applications.read', '📨', Applications],
  ['reports', 'reports.handle', '🚩', Reports],
  ['fraud', 'fraud.review', '🕵', Fraud],
  ['tickets', 'support.handle', '💬', Tickets],
  ['referrals', 'referrals.read', '¥', Referrals],
  ['notifications', 'notify.broadcast', '📣', Notifications],
  ['content', 'content.edit', '🎛', Content],
  ['templates', 'content.edit', '✉', Templates],
  ['campaigns', 'outreach.read', '📨', Campaigns],
  ['messages', 'outreach.read', '📬', Messages],
  ['preview', 'dashboard.view', '📱', Preview],
  ['deletions', 'users.read', '🗑', Deletions],
  ['audit', 'audit.read', '🧾', Audit],
  ['ai', 'system.health', '🤖', AiMonitor],
  ['system', 'system.health', '🖥', System],
  ['admins', 'admins.manage', '🔐', Admins],
];

/** GET /badges field → sidebar page key. */
const BADGE_KEYS = { companiesPending: 'companies', reportsOpen: 'reports', ticketsOpen: 'tickets', fraudOpen: 'fraud', licensesPending: 'licenses', listingsPending: 'listings', deletionsScheduled: 'deletions' };

const readHash = () => (window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');

function Shell({ admin, onLogout }) {
  const { t, lang, setLang } = useT();
  const [page, setPage] = useState(readHash);
  const [menu, setMenu] = useState(false);
  const allowed = useMemo(() => PAGES.filter(([, perm]) => admin.perms.includes(perm)), [admin]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const onHash = () => { setPage(readHash()); setMenu(false); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const badgesMissing = useRef(false);
  const loadCounts = useCallback(() => {
    if (!admin.perms.includes('dashboard.view')) return;
    const fromStats = () => api('GET', '/stats').then((s) => setCounts({ reports: s.reports.open, companies: s.users.pendingVerification })).catch(() => {});
    if (badgesMissing.current) { fromStats(); return; }
    api('GET', '/badges')
      .then((b) => setCounts(Object.fromEntries(Object.entries(BADGE_KEYS).map(([f, k]) => [k, Number(b[f]) || 0]))))
      .catch((e) => { if (isMissing(e)) { badgesMissing.current = true; fromStats(); } });
  }, [admin]);
  useEffect(() => { loadCounts(); }, [loadCounts, page]);
  useInterval(loadCounts, 60000);
  useEffect(() => {
    const onFocus = () => loadCounts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadCounts]);

  const current = allowed.find(([k]) => k === page) || allowed[0];
  const Page = current ? current[3] : null;
  useEffect(() => { if (current) document.title = `${t(`nav_${current[0]}`)} · Michi Admin`; }, [current, t]);

  return (
    <div className="adm-shell">
      <aside className={`adm-side${menu ? ' is-open' : ''}`} aria-label="Admin navigation">
        <div className="adm-brand"><span className="adm-logo" aria-hidden="true">道</span>{t('appName')}</div>
        <nav>
          {allowed.map(([k, , icon]) => (
            <button key={k} id={`nav-${k}`} type="button" className={`adm-nav-btn${current && current[0] === k ? ' is-active' : ''}`} onClick={() => { window.location.hash = `/${k}`; }}>
              <span aria-hidden="true" style={{ width: 18, textAlign: 'center' }}>{icon}</span>{t(`nav_${k}`)}
              {counts[k] > 0 && <span className="adm-nav-badge">{counts[k]}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <div className="adm-me"><strong>{admin.fullName || admin.email}</strong>{admin.email} · {admin.role}</div>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
            {LANGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <button id="logout" type="button" className="btn" onClick={onLogout}>{t('logout')}</button>
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="adm-mobile-bar">
          <button type="button" className="btn btn-sm" onClick={() => setMenu((v) => !v)} aria-label="Menu">☰</button>
          <strong>{current ? t(`nav_${current[0]}`) : ''}</strong>
        </div>
        <main className="adm-main" onClick={() => menu && setMenu(false)}>
          {Page ? <Page admin={admin} /> : <div className="empty">{t('noPerm')}</div>}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLangState] = useState(() => localStorage.getItem('michi_admin_lang') || 'ja');
  const setLang = useCallback((l) => { setLangState(l); localStorage.setItem('michi_admin_lang', l); document.documentElement.lang = l; }, []);
  const i18n = useMemo(() => ({ t: makeT(lang), lang, setLang }), [lang, setLang]);
  const [admin, setAdmin] = useState(null);
  const [booting, setBooting] = useState(hasSession());
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setLogoutHandler(() => { setAdmin(null); setExpired(true); });
    if (!hasSession()) return;
    api('GET', '/me').then((d) => setAdmin(d.admin)).catch(() => clearSession()).finally(() => setBooting(false));
  }, []);

  const logout = async () => { await auth.logout(); clearSession(); setAdmin(null); };

  return (
    <I18nCtx.Provider value={i18n}>
      <ToastProvider>
        {booting ? <Loading /> : admin ? <Shell admin={admin} onLogout={logout} /> : (
          <>
            {expired && <div className="alert alert-warn" style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>{i18n.t('sessionExpired')}</div>}
            <Login onDone={(a) => { setExpired(false); setAdmin(a); }} />
          </>
        )}
      </ToastProvider>
    </I18nCtx.Provider>
  );
}

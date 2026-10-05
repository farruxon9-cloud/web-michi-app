import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, Empty, PageHead, fmtDate, Badge, ConfirmAction } from '../components/ui';
import { UserDrawer } from './Users';
import { ListingDrawer } from './Listings';

const SEVERITY = [['high', 'bad'], ['medium', 'warn'], ['low', '']];
const TYPES = ['dup_phone', 'ip_cluster', 'salary_outlier', 'keyword'];

export default function Fraud({ admin }) {
  const { t } = useT();
  const { data, error, loading, reload } = useApi('/fraud');
  const [dialog, setDialog] = useState(null);
  const [user, setUser] = useState(null);
  const [listing, setListing] = useState(null);
  const items = (data && data.items) || [];
  const canUsers = admin.perms.includes('users.read');
  const canListings = admin.perms.includes('listings.moderate');

  const review = (x, status) => setDialog({
    title: `${t(status === 'dismissed' ? 'dismiss' : 'markActioned')} · ${x.title || x.key}`,
    sub: status === 'dismissed' ? t('dismissSub') : t('actionedSub'),
    danger: false,
    confirmLabel: t(status === 'dismissed' ? 'dismiss' : 'markActioned'),
    run: ({ reason }) => api('POST', `/fraud/${encodeURIComponent(x.key)}/review`, { status, note: reason, reason }),
  });

  return (
    <>
      <PageHead title={t('nav_fraud')} sub={t('fraudSub')}>
        <button type="button" className="btn btn-sm" onClick={reload}>↻ {t('reload')}</button>
      </PageHead>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (items.length === 0 ? <Empty>{t('fraudEmpty')}</Empty> : (
        SEVERITY.map(([sev, kind]) => {
          const group = items.filter((x) => (x.severity || 'low') === sev);
          if (!group.length) return null;
          return (
            <section key={sev} className="sev-group" id={`fraud-${sev}`}>
              <div className="section-title row" style={{ marginTop: 6 }}><span className={`sev-dot is-${sev}`} aria-hidden="true" />{t(`sev_${sev}`)} · {group.length}</div>
              <div className="card-grid">
                {group.map((x) => (
                  <article key={x.key} className={`card sev-card is-${sev}`}>
                    <div className="row-between">
                      <Badge kind={kind || 'accent'}>{TYPES.includes(x.type) ? t(`ft_${x.type}`) : x.type}</Badge>
                      <span className="small muted">{fmtDate(x.createdAt)}</span>
                    </div>
                    <div className="cell-main" style={{ marginTop: 8 }}>{x.title}</div>
                    {x.detail && <div className="small muted pre" style={{ marginTop: 4 }}>{x.detail}</div>}
                    {((x.userIds && x.userIds.length > 0) || x.listingId) && (
                      <div className="chip-row">
                        {(x.userIds || []).map((uid) => (
                          canUsers
                            ? <button key={uid} type="button" className="chip-btn" onClick={() => setUser(uid)}>👤 <span className="mono">{uid}</span></button>
                            : <Badge key={uid}>👤 {uid}</Badge>
                        ))}
                        {x.listingId && (canListings
                          ? <button type="button" className="chip-btn" onClick={() => setListing(x.listingId)}>🗂 <span className="mono">{x.listingId}</span></button>
                          : <Badge>🗂 {x.listingId}</Badge>)}
                      </div>
                    )}
                    <div className="action-row" style={{ marginTop: 12 }}>
                      <button type="button" className="btn btn-sm" onClick={() => review(x, 'dismissed')}>{t('dismiss')}</button>
                      <button type="button" className="btn btn-sm btn-ok" onClick={() => review(x, 'actioned')}>✓ {t('markActioned')}</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      ))}
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
      {user && <UserDrawer id={user} admin={admin} onClose={() => setUser(null)} onChanged={reload} />}
      {listing && <ListingDrawer type="jobs" id={listing} admin={admin} onClose={() => setListing(null)} onChanged={reload} />}
    </>
  );
}

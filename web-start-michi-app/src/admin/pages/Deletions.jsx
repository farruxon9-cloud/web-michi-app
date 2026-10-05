import { useState } from 'react';
import { useT } from '../i18n';
import { api } from '../api';
import { useApi, Loading, LoadError, Empty, PageHead, fmtDate, Badge, ConfirmAction } from '../components/ui';

/** Days left until `deleteAt` (negative = overdue, the sweep will pick it up). */
const daysLeft = (v) => Math.ceil((new Date(v).getTime() - Date.now()) / 864e5);

export default function Deletions({ admin }) {
  const { t } = useT();
  const { data, error, loading, reload } = useApi('/deletions');
  const [dialog, setDialog] = useState(null);
  const canExecute = admin.perms.includes('users.delete');
  const canCancel = admin.perms.includes('users.disable') || canExecute;
  // Accept { userId, email, deletion:{...} } and flat rows.
  const items = ((data && data.items) || []).map((x) => {
    const d = x.deletion || x;
    return { uid: x.userId || x.id, name: x.fullName || x.companyName || '', email: x.email || '', role: x.role || '', requestedAt: d.requestedAt, deleteAt: d.deleteAt, reason: d.reason || '' };
  });

  const execute = (x) => setDialog({
    title: `${t('executeNow')} · ${x.email || x.uid}`, sub: t('deleteWarn'), danger: true, needTotp: true, confirmLabel: t('executeNow'),
    run: ({ reason, totp }) => api('POST', `/deletions/${x.uid}/execute`, { reason, totp }),
  });
  const cancel = (x) => setDialog({
    title: `${t('cancelDeletion')} · ${x.email || x.uid}`, confirmLabel: t('cancelDeletion'),
    run: ({ reason }) => api('POST', `/deletions/${x.uid}/cancel`, { reason }),
  });

  return (
    <>
      <PageHead title={t('nav_deletions')} sub={t('deletionsSub')}>
        <button type="button" className="btn btn-sm" onClick={reload}>↻ {t('reload')}</button>
      </PageHead>
      <LoadError error={error} onRetry={reload} />
      {loading && !data ? <Loading /> : data && (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>{t('name')}</th><th>{t('requested')}</th><th>{t('deleteAt')}</th><th>{t('reason').split('（')[0].split(' (')[0]}</th><th>{t('actions')}</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
              {items.map((x) => {
                const left = x.deleteAt ? daysLeft(x.deleteAt) : null;
                return (
                  <tr key={x.uid}>
                    <td>
                      <div className="cell-main">{x.name || x.email || '—'}</div>
                      <div className="cell-sub">{x.email}{x.role ? ` · ${t(x.role)}` : ''} · <span className="mono">{x.uid}</span></div>
                    </td>
                    <td className="small">{fmtDate(x.requestedAt)}</td>
                    <td>
                      <div className="small">{fmtDate(x.deleteAt)}</div>
                      {left !== null && <Badge kind={left <= 3 ? 'bad' : 'warn'}>{left > 0 ? t('inDays').replace('{n}', left) : t('overdue')}</Badge>}
                    </td>
                    <td className="small pre">{x.reason || '—'}</td>
                    <td>
                      <div className="action-row">
                        {canCancel && <button type="button" className="btn btn-sm" onClick={() => cancel(x)}>{t('cancelDeletion')}</button>}
                        {canExecute && <button type="button" className="btn btn-sm btn-danger" onClick={() => execute(x)}>{t('executeNow')}</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {dialog && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </>
  );
}

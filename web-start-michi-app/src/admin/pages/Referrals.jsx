import { useState } from 'react';
import { useT } from '../i18n';
import { api, download } from '../api';
import { useApi, Loading, ErrorBox, Empty, PageHead, Seg, SearchBox, Pager, fmtDate, fmtYen, StatusBadge, ConfirmAction, useToast, errText } from '../components/ui';

const EMPTY = { referrerName: '', candidateName: '', companyName: '', amount: '', hiredAt: '', conditionMonths: '3', note: '' };

function AddDialog({ onClose }) {
  const { t } = useT();
  const [f, setF] = useState(EMPTY);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <ConfirmAction
      title={t('addReferral')} needReason={false} onClose={onClose}
      extraValid={f.referrerName.trim().length > 0 && f.candidateName.trim().length > 0}
      run={() => api('POST', '/referrals', { ...f, amount: Number(f.amount) || 0, conditionMonths: Number(f.conditionMonths) || 0 })}
    >
      <div className="form-grid">
        <div className="field"><label htmlFor="rf-referrer">{t('referrer')} *</label><input id="rf-referrer" className="input" maxLength={120} value={f.referrerName} onChange={set('referrerName')} /></div>
        <div className="field"><label htmlFor="rf-candidate">{t('candidate')} *</label><input id="rf-candidate" className="input" maxLength={120} value={f.candidateName} onChange={set('candidateName')} /></div>
        <div className="field"><label htmlFor="rf-company">{t('company')}</label><input id="rf-company" className="input" maxLength={200} value={f.companyName} onChange={set('companyName')} /></div>
        <div className="field"><label htmlFor="rf-amount">{t('amount')}</label><input id="rf-amount" className="input" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, '') })} /></div>
        <div className="field"><label htmlFor="rf-hired">{t('hiredAt')}</label><input id="rf-hired" className="input" type="date" value={f.hiredAt} onChange={set('hiredAt')} /></div>
        <div className="field"><label htmlFor="rf-months">{t('conditionMonths')}</label><input id="rf-months" className="input" type="number" min={0} max={24} value={f.conditionMonths} onChange={set('conditionMonths')} /></div>
      </div>
      <div className="field"><label htmlFor="rf-note">{t('note')}</label><textarea id="rf-note" className="textarea" maxLength={1000} value={f.note} onChange={set('note')} /></div>
    </ConfirmAction>
  );
}

export default function Referrals({ admin }) {
  const { t } = useT();
  const toast = useToast();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const { data, error, loading, reload } = useApi(`/referrals?page=${page}&size=25&status=${status}&q=${encodeURIComponent(q)}`);
  const canPay = admin.perms.includes('referrals.payout');
  const change = (r, next) => setDialog({
    title: `${t(next === 'paid' ? 'markPaid' : `rf_${next}`)} · ${r.candidateName} (${fmtYen(r.amount)})`,
    danger: next === 'cancelled',
    run: ({ reason }) => api('PATCH', `/referrals/${r.id}`, { status: next, note: reason }),
  });
  const exportCsv = async () => {
    try { await download('/referrals/export.csv', `michi-referrals-${new Date().toISOString().slice(0, 10)}.csv`); } catch (e) { toast(errText(e, t), 'bad'); }
  };

  return (
    <>
      <PageHead title={t('nav_referrals')}>
        <button id="ref-export" type="button" className="btn" onClick={exportCsv}>⬇ {t('exportCsv')}</button>
        {canPay && <button id="ref-add" type="button" className="btn btn-primary" onClick={() => setDialog('add')}>＋ {t('addReferral')}</button>}
      </PageHead>
      {data && (
        <div className="totals">
          {['pending', 'eligible', 'paid'].map((k) => (
            <div key={k} className="card kpi"><div className="kpi-label">{t(`rf_${k}`)}</div><div className="kpi-value">{fmtYen(data.totals[k])}</div></div>
          ))}
        </div>
      )}
      <div className="adm-toolbar">
        <SearchBox id="ref-search" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={t('search')} />
        <Seg label={t('status')} value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          options={[['all', t('all')], ['pending', t('rf_pending')], ['eligible', t('rf_eligible')], ['paid', t('rf_paid')], ['cancelled', t('rf_cancelled')]]} />
      </div>
      {error && <ErrorBox error={error} onRetry={reload} />}
      {loading && !data ? <Loading /> : data && (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>{t('referrer')}</th><th>{t('candidate')}</th><th>{t('amount')}</th><th>{t('hiredAt')}</th><th>{t('status')}</th>{canPay && <th>{t('actions')}</th>}</tr></thead>
              <tbody>
                {data.items.length === 0 && <tr><td colSpan={6}><Empty /></td></tr>}
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-main">{r.referrerName}</td>
                    <td><div className="cell-main">{r.candidateName}</div><div className="cell-sub">{r.companyName}</div></td>
                    <td className="mono">{fmtYen(r.amount)}</td>
                    <td className="small">{r.hiredAt || '—'}<div className="cell-sub">{r.conditionMonths} {t('conditionMonths').replace(/.*[（(]|[）)]/g, '')}</div></td>
                    <td><StatusBadge value={r.status} label={t(`rf_${r.status}`)} />{r.paidAt && <div className="cell-sub">{fmtDate(r.paidAt)}</div>}</td>
                    {canPay && (
                      <td><div className="action-row">
                        {r.status === 'pending' && <button type="button" className="btn btn-sm" onClick={() => change(r, 'eligible')}>{t('rf_eligible')}</button>}
                        {(r.status === 'pending' || r.status === 'eligible') && <button type="button" className="btn btn-sm btn-ok" onClick={() => change(r, 'paid')}>{t('markPaid')}</button>}
                        {r.status !== 'paid' && r.status !== 'cancelled' && <button type="button" className="btn btn-sm btn-ghost" onClick={() => change(r, 'cancelled')}>{t('rf_cancelled')}</button>}
                      </div></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
        </>
      )}
      {dialog === 'add' && <AddDialog onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
      {dialog && dialog !== 'add' && <ConfirmAction {...dialog} onClose={(ch) => { setDialog(null); if (ch) reload(); }} />}
    </>
  );
}

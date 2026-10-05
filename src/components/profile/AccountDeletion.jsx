// src/components/profile/AccountDeletion.jsx
// Account deletion (APPI) with a 30-day grace period:
//   POST /api/auth/me/delete-request {reason?} → user.deletion = { deleteAt }
//   POST /api/auth/me/delete-request/cancel
// <DeleteAccountSection/> lives in Settings; <DeletionBanner/> on the profile page while scheduled.
import { useState } from 'react';
import { UserX, AlertTriangle } from 'lucide-react';
import ConfirmSheet from '../ConfirmSheet';
import { requestAccountDeletion, cancelAccountDeletion } from '../../services/accountApi';
import { formatDate } from '../../utils/trustHelpers';
import '../trust.css';

export function DeletionBanner({ t, user, refreshUser }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const deleteAt = user && user.deletion && user.deletion.deleteAt;
  if (!deleteAt) return null;
  const cancel = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await cancelAccountDeletion();
      if (typeof refreshUser === 'function') await refreshUser();
    } catch { setError(t('deleteCancelFailed', 'キャンセルできませんでした。もう一度お試しください。')); }
    setBusy(false);
  };
  return (
    <div className="trust-banner" role="status" id="deletion-banner">
      <AlertTriangle size={20} color="#FF453A" style={{ flexShrink: 0 }} />
      <div>
        {t('deleteScheduledBanner', { date: formatDate(deleteAt), defaultValue: 'アカウントは {{date}} に削除されます。' })}
        {error && <div style={{ color: '#FF453A', marginTop: 4 }}>{error}</div>}
      </div>
      <button type="button" className="trust-btn" id="deletion-cancel-btn" onClick={cancel} disabled={busy}>{t('deleteCancelBtn', '削除を取り消す')}</button>
    </div>
  );
}

export function DeleteAccountSection({ t, user, refreshUser }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!user) return null;
  const scheduled = Boolean(user.deletion && user.deletion.deleteAt);

  const confirm = async () => {
    setConfirmOpen(false);
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await requestAccountDeletion();
      if (typeof refreshUser === 'function') await refreshUser();
    } catch (err) {
      setError(err && err.status === 404 ? t('featureUnavailable', 'この機能はまだ利用できません') : t('deleteRequestFailed', '削除を申請できませんでした。'));
    }
    setBusy(false);
  };

  return (
    <div className="menu-group glass squircle" style={{ padding: 0 }}>
      <h4 className="settings-section-title">{t('accountSectionTitle', 'アカウント')}</h4>
      <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {scheduled ? (
          <DeletionBanner t={t} user={user} refreshUser={refreshUser} />
        ) : (
          <>
            <p className="trust-card-desc">{t('deleteAccountDesc', 'アカウントと個人情報を削除します。申請から30日間は取り消せます。')}</p>
            <button type="button" className="trust-btn danger" id="delete-account-btn" onClick={() => setConfirmOpen(true)} disabled={busy} style={{ alignSelf: 'flex-start' }}>
              <UserX size={15} /> {t('deleteAccountBtn', 'アカウントを削除')}
            </button>
          </>
        )}
        {error && <p className="trust-notice bad" role="alert">{error}</p>}
      </div>
      <ConfirmSheet
        open={confirmOpen}
        id="delete-account-confirm"
        title={t('deleteAccountConfirmTitle', 'アカウントを削除しますか？')}
        message={t('deleteAccountConfirmMsg', '30日後にアカウント・求人・応募などのデータが完全に削除されます。30日以内ならいつでも取り消せます。')}
        confirmLabel={t('deleteAccountBtn', 'アカウントを削除')}
        cancelLabel={t('cancel', 'キャンセル')}
        onConfirm={confirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

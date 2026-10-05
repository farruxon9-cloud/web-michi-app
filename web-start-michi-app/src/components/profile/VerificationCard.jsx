// src/components/profile/VerificationCard.jsx
// Company ⭐ verification card (profile main page).
//   GET  /api/auth/me/verification → { status, eligible, missing[], requestedAt, verifiedAt, expiresAt, note, cooldownUntil }
//   POST /api/auth/me/verification → { success, user, verification } | 422 NOT_ELIGIBLE | 429 COOLDOWN | 409
// No documents are needed: the company only has to complete its profile and post ≥1 listing.
// If the GET endpoint is not deployed yet (404) the card falls back to user.verification (no checklist).
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, Clock, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';
import { getMyVerification, requestMyVerification } from '../../services/accountApi';
import { VERIFICATION_MISSING_KEYS, normalizeVerification, canRequestVerification, formatDate, missingItemTarget } from '../../utils/trustHelpers';
import '../trust.css';

export default function VerificationCard({ t, user, refreshUser, onOpenPage }) {
  const fallback = normalizeVerification(user && user.verification);
  const [vm, setVm] = useState(null); // null = loading
  const [hasChecklist, setHasChecklist] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await getMyVerification();
      setVm(normalizeVerification(data));
      setHasChecklist(true);
    } catch {
      // Not deployed (404) / offline: show the status we already know, without the checklist
      setVm(null);
      setHasChecklist(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const view = vm || fallback;
  // Without the checklist endpoint we cannot know eligibility — let the server decide (422 on POST)
  const canRequest = hasChecklist ? canRequestVerification(view) : (['none', 'rejected', 'expired'].includes(view.status) && !view.cooldownUntil);

  const request = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await requestMyVerification({});
      if (res && res.verification) setVm(normalizeVerification(res.verification));
      else setVm({ ...view, status: 'pending' });
      if (typeof refreshUser === 'function') refreshUser();
    } catch (err) {
      const data = (err && err.data) || {};
      if (err && err.code === 'NOT_ELIGIBLE') {
        setVm({ ...view, eligible: false, missing: Array.isArray(data.missing) ? data.missing : view.missing });
        setHasChecklist(true);
        setError(t('verifyNotEligible', 'まだ条件を満たしていません。下の項目を完了してください。'));
      } else if (err && err.code === 'COOLDOWN') {
        setVm({ ...view, cooldownUntil: data.retryAt || null });
        setError(t('verifyCooldown', { date: formatDate(data.retryAt), defaultValue: '{{date}} 以降に再申請できます。' }));
      } else if (err && err.code === 'ALREADY_PENDING') {
        setVm({ ...view, status: 'pending' });
      } else if (err && err.code === 'ALREADY_VERIFIED') {
        load();
      } else {
        setError(t('verifyRequestFailed'));
      }
    }
    setBusy(false);
  };

  const statusChip = {
    none: ['muted', t('verifyStatus_none', '未認証')],
    pending: ['warn', t('verifyStatus_pending', '審査中')],
    verified: ['info', t('verifyStatus_verified', '認証済み')],
    expired: ['bad', t('verifyStatus_expired', '期限切れ')],
    rejected: ['bad', t('verifyStatus_rejected', '却下')],
  }[view.status] || ['muted', ''];

  const showChecklist = hasChecklist && ['none', 'expired', 'rejected'].includes(view.status);

  return (
    <section className={`trust-card ${view.status === 'verified' ? 'trust-card-verified' : ''}`} id="verification-card" aria-labelledby="verification-card-title">
      <div className="trust-card-head">
        <span className="trust-icon-wrap"><ShieldCheck size={18} /></span>
        <h3 id="verification-card-title">{t('verifyCardTitle', 'Michi認証バッジ')}</h3>
        <span className={`trust-chip ${statusChip[0]}`} data-testid="verification-status">{statusChip[1]}</span>
      </div>

      {view.status === 'verified' && (
        <p className="trust-notice info">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <VerifiedBadge size={16} verifiedAt={view.verifiedAt} /> {t('verifyVerifiedText', '求人に⭐認証バッジが表示されています。')}
          </span>
          {view.expiresAt && <span>{t('verifyValidUntil', { date: formatDate(view.expiresAt), defaultValue: '有効期限: {{date}}' })}</span>}
        </p>
      )}

      {view.status === 'pending' && (
        <p className="trust-notice warn">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {t('verifyPendingText', 'Michiが審査中です。通常1〜2営業日で結果をお知らせします。')}</span>
        </p>
      )}

      {view.status === 'expired' && (
        <p className="trust-notice bad">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><RefreshCw size={14} /> {t('verifyExpiredText', { date: formatDate(view.expiresAt), defaultValue: '認証バッジの有効期限が切れました（{{date}}）。再申請してください。' })}</span>
        </p>
      )}

      {view.status === 'rejected' && (
        <div className="trust-notice bad" role="status">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> {t('verifyRejectedNote')}</strong>
          {view.note && <span>{t('moderationReasonLabel')}: {view.note}</span>}
          {view.cooldownUntil && <span>{t('verifyCooldown', { date: formatDate(view.cooldownUntil), defaultValue: '{{date}} 以降に再申請できます。' })}</span>}
        </div>
      )}

      {view.status === 'none' && <p className="trust-card-desc">{t('verifyIntro', '書類は不要です。会社情報を入力し、求人を1件以上掲載すると申請できます。認証は12か月有効です。')}</p>}

      {showChecklist && (
        <ul className="trust-checklist" aria-label={t('verifyChecklistTitle', '申請の条件')}>
          {VERIFICATION_MISSING_KEYS.map((key) => {
            const done = !view.missing.includes(key);
            return (
              <li key={key} className={`trust-check-item ${done ? 'done' : 'todo'}`} data-testid={`verify-item-${key}`}>
                {done ? <CheckCircle2 size={18} color="#30D158" /> : <Circle size={18} color="#8E8E93" />}
                <span className="trust-check-label">{t(`verifyMissing_${key}`)}</span>
                {!done && (
                  <button type="button" className="trust-btn" id={`verify-fix-${key}`} onClick={() => onOpenPage && onOpenPage(missingItemTarget(key) === 'post_job' ? 'my_ads' : 'personalInfo')}>
                    {key === 'listing' ? t('verifyActionPostJob', '求人を掲載') : t('verifyActionFix', '入力する')}
                    <ChevronRight size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="trust-notice bad" role="alert">{error}</p>}

      {canRequest && (
        <button type="button" className="trust-btn-primary" id="verify-request-btn" onClick={request} disabled={busy}>
          {busy ? t('sending', '送信中…') : (view.status === 'none' ? t('verifyGetBadge', '⭐ 認証バッジを申請') : t('verifyRequestAgain'))}
        </button>
      )}
    </section>
  );
}

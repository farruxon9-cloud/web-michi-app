// src/components/profile/DriverLicenseCard.jsx
// Driver licence check (driver profile):
//   GET  /api/auth/me/license → { license: { type, expiresAt, status, note } | null }
//   POST /api/auth/me/license { type, expiresAt:'YYYY-MM-DD', image: dataUrl ≤2MB } → status 'pending'
// The photo is private (admins only) and deleted right after the review; only type/expiry/status stay.
// Hidden quietly while the endpoint is not deployed (404).
import { useCallback, useEffect, useRef, useState } from 'react';
import { IdCard, Camera, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getMyLicense, submitMyLicense, isNotDeployed } from '../../services/accountApi';
import { LICENSE_TYPES, licenseTypeLabel, licenseEffectiveStatus, formatDate } from '../../utils/trustHelpers';
import { resizeLicenseImage } from '../../utils/licenseImage';
import '../trust.css';

const CHIP = { none: 'muted', pending: 'warn', verified: 'ok', rejected: 'bad', expired: 'bad' };

export default function DriverLicenseCard({ t, refreshUser }) {
  const [available, setAvailable] = useState(true);
  const [license, setLicense] = useState(null);
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyLicense();
      const lic = data && typeof data === 'object' && 'license' in data ? data.license : data;
      setLicense(lic && lic.type ? lic : null);
    } catch (err) {
      if (isNotDeployed(err)) setAvailable(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!available) return null;

  const status = licenseEffectiveStatus(license);
  const showForm = editing || status === 'none';

  const onPickFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      setImage(await resizeLicenseImage(file));
    } catch {
      setError(t('licensePhotoError', '写真を読み込めませんでした。別の画像をお試しください。'));
    }
  };

  const submit = async () => {
    if (busy) return;
    if (!type || !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt) || !image) {
      setError(t('licenseFormIncomplete', '種類・有効期限・写真をすべて入力してください。'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await submitMyLicense({ type, expiresAt, image });
      const lic = (res && (res.license || (res.user && res.user.license))) || { type, expiresAt, status: 'pending' };
      setLicense({ ...lic, status: lic.status || 'pending' });
      setEditing(false);
      setImage('');
      if (typeof refreshUser === 'function') refreshUser();
    } catch (err) {
      setError(err && err.status === 413 ? t('licensePhotoTooLarge', '写真が大きすぎます（2MBまで）。') : t('licenseSubmitFailed', '送信できませんでした。もう一度お試しください。'));
    }
    setBusy(false);
  };

  const startEdit = () => {
    setType(license?.type || '');
    setExpiresAt(license?.expiresAt ? String(license.expiresAt).slice(0, 10) : '');
    setImage('');
    setError('');
    setEditing(true);
  };

  return (
    <section className="trust-card" id="driver-license-card" aria-labelledby="driver-license-title">
      <div className="trust-card-head">
        <span className="trust-icon-wrap" style={{ background: 'rgba(48, 209, 88, 0.12)', color: '#30D158' }}><IdCard size={18} /></span>
        <h3 id="driver-license-title">{t('licenseCardTitle', '運転免許証の確認')}</h3>
        <span className={`trust-chip ${CHIP[status]}`} data-testid="license-status">{t(`licenseStatus_${status}`)}</span>
      </div>

      {license && !showForm && (
        <div className="trust-check-item" style={{ flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 15 }}>{licenseTypeLabel(license.type)}</strong>
          {license.expiresAt && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('licenseExpiresLabel', '有効期限')}: {formatDate(`${String(license.expiresAt).slice(0, 10)}T00:00:00`)}</span>}
        </div>
      )}

      {!showForm && status === 'pending' && (
        <p className="trust-notice warn"><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Clock size={14} /> {t('licensePendingText', 'Michiが確認中です。確認後、写真は削除されます。')}</span></p>
      )}
      {!showForm && status === 'verified' && (
        <p className="trust-notice ok"><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><CheckCircle2 size={14} /> {t('licenseVerifiedText', '免許証が確認されました。応募先の企業に「免許確認済み」と表示されます。')}</span></p>
      )}
      {!showForm && status === 'rejected' && (
        <div className="trust-notice bad">
          <strong style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><AlertTriangle size={14} /> {t('licenseRejectedText', '確認できませんでした。もう一度提出してください。')}</strong>
          {license && license.note && <span>{t('moderationReasonLabel')}: {license.note}</span>}
        </div>
      )}
      {!showForm && status === 'expired' && (
        <p className="trust-notice bad">{t('licenseExpiredText', '免許証の有効期限が切れています。更新後の免許証を提出してください。')}</p>
      )}

      {showForm && (
        <>
          <p className="trust-card-desc">{t('licenseIntro', '免許証の写真は審査担当者のみが確認し、確認後すぐに削除されます。')}</p>
          <label className="trust-field">
            <span>{t('licenseTypeLabel', '免許の種類')}</span>
            <select className="trust-select" id="license-type-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">{t('selectPlaceholder', '選択してください')}</option>
              {LICENSE_TYPES.map((l) => <option key={l.id} value={l.id}>{l.ja}</option>)}
            </select>
          </label>
          <label className="trust-field">
            <span>{t('licenseExpiresLabel', '有効期限')}</span>
            <input className="trust-input" id="license-expiry-input" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </label>
          <div className="trust-field">
            <span>{t('licensePhotoLabel', '免許証の写真（表面）')}</span>
            <button type="button" className="trust-photo-drop" id="license-photo-btn" onClick={() => fileRef.current && fileRef.current.click()}>
              {image ? <img src={image} alt={t('licensePhotoLabel', '免許証の写真（表面）')} /> : (<><Camera size={18} /> {t('licensePhotoPick', '写真を選ぶ')}</>)}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickFile} data-testid="license-photo-input" />
          </div>
          {error && <p className="trust-notice bad" role="alert">{error}</p>}
          <div className="support-actions">
            {editing && <button type="button" className="trust-btn" onClick={() => setEditing(false)}>{t('cancel', 'キャンセル')}</button>}
            <button type="button" className="trust-btn-primary" id="license-submit-btn" onClick={submit} disabled={busy}>
              {busy ? t('sending', '送信中…') : t('licenseSubmit', '確認を依頼する')}
            </button>
          </div>
        </>
      )}

      {!showForm && status !== 'pending' && (
        <button type="button" className="trust-btn" id="license-update-btn" onClick={startEdit} style={{ alignSelf: 'flex-start' }}>
          {t('licenseUpdate', '免許証を再提出')}
        </button>
      )}
    </section>
  );
}

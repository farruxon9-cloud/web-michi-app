import React, { useState, useEffect } from 'react';
import { MailCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendEmailOtpViaN8n, verifyEmailOtpCode } from '../../services/n8nEmailOtpService';

export default function N8nEmailOtpWidget({
  email,
  isEmailVerified,
  setIsEmailVerified
}) {
  const { t } = useTranslation();
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendInlineOtp = async () => {
    if (!email || !email.includes('@')) {
      setOtpErrorMsg(t('validEmailRequired', '有効なメールアドレスを入力してください。'));
      return;
    }
    setOtpErrorMsg('');
    setOtpSuccessMsg('');
    setOtpSending(true);

    try {
      const res = await sendEmailOtpViaN8n(email);
      setOtpSending(false);
      if (res.success) {
        setOtpSent(true);
        setOtpCooldown(res.cooldownSeconds || 60);
        setOtpSuccessMsg(t('otpSentSuccess', '確認コードをメールに送信しました！'));
      } else {
        setOtpErrorMsg(t(res.messageKey || 'invalidEmail', 'メールアドレスを確認してください'));
      }
    } catch (err) {
      setOtpSending(false);
      setOtpErrorMsg(t('validEmailRequired', '有効なメールアドレスを入力してください。'));
    }
  };

  const handleVerifyInlineOtp = (overrideCode) => {
    const targetCode = typeof overrideCode === 'string' ? overrideCode : otpCodeInput;
    if (!targetCode || targetCode.length !== 6) {
      setOtpErrorMsg(t('enter6DigitCode', '6桁の確認コードを入力してください。'));
      return;
    }
    setOtpErrorMsg('');
    setOtpSuccessMsg('');
    
    const res = verifyEmailOtpCode(email, targetCode);
    if (res.success) {
      setIsEmailVerified(true);
      setOtpSuccessMsg(t('emailVerifiedSuccess', '✅ メールアドレスが正常に認証されました！'));
    } else {
      const remaining = res.remainingAttempts ?? 3;
      if (res.messageKey === 'otpExpired') {
        setOtpErrorMsg(t('otpExpired', '認証コードの期限が切れています。再送信してください。'));
      } else if (res.messageKey === 'otpMaxAttemptsExceeded') {
        setOtpErrorMsg(t('otpMaxAttemptsExceeded', '試行回数が上限に達しました。新しいコードをリクエストしてください。'));
      } else {
        setOtpErrorMsg(t('invalidCodeWithRemaining', '認証コードが正しくありません。残り試行回数: {{count}}回', { count: remaining }));
      }
    }
  };

  return (
    <div className="otp-inline-widget glass squircle" style={{ padding: '12px 14px', marginBottom: '16px', borderRadius: '14px', background: 'rgba(10, 132, 255, 0.05)', border: '1px solid rgba(10, 132, 255, 0.2)' }}>
      {isEmailVerified ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#30D158', fontWeight: 'bold', fontSize: '14px', padding: '10px 14px', background: 'rgba(48, 209, 88, 0.12)', borderRadius: '12px', border: '1px solid rgba(48, 209, 88, 0.35)', boxShadow: '0 4px 12px rgba(48, 209, 88, 0.15)' }}>
          <CheckCircle2 size={20} color="#30D158" aria-hidden="true" />
          <span>{t('emailVerifiedBadge', '✅ メールアドレス認証完了')}</span>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleSendInlineOtp}
            disabled={!email || !email.includes('@') || otpSending || otpCooldown > 0}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              background: (!email || !email.includes('@') || otpCooldown > 0) ? 'rgba(142, 142, 147, 0.2)' : 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
              color: (!email || !email.includes('@') || otpCooldown > 0) ? '#8E8E93' : '#FFF',
              fontWeight: '700',
              fontSize: '13.5px',
              border: 'none',
              cursor: (!email || !email.includes('@') || otpCooldown > 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: otpCooldown > 0 ? 'none' : '0 4px 12px rgba(10, 132, 255, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <MailCheck size={16} aria-hidden="true" />
            {otpSending ? t('sendingCode', '送信中...') : otpCooldown > 0 ? `${t('resendCode', '再送信')} (${otpCooldown}s)` : otpSent ? t('resendOtp', 'コードを再送信') : t('sendOtpBtn', 'コードを送信')}
          </button>

          {otpSent && !isEmailVerified && (
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center', width: '100%' }}>
              <input
                type="text"
                maxLength={6}
                placeholder={t('otpInputPlaceholder', '6桁の認証コード')}
                value={otpCodeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtpCodeInput(val);
                  if (val.length === 6) {
                    handleVerifyInlineOtp(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerifyInlineOtp();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(10, 132, 255, 0.35)',
                  background: 'var(--card-bg, #FFF)',
                  color: 'var(--text-main)',
                  fontSize: '16px',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(10, 132, 255, 0.08)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => handleVerifyInlineOtp()}
                disabled={otpCodeInput.length !== 6}
                style={{
                  height: '44px',
                  minWidth: '105px',
                  whiteSpace: 'nowrap',
                  padding: '0 16px',
                  background: otpCodeInput.length === 6 ? 'linear-gradient(135deg, #30D158 0%, #28CD41 100%)' : 'rgba(142, 142, 147, 0.2)',
                  color: otpCodeInput.length === 6 ? '#FFF' : '#8E8E93',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: otpCodeInput.length === 6 ? 'pointer' : 'not-allowed',
                  boxShadow: otpCodeInput.length === 6 ? '0 4px 12px rgba(48, 209, 88, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{t('verifyBtn', '認証する')}</span>
              </button>
            </div>
          )}

          {otpErrorMsg && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#FF3B30', fontWeight: '600' }}>
              ⚠️ {otpErrorMsg}
            </div>
          )}
          {otpSuccessMsg && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#30D158', fontWeight: '600' }}>
              {otpSuccessMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

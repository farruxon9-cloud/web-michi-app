import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Loader2, Sparkles, X, User, Building2, GraduationCap, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendEmailOtpViaN8n, verifyEmailOtpCodeViaN8n, isValidEmail } from '../services/n8nEmailOtpService';
import './EmailOtpAuthModal.css';

export default function EmailOtpAuthModal({ isOpen, onClose, onSuccess, initialRole = 'driver' }) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(initialRole || 'driver');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  const inputRefs = useRef([]);
  const successTimerRef = useRef(null);

  // 1. Modal ochilganda Escape bilan yopish va Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [isOpen, loading, onClose]);

  // 2. Qayta yuborish taymeri (Cooldown)
  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // 3. Modal holatini qayta tiklash
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setErrorMsg('');
      setInfoMsg('');
      setLoading(false);
      setOtpDigits(['', '', '', '', '', '']);
      setSessionId(null);
      setRole(initialRole || 'driver');
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  // Ko'p tilli lokalizatsiya lug'ati
  const localizedTexts = {
    ja: {
      emailInvalid: '有効なメールアドレスを入力してください。',
      sentMsg: '確認コードをメールに送信しました。',
      codeInvalid: '6桁の確認コードをすべて入力してください。',
      serverErr: 'サーバー接続エラー。再試行してください。',
      verifyErr: '検証中にエラーが発生しました。コードをご確認ください。'
    },
    uz: {
      emailInvalid: "Noto'g'ri email formati! Iltimos, haqiqiy email kiriting.",
      sentMsg: 'Tasdiqlash kodi pochtangizga yuborildi!',
      codeInvalid: "Iltimos, 6 xonali tasdiqlash kodini to'liq kiriting.",
      serverErr: 'Server bilan aloqa uzildi. Qayta urinib ko\'ring.',
      verifyErr: 'Tasdiqlashda xatolik yuz berdi. Kodni tekshiring.'
    },
    en: {
      emailInvalid: 'Please enter a valid email address.',
      sentMsg: 'Verification code sent to your email!',
      codeInvalid: 'Please enter all 6 digits.',
      serverErr: 'Server connection failed. Please try again.',
      verifyErr: 'Verification error occurred. Check your code.'
    },
    ru: {
      emailInvalid: 'Пожалуйста, введите корректный email.',
      sentMsg: 'Код подтверждения отправлен на вашу почту!',
      codeInvalid: 'Пожалуйста, введите все 6 цифр.',
      serverErr: 'Ошибка подключения к серверу.',
      verifyErr: 'Произошла ошибка проверки. Проверьте код.'
    },
    zh: {
      emailInvalid: '请输入有效的电子邮件地址。',
      sentMsg: '验证码已发送至您的邮箱！',
      codeInvalid: '请输入完整的 6 位验证码。',
      serverErr: '服务器连接失败，请重试。',
      verifyErr: '验证过程中发生错误，请检查验证码。'
    }
  };

  const texts = localizedTexts[currentLang] || localizedTexts.ja;

  // Kodni yuborish hodisasi
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMsg(texts.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      const result = await sendEmailOtpViaN8n(cleanEmail);
      if (result?.success) {
        setStep('otp');
        setCooldown(result.cooldownSeconds || 60);
        setSessionId(result.sessionId || null);
        setInfoMsg(result.message || texts.sentMsg);
        
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
      } else {
        setErrorMsg(result?.message || texts.serverErr);
      }
    } catch (err) {
      setErrorMsg(texts.serverErr);
    } finally {
      setLoading(false);
    }
  };

  // 6 ta katakchani boshqarish
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (!cleanVal) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    newDigits[index] = cleanVal.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const filledCode = newDigits.join('');
    if (filledCode.length === 6) {
      verifyCode(filledCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '').trim();
    if (!pastedText) return;

    const digits = pastedText.substring(0, 6).split('');
    const newDigits = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 6) newDigits[i] = d;
    });
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (newDigits.join('').length === 6) {
      verifyCode(newDigits.join(''));
    } else if (inputRefs.current[digits.length]) {
      inputRefs.current[digits.length]?.focus();
    }
  };

  // Kodni tekshirish hodisasi
  const verifyCode = async (codeToVerify) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length !== 6 || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await verifyEmailOtpCodeViaN8n(email.trim().toLowerCase(), fullCode, sessionId);
      if (result?.success) {
        setStep('success');
        
        const userData = {
          email: email.trim().toLowerCase(),
          role: role,
          authenticatedAt: new Date().toISOString(),
          isEmailVerified: true
        };

        try {
          localStorage.setItem('michi_auth_user', JSON.stringify(userData));
          localStorage.setItem('michi_user_role', role);
          
          const prevProfile = JSON.parse(localStorage.getItem('michi_driver_profile') || '{}');
          localStorage.setItem('michi_driver_profile', JSON.stringify({
            ...prevProfile,
            email: userData.email,
            isVerified: true
          }));
        } catch (e) {}

        successTimerRef.current = setTimeout(() => {
          onSuccess?.(userData);
          onClose?.();
        }, 1400);
      } else {
        setErrorMsg(result?.message || texts.verifyErr);
      }
    } catch (err) {
      setErrorMsg(texts.verifyErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-otp-modal-overlay" onClick={() => !loading && onClose?.()}>
      <div 
        role="dialog" 
        aria-modal="true" 
        className="email-otp-modal-container animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="email-otp-modal-header">
          <div className="header-brand-box">
            <div className="brand-logo-glow" aria-hidden="true">
              <Sparkles size={18} color="#FFF" />
            </div>
            <div>
              <h3 className="brand-title">Michi Auth</h3>
              <p className="brand-subtitle">
                {currentLang === 'ja'
                  ? 'メールOTP本人確認'
                  : currentLang === 'en'
                  ? 'Email OTP Verification'
                  : 'Email orqali avtorizatsiya'}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            disabled={loading}
            aria-label="Yopish"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="email-otp-steps-bar" aria-hidden="true">
          <div className={`step-dot ${step === 'email' ? 'active' : 'completed'}`}>
            <span className="dot-number">1</span>
            <span className="dot-label">{currentLang === 'ja' ? 'メール' : 'Email'}</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-dot ${step === 'otp' ? 'active' : step === 'success' ? 'completed' : ''}`}>
            <span className="dot-number">2</span>
            <span className="dot-label">{currentLang === 'ja' ? 'OTP認証' : 'OTP Code'}</span>
          </div>
        </div>

        {/* Step 1: Email & Role Form */}
        {step === 'email' && (
          <form className="email-otp-form" onSubmit={handleSendOtp}>
            <div className="form-section-title">
              {currentLang === 'ja' 
                ? 'アカウント役割の選択' 
                : currentLang === 'en' 
                ? 'Select Account Role' 
                : 'Hisob turini tanlang'}
            </div>
            
            <div className="role-selector-chips">
              <button
                type="button"
                className={`role-chip ${role === 'driver' ? 'selected' : ''}`}
                onClick={() => setRole('driver')}
              >
                <User size={15} />
                <span>{currentLang === 'ja' ? '求職者 / ドライバー' : 'Haydovchi'}</span>
              </button>

              <button
                type="button"
                className={`role-chip ${role === 'company' ? 'selected' : ''}`}
                onClick={() => setRole('company')}
              >
                <Building2 size={15} />
                <span>{currentLang === 'ja' ? '企業 / 採用担当' : 'Ish beruvchi'}</span>
              </button>

              <button
                type="button"
                className={`role-chip ${role === 'school' ? 'selected' : ''}`}
                onClick={() => setRole('school')}
              >
                <GraduationCap size={15} />
                <span>{currentLang === 'ja' ? '自動車教習所' : 'Avtomaktab'}</span>
              </button>
            </div>

            <div className="form-group-box">
              <label className="input-label">
                {currentLang === 'ja' ? '電子メールアドレス' : currentLang === 'en' ? 'Email Address' : 'Elektron pochta manzilingiz'}
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" aria-hidden="true" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="masalan: user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-field-input"
                  autoComplete="email"
                  spellCheck="false"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="auth-alert error-alert animate-shake" role="alert">
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="auth-submit-btn primary-gradient"
            >
              {loading ? (
                <span className="flex-btn-content">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{currentLang === 'ja' ? '送信中...' : 'Yuborilmoqda...'}</span>
                </span>
              ) : (
                <span className="flex-btn-content">
                  <span>{currentLang === 'ja' ? '確認コードを送信' : 'Tasdiqlash kodini yuborish'}</span>
                  <ShieldCheck size={18} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit OTP Verification Form */}
        {step === 'otp' && (
          <div className="email-otp-verification-section">
            <button 
              type="button" 
              className="back-step-btn" 
              onClick={() => setStep('email')} 
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>{currentLang === 'ja' ? 'メールアドレスの変更' : "Emailni o'zgartirish"}</span>
            </button>

            <div className="otp-instruct-box">
              <div className="otp-icon-circle" aria-hidden="true">
                <Lock size={22} color="#5E5CE6" />
              </div>
              <h4 className="otp-instruct-title">
                {currentLang === 'ja' ? '6桁の確認コードを入力' : '6 xonali tasdiqlash kodini kiriting'}
              </h4>
              <p className="otp-instruct-sub">
                <strong className="user-target-email">{email}</strong>{' '}
                {currentLang === 'ja' ? 'へお送りしたコードを入力してください。' : 'manziliga yuborilgan kodni kiriting.'}
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="otp-digits-row" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={digit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`otp-digit-box ${digit ? 'filled' : ''}`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {errorMsg && (
              <div className="auth-alert error-alert animate-shake" role="alert">
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && !errorMsg && (
              <div className="auth-alert success-alert">
                <span>{infoMsg}</span>
              </div>
            )}

            <button
              type="button"
              disabled={loading || otpDigits.join('').length !== 6}
              onClick={() => verifyCode()}
              className="auth-submit-btn primary-gradient mt-4"
            >
              {loading ? (
                <span className="flex-btn-content">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{currentLang === 'ja' ? '検証中...' : 'Tekshirilmoqda...'}</span>
                </span>
              ) : (
                <span className="flex-btn-content">
                  <CheckCircle2 size={18} />
                  <span>{currentLang === 'ja' ? '認証してログイン' : 'Tasdiqlash va kirish'}</span>
                </span>
              )}
            </button>

            {/* Resend Cooldown Countdown */}
            <div className="resend-cooldown-box">
              {cooldown > 0 ? (
                <span className="cooldown-text">
                  {currentLang === 'ja' ? `コードの再送信 (${cooldown}秒)` : `Kodni qayta yuborish (${cooldown}s)`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="resend-action-btn"
                >
                  <RefreshCw size={14} />
                  <span>{currentLang === 'ja' ? 'コードを再送信' : 'Kodni qayta yuborish'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Success Celebration State */}
        {step === 'success' && (
          <div className="email-otp-success-screen animate-scale-up">
            <div className="success-icon-pulse">
              <CheckCircle2 size={54} color="#34C759" />
            </div>
            <h3 className="success-title">
              {currentLang === 'ja' ? '認証が完了しました！' : 'Muvaffaqiyatli tasdiqlandi!'}
            </h3>
            <p className="success-sub">
              {currentLang === 'ja'
                ? 'Michi Appへようこそ。リダイレクト中...'
                : "Tizimga muvaffaqiyatli kirdingiz. Yo'naltirilmoqda..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

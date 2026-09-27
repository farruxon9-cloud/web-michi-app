import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Loader2, Sparkles, X, User, Building2, GraduationCap, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendEmailOtpViaN8n, verifyEmailOtpCode, isValidEmail } from '../services/n8nEmailOtpService';
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
  const [demoCode, setDemoCode] = useState('');

  const inputRefs = useRef([]);

  // Resend OTP Cooldown Timer
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setErrorMsg('');
      setInfoMsg('');
      setLoading(false);
      setOtpDigits(['', '', '', '', '', '']);
      setDemoCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMsg(
        currentLang === 'ja'
          ? '有効なメールアドレスを入力してください。'
          : currentLang === 'en'
          ? 'Please enter a valid email address.'
          : 'Noto\'g\'ri email formati! Iltimos, haqiqiy email kiriting.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await sendEmailOtpViaN8n(cleanEmail);
      if (result.success) {
        setStep('otp');
        setCooldown(result.cooldownSeconds || 60);
        setDemoCode(result.code || '');
        setInfoMsg(
          result.message ||
          (currentLang === 'ja'
            ? '確認コードをメールに送信しました。'
            : currentLang === 'en'
            ? 'Verification code sent to your email!'
            : 'Tasdiqlash kodi pochtangizga yuborildi!')
        );
        // Auto focus first OTP input digit after step switch
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 300);
      } else {
        setErrorMsg(result.message || 'Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    } catch (err) {
      setErrorMsg('Server bilan aloqa uzildi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit input
  const handleDigitChange = (index, value) => {
    // Only accept numeric digits
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.substring(cleanVal.length - 1); // Take last entered digit
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Auto-advance focus to next input
    if (cleanVal && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }

    // Auto verify if all 6 digits entered
    const filledCode = newDigits.join('');
    if (filledCode.length === 6) {
      verifyCode(filledCode);
    }
  };

  // Handle Backspace navigation across digits
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle Paste 6 digits into OTP inputs
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
      inputRefs.current[digits.length].focus();
    }
  };

  // Verify full OTP code
  const verifyCode = async (codeToVerify) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg(
        currentLang === 'ja'
          ? '6桁の確認コードをすべて入力してください。'
          : currentLang === 'en'
          ? 'Please enter all 6 digits.'
          : 'Iltimos, 6 xonali tasdiqlash kodini to\'liq kiriting.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = verifyEmailOtpCode(email, fullCode);
      if (result.success) {
        setStep('success');
        
        // Formulate user payload
        const userData = {
          email: email.trim().toLowerCase(),
          role: role,
          authenticatedAt: new Date().toISOString(),
          isEmailVerified: true
        };

        // Persist to local storage
        try {
          localStorage.setItem('michi_auth_user', JSON.stringify(userData));
          localStorage.setItem('michi_user_role', role);
          
          // Update profileData
          const prevProfile = JSON.parse(localStorage.getItem('michi_driver_profile') || '{}');
          localStorage.setItem('michi_driver_profile', JSON.stringify({
            ...prevProfile,
            email: userData.email,
            isVerified: true
          }));
        } catch (e) {}

        // Notify parent callback after short delay for success animation
        setTimeout(() => {
          if (onSuccess) onSuccess(userData);
          onClose();
        }, 1500);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err) {
      setErrorMsg('Tekshirishda xatolik. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-otp-modal-overlay" onClick={onClose}>
      <div className="email-otp-modal-container animate-slide-up" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="email-otp-modal-header">
          <div className="header-brand-box">
            <div className="brand-logo-glow">
              <Sparkles size={18} color="#FFF" aria-hidden="true" />
            </div>
            <div>
              <h3 className="brand-title">Michi Auth</h3>
              <p className="brand-subtitle">
                {currentLang === 'ja'
                  ? 'メールOTP本人確認'
                  : currentLang === 'en'
                  ? 'Email OTP Verification'
                  : 'Email orqali ro\'yxatdan o\'tish va kirish'}
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="email-otp-steps-bar">
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
                <User size={15} aria-hidden="true" />
                <span>{currentLang === 'ja' ? '求職者 / ドライブ' : 'Haydovchi / Mijoz'}</span>
              </button>

              <button
                type="button"
                className={`role-chip ${role === 'company' ? 'selected' : ''}`}
                onClick={() => setRole('company')}
              >
                <Building2 size={15} aria-hidden="true" />
                <span>{currentLang === 'ja' ? '企業 / 採用担当' : 'Ish beruvchi'}</span>
              </button>

              <button
                type="button"
                className={`role-chip ${role === 'school' ? 'selected' : ''}`}
                onClick={() => setRole('school')}
              >
                <GraduationCap size={15} aria-hidden="true" />
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
                />
              </div>
            </div>

            {errorMsg && (
              <div className="auth-alert error-alert animate-shake">
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
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  <span>{currentLang === 'ja' ? '送信中...' : 'Yuborilmoqda...'}</span>
                </span>
              ) : (
                <span className="flex-btn-content">
                  <span>{currentLang === 'ja' ? '確認コードを送信' : 'Tasdiqlash kodini yuborish'}</span>
                  <ShieldCheck size={18} aria-hidden="true" />
                </span>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit OTP Verification Form */}
        {step === 'otp' && (
          <div className="email-otp-verification-section">
            <button className="back-step-btn" onClick={() => setStep('email')}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{currentLang === 'ja' ? 'メールアドレスの変更' : 'Emailni o\'zgartirish'}</span>
            </button>

            <div className="otp-instruct-box">
              <div className="otp-icon-circle">
                <Lock size={22} color="#5E5CE6" aria-hidden="true" />
              </div>
              <h4 className="otp-instruct-title">
                {currentLang === 'ja' ? '6桁の確認コードを入力' : '6 xonali tasdiqlash kodini kiriting'}
              </h4>
              <p className="otp-instruct-sub">
                <strong className="user-target-email">{email}</strong>{' '}
                {currentLang === 'ja' ? 'へお送りしたコードを入力してください。' : 'manziliga n8n Webhook orqali yuborildi.'}
              </p>
            </div>

            {/* Demo Code Badge Hint */}
            {demoCode && (
              <div className="demo-otp-badge">
                <span>⚡ Test OTP kodi: <strong>{demoCode}</strong></span>
              </div>
            )}

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
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`otp-digit-box ${digit ? 'filled' : ''}`}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="auth-alert error-alert animate-shake">
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
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  <span>{currentLang === 'ja' ? '検証中...' : 'Tekshirilmoqda...'}</span>
                </span>
              ) : (
                <span className="flex-btn-content">
                  <CheckCircle2 size={18} aria-hidden="true" />
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
                  <RefreshCw size={14} aria-hidden="true" />
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
              <CheckCircle2 size={54} color="#34C759" aria-hidden="true" />
            </div>
            <h3 className="success-title">
              {currentLang === 'ja' ? '認証が完了しました！' : 'Muvaffaqiyatli tasdiqlandi!'}
            </h3>
            <p className="success-sub">
              {currentLang === 'ja'
                ? 'Michi Appへようこそ。リダイレクト中...'
                : 'Tizimga muvaffaqiyatli kirdingiz. Yo\'naltirilmoqda...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

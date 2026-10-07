import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Loader2, Sparkles, X, User, Building2, GraduationCap, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendEmailOtpViaN8n, verifyEmailOtpCodeViaN8n, isValidEmail } from '../services/n8nEmailOtpService';
import { pickText } from '../utils/localize';
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
    },
    vi: {
      emailInvalid: 'Vui lòng nhập địa chỉ email hợp lệ.',
      sentMsg: 'Mã xác minh đã được gửi đến email của bạn!',
      codeInvalid: 'Vui lòng nhập đủ 6 chữ số.',
      serverErr: 'Không thể kết nối máy chủ. Vui lòng thử lại.',
      verifyErr: 'Đã xảy ra lỗi xác minh. Vui lòng kiểm tra lại mã.'
    },
    ne: {
      emailInvalid: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।',
      sentMsg: 'प्रमाणीकरण कोड तपाईंको इमेलमा पठाइयो!',
      codeInvalid: 'कृपया सबै ६ अङ्क प्रविष्ट गर्नुहोस्।',
      serverErr: 'सर्भरसँग जडान असफल भयो। कृपया फेरि प्रयास गर्नुहोस्।',
      verifyErr: 'प्रमाणीकरणमा त्रुटि भयो। कृपया कोड जाँच गर्नुहोस्।'
    }
  };

  const texts = localizedTexts[currentLang] || localizedTexts.en;
  const tx = (map) => pickText(currentLang, map);
  // OTP yo'riqnomasi: ba'zi tillarda email jumla boshida, ba'zilarida oxirida keladi
  const otpPrefix = {
    en: 'Enter the code we sent to',
    ru: 'Введите код, отправленный на',
    zh: '请输入发送至',
    vi: 'Nhập mã đã gửi đến'
  }[currentLang] || '';
  const otpSuffix = tx({
    ja: ' へお送りしたコードを入力してください。',
    en: '.',
    uz: ' manziliga yuborilgan kodni kiriting.',
    ru: '.',
    zh: ' 的验证码。',
    vi: '.',
    ne: ' मा पठाइएको कोड प्रविष्ट गर्नुहोस्।'
  });

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
        if (result.token) {
          localStorage.setItem('michi_jwt_token', result.token);
        }
        
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
                {tx({
                  ja: 'メールOTP本人確認',
                  en: 'Email OTP Verification',
                  uz: 'Email orqali avtorizatsiya',
                  ru: 'Подтверждение по email (OTP)',
                  zh: '邮箱 OTP 验证',
                  vi: 'Xác minh OTP qua email',
                  ne: 'इमेल OTP प्रमाणीकरण'
                })}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            disabled={loading}
            aria-label={tx({ ja: '閉じる', en: 'Close', uz: 'Yopish', ru: 'Закрыть', zh: '关闭', vi: 'Đóng', ne: 'बन्द गर्नुहोस्' })}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="email-otp-steps-bar" aria-hidden="true">
          <div className={`step-dot ${step === 'email' ? 'active' : 'completed'}`}>
            <span className="dot-number">1</span>
            <span className="dot-label">{tx({ ja: 'メール', en: 'Email', uz: 'Email', ru: 'Email', zh: '邮箱', vi: 'Email', ne: 'इमेल' })}</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-dot ${step === 'otp' ? 'active' : step === 'success' ? 'completed' : ''}`}>
            <span className="dot-number">2</span>
            <span className="dot-label">{tx({ ja: 'OTP認証', en: 'OTP Code', uz: 'OTP kod', ru: 'OTP-код', zh: 'OTP 验证码', vi: 'Mã OTP', ne: 'OTP कोड' })}</span>
          </div>
        </div>

        {/* Step 1: Email & Role Form */}
        {step === 'email' && (
          <form className="email-otp-form" onSubmit={handleSendOtp}>
            <div className="form-section-title">
              {tx({
                ja: 'アカウント役割の選択',
                en: 'Select Account Role',
                uz: 'Hisob turini tanlang',
                ru: 'Выберите тип аккаунта',
                zh: '选择账户类型',
                vi: 'Chọn loại tài khoản',
                ne: 'खाताको प्रकार छान्नुहोस्'
              })}
            </div>
            
            <div className="role-selector-chips">
              <button
                type="button"
                className={`role-chip ${role === 'driver' ? 'selected' : ''}`}
                onClick={() => setRole('driver')}
              >
                <User size={15} />
                <span>{tx({ ja: '求職者 / ドライバー', en: 'Job Seeker / Driver', uz: 'Haydovchi', ru: 'Соискатель / Водитель', zh: '求职者 / 司机', vi: 'Người tìm việc / Tài xế', ne: 'रोजगार खोजकर्ता / चालक' })}</span>
              </button>

              <button
                type="button"
                className={`role-chip ${role === 'company' ? 'selected' : ''}`}
                onClick={() => setRole('company')}
              >
                <Building2 size={15} />
                <span>{tx({ ja: '企業 / 採用担当', en: 'Company / Recruiter', uz: 'Ish beruvchi', ru: 'Компания / Рекрутер', zh: '企业 / 招聘负责人', vi: 'Doanh nghiệp / Nhà tuyển dụng', ne: 'कम्पनी / भर्ती प्रबन्धक' })}</span>
              </button>

              <button
                type="button"
                className={`role-chip ${role === 'school' ? 'selected' : ''}`}
                onClick={() => setRole('school')}
              >
                <GraduationCap size={15} />
                <span>{tx({ ja: '自動車教習所', en: 'Driving School', uz: 'Avtomaktab', ru: 'Автошкола', zh: '驾校', vi: 'Trường dạy lái xe', ne: 'ड्राइभिङ स्कुल' })}</span>
              </button>
            </div>

            <div className="form-group-box">
              <label className="input-label">
                {tx({ ja: '電子メールアドレス', en: 'Email Address', uz: 'Elektron pochta manzilingiz', ru: 'Адрес электронной почты', zh: '电子邮箱地址', vi: 'Địa chỉ email', ne: 'इमेल ठेगाना' })}
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" aria-hidden="true" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder={tx({ ja: '例: user@example.com', en: 'e.g. user@example.com', uz: 'masalan: user@example.com', ru: 'например: user@example.com', zh: '例如：user@example.com', vi: 'ví dụ: user@example.com', ne: 'उदाहरण: user@example.com' })}
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
                  <span>{tx({ ja: '送信中...', en: 'Sending...', uz: 'Yuborilmoqda...', ru: 'Отправка...', zh: '发送中...', vi: 'Đang gửi...', ne: 'पठाउँदै...' })}</span>
                </span>
              ) : (
                <span className="flex-btn-content">
                  <span>{tx({ ja: '確認コードを送信', en: 'Send Verification Code', uz: 'Tasdiqlash kodini yuborish', ru: 'Отправить код подтверждения', zh: '发送验证码', vi: 'Gửi mã xác minh', ne: 'प्रमाणीकरण कोड पठाउनुहोस्' })}</span>
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
              <span>{tx({ ja: 'メールアドレスの変更', en: 'Change Email', uz: "Emailni o'zgartirish", ru: 'Изменить email', zh: '更改邮箱地址', vi: 'Đổi email', ne: 'इमेल परिवर्तन गर्नुहोस्' })}</span>
            </button>

            <div className="otp-instruct-box">
              <div className="otp-icon-circle" aria-hidden="true">
                <Lock size={22} color="#5E5CE6" />
              </div>
              <h4 className="otp-instruct-title">
                {tx({ ja: '6桁の確認コードを入力', en: 'Enter the 6-digit verification code', uz: '6 xonali tasdiqlash kodini kiriting', ru: 'Введите 6-значный код подтверждения', zh: '请输入 6 位验证码', vi: 'Nhập mã xác minh gồm 6 chữ số', ne: '६ अङ्कको प्रमाणीकरण कोड प्रविष्ट गर्नुहोस्' })}
              </h4>
              <p className="otp-instruct-sub">
                {otpPrefix && <>{otpPrefix}{' '}</>}
                <strong className="user-target-email">{email}</strong>
                {otpSuffix}
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
                  <span>{tx({ ja: '検証中...', en: 'Verifying...', uz: 'Tekshirilmoqda...', ru: 'Проверка...', zh: '验证中...', vi: 'Đang xác minh...', ne: 'प्रमाणित गर्दै...' })}</span>
                </span>
              ) : (
                <span className="flex-btn-content">
                  <CheckCircle2 size={18} />
                  <span>{tx({ ja: '認証してログイン', en: 'Verify & Sign In', uz: 'Tasdiqlash va kirish', ru: 'Подтвердить и войти', zh: '验证并登录', vi: 'Xác minh và đăng nhập', ne: 'प्रमाणित गरी लगइन गर्नुहोस्' })}</span>
                </span>
              )}
            </button>

            {/* Resend Cooldown Countdown */}
            <div className="resend-cooldown-box">
              {cooldown > 0 ? (
                <span className="cooldown-text">
                  {tx({
                    ja: `コードの再送信 (${cooldown}秒)`,
                    en: `Resend code (${cooldown}s)`,
                    uz: `Kodni qayta yuborish (${cooldown}s)`,
                    ru: `Отправить код повторно (${cooldown} с)`,
                    zh: `重新发送验证码（${cooldown}秒）`,
                    vi: `Gửi lại mã (${cooldown}s)`,
                    ne: `कोड पुनः पठाउनुहोस् (${cooldown} सेकेन्ड)`
                  })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="resend-action-btn"
                >
                  <RefreshCw size={14} />
                  <span>{tx({ ja: 'コードを再送信', en: 'Resend Code', uz: 'Kodni qayta yuborish', ru: 'Отправить код повторно', zh: '重新发送验证码', vi: 'Gửi lại mã', ne: 'कोड पुनः पठाउनुहोस्' })}</span>
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
              {tx({ ja: '認証が完了しました！', en: 'Verification complete!', uz: 'Muvaffaqiyatli tasdiqlandi!', ru: 'Подтверждение выполнено!', zh: '验证成功！', vi: 'Xác minh thành công!', ne: 'प्रमाणीकरण सफल भयो!' })}
            </h3>
            <p className="success-sub">
              {tx({
                ja: 'Michi Appへようこそ。リダイレクト中...',
                en: 'Welcome to Michi App. Redirecting...',
                uz: "Tizimga muvaffaqiyatli kirdingiz. Yo'naltirilmoqda...",
                ru: 'Добро пожаловать в Michi App. Перенаправление...',
                zh: '欢迎使用 Michi App。正在跳转...',
                vi: 'Chào mừng đến với Michi App. Đang chuyển hướng...',
                ne: 'Michi App मा स्वागत छ। रिडाइरेक्ट गर्दै...'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

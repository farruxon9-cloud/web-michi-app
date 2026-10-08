import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, UserCircle, Plus, X, Camera, MailCheck, ArrowLeft, Mail, Lock, Eye, EyeOff, User, ShieldAlert, RefreshCw, KeyRound } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import {
  checkLockout,
  recordFailedAttempt,
  resetAttempts,
  generateCaptcha,
  sanitizeInput,
  evaluatePasswordStrength
} from '../services/authSecurityService';
import N8nEmailOtpWidget from './auth/N8nEmailOtpWidget';
import { sendEmailOtpViaN8n, verifyEmailOtpCodeViaN8n } from '../services/n8nEmailOtpService';
import { checkEmailExists } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { suspensionInfo, formatDate } from '../utils/trustHelpers';
import './RoleSelect.css';
import { pickText } from '../utils/localize';


const DRIVER_LICENSES = [
  'futsu', 'junchugata', 'chugata', 'oogata', 'oogata_tokushu',
  'kenin', 'dainishu', 'motorcycle', 'kogata_tokushu', 'gentsuki'
];

const TECH_CERTS = [
  'forklift', 'tamakake', 'crane', 'mobile_crane', 'excavator',
  'aerial_work', 'welding', 'hazardous'
];

export default function RoleSelect({ onSelectRole, onGuest, initialStep = 'role' }) {
  const { t, i18n } = useTranslation();
  const { login, register } = useAuth();
  
  // Auth flow states: 'role' -> 'login' -> 'register' -> 'verify'
  const [authStep, setAuthStep] = useState(() => {
    if (initialStep === 'register') {
      return 'role';
    }
    return initialStep;
  });
  const [registerDirectly, setRegisterDirectly] = useState(initialStep === 'register');
  const [selectedRole, setSelectedRole] = useState(null);

  // Login credentials
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Security & Lockout Control States
  const [lockoutState, setLockoutState] = useState({ isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false });
  const [captchaChallenge, setCaptchaChallenge] = useState(null);
  const [userCaptchaAns, setUserCaptchaAns] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [suspended, setSuspended] = useState(null); // { until, reason } from 403 SUSPENDED
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 6-Digit OTP UI States
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Password Recovery
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState('email');
  const [recoveryShowPassword, setRecoveryShowPassword] = useState(false);

  // Verify Code
  const [verifyCode, setVerifyCode] = useState('');

  const fileInputRef = useRef(null);

  // Shared Registration
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [gender, setGender] = useState('male');

  // n8n Email OTP Verification Inline State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  // One-time proof from /verify-otp (memory only, never persisted); /register requires it.
  const [emailVerificationToken, setEmailVerificationToken] = useState(null);
  const [, setOtpSent] = useState(false);
  const [otpErrorMsg, setOtpErrorMsg] = useState('');
  const [, setOtpSuccessMsg] = useState('');

  // Live password strength
  const passwordStrength = evaluatePasswordStrength(password);

  // User-specific Registration
  const [birthDate, setBirthDate] = useState('');
  const [driverLicenses, setDriverLicenses] = useState([]);
  const [techCertificates, setTechCertificates] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  const [addressHistory, setAddressHistory] = useState([]);
  const [educationHistory, setEducationHistory] = useState([]);
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');

  // Company-specific Registration
  const [companyType, setCompanyType] = useState('logistics');
  const [companyAddress, setCompanyAddress] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [corporateNumber, setCorporateNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');

  // Legal
  const [agreeLabor, setAgreeLabor] = useState(false);
  const [agreeVisa, setAgreeVisa] = useState(false);
  const [agreeAd, setAgreeAd] = useState(false);
  const allLegalAccepted = agreeLabor && agreeVisa && agreeAd;

  // Lockout Countdown Timer
  useEffect(() => {
    let timer;
    if (lockoutState.isLocked && lockoutState.remainingMs > 0) {
      timer = setInterval(() => {
        setLockoutState(prev => {
          if (prev.remainingMs <= 1000) {
            return { isLocked: false, remainingMs: 0, level: prev.level, isStrictEmailLock: false };
          }
          return { ...prev, remainingMs: prev.remainingMs - 1000 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutState.isLocked, lockoutState.remainingMs]);

  // OTP Resend Timer
  useEffect(() => {
    let timer;
    if (authStep === 'verify' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, otpTimer]);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    if (registerDirectly) {
      setAuthStep('register');
    } else {
      setAuthStep('login');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setLoginErrorMessage('');

    const sanitizedEmail = sanitizeInput(loginEmail.trim()).toLowerCase();

    // 1. Lockout check
    const lockCheck = checkLockout(sanitizedEmail);
    if (lockCheck.isLocked) {
      setLockoutState(lockCheck);
      return;
    }

    // 2. Anti-Bot CAPTCHA check if active
    if (captchaChallenge) {
      if (parseInt(userCaptchaAns, 10) !== captchaChallenge.expectedAnswer) {
        setCaptchaError(true);
        setCaptchaChallenge(generateCaptcha());
        setUserCaptchaAns('');
        return;
      }
      setCaptchaChallenge(null);
      setCaptchaError(false);
    }

    setIsSubmitting(true);
    (async () => {
      if (!sanitizedEmail) {
        setIsSubmitting(false);
        setLoginErrorMessage(t('emailRequired', "Iltimos, elektron pochtangizni kiriting."));
        return;
      }

      try {
        const res = await login(sanitizedEmail, loginPassword);
        setIsSubmitting(false);
        if (res.success && res.user) {
          resetAttempts(sanitizedEmail);
          const userRole = res.user.role || selectedRole || 'driver';
          const profilePayload = res.user.profileData || {
            fullName: res.user.fullName || sanitizedEmail.split('@')[0],
            email: res.user.email || sanitizedEmail,
            isEmailVerified: true
          };
          onSelectRole(userRole, profilePayload);
          return;
        }
      } catch (apiErr) {
        console.warn("Backend Login Error:", apiErr);
        setIsSubmitting(false);
        // Suspended account: explain why instead of counting it as a wrong password
        const susp = suspensionInfo(apiErr);
        if (susp) {
          setLoginErrorMessage('');
          setSuspended(susp);
          return;
        }
        setSuspended(null);
        const failRes = recordFailedAttempt(sanitizedEmail);
        if (failRes.isLocked) {
          setLockoutState(checkLockout(sanitizedEmail));
        } else {
          if (failRes.requireCaptcha) {
            setCaptchaChallenge(generateCaptcha());
          }
          setLoginErrorMessage('invalidLoginCredentials');
        }
      }
    })();
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!allLegalAccepted) return;

    if (!isEmailVerified) {
      setOtpErrorMsg(t('mustVerifyEmailBeforeRegister', "Ro'yxatdan o'tish uchun elektron pochtangizni 6-xonali OTP kodi orqali tasdiqlashingiz shart!"));
      alert(t('mustVerifyEmailBeforeRegisterAlert', "Ro'yxatdan o'tish uchun elektron pochtangizni 6-xonali OTP kodi orqali tasdiqlashingiz shart!"));
      return;
    }

    const filteredAddressHistory = addressHistory.filter(a => a.address);
    const filteredEducationHistory = educationHistory.filter(e => e.school || e.major);
    const fallbackAddress = filteredAddressHistory.map(a => a.address + (a.isCurrent ? ` (${t('currentAddressLabel', 'Hozirgi')})` : '')).join(', ');
    const fallbackEducation = filteredEducationHistory.map(e => `${e.school}${e.major ? ` (${e.major})` : ''} • ${e.startDate || ''} ~ ${e.isCurrent ? t('currentlyStudyingLabel', 'O\'qiyotgan') : e.endDate || ''}`).join(', ');

    const userProfilePayload = selectedRole === 'company' ? {
      fullName: fullName || 'Kompaniya',
      email: email.trim().toLowerCase(),
      isEmailVerified: true,
      avatar,
      companyType,
      companyAddress,
      employeeCount,
      contactPerson,
      companyPhone,
      companyDesc,
      corporateNumber,
      website,
      establishedYear,
    } : {
      fullName: fullName || 'Michi User',
      email: email.trim().toLowerCase(),
      isEmailVerified: true,
      avatar,
      gender,
      birthDate,
      driverLicenses,
      techCertificates,
      workHistory: workHistory.filter(w => w.company || w.position),
      addressHistory: filteredAddressHistory,
      educationHistory: filteredEducationHistory,
      address: fallbackAddress || address,
      education: fallbackEducation || education,
    };

    const registerPayload = {
      fullName: fullName || (selectedRole === 'company' ? 'Kompaniya' : 'Michi User'),
      email: email.trim().toLowerCase(),
      password: password,
      role: selectedRole || 'driver',
      profileData: userProfilePayload,
      ...(emailVerificationToken ? { verificationToken: emailVerificationToken } : {})
    };

    setIsSubmitting(true);
    try {
      const res = await register(registerPayload);
      setIsSubmitting(false);

      resetAttempts(email);
      setLockoutState({ isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false });
      
      const returnedRole = res.user?.role || selectedRole || 'driver';
      const returnedProfile = res.user?.profileData || userProfilePayload;
      onSelectRole(returnedRole, returnedProfile);
    } catch (err) {
      console.error("Backend Register Error:", err?.message || err);
      setIsSubmitting(false);
      if (err?.code === 'EMAIL_VERIFICATION_INVALID' || err?.code === 'EMAIL_NOT_VERIFIED') {
        // Proof expired or already used: verify the email again with a new code.
        setIsEmailVerified(false);
        setEmailVerificationToken(null);
        setOtpSent(false);
        setOtpErrorMsg(t('emailVerificationExpired', "Email tasdig'i muddati tugadi. Emailni qayta tasdiqlang."));
        return;
      }
      setOtpErrorMsg(err.message || t('registerErrorMsg', "Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."));
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('') || verifyCode;
    setIsSubmitting(true);
    try {
      const res = await verifyEmailOtpCodeViaN8n(email || forgotEmail || loginEmail, fullOtp);
      setIsSubmitting(false);

      if (res.success) {
        resetAttempts(email || forgotEmail || loginEmail);
        setLockoutState({ isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false });
      
        if (selectedRole === 'company') {
          onSelectRole(selectedRole, {
            fullName: fullName || 'Kompaniya',
            email,
            avatar,
            companyType,
            companyAddress,
            employeeCount,
            contactPerson,
            companyPhone,
            companyDesc,
            corporateNumber,
            website,
            establishedYear,
          });
        } else {
          const filteredAddressHistory = addressHistory.filter(a => a.address);
          const filteredEducationHistory = educationHistory.filter(e => e.school || e.major);
          const fallbackAddress = filteredAddressHistory.map(a => a.address + (a.isCurrent ? ` (${t('currentAddressLabel', 'Hozirgi')})` : '')).join(', ');
          const fallbackEducation = filteredEducationHistory.map(e => `${e.school}${e.major ? ` (${e.major})` : ''} • ${e.startDate || ''} ~ ${e.isCurrent ? t('currentlyStudyingLabel', 'O\'qiyotgan') : e.endDate || ''}`).join(', ');

          onSelectRole(selectedRole || 'driver', {
            fullName: fullName || 'Michi User',
            email,
            avatar,
            gender,
            birthDate,
            driverLicenses,
            techCertificates,
            workHistory: workHistory.filter(w => w.company || w.position),
            addressHistory: filteredAddressHistory,
            educationHistory: filteredEducationHistory,
            address: fallbackAddress || address,
            education: fallbackEducation || education,
          });
        }
      } else {
        alert(res.error || t(res.messageKey, "Tasdiqlash kodi noto'g'ri!"));
      }
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message || t('verifyError', "Tasdiqlash kodi noto'g'ri!"));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.7);
        setAvatar(compressed);
        localStorage.setItem('michi_avatar', compressed);
      } catch (err) {
        console.error("Avatar compression failed:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result);
          localStorage.setItem('michi_avatar', reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const addWorkEntry = () => {
    if (workHistory.length < 3) {
      setWorkHistory(prev => [...prev, { company: '', position: '', startDate: '', endDate: '', isCurrent: false }]);
    }
  };

  const removeWorkEntry = (index) => {
    setWorkHistory(prev => prev.filter((_, i) => i !== index));
  };

  const updateWorkEntry = (index, field, value) => {
    setWorkHistory(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const addAddressEntry = () => {
    if (addressHistory.length < 3) {
      setAddressHistory(prev => [...prev, { address: '', isCurrent: false }]);
    }
  };

  const removeAddressEntry = (index) => {
    setAddressHistory(prev => prev.filter((_, i) => i !== index));
  };

  const updateAddressEntry = (index, field, value) => {
    setAddressHistory(prev => prev.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      } else {
        if (field === 'isCurrent' && value === true) {
          // Allow only one current address
          return { ...entry, isCurrent: false };
        }
        return entry;
      }
    }));
  };

  const addEducationEntry = () => {
    if (educationHistory.length < 3) {
      setEducationHistory(prev => [...prev, { school: '', major: '', startDate: '', endDate: '', isCurrent: false }]);
    }
  };

  const removeEducationEntry = (index) => {
    setEducationHistory(prev => prev.filter((_, i) => i !== index));
  };

  const updateEducationEntry = (index, field, value) => {
    setEducationHistory(prev => prev.map((entry, i) => {
      if (i === index) {
        let updated = { ...entry, [field]: value };
        if (field === 'isCurrent' && value === true) {
          updated.endDate = '';
        }
        return updated;
      }
      return entry;
    }));
  };

  if (lockoutState.isLocked) {
    const remainingSecs = Math.ceil(lockoutState.remainingMs / 1000);
    const mins = Math.floor(remainingSecs / 60);
    const secs = remainingSecs % 60;
    const formattedTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return (
      <div className="role-container slide-up">
        <div className="auth-card glass squircle auth-lockout-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div className="lockout-badge-icon" style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 59, 48, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(255, 59, 48, 0.2)'
          }}>
            <ShieldAlert size={36} color="#FF3B30" />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-main)' }}>
            {lockoutState.isStrictEmailLock 
              ? t('strictLockoutTitle', 'Hisob Himoya Rejimiga O\'tdi')
              : t('accountLockedTitle', 'Hisob vaqtinchalik bloklandi')}
          </h2>

          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
            {lockoutState.isStrictEmailLock
              ? t('strictLockoutDesc', 'Noma\'lum urinishlar sababli parol kiritish to\'xtatildi. Emailingizga yuborilgan kod orqali qayta tiklang.')
              : t('accountLockedDesc', 'Ketma-ket xato kiritish sababli hisobingiz muhofaza qilindi.')}
          </p>

          {!lockoutState.isStrictEmailLock && (
            <div className="lockout-countdown-box" style={{
              background: 'rgba(255, 59, 48, 0.08)', borderRadius: '16px', border: '1px solid rgba(255, 59, 48, 0.2)',
              padding: '16px', margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Qayta urinishgacha:</span>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#FF3B30', letterSpacing: '2px', fontFamily: 'monospace' }}>{formattedTimer}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={async () => {
                setAuthStep('forgot_password');
                setRecoveryStep('email');
                setForgotEmail(loginEmail);
                if (loginEmail) await sendEmailOtpViaN8n(loginEmail);
              }}
              style={{ width: '100%', background: 'linear-gradient(135deg, #0A84FF, #0056B3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <KeyRound size={16} />
              <span>{t('unlockViaEmail', 'Email Orqali Instant Unlock')}</span>
            </button>

            <button 
              type="button" 
              className="icon-btn glass" 
              onClick={() => {
                setLockoutState({ isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false });
                setAuthStep('role');
              }}
              style={{ width: '100%', borderRadius: '14px', fontSize: '13px', padding: '12px', cursor: 'pointer' }}
            >
              {t('backToRoleSelect', 'Ortga Qaytish')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'verify') {
    const handleOtpChange = (index, value) => {
      if (!/^\d*$/.test(value)) return;
      const newDigits = [...otpDigits];
      newDigits[index] = value.substring(value.length - 1);
      setOtpDigits(newDigits);

      if (value && index < 5) {
        otpInputRefs[index + 1].current?.focus();
      }
    };

    const handleOtpKeyDown = (index, e) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpInputRefs[index - 1].current?.focus();
      }
    };

    const handleOtpPaste = (e) => {
      e.preventDefault();
      const pasted = e.clipboardData ? e.clipboardData.getData('text').trim() : '';
      const digitsOnly = pasted.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = digitsOnly[i] || '';
        }
        setOtpDigits(newDigits);
        const focusIdx = Math.min(digitsOnly.length, 5);
        otpInputRefs[focusIdx].current?.focus();
      }
    };

    return (
      <div className="role-container slide-up">
        <div className="auth-card glass squircle" style={{ textAlign: 'center', padding: '36px 20px', position: 'relative' }}>
          <button className="icon-btn glass" onClick={() => setAuthStep('register')} style={{ position: 'absolute', top: 20, left: 20 }}>
            <ArrowLeft size={20} />
          </button>
          <MailCheck size={44} color="#0A84FF" style={{ margin: '16px auto 12px auto' }} />
          <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: '800' }}>{t('otpTitle', 'Email Tasdiqlash Kodi')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('otpSub', 'Elektron pochtangizga 6-xonali tasdiqlash kodi yuborildi.')}
          </p>

          <form onSubmit={handleVerifySubmit}>
            <div className="otp-digit-grid" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className="otp-digit-input"
                  style={{
                    width: '42px', height: '48px', borderRadius: '12px',
                    border: digit ? '2px solid #0A84FF' : '1px solid var(--glass-border)',
                    background: 'var(--card-bg)', color: 'var(--text-main)',
                    textAlign: 'center', fontSize: '20px', fontWeight: '800',
                    outline: 'none', transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              {otpTimer > 0 ? (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t('otpResendTimer', { seconds: otpTimer })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const targetEmail = email || forgotEmail || loginEmail;
                    if (targetEmail) await sendEmailOtpViaN8n(targetEmail);
                    setOtpTimer(60);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={12} />
                  <span>{t('otpResendBtn', 'Qayta kod yuborish')}</span>
                </button>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {t('verifyAndLogin', 'Tasdiqlash va Kirish')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (authStep === 'forgot_password') {
    // ==========================================================================
    // PAROLNI TIKLASH VA TIZIMGA QAYTA KIRISh MANTIG'I (PASSWORD RECOVERY FLOW LOGIC)
    // ==========================================================================
    // [UZ] Ushbu funksiya foydalanuvchining tiklash bosqichlarini boshqaradi.
    // 1-bosqich ('email'): Elektron pochta to'g'ri kiritilganligini tekshiradi va kod kiritish oynasiga o'tkazadi.
    // 2-bosqich ('code'): Kiritilgan parolni tiklash kodini (simulyatsiya uchun: 1234) tekshiradi.
    // 3-bosqich ('new_password'): Yangi parolni qabul qiladi, muvaffaqiyatli o'zgartirilganligini bildiradi
    // va foydalanuvchining eski pochtasi ostida profilingizga bir zumda kirishni (onSelectRole) amalga oshiradi.
    //
    // [JA] パスワード再設定・即時ログイン処理ハンドラ：
    // この関数はユーザーの再設定フローの各フェーズ（メール入力 -> コード検証 -> 新パスワード設定）を制御します。
    // メール送信及びコード入力（テストコード: 1234）が完了すると、新パスワードが適用され、
    // 古いメールアドレスを保持したままで、即座に該当ロール（運転手/企業）としてログイン（onSelectRole）を実行します。
    // ==========================================================================
    const handleRecoverySubmit = async (e) => {
      e.preventDefault();
      if (recoveryStep === 'email') {
        if (!forgotEmail || !forgotEmail.includes('@')) {
          alert(t('emailRequired', "Iltimos, elektron pochtangizni to'g'ri kiriting."));
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await sendEmailOtpViaN8n(forgotEmail);
          setIsSubmitting(false);
          if (res.success) {
            setRecoveryStep('code');
          } else {
            alert(res.error || t('otpSendFailed', "Pochtaga kod yuborishda xatolik yuz berdi."));
            setRecoveryStep('code');
          }
        } catch (err) {
          setIsSubmitting(false);
          setRecoveryStep('code');
        }
      } else if (recoveryStep === 'code') {
        if (!recoveryCode) {
          alert(t('enter6DigitCode', "Iltimos, 6 xonali tasdiqlash kodini kiriting!"));
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await verifyEmailOtpCodeViaN8n(forgotEmail, recoveryCode);
          setIsSubmitting(false);
          if (res.success) {
            setRecoveryStep('new_password');
          } else {
            alert(res.error || t('verifyError', "Tasdiqlash kodi noto'g'ri!"));
          }
        } catch (err) {
          setIsSubmitting(false);
          alert(t('verifyError', "Tasdiqlash kodi noto'g'ri!"));
        }
      } else if (recoveryStep === 'new_password') {
        if (!newPassword || newPassword.length < 6) {
          alert(t('passwordRequired', "Iltimos, kamida 6 xonali yangi parol kiriting."));
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: forgotEmail, 
              code: recoveryCode, 
              otpCode: recoveryCode, 
              newPassword: newPassword 
            })
          });
          const data = await res.json().catch(() => ({}));
          setIsSubmitting(false);
          if (res.ok && data.success !== false) {
            alert(t('recoverySuccessAlert', "Parol muvaffaqiyatli yangilandi!"));
            resetAttempts(forgotEmail);
            setLockoutState({ isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false });
            setAuthStep('login');
          } else {
            alert(data.error || data.message || t('passwordResetFailed', "Parolni tiklashda xatolik yuz berdi."));
          }
        } catch (err) {
          setIsSubmitting(false);
          alert(err.message || t('passwordResetFailed', "Parolni tiklashda xatolik yuz berdi."));
        }
      }
    };

    return (
      <div className="role-container login-centered-container slide-up">
        <div className="auth-card glass squircle" style={{ position: 'relative', width: '100%' }}>
          <button 
            className="icon-btn glass" 
            onClick={() => {
              if (recoveryStep === 'code') setRecoveryStep('email');
              else if (recoveryStep === 'new_password') setRecoveryStep('code');
              else setAuthStep('login');
            }} 
            style={{ position: 'absolute', top: '16px', left: '16px' }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="auth-logo-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', marginBottom: '8px' }}>
            <div className="logo-kanji" style={{ transform: 'scale(1.25)', boxShadow: '0 8px 24px rgba(90, 85, 234, 0.35)' }}>道</div>
          </div>

          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
              {t('recoveryTitle', 'Parolni tiklash')}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {recoveryStep === 'email' && t('recoveryEmailSub', 'Elektron pochtangizni kiriting')}
              {recoveryStep === 'code' && t('recoveryCodeSub', 'Tasdiqlash kodini kiriting')}
              {recoveryStep === 'new_password' && t('recoveryPassSub', 'Yangi parol belgilang')}
            </p>
          </div>

          <form onSubmit={handleRecoverySubmit} className="auth-form hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: 'none', padding: 0 }}>
              
              {recoveryStep === 'email' && (
                <div className="premium-input-group">
                  <div className={`premium-input-wrapper ${forgotEmail ? 'has-value' : ''}`}>
                    <div className="premium-input-icon">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder=" "
                      className="premium-input" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    <label className="premium-label">{t("emailPlaceholder", "Email manzili")}</label>
                    <div className="premium-input-border"></div>
                  </div>
                </div>
              )}

              {recoveryStep === 'code' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '8px' }}>
                    {t('recoveryCodeSentMsg', 'Tiklash kodi emailingizga yuborildi.')}
                  </p>
                  <input 
                    type="number" 
                    placeholder="000000" 
                    className="auth-input" 
                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', borderRadius: '16px', padding: '14px', border: '1px solid rgba(90, 85, 234, 0.25)' }}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    required
                  />
                </div>
              )}

              {recoveryStep === 'new_password' && (
                <div className="premium-input-group">
                  <div className={`premium-input-wrapper ${newPassword ? 'has-value' : ''}`}>
                    <div className="premium-input-icon">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={recoveryShowPassword ? "text" : "password"} 
                      placeholder=" "
                      required 
                      className="premium-input" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label className="premium-label">{t("passPlaceholder", "Yangi parol")}</label>
                    
                    <button 
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setRecoveryShowPassword(!recoveryShowPassword)}
                      style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: '8px', cursor: 'pointer', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}
                    >
                      {recoveryShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    
                    <div className="premium-input-border"></div>
                  </div>
                </div>
              )}

            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '4px', width: '100%' }}>
              {recoveryStep === 'email' && t('sendCodeBtn', 'Kodni yuborish')}
              {recoveryStep === 'code' && t('verifyCodeBtn', 'Kodni tasdiqlash')}
              {recoveryStep === 'new_password' && t('updateAndLoginBtn', 'Parolni yangilash va Kirish')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (authStep === 'login') {
    return (
      <div className="role-container login-centered-container slide-up">
        <div className="auth-card glass squircle" style={{ position: 'relative', width: '100%' }}>
          <button className="icon-btn glass" onClick={() => setAuthStep('role')} style={{ position: 'absolute', top: '16px', left: '16px' }}>
            <ArrowLeft size={20} />
          </button>
          
          <div className="auth-logo-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', marginBottom: '8px' }}>
            <div className="logo-kanji" style={{ transform: 'scale(1.25)', boxShadow: '0 8px 24px rgba(90, 85, 234, 0.35)' }}>道</div>
          </div>

          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>{t('loginTitle', 'Tizimga kirish')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              {selectedRole === 'company' ? t('roleCompanyTitle', 'Kompaniya') : t('roleDriverTitle', 'Haydovchi')} - {t('loginTitle', 'Tizimga kirish')}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="auth-form hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: 'none', padding: 0 }}>
              
              {/* Premium Email/Login Input */}
              <div className="premium-input-group">
                <div className={`premium-input-wrapper ${loginEmail ? 'has-value' : ''}`}>
                  <div className="premium-input-icon">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder=" "
                    className="premium-input" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <label className="premium-label">{t("emailOrLogin", "Email yoki Login")}</label>
                  <div className="premium-input-border"></div>
                </div>
              </div>

              {/* Premium Password Input with Toggle */}
              <div className="premium-input-group">
                <div className={`premium-input-wrapper ${loginPassword ? 'has-value' : ''}`}>
                  <div className="premium-input-icon">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder=" "
                    required 
                    className="premium-input" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <label className="premium-label">{t("passPlaceholder", "Parol")}</label>
                  
                  {/* Eye Toggle button */}
                  <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', padding: '8px', cursor: 'pointer', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  
                  <div className="premium-input-border"></div>
                </div>
              </div>

              {/* Warning Alert Banner */}
              {loginErrorMessage && (
                <div style={{
                  background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.25)',
                  borderRadius: '12px', padding: '10px 12px', color: '#FF3B30', fontSize: '12.5px',
                  fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{t(loginErrorMessage, t('invalidLoginCredentials', 'メールアドレスまたはパスワードが正しくありません。'))}</span>
                </div>
              )}

              {/* Suspended account (403 SUSPENDED) */}
              {suspended && (
                <div role="alert" id="login-suspended-notice" style={{
                  background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.3)',
                  borderRadius: '12px', padding: '10px 12px', color: '#FF9500', fontSize: '12.5px',
                  fontWeight: '700', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px'
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span>{suspended.until
                      ? t('loginSuspendedUntil', { date: formatDate(suspended.until), defaultValue: 'このアカウントは {{date}} まで利用停止中です。' })
                      : t('loginSuspendedPermanent', 'このアカウントは利用停止されています。')}</span>
                    {suspended.reason && <span style={{ fontWeight: 600 }}>{t('moderationReasonLabel')}: {suspended.reason}</span>}
                    <span style={{ fontWeight: 600, opacity: 0.85 }}>{t('loginSuspendedHelp', 'ご不明な点は support@michi.jp.net までお問い合わせください。')}</span>
                  </span>
                </div>
              )}

              {/* Anti-Bot Math CAPTCHA Challenge */}
              {captchaChallenge && (
                <div className="captcha-challenge-box" style={{
                  background: 'rgba(255, 149, 0, 0.08)', borderRadius: '14px', border: '1px solid rgba(255, 149, 0, 0.3)',
                  padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#FF9500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} />
                    <span>{t('captchaTitle', 'Robot Himoyasi (CAPTCHA)')}</span>
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {captchaChallenge.question}
                  </span>
                  <input 
                    type="number" 
                    className="auth-input" 
                    placeholder={pickText(i18n.language, { ja: '答え', uz: 'Javob', en: 'Answer', ru: 'Ответ', zh: '答案', vi: 'Trả lời', ne: 'उत्तर' })}
                    value={userCaptchaAns}
                    onChange={(e) => setUserCaptchaAns(e.target.value)}
                    style={{ fontSize: '16px', textAlign: 'center', padding: '8px', borderRadius: '10px' }}
                    required
                  />
                  {captchaError && (
                    <span style={{ fontSize: '11px', color: '#FF3B30', fontWeight: '700' }}>
                      {t('captchaError', 'Javob noto\'g\'ri kiritildi.')}
                    </span>
                  )}
                </div>
              )}

              {/* Forgot Password trigger */}
              <button 
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setAuthStep('forgot_password');
                  setRecoveryStep('email');
                  setForgotEmail(loginEmail);
                  setRecoveryCode('');
                  setNewPassword('');
                }}
              >
                {t('forgotPasswordBtn', 'Parolni unutdingizmi?')}
              </button>

            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '4px', width: '100%' }}>
              {t('loginBtn', 'Kirish')}
            </button>
          </form>
          
          <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '500' }}>{t("noAccount", "Akkauntingiz yo'qmi?")}</p>
            <button 
              onClick={() => setAuthStep('register')}
              className="btn-primary"
              style={{ 
                background: 'rgba(10, 132, 255, 0.08)', 
                color: '#0A84FF', 
                border: '1px solid rgba(10, 132, 255, 0.2)', 
                padding: '14px 16px', 
                fontSize: '16px', 
                fontWeight: '700',
                width: '100%', 
                borderRadius: '14px',
                minHeight: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              {t("registerTitle", "Ro'yxatdan o'tish")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'register') {
    return (
      <div className="role-container slide-up">
        <div className="auth-card glass squircle" style={{ position: 'relative' }}>
          <button className="icon-btn glass" onClick={() => setAuthStep(registerDirectly ? 'role' : 'login')} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
            <ArrowLeft size={20} />
          </button>

          <form onSubmit={handleRegisterSubmit} className="auth-form-scroll hide-scrollbar">
            <div className="auth-header" style={{ marginTop: '30px' }}>
              <h2>{t("registerTitle", "Ro'yxatdan o'tish")}</h2>
              <p>{t("registerSub", "Michi platformasida professional profil yaratish")}</p>
            </div>
            
            {/* Avatar Selection */}
            <div className="avatar-upload-section">
              <div 
                className="avatar-upload-circle" 
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <Camera size={28} />
                    <span>{t('uploadPhoto', 'Rasm yuklash')}</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef} 
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* === DRIVER REGISTRATION === */}
            {selectedRole === 'driver' && (
              <>
                <div className="form-section">
                  <h4>{t("personalInfo", "Shaxsiy ma'lumotlar")}</h4>
                  
                  <div className="premium-input-group" style={{ marginBottom: '16px' }}>
                    <div className={`premium-input-wrapper ${fullName ? 'has-value' : ''}`}>
                      <span className="premium-input-icon"><User size={20} /></span>
                      <input 
                        type="text" 
                        placeholder=" "
                        required 
                        className="premium-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        maxLength={50}
                      />
                      <label className="premium-label">{t("namePlaceholder", "To'liq ismingiz")}</label>
                      <div className="premium-input-border"></div>
                    </div>
                  </div>

                  <div className="input-label-wrap" style={{ marginTop: '4px', marginBottom: '8px' }}>
                    <label>{t('genderLabel', 'Jinsingiz')}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button"
                        className={`gender-btn ${gender === 'male' ? 'active male' : ''}`}
                        onClick={() => setGender('male')}
                      >
                        {t('male', 'Erkak')}
                      </button>
                      <button 
                        type="button"
                        className={`gender-btn ${gender === 'female' ? 'active female' : ''}`}
                        onClick={() => setGender('female')}
                      >
                        {t('female', 'Ayol')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="input-label-wrap">
                    <label>{t('dobLabel', 'Tug\'ilgan sana')}</label>
                    <input 
                      type="date" 
                      className="auth-input" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="input-label-wrap" style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>{t('livingAddressTitle', 'Yashash manzillari')}</label>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t("addressHistorySub", "Yashagan joylaringiz ro'yxati (Maksimal 3 ta)")}</p>
                  </div>
                  {addressHistory.map((entry, index) => (
                    <div key={index} className="work-entry glass" style={{ marginBottom: '12px' }}>
                      <div className="work-entry-header">
                        <span className="work-entry-num">#{index + 1}</span>
                        <button 
                          type="button" 
                          className="remove-work-btn"
                          onClick={() => removeAddressEntry(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="work-entry-fields">
                        <input
                          type="text"
                          placeholder={t('livingAddressPlaceholder', 'Manzilingizni kiriting (Prefektura, shahar, ko\'cha)...')}
                          className="auth-input work-input"
                          value={entry.address}
                          onChange={(e) => updateAddressEntry(index, 'address', e.target.value)}
                          maxLength={120}
                          required
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <input 
                            type="checkbox" 
                            id={`addr-current-${index}`} 
                            checked={entry.isCurrent || false}
                            onChange={(e) => updateAddressEntry(index, 'isCurrent', e.target.checked)}
                            style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                          />
                          <label htmlFor={`addr-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>{t('currentAddressLabel', 'Hozirgi yashash joyim')}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {addressHistory.length < 3 && (
                    <button type="button" className="add-work-btn" onClick={addAddressEntry}>
                      <Plus size={15} /> {addressHistory.length === 0 ? t('addAddressBtn', "Yashash manzili qo'shish") : t('addMore', "Yana qo'shish")}
                    </button>
                  )}

                  {/* Dynamic Education History */}
                  <div className="input-label-wrap" style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>{t('educationTitle', 'Ta\'lim ma\'lumotlari')}</label>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t("educationHistorySub", "Tugatgan maktab, kollej yoki universitetlaringiz (Maksimal 3 ta)")}</p>
                  </div>
                  {educationHistory.map((entry, index) => (
                    <div key={index} className="work-entry glass" style={{ marginBottom: '12px' }}>
                      <div className="work-entry-header">
                        <span className="work-entry-num">#{index + 1}</span>
                        <button 
                          type="button" 
                          className="remove-work-btn"
                          onClick={() => removeEducationEntry(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="work-entry-fields">
                        <input
                          type="text"
                          placeholder={t('educationSchoolPlaceholder', 'O\'quv muassasasi nomi')}
                          className="auth-input work-input"
                          value={entry.school}
                          onChange={(e) => updateEducationEntry(index, 'school', e.target.value)}
                          maxLength={100}
                          required
                        />
                        <input
                          type="text"
                          placeholder={t('educationMajorPlaceholder', 'Yo\'nalishi / Mutaxassisligi')}
                          className="auth-input work-input"
                          value={entry.major}
                          onChange={(e) => updateEducationEntry(index, 'major', e.target.value)}
                          maxLength={100}
                        />
                        <div className="work-dates-row" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: '600' }}>{t('startDateLabel', 'Kirgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.startDate || ''}
                              onChange={(e) => updateEducationEntry(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 1, opacity: entry.isCurrent ? 0.5 : 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px', fontWeight: '600' }}>{t('endDateLabel', 'Ketgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.endDate || ''}
                              onChange={(e) => updateEducationEntry(index, 'endDate', e.target.value)}
                              disabled={entry.isCurrent}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <input 
                            type="checkbox" 
                            id={`edu-current-${index}`} 
                            checked={entry.isCurrent || false}
                            onChange={(e) => updateEducationEntry(index, 'isCurrent', e.target.checked)}
                            style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                          />
                          <label htmlFor={`edu-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>{t('currentlyStudyingLabel', 'Hozir ham o\'qiyman')}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {educationHistory.length < 3 && (
                    <button type="button" className="add-work-btn" onClick={addEducationEntry}>
                      <Plus size={15} /> {educationHistory.length === 0 ? t('addEducationBtn', "O'qish joyi qo'shish") : t('addMore', "Yana qo'shish")}
                    </button>
                  )}
                </div>

                <div className="form-section">
                  <h4>{t("proInfo", "Kasbiy ma'lumotlar")}</h4>
                  <div className="input-group">
                    <label style={{marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)'}}>{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}</label>
                    <div className="checkbox-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '10px', background: 'rgba(255,255,255,0.25)', padding: '14px', borderRadius: '16px', border: '1px solid var(--glass-border)'}}>
                      {DRIVER_LICENSES.map(cert => (
                        <label key={cert} style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'}}>
                          <input 
                            type="checkbox" 
                            checked={driverLicenses.includes(cert)}
                            onChange={(e) => {
                              if (e.target.checked) setDriverLicenses(prev => [...prev, cert]);
                              else setDriverLicenses(prev => prev.filter(id => id !== cert));
                            }}
                            style={{width: '18px', height: '18px', accentColor: 'var(--primary)'}}
                          />
                          {t(`lic_${cert}`)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="input-group" style={{marginTop: '16px'}}>
                    <label style={{marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)'}}>{t('techCertsLabel', 'Maxsus texnika va malaka sertifikatlari')}</label>
                    <div className="checkbox-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '10px', background: 'rgba(255,255,255,0.25)', padding: '14px', borderRadius: '16px', border: '1px solid var(--glass-border)'}}>
                      {TECH_CERTS.map(cert => (
                        <label key={cert} style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'}}>
                          <input 
                            type="checkbox" 
                            checked={techCertificates.includes(cert)}
                            onChange={(e) => {
                              if (e.target.checked) setTechCertificates(prev => [...prev, cert]);
                              else setTechCertificates(prev => prev.filter(id => id !== cert));
                            }}
                            style={{width: '18px', height: '18px', accentColor: 'var(--primary)'}}
                          />
                          {t(`tech_${cert}`)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Work Experience Section */}
                <div className="form-section">
                  <div className="input-label-wrap">
                    <h4>{t("workExperience", "Ish tajribasi")}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{t("expPlaceholder", "Oxirgi ishlagan joylaringizni qo'shishingiz mumkin")}</p>
                  </div>
                  {workHistory.map((entry, index) => (
                    <div key={index} className="work-entry glass">
                      <div className="work-entry-header">
                        <span className="work-entry-num">#{index + 1}</span>
                        <button 
                          type="button" 
                          className="remove-work-btn"
                          onClick={() => removeWorkEntry(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="work-entry-fields">
                        <input
                          type="text"
                          placeholder={t('companyNamePlaceholder', 'Kompaniya nomi')}
                          className="auth-input work-input"
                          value={entry.company}
                          onChange={(e) => updateWorkEntry(index, 'company', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder={t('positionLabel', 'Lavozim')}
                          className="auth-input work-input"
                          value={entry.position}
                          onChange={(e) => updateWorkEntry(index, 'position', e.target.value)}
                        />
                        <div className="work-dates-row" style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('startDateLabel', 'Kirgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.startDate || ''}
                              onChange={(e) => updateWorkEntry(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 1, opacity: entry.isCurrent ? 0.5 : 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('endDateLabel', 'Ketgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.endDate || ''}
                              onChange={(e) => updateWorkEntry(index, 'endDate', e.target.value)}
                              disabled={entry.isCurrent}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <input 
                            type="checkbox" 
                            id={`current-${index}`} 
                            checked={entry.isCurrent || false}
                            onChange={(e) => updateWorkEntry(index, 'isCurrent', e.target.checked)}
                            style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: 'var(--primary)' }}
                          />
                          <label htmlFor={`current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>{t('currentlyWorking', 'Hozir ham ishlayman')}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {workHistory.length < 3 && (
                    <button type="button" className="add-work-btn" onClick={addWorkEntry}>
                      <Plus size={16} /> {workHistory.length === 0 ? t('addWorkExperience', "Ish tajribasi qo'shish") : t('addMore', "Yana qo'shish")}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* === COMPANY REGISTRATION === */}
            {selectedRole === 'company' && (
              <>
                <div className="form-section">
                  <h4>{t("companyInfo", "Kompaniya ma'lumotlari")}</h4>
                  
                  <div className="premium-input-group" style={{ marginBottom: '16px' }}>
                    <div className={`premium-input-wrapper ${fullName ? 'has-value' : ''}`}>
                      <span className="premium-input-icon"><Building2 size={20} /></span>
                      <input 
                        type="text" 
                        placeholder=" "
                        required 
                        className="premium-input" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        maxLength={50}
                      />
                      <label className="premium-label">{t("companyNamePlaceholder", "Kompaniya nomi")}</label>
                      <div className="premium-input-border"></div>
                    </div>
                  </div>

                  <div className="input-label-wrap" style={{ marginBottom: '16px' }}>
                    <label>{t('companyTypeLabel', 'Faoliyat turi')}</label>
                    <select 
                      className="auth-input" 
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                    >
                      <option value="logistics">{t('typeLogistics', 'Logistika / Yuk tashish')}</option>
                      <option value="driving_school">{t('typeDrivingSchool', 'Avtomaktab')}</option>
                      <option value="taxi_company">{t('typeTaxiCompany', 'Taksi xizmati / Kompaniyasi')}</option>
                      <option value="bus_company">{t('typeBusCompany', 'Avtobus xizmati / Yo\'nalishlari')}</option>
                      <option value="special_machinery">{t('typeSpecialMachinery', 'Maxsus texnika / Qurilish texnikasi')}</option>
                      <option value="other">{t('typeOther', 'Boshqa')}</option>
                    </select>
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder={t("companyAddressPlaceholder", "Kompaniya manzili")} 
                    className="auth-input" 
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    maxLength={120}
                    style={{ marginBottom: '16px' }}
                  />
                  
                  <input 
                    type="text" 
                    placeholder={t("corporateNumberPlaceholder", "Yuridik shaxs raqami (Houjin Bangou)")} 
                    className="auth-input" 
                    value={corporateNumber}
                    onChange={(e) => setCorporateNumber(e.target.value)}
                    maxLength={13}
                    style={{ marginBottom: '16px' }}
                  />
                  
                  <input 
                    type="url" 
                    placeholder={t("websitePlaceholder", "Kompaniya veb-sayti (ixtiyoriy)")} 
                    className="auth-input" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    maxLength={100}
                    style={{ marginBottom: '16px' }}
                  />
                  
                  <input 
                    type="number" 
                    placeholder={t("establishedYearPlaceholder", "Tashkil etilgan yili (Masalan: 2005)")} 
                    className="auth-input" 
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    maxLength={4}
                  />
                </div>

                <div className="form-section">
                  <h4>{t("companyDetailsTitle", "Bog'lanish uchun")}</h4>
                  <input 
                    type="text" 
                    placeholder={t("contactPersonPlaceholder", "Mas'ul shaxs ismi")} 
                    className="auth-input" 
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    maxLength={50}
                    style={{ marginBottom: '16px' }}
                  />
                  <input 
                    type="tel" 
                    placeholder={t("companyPhonePlaceholder", "Telefon raqam")} 
                    className="auth-input" 
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    maxLength={20}
                    style={{ marginBottom: '16px' }}
                  />
                  <input 
                    type="number" 
                    placeholder={t("employeeCountPlaceholder", "Ishchilar soni")} 
                    className="auth-input" 
                    value={employeeCount}
                    onInput={(e) => { e.target.value = e.target.value.slice(0, 6) }}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    style={{ marginBottom: '16px' }}
                  />
                  <textarea 
                    placeholder={t("companyDescPlaceholder", "Kompaniya haqida qisqacha")}
                    className="auth-textarea"
                    value={companyDesc}
                    onChange={(e) => setCompanyDesc(e.target.value)}
                    maxLength={300}
                  />
                </div>
              </>
            )}

            {/* Email & Password */}
            <div className="form-section">
              <h4>{t("accInfo", "Hisob ma'lumotlari")}</h4>
              
              <div className="premium-input-group" style={{ marginBottom: '12px' }}>
                <div className={`premium-input-wrapper ${email ? 'has-value' : ''}`}>
                  <span className="premium-input-icon"><Mail size={20} /></span>
                  <input 
                    type="email" 
                    placeholder=" "
                    required 
                    disabled={isEmailVerified}
                    className="premium-input" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailVerified(false);
                      setEmailVerificationToken(null);
                      setOtpSent(false);
                      setOtpErrorMsg('');
                      setOtpSuccessMsg('');
                    }}
                    maxLength={80}
                  />
                  <label className="premium-label">{t("emailPlaceholder", "Email manzili")}</label>
                  <div className="premium-input-border"></div>
                </div>
              </div>

              {/* Embedded n8n OTP Verification Standalone Component */}
              <N8nEmailOtpWidget 
                email={email} 
                isEmailVerified={isEmailVerified} 
                setIsEmailVerified={setIsEmailVerified} 
                onVerified={setEmailVerificationToken}
              />

              <div className="premium-input-group" style={{ marginBottom: '16px' }}>
                <div className={`premium-input-wrapper ${password ? 'has-value' : ''}`}>
                  <span className="premium-input-icon"><Lock size={20} /></span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder=" "
                    required 
                    className="premium-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={30}
                  />
                  <label className="premium-label">{t("passPlaceholder", "Yangi parol")}</label>
                  <button 
                    type="button" 
                    className="password-toggle-btn icon-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', background: 'none', boxShadow: 'none', border: 'none', padding: 0, width: 'auto', height: 'auto' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="premium-input-border"></div>
                </div>
                
                {/* Live Password Strength Meter */}
                {password && (
                  <div className="password-strength-container" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="strength-bar-track" style={{ height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                      <div className={`strength-bar-fill strength-${passwordStrength.label}`} style={{
                        height: '100%',
                        width: passwordStrength.score === 0 ? '15%' : passwordStrength.score === 1 ? '25%' : passwordStrength.score === 2 ? '50%' : passwordStrength.score === 3 ? '75%' : '100%',
                        background: passwordStrength.label === 'weak' ? '#FF3B30' : passwordStrength.label === 'fair' ? '#FF9500' : passwordStrength.label === 'good' ? '#FFD60A' : '#34C759',
                        transition: 'all 0.25s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: passwordStrength.label === 'weak' ? '#FF3B30' : passwordStrength.label === 'fair' ? '#FF9500' : passwordStrength.label === 'good' ? '#FFD60A' : '#34C759' }}>
                      {t(`passwordStrength${passwordStrength.label.charAt(0).toUpperCase() + passwordStrength.label.slice(1)}`)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Checklist */}
            <div className="form-section legal-section">
              <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '12px' }}>{t("legalInfo", "YAPONIYA QONUNIY SHARTLARI")}</h4>
              <div className="legal-card">
                <label className="terms-checkbox">
                  <input type="checkbox" checked={agreeLabor} onChange={(e) => setAgreeLabor(e.target.checked)} />
                  <span>
                    {t("legalLabor", "Yaponiya Mehnat standarti qonuniga rioya qilishga roziman.")}
                  </span>
                </label>
                <label className="terms-checkbox">
                  <input type="checkbox" checked={agreeVisa} onChange={(e) => setAgreeVisa(e.target.checked)} />
                  <span>
                    {t("legalVisa", "Chet el fuqarolari uchun tegishli viza maqomini taqdim etishga roziman.")}
                  </span>
                </label>
                <label className="terms-checkbox">
                  <input type="checkbox" checked={agreeAd} onChange={(e) => setAgreeAd(e.target.checked)} />
                  <span>
                    {t("legalAd", "Ma'lumotlarimdan reklama maqsadida foydalanishga rozilik bildiraman.")}
                  </span>
                </label>
              </div>
            </div>
            {otpErrorMsg && (
              <div role="alert" style={{ color: '#FF3B30', fontSize: '13px', fontWeight: 600, marginTop: '10px' }}>
                {otpErrorMsg}
              </div>
            )}

            <button 
              type="submit" 
              className={`btn-primary ${!allLegalAccepted ? 'btn-disabled' : ''}`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px', marginBottom: '20px', width: '100%' }}
            >
              {t("registerTitle", "Ro'yxatdan o'tish")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="role-container slide-up">
      <div className="header-text">
        <h1>{t('welcomeTitle', 'Xush kelibsiz')}</h1>
        <p>{t('welcomeSubtitle', 'Michi tizimida rolingizni tanlang')}</p>
      </div>

      <div className="roles-list">
        <div className="role-card glass squircle" onClick={() => handleRoleClick('driver')}>
          <div className="role-icon blue-bg">
            <UserCircle size={32} strokeWidth={1.5} color="#0A84FF" />
          </div>
          <div className="role-info">
            <h3>{t('roleDriverTitle', 'Haydovchi')}</h3>
            <p>{t('roleDriverDesc', 'Ish qidirish, akademiyada o\'qish va xizmatlar')}</p>
          </div>
        </div>

        <div className="role-card glass squircle" onClick={() => handleRoleClick('company')}>
          <div className="role-icon purple-bg">
            <Building2 size={32} strokeWidth={1.5} color="#AF52DE" />
          </div>
          <div className="role-info">
            <h3>{t('roleCompanyTitle', 'Kompaniya / Maktab')}</h3>
            <p>{t('roleCompanyDesc', 'E\'lon berish, xodimlarni boshqarish')}</p>
          </div>
        </div>
      </div>

      <button className="guest-btn" onClick={() => onGuest && onGuest()}>
        {t("guestBtn", "Mehmon sifatida kirish")}
      </button>
    </div>
  );
}

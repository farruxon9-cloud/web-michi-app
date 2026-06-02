import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, UserCircle, Plus, X, Camera, MailCheck, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import './RoleSelect.css';


const DRIVER_LICENSES = [
  'futsu', 'junchugata', 'chugata', 'oogata', 'oogata_tokushu',
  'kenin', 'dainishu', 'motorcycle', 'kogata_tokushu', 'gentsuki'
];

const TECH_CERTS = [
  'forklift', 'tamakake', 'crane', 'mobile_crane', 'excavator',
  'aerial_work', 'welding', 'hazardous'
];

export default function RoleSelect({ onSelectRole, onGuest }) {
  const { t } = useTranslation();
  
  // Auth flow states: 'role' -> 'login' -> 'register' -> 'verify'
  const [authStep, setAuthStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);

  // Login credentials
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================================================
  // PAROLNI TIKLASH VA QAYTA TIZIMGA KIRISH SHARTLARI (PASSWORD RECOVERY & INSTANT LOGIN)
  // [UZ] Foydalanuvchilar o'z parollarini unutganlarida, eski elektron pochtalari orqali
  // o'z profillariga oson va yengil qayta kirishlarini ta'minlash uchun ushbu holat boshqaruvchilari qo'shildi.
  // [JA] パスワード再設定及び即時ログイン管理用ステート：
  // ユーザーがパスワードを忘れた場合、古いメールアドレスを使用してプロフィールに簡単にアクセスし、
  // アプリの使用をシームレスに継続できるためのリカバリフローの状態管理変数群。
  // ==========================================================================
  const [forgotEmail, setForgotEmail] = useState(''); // [UZ] Parolni tiklash uchun kiritilgan eski email / [JA] パスワード再設定対象の登録済みメールアドレス
  const [recoveryCode, setRecoveryCode] = useState(''); // [UZ] Elektron pochtaga yuborilgan tiklash kodi (Test uchun: 1234) / [JA] メール宛てに送出されたリカバリ用認証コード（テスト用: 1234）
  const [newPassword, setNewPassword] = useState(''); // [UZ] Belgilanayotgan yangi kirish paroli / [JA] 設定される新しいログイン用パスワード
  const [recoveryStep, setRecoveryStep] = useState('email'); // [UZ] Tiklash jarayoni bosqichi ('email' | 'code' | 'new_password') / [JA] リカバリフローの現在フェーズ
  const [recoveryShowPassword, setRecoveryShowPassword] = useState(false); // [UZ] Yangi parolni ko'rsatish/yashirish to'g'risi / [JA] 新パスワード表示・非表示フラグ

  // Verify Code
  const [verifyCode, setVerifyCode] = useState('');

  const fileInputRef = useRef(null);

  // Shared Registration
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [gender, setGender] = useState('male');

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

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setAuthStep('login');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = loginEmail.trim();
    if (loginPassword === 'admin' && !trimmedEmail) {
      onSelectRole('admin', { fullName: 'Admin' });
    } else if (trimmedEmail === 'admin' && loginPassword === 'admin') {
      const mockData = selectedRole === 'company' 
        ? { fullName: 'Sagawa Express', companyType: 'logistics', email: 'admin@sagawa.jp' }
        : { fullName: 'Test Haydovchi', driverLicenses: ['oogata', 'kenin'], techCertificates: ['forklift'], email: 'admin@driver.jp' };
      onSelectRole(selectedRole, mockData);
    } else if (!trimmedEmail) {
      alert(t('emailRequired', "Iltimos, elektron pochtangizni kiriting."));
    } else {
      alert(t('loginError', "Login yoki parol noto'g'ri kiritilgan."));
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!allLegalAccepted) return;
    setAuthStep('verify');
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (verifyCode === '1234') {
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
        // Fallback string values for backward compatibility
        const fallbackAddress = filteredAddressHistory.map(a => a.address + (a.isCurrent ? ` (${t('currentAddressLabel', 'Hozirgi')})` : '')).join(', ');
        const fallbackEducation = filteredEducationHistory.map(e => `${e.school}${e.major ? ` (${e.major})` : ''} • ${e.startDate || ''} ~ ${e.isCurrent ? t('currentlyStudyingLabel', 'O\'qiyotgan') : e.endDate || ''}`).join(', ');

        onSelectRole(selectedRole, {
          fullName,
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
      alert(t('verifyError', "Tasdiqlash kodi noto'g'ri!"));
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

  if (authStep === 'verify') {
    return (
      <div className="role-container slide-up">
        <div className="auth-card glass squircle" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <button className="icon-btn" onClick={() => setAuthStep('register')} style={{ position: 'absolute', top: 20, left: 20 }}>
            <ArrowLeft size={20} />
          </button>
          <MailCheck size={48} color="#0A84FF" style={{ margin: '20px auto' }} />
          <h2 style={{ marginBottom: '10px' }}>{t('emailVerification', 'Email tasdiqlash')}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('emailVerifyDesc', 'Iltimos, emailingizga yuborilgan 4 xonali kodni kiriting. (Test uchun: 1234)')}
          </p>
          <form onSubmit={handleVerifySubmit}>
            <input 
              type="number" 
              placeholder="1234" 
              className="auth-input" 
              style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary squircle" style={{ marginTop: '20px' }}>
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
    const handleRecoverySubmit = (e) => {
      e.preventDefault();
      if (recoveryStep === 'email') {
        if (!forgotEmail) {
          alert(t('emailRequired', "Iltimos, elektron pochtangizni kiriting."));
          return;
        }
        setRecoveryStep('code');
      } else if (recoveryStep === 'code') {
        if (recoveryCode === '1234') {
          setRecoveryStep('new_password');
        } else {
          alert(t('verifyError', "Tasdiqlash kodi noto'g'ri!"));
        }
      } else if (recoveryStep === 'new_password') {
        if (!newPassword) {
          alert(t('passwordRequired', "Iltimos, yangi parol kiriting."));
          return;
        }
        alert(t('recoverySuccessAlert', "Parolingiz muvaffaqiyatli tiklandi va profilingizga kirdingiz!"));
        
        // [UZ] Eski elektron pochta va yangilangan parol ostida tizimga darhol kirish (yengil o'tish)
        // [JA] 古いメールアドレス情報を引き継いだ形で即時自動ログインを実行するモックデータ定義
        const mockData = selectedRole === 'company'
          ? { fullName: 'Sagawa Express', companyType: 'logistics', email: forgotEmail }
          : { fullName: 'Mehmon Haydovchi', driverLicenses: ['oogata', 'kenin'], techCertificates: ['forklift'], email: forgotEmail };
        onSelectRole(selectedRole, mockData);
      }
    };

    return (
      <div className="role-container login-centered-container slide-up">
        <div className="auth-card glass squircle" style={{ position: 'relative', width: '100%' }}>
          <button 
            className="icon-btn" 
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
                    {t('recoveryCodeSentMsg', 'Esda tuting, tiklash kodi emailingizga yuborildi. (Test kodi: 1234)')}
                  </p>
                  <input 
                    type="number" 
                    placeholder="1234" 
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
            
            <button type="submit" className="btn-primary squircle" style={{ marginTop: '4px', width: '100%', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), #4338CA)', boxShadow: '0 8px 20px rgba(90, 85, 234, 0.25)' }}>
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
          <button className="icon-btn" onClick={() => setAuthStep('role')} style={{ position: 'absolute', top: '16px', left: '16px' }}>
            <ArrowLeft size={20} />
          </button>
          
          <div className="auth-logo-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', marginBottom: '8px' }}>
            <div className="logo-kanji" style={{ transform: 'scale(1.25)', boxShadow: '0 8px 24px rgba(90, 85, 234, 0.35)' }}>道</div>
          </div>

          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>{t('loginTitle', 'Tizimga kirish')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
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
            
            <button type="submit" className="btn-primary squircle" style={{ marginTop: '4px', width: '100%', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), #4338CA)', boxShadow: '0 8px 20px rgba(90, 85, 234, 0.25)' }}>
              {t('loginBtn', 'Kirish')}
            </button>
          </form>
          
          <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '500' }}>{t("noAccount", "Akkauntingiz yo'qmi?")}</p>
            <button 
              onClick={() => setAuthStep('register')}
              className="btn-primary squircle"
              style={{ background: 'rgba(10, 132, 255, 0.08)', color: '#0A84FF', border: '1px solid rgba(10, 132, 255, 0.15)', padding: '10px', fontSize: '14px', width: '100%', borderRadius: '12px' }}
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
          <button className="icon-btn glass" onClick={() => setAuthStep('login')} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
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
                  <input 
                    type="text" 
                    placeholder={t("namePlaceholder", "To'liq ismingiz")}
                    required 
                    className="auth-input" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={50}
                  />

                  <div className="input-label-wrap" style={{ marginTop: '16px', marginBottom: '8px' }}>
                    <label>{t('genderLabel', 'Jinsingiz')}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setGender('male')}
                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${gender === 'male' ? 'var(--primary)' : 'var(--glass-border)'}`, background: gender === 'male' ? 'rgba(90, 85, 234, 0.1)' : 'transparent', color: gender === 'male' ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {t('male', 'Erkak')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setGender('female')}
                        style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${gender === 'female' ? '#FF2D55' : 'var(--glass-border)'}`, background: gender === 'female' ? 'rgba(255, 45, 85, 0.1)' : 'transparent', color: gender === 'female' ? '#FF2D55' : 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
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
                    <div key={index} className="work-entry glass squircle" style={{ marginBottom: '10px', padding: '12px', border: '1px solid var(--glass-border)' }}>
                      <div className="work-entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="work-entry-num" style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px' }}>#{index + 1}</span>
                        <button 
                          type="button" 
                          className="remove-work-btn"
                          style={{ background: 'rgba(255, 59, 48, 0.08)', border: 'none', color: '#FF3B30', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => removeAddressEntry(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="work-entry-fields" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder={t('livingAddressPlaceholder', 'Manzilingizni kiriting (Prefektura, shahar, ko\'cha)...')}
                          className="auth-input work-input"
                          value={entry.address}
                          onChange={(e) => updateAddressEntry(index, 'address', e.target.value)}
                          maxLength={120}
                          required
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <input 
                            type="checkbox" 
                            id={`addr-current-${index}`} 
                            checked={entry.isCurrent || false}
                            onChange={(e) => updateAddressEntry(index, 'isCurrent', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <label htmlFor={`addr-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('currentAddressLabel', 'Hozirgi yashash joyim')}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {addressHistory.length < 3 && (
                    <button type="button" className="add-work-btn" style={{ width: '100%', marginBottom: '16px', background: 'rgba(90, 85, 234, 0.08)', border: '1px dashed rgba(90, 85, 234, 0.3)', color: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={addAddressEntry}>
                      <Plus size={15} /> {addressHistory.length === 0 ? t('addAddressBtn', "Yashash manzili qo'shish") : t('addMore', "Yana qo'shish")}
                    </button>
                  )}

                  {/* Dynamic Education History */}
                  <div className="input-label-wrap" style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>{t('educationTitle', 'Ta\'lim ma\'lumotlari')}</label>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t("educationHistorySub", "Tugatgan maktab, kollej yoki universitetlaringiz (Maksimal 3 ta)")}</p>
                  </div>
                  {educationHistory.map((entry, index) => (
                    <div key={index} className="work-entry glass squircle" style={{ marginBottom: '10px', padding: '12px', border: '1px solid var(--glass-border)' }}>
                      <div className="work-entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="work-entry-num" style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px' }}>#{index + 1}</span>
                        <button 
                          type="button" 
                          className="remove-work-btn"
                          style={{ background: 'rgba(255, 59, 48, 0.08)', border: 'none', color: '#FF3B30', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => removeEducationEntry(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="work-entry-fields" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('startDateLabel', 'Kirgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.startDate || ''}
                              onChange={(e) => updateEducationEntry(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 1, opacity: entry.isCurrent ? 0.5 : 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('endDateLabel', 'Ketgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.endDate || ''}
                              onChange={(e) => updateEducationEntry(index, 'endDate', e.target.value)}
                              disabled={entry.isCurrent}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <input 
                            type="checkbox" 
                            id={`edu-current-${index}`} 
                            checked={entry.isCurrent || false}
                            onChange={(e) => updateEducationEntry(index, 'isCurrent', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          <label htmlFor={`edu-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('currentlyStudyingLabel', 'Hozir ham o\'qiyman')}</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {educationHistory.length < 3 && (
                    <button type="button" className="add-work-btn" style={{ width: '100%', marginBottom: '16px', background: 'rgba(90, 85, 234, 0.08)', border: '1px dashed rgba(90, 85, 234, 0.3)', color: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={addEducationEntry}>
                      <Plus size={15} /> {educationHistory.length === 0 ? t('addEducationBtn', "O'qish joyi qo'shish") : t('addMore', "Yana qo'shish")}
                    </button>
                  )}
                </div>

                <div className="form-section">
                  <h4>{t("proInfo", "Kasbiy ma'lumotlar")}</h4>
                    <div className="input-group">
                      <label style={{marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)'}}>{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}</label>
                      <div className="checkbox-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px'}}>
                        {DRIVER_LICENSES.map(cert => (
                          <label key={cert} style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'}}>
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
                      <div className="checkbox-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px'}}>
                        {TECH_CERTS.map(cert => (
                          <label key={cert} style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'}}>
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
                    <div key={index} className="work-entry glass squircle">
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
                        <div className="work-dates-row" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('startDateLabel', 'Kirgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.startDate || ''}
                              onChange={(e) => updateWorkEntry(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div style={{ flex: 1, opacity: entry.isCurrent ? 0.5 : 1 }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('endDateLabel', 'Ketgan vaqti')}</label>
                            <input
                              type="month"
                              className="auth-input work-input"
                              value={entry.endDate || ''}
                              onChange={(e) => updateWorkEntry(index, 'endDate', e.target.value)}
                              disabled={entry.isCurrent}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                          <input 
                            type="checkbox" 
                            id={`current-${index}`} 
                            checked={entry.isCurrent || false}
                            onChange={(e) => updateWorkEntry(index, 'isCurrent', e.target.checked)}
                          />
                          <label htmlFor={`current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('currentlyWorking', 'Hozir ham ishlayman')}</label>
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
                  <input 
                    type="text" 
                    placeholder={t("companyNamePlaceholder", "Kompaniya nomi")} 
                    required 
                    className="auth-input" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={50}
                  />
                  <div className="input-label-wrap">
                    <label>{t('companyTypeLabel', 'Faoliyat turi')}</label>
                    <select 
                      className="auth-input" 
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                    >
                      <option value="logistics">{t('typeLogistics', 'Logistika / Yuk tashish')}</option>
                      <option value="driving_school">{t('typeDrivingSchool', 'Avtomaktab')}</option>
                      <option value="manufacturing">{t('typeManufacturing', 'Ishlab chiqarish')}</option>
                      <option value="food_service">{t('typeFoodService', 'Oziq-ovqat xizmati')}</option>
                      <option value="construction">{t('typeConstruction', 'Qurilish')}</option>
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
                  />
                  <input 
                    type="text" 
                    placeholder={t("corporateNumberPlaceholder", "Yuridik shaxs raqami (Houjin Bangou)")} 
                    className="auth-input" 
                    value={corporateNumber}
                    onChange={(e) => setCorporateNumber(e.target.value)}
                    maxLength={13}
                  />
                  <input 
                    type="url" 
                    placeholder={t("websitePlaceholder", "Kompaniya veb-sayti (ixtiyoriy)")} 
                    className="auth-input" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    maxLength={100}
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
                  />
                  <input 
                    type="tel" 
                    placeholder={t("companyPhonePlaceholder", "Telefon raqam")} 
                    className="auth-input" 
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    maxLength={20}
                  />
                  <input 
                    type="number" 
                    placeholder={t("employeeCountPlaceholder", "Ishchilar soni")} 
                    className="auth-input" 
                    value={employeeCount}
                    onInput={(e) => { e.target.value = e.target.value.slice(0, 6) }}
                    onChange={(e) => setEmployeeCount(e.target.value)}
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
              <input 
                type="email" 
                placeholder={t("emailPlaceholder", "Email manzili")} 
                required 
                className="auth-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={80}
              />
              <input 
                type="password" 
                placeholder={t("passPlaceholder", "Yangi parol")} 
                required 
                className="auth-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={30}
              />
            </div>

            {/* Legal Checklist */}
            <div className="form-section legal-section">
              <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '12px' }}>{t("legalInfo", "YAPONIYA QONUNIY SHARTLARI")}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input type="checkbox" checked={agreeLabor} onChange={(e) => setAgreeLabor(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {t("legalLabor", "Yaponiya Mehnat standarti qonuniga rioya qilishga roziman.")}
                  </span>
                </label>
                <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input type="checkbox" checked={agreeVisa} onChange={(e) => setAgreeVisa(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {t("legalVisa", "Chet el fuqarolari uchun tegishli viza maqomini taqdim etishga roziman.")}
                  </span>
                </label>
                <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input type="checkbox" checked={agreeAd} onChange={(e) => setAgreeAd(e.target.checked)} style={{ marginTop: '3px' }} />
                  <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {t("legalAd", "Ma'lumotlarimdan reklama maqsadida foydalanishga rozilik bildiraman.")}
                  </span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn-primary squircle ${!allLegalAccepted ? 'btn-disabled' : ''}`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px', marginBottom: '20px' }}
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

      <button className="guest-btn" onClick={() => onGuest()}>
        {t("guestBtn", "Mehmon sifatida kirish")}
      </button>


    </div>
  );
}

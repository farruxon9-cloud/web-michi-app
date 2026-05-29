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

  // Company-specific Registration
  const [companyType, setCompanyType] = useState('logistics');
  const [companyAddress, setCompanyAddress] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');

  // Legal
  const [agreeAllTerms, setAgreeAllTerms] = useState(false);
  const allLegalAccepted = agreeAllTerms;

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setAuthStep('login');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginPassword === 'admin' && !loginEmail) {
      onSelectRole('admin', { fullName: 'Admin' });
    } else if (loginEmail === 'admin' && loginPassword === 'admin') {
      const mockData = selectedRole === 'company' 
        ? { fullName: 'Sagawa Express', companyType: 'logistics', email: 'admin@sagawa.jp' }
        : { fullName: 'Test Haydovchi', driverLicenses: ['oogata', 'kenin'], techCertificates: ['forklift'], email: 'admin@driver.jp' };
      onSelectRole(selectedRole, mockData);
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
        });
      } else {
        onSelectRole(selectedRole, {
          fullName,
          email,
          avatar,
          gender,
          birthDate,
          driverLicenses,
            techCertificates,
          workHistory: workHistory.filter(w => w.company || w.position),
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

  if (authStep === 'login') {
    return (
      <div className="role-container login-centered-container slide-up">
        <div className="auth-card glass squircle" style={{ position: 'relative', width: '100%' }}>
          <button className="icon-btn" onClick={() => setAuthStep('role')} style={{ position: 'absolute', top: '16px', left: '16px' }}>
            <ArrowLeft size={20} />
          </button>
          
          <div className="auth-logo-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', marginBottom: '8px' }}>
            <div className="logo-kanji" style={{ transform: 'scale(1.25)', boxShadow: '0 8px 24px rgba(90, 85, 234, 0.35)', animation: 'blob-float 10s infinite alternate ease-in-out' }}>道</div>
          </div>

          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>{t('loginTitle', 'Tizimga kirish')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {selectedRole === 'company' ? t('roleCompanyTitle', 'Kompaniya') : t('roleDriverTitle', 'Haydovchi')} - {t('loginTitle', 'Tizimga kirish')}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="auth-form hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: 'none', padding: 0 }}>
              
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
                    required
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

            </div>
            
            <button type="submit" className="btn-primary squircle" style={{ marginTop: '4px', width: '100%', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), #4338CA)', boxShadow: '0 8px 20px rgba(90, 85, 234, 0.25)' }}>
              {t('loginBtn', 'Kirish')}
            </button>
          </form>
          
          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '500' }}>{t("noAccount", "Akkauntingiz yo'qmi?")}</p>
            <button 
              onClick={() => setAuthStep('register')}
              className="btn-primary squircle"
              style={{ background: 'rgba(10, 132, 255, 0.08)', color: '#0A84FF', border: '1px solid rgba(10, 132, 255, 0.15)', padding: '12px', fontSize: '14px', width: '100%', borderRadius: '12px' }}
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
        <div className="auth-card glass squircle">
          <button className="icon-btn" onClick={() => setAuthStep('login')}>
            <ArrowLeft size={20} />
          </button>
          <div className="auth-header">
            <h2>{t("registerTitle", "Ro'yxatdan o'tish")}</h2>
            <p>{t("registerSub", "Michi platformasida professional profil yaratish")}</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="auth-form-scroll hide-scrollbar">
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
              <label className="terms-checkbox" style={{ alignItems: 'flex-start', gap: '10px' }}>
                <input type="checkbox" checked={agreeAllTerms} onChange={(e) => setAgreeAllTerms(e.target.checked)} style={{ marginTop: '3px' }} />
                <span style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {t("legalLabor", "Yaponiya Mehnat standarti qonuniga (労働基準法) rioya qilishga roziman.")}<br/><br/>
                  {t("legalVisa", "Chet el fuqarolari uchun tegishli viza maqomini taqdim etishga roziman.")}<br/><br/>
                  {t("legalAd", "Ma'lumotlarimdan reklama maqsadida foydalanishga rozilik bildiraman.")}
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className={`btn-primary squircle ${!allLegalAccepted ? 'btn-disabled' : ''}`}
              disabled={!allLegalAccepted}
              style={{ marginTop: '10px' }}
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

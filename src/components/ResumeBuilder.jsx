import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, User, Phone, Briefcase, GraduationCap, 
  Award, BookOpen, FileText, Loader2, Sparkles, 
  ShieldCheck, CheckCircle2, X, Plus 
} from 'lucide-react';
import { generateRirekisho } from '../utils/resumeGenerator';
import './ResumeBuilder.css';

const getJapaneseEra = (year) => {
  const y = parseInt(year, 10);
  if (isNaN(y)) return '';
  if (y >= 2019) {
    const eraYear = y - 2019 + 1;
    return `令和${eraYear === 1 ? '元' : eraYear}年`;
  }
  if (y >= 1989) {
    const eraYear = y - 1989 + 1;
    return `平成${eraYear === 1 ? '元' : eraYear}年`;
  }
  if (y >= 1926) {
    const eraYear = y - 1926 + 1;
    return `昭和${eraYear === 1 ? '元' : eraYear}年`;
  }
  return '';
};

export default function ResumeBuilder({ 
  profileData = {}, 
  onUpdateProfile, 
  onBack,
  isVoiceActive,
  setIsVoiceActive,
  isVoiceStandby,
  setIsVoiceStandby
}) {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'uz').substring(0, 2).toLowerCase();

  const [formData, setFormData] = useState({
    fullName: '',
    furigana: '',
    birthDate: '',
    gender: 'male',
    birthPlace: '',
    nationality: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    motivation: '',
    selfPR: '',
    hobbies: '',
    personalRequests: '貴社規定に従います。',
    educationHistory: [],
    workHistory: [],
    driverLicenses: [],
    techCertificates: [],
    jlptStatus: null
  });

  const [pdfStatus, setPdfStatus] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // JLPT Verifikatsiya holatlari
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatusText, setVerificationStatusText] = useState('');
  const [detectedLevel, setDetectedLevel] = useState('N3');
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const verifyIntervalRef = useRef(null);

  // Sana boshqaruvi
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const debounceTimeoutRef = useRef(null);
  const previousUrlRef = useRef(null);

  // 1. Blob URL larni tozalash (Memory Leak Prevention)
  const setCleanPreviewUrl = useCallback((newUrl) => {
    if (previousUrlRef.current && previousUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrlRef.current);
    }
    previousUrlRef.current = newUrl;
    setPdfPreviewUrl(newUrl);
  }, []);

  // 2. Boshlang'ich ma'lumotlarni sinxronlash
  useEffect(() => {
    const bDate = profileData.birthDate || '';
    const initialData = {
      fullName: profileData.fullName || '',
      furigana: profileData.furigana || '',
      birthDate: bDate,
      gender: profileData.gender || 'male',
      birthPlace: profileData.birthPlace || '',
      nationality: profileData.nationality || '',
      postalCode: profileData.postalCode || '',
      address: profileData.address || '',
      phone: profileData.phone || '',
      email: profileData.email || '',
      motivation: profileData.motivation || '',
      selfPR: profileData.selfPR || '',
      hobbies: profileData.hobbies || '',
      personalRequests: profileData.personalRequests || '貴社規定に従います。',
      educationHistory: Array.isArray(profileData.educationHistory) 
        ? profileData.educationHistory.map(edu => ({
            school: edu.school || '',
            major: edu.major || edu.degree || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || edu.gradDate || ''
          })) 
        : [],
      workHistory: Array.isArray(profileData.workHistory) ? [...profileData.workHistory] : [],
      driverLicenses: Array.isArray(profileData.driverLicenses) ? [...profileData.driverLicenses] : [],
      techCertificates: Array.isArray(profileData.techCertificates) ? [...profileData.techCertificates] : [],
      jlptStatus: profileData.jlptStatus || null
    };

    setFormData(initialData);

    if (bDate) {
      const parts = bDate.split('-');
      if (parts.length === 3) {
        setSelectedYear(parts[0]);
        setSelectedMonth(parseInt(parts[1], 10).toString());
        setSelectedDay(parseInt(parts[2], 10).toString());
      }
    }

    // PDF Preview yaratish
    handlePreviewPDF(initialData);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
      if (previousUrlRef.current && previousUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
      if (setIsVoiceActive) setIsVoiceActive(false);
      if (setIsVoiceStandby) setIsVoiceStandby(false);
    };
  }, []);

  // 3. Ovozli yordamchi orqali rezyumeni to'ldirish hodisasi
  useEffect(() => {
    const handleVoiceUpdate = (e) => {
      if (!e.detail) return;
      const { field, value } = e.detail;
      setFormData(prev => {
        let updated;
        if (field === 'driverLicenses' || field === 'techCertificates') {
          const arr = Array.isArray(value) ? value : [value];
          const current = prev[field] || [];
          const merged = Array.from(new Set([...current, ...arr]));
          updated = { ...prev, [field]: merged };
        } else {
          updated = { ...prev, [field]: value };
        }

        setTimeout(() => {
          const inputEl = document.getElementById(field);
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.focus();
            inputEl.classList.add('voice-highlight');
            setTimeout(() => inputEl.classList.remove('voice-highlight'), 2500);
          }
        }, 100);

        handlePreviewPDF(updated);
        onUpdateProfile?.(updated);
        return updated;
      });
    };

    window.addEventListener('michi-voice-resume-update', handleVoiceUpdate);
    return () => window.removeEventListener('michi-voice-resume-update', handleVoiceUpdate);
  }, [onUpdateProfile]);

  // 4. Debounced PDF Preview generatsiyasi (3 soniya nofaollikdan keyin)
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      handlePreviewPDF(formData);
    }, 3000);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [formData]);

  // PDF Preview yaratish yordamchisi
  const handlePreviewPDF = async (dataToUse = formData) => {
    try {
      const dataUrl = await generateRirekisho(dataToUse, {
        onProgress: (status) => setPdfStatus(status),
        download: false
      });
      if (dataUrl) {
        setCleanPreviewUrl(dataUrl);
      }
    } catch (e) {
      setPdfStatus('failed');
    }
  };

  // PDF Yuklab olish
  const handleDownloadPDF = async () => {
    onUpdateProfile?.(formData);
    try {
      await generateRirekisho(formData, {
        onProgress: (status) => setPdfStatus(status),
        download: true
      });
    } catch (e) {
      setPdfStatus('failed');
      alert(t('pdfError', 'PDF yaratishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.'));
    }
  };

  // Yangi oynada xavfsiz ochish
  const handleOpenPDFInNewTab = (e) => {
    e.preventDefault();
    if (pdfPreviewUrl) {
      const newWin = window.open(pdfPreviewUrl, '_blank', 'noopener,noreferrer');
      if (!newWin) {
        alert(t('popupBlocked', 'Pop-up oyna bloklandi. Brauzer sozlamalaridan ruxsat bering yoki PDFni yuklab oling.'));
      }
    } else {
      alert(t('previewNotReady', 'PDF hali tayyor emas. Iltimos, bir oz kuting.'));
    }
  };

  // Sana kiritish hodisalari
  const handleDayInput = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    setSelectedDay(clean);
    updateBirthDate(selectedYear, selectedMonth, clean);
  };

  const handleMonthInput = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    setSelectedMonth(clean);
    updateBirthDate(selectedYear, clean, selectedDay);
  };

  const handleYearInput = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    setSelectedYear(clean);
    updateBirthDate(clean, selectedMonth, selectedDay);
  };

  const updateBirthDate = (y, m, d) => {
    if (y && y.length === 4 && m && d && parseInt(m, 10) >= 1 && parseInt(m, 10) <= 12 && parseInt(d, 10) >= 1 && parseInt(d, 10) <= 31) {
      const fm = String(m).padStart(2, '0');
      const fd = String(d).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${y}-${fm}-${fd}` }));
    } else {
      setFormData(prev => ({ ...prev, birthDate: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const parseYearMonth = (dateStr) => {
    if (!dateStr) return { year: '', month: '' };
    const parts = dateStr.split('-');
    return { year: parts[0] || '', month: parts[1] ? parseInt(parts[1], 10).toString() : '' };
  };

  const buildYearMonth = (year, month) => {
    if (!year && !month) return '';
    const y = year || '';
    const m = month ? String(month).padStart(2, '0') : '';
    return (y && m) ? `${y}-${m}` : (y || '');
  };

  // Ta'lim ro'yxati
  const handleAddEdu = () => {
    setFormData(prev => ({
      ...prev,
      educationHistory: [...prev.educationHistory, { school: '', major: '', startDate: '', endDate: '' }]
    }));
  };

  const handleRemoveEdu = (index) => {
    setFormData(prev => ({
      ...prev,
      educationHistory: prev.educationHistory.filter((_, i) => i !== index)
    }));
  };

  const handleEduChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.educationHistory];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educationHistory: updated };
    });
  };

  // Ish tajribasi ro'yxati
  const handleAddWork = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { company: '', position: '', startDate: '', endDate: '', isCurrent: false }]
    }));
  };

  const handleRemoveWork = (index) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index)
    }));
  };

  const handleWorkChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.workHistory];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workHistory: updated };
    });
  };

  const handleToggleLicense = (lic) => {
    setFormData(prev => {
      const exists = prev.driverLicenses.includes(lic);
      const updated = exists ? prev.driverLicenses.filter(l => l !== lic) : [...prev.driverLicenses, lic];
      return { ...prev, driverLicenses: updated };
    });
  };

  const handleToggleCertificate = (cert) => {
    setFormData(prev => {
      const exists = prev.techCertificates.includes(cert);
      const updated = exists ? prev.techCertificates.filter(c => c !== cert) : [...prev.techCertificates, cert];
      return { ...prev, techCertificates: updated };
    });
  };

  // JLPT Sertifikatini verifikatsiya qilish simulyatsiyasi (Xavfsiz interval bilan)
  const handleVerifyStart = (file) => {
    if (!file) return;
    setUploadedFile(file);
    setIsVerifying(true);
    setVerificationProgress(0);
    setVerificationStatusText(currentLang === 'ja' ? 'ファイルを解析中...' : 'Fayl tahlil qilinmoqda...');

    let extractedLevel = 'N3';
    const match = file.name.toUpperCase().match(/N[1-5]|Ｎ[１-５]/);
    if (match) {
      extractedLevel = match[0].replace('Ｎ', 'N');
    }
    setDetectedLevel(extractedLevel);

    if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);

    let progress = 0;
    verifyIntervalRef.current = setInterval(() => {
      progress += 20;
      setVerificationProgress(progress);

      if (progress >= 100) {
        clearInterval(verifyIntervalRef.current);
        const certNo = `No. 26A${Math.floor(100000 + Math.random() * 900000)}`;
        setIsVerifying(false);

        const updatedStatus = {
          level: extractedLevel,
          verified: true,
          certNo,
          date: new Date().toISOString().split('T')[0]
        };

        setFormData(prev => {
          const updated = { ...prev, jlptStatus: updatedStatus };
          onUpdateProfile?.(updated);
          return updated;
        });
      }
    }, 250);
  };

  const handleResetVerification = () => {
    setUploadedFile(null);
    setFormData(prev => {
      const updated = { ...prev, jlptStatus: null };
      onUpdateProfile?.(updated);
      return updated;
    });
  };

  return (
    <div className="resume-builder-container fade-in">
      {/* Yuqori orqaga qaytish va ovozli panel */}
      <div className="resume-builder-sticky-back" style={{ display: 'flex', width: '92%', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          type="button" 
          onClick={() => {
            onUpdateProfile?.(formData);
            onBack?.();
          }} 
          className="icon-btn glass" 
          aria-label={t('backBtn', 'Orqaga')}
        >
          <ArrowLeft size={20} />
        </button>

        {setIsVoiceActive && setIsVoiceStandby && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>AI VOICE</span>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => {
                const nextVal = !isVoiceStandby;
                if (nextVal) {
                  window.dispatchEvent(new CustomEvent('michi-voice-resume-start'));
                }
                setIsVoiceStandby(nextVal);
                setIsVoiceActive(nextVal);
              }}
              aria-label="AI Voice"
            >
              <div className={`theme-toggle-track ${isVoiceStandby ? 'dark' : 'light'}`} style={{ width: '48px', height: '24px', borderRadius: '12px' }}>
                <div className="theme-toggle-thumb" style={{ width: '18px', height: '18px', left: isVoiceStandby ? 'calc(100% - 20px)' : '2px', top: '2px' }}>
                  <Sparkles size={10} color="#ffffff" />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="resume-builder-body">
        <h2 className="resume-builder-title">{t('resumeBuilderTitle', 'Yapon Rezyumesi (履歴書)')}</h2>

        {/* 1-BO'LIM: Shaxsiy ma'lumotlar */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <User className="step-icon text-purple" size={24} />
            <h3>{t('personalInfo', 'Shaxsiy ma\'lumotlar')}</h3>
            <p>{t('step1Desc', 'Rirekisho rezyumesi uchun shaxsiy ma\'lumotlaringizni to\'ldiring.')}</p>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">{t('fullNameLabel', 'Ism va familiya')}</label>
            <input 
              type="text" 
              id="fullName"
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange}
              placeholder="Masalan: ALIMOV ANVAR"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="furigana">{t('katakanaNameLabel', 'Katakanada yozilishi')}</label>
            <input 
              type="text" 
              id="furigana"
              name="furigana" 
              value={formData.furigana} 
              onChange={handleChange}
              placeholder="Masalan: アリモフ アンバル"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>{t('genderLabel', 'Jins')}</label>
            <div className="gender-select-row">
              <button
                type="button"
                className={`gender-select-btn male ${formData.gender === 'male' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
              >
                {t('male', 'Erkak')}
              </button>
              <button
                type="button"
                className={`gender-select-btn female ${formData.gender === 'female' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
              >
                {t('female', 'Ayol')}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{t('dobLabel', "Tug'ilgan sana")}</label>
            <div className="dob-inputs-row">
              <div className="dob-input-wrapper">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="DD"
                  value={selectedDay} 
                  onChange={(e) => handleDayInput(e.target.value)}
                  className="glass-input dob-num-input"
                />
                <span className="dob-input-suffix">{t('daySuffix', 'kun')}</span>
              </div>

              <div className="dob-input-wrapper">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="MM"
                  value={selectedMonth} 
                  onChange={(e) => handleMonthInput(e.target.value)}
                  className="glass-input dob-num-input"
                />
                <span className="dob-input-suffix">{t('monthSuffix', 'oy')}</span>
              </div>

              <div className="dob-input-wrapper year-wrapper">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="YYYY"
                  value={selectedYear} 
                  onChange={(e) => handleYearInput(e.target.value)}
                  className="glass-input dob-num-input"
                />
                <span className="dob-input-suffix">{t('yearSuffix', 'yil')}</span>
              </div>
            </div>

            {selectedYear && getJapaneseEra(selectedYear) && (
              <div className="dob-era-preview">
                <span className="dob-era-badge">{getJapaneseEra(selectedYear)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2-BO'LIM: Aloqa va Manzil */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <Phone className="step-icon text-purple" size={24} />
            <h3>{t('contactInfo', 'Aloqa va Manzil')}</h3>
          </div>

          <div className="form-group">
            <label htmlFor="postalCode">{t('postalCodeLabel', 'Pochta indeksi')}</label>
            <input 
              type="text" 
              id="postalCode"
              name="postalCode" 
              value={formData.postalCode} 
              onChange={handleChange}
              placeholder="160-0023"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">{t('livingAddressTitle', 'Yashash manzilingiz')}</label>
            <input 
              type="text" 
              id="address"
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              placeholder="Tokyo-to, Shinjuku-ku..."
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t('phoneLabel', 'Telefon raqam')}</label>
            <input 
              type="tel" 
              id="phone"
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="080-1234-5678"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('emailPlaceholder', 'Email manzil')}</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className="glass-input"
            />
          </div>
        </div>

        {/* 3-BO'LIM: Ta'lim tarixi */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <GraduationCap className="step-icon text-purple" size={24} />
            <h3>{t('educationTitle', 'Ta\'lim tarixi')}</h3>
          </div>

          <div className="history-list">
            {formData.educationHistory.map((edu, idx) => (
              <div key={idx} className="history-card glass-card">
                <div className="history-card-header">
                  <h4>{t('education', 'Ta\'lim')} #{idx + 1}</h4>
                  <button type="button" onClick={() => handleRemoveEdu(idx)} className="remove-btn">
                    {t('remove', 'O\'chirish')}
                  </button>
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={t('schoolName', 'Muassasa nomi')}
                    value={edu.school} 
                    onChange={(e) => handleEduChange(idx, 'school', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={t('degree', 'Mutaxassislik')}
                    value={edu.major} 
                    onChange={(e) => handleEduChange(idx, 'major', e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddEdu} className="add-btn squircle">
            + {t('addEducation', 'Ta\'lim qo\'shish')}
          </button>
        </div>

        {/* 4-BO'LIM: Ish tajribasi va Litsenziyalar */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <Briefcase className="step-icon text-purple" size={24} />
            <h3>{t('workExperience', 'Ish tajribasi')}</h3>
          </div>

          <div className="history-list">
            {formData.workHistory.map((work, idx) => (
              <div key={idx} className="history-card glass-card">
                <div className="history-card-header">
                  <h4>{t('company', 'Kompaniya')} #{idx + 1}</h4>
                  <button type="button" onClick={() => handleRemoveWork(idx)} className="remove-btn">
                    {t('remove', 'O\'chirish')}
                  </button>
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={t('companyName', 'Kompaniya nomi')}
                    value={work.company} 
                    onChange={(e) => handleWorkChange(idx, 'company', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={t('position', 'Lavozim')}
                    value={work.position} 
                    onChange={(e) => handleWorkChange(idx, 'position', e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddWork} className="add-btn squircle">
            + {t('addWork', 'Ish joyi qo\'shish')}
          </button>

          {/* Guvohnomalar */}
          <div className="step-intro" style={{ marginTop: '20px' }}>
            <Award className="step-icon text-purple" size={24} />
            <h3>{t('licensesQualifications', 'Guvohnoma va Sertifikatlar')}</h3>
          </div>
          
          <div className="badges-select-group">
            {['futsu', 'junchugata', 'chugata', 'oogata'].map(lic => (
              <button 
                key={lic}
                type="button"
                onClick={() => handleToggleLicense(lic)}
                className={`badge-select-btn squircle ${formData.driverLicenses.includes(lic) ? 'selected' : ''}`}
              >
                {t(`lic_${lic}`)}
              </button>
            ))}
          </div>

          {/* JLPT Sertifikat bloki */}
          {formData.jlptStatus?.verified ? (
            <div className="glass squircle" style={{ padding: '16px', border: '1px solid rgba(48, 209, 88, 0.3)', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="#30D158" />
                <div>
                  <strong style={{ color: '#30D158' }}>JLPT {formData.jlptStatus.level} Tasdiqlangan ✓</strong>
                  <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-secondary)' }}>
                    Hujjat: {formData.jlptStatus.certNo}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleResetVerification}
                className="remove-btn" 
                style={{ marginTop: '10px' }}
              >
                O'chirish
              </button>
            </div>
          ) : (
            <div className="glass squircle" style={{ padding: '14px', marginTop: '14px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed var(--glass-border)', padding: '20px', textAlign: 'center', cursor: 'pointer', borderRadius: '12px' }}
              >
                <FileText size={22} style={{ color: 'var(--text-secondary)', marginBottom: '6px' }} />
                <span style={{ display: 'block', fontSize: '12px' }}>
                  {uploadedFile ? uploadedFile.name : t('uploadCertFile', 'JLPT sertifikatini yuklash (PDF/Rasm)')}
                </span>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,image/*" 
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleVerifyStart(e.target.files[0])}
              />
            </div>
          )}
        </div>

        {/* 5-BO'LIM: Motivatsiya va Self-PR */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <BookOpen className="step-icon text-purple" size={24} />
            <h3>{t('motivationPR', 'Motivatsiya va O\'z-o\'zini taqdim')}</h3>
          </div>

          <div className="form-group">
            <label htmlFor="motivation">{t('motivationLabel', 'Ishga kirish sababi (志望動機)')}</label>
            <textarea 
              id="motivation"
              name="motivation" 
              value={formData.motivation} 
              onChange={handleChange}
              rows={3}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="selfPR">{t('selfPRLabel', 'O\'z-o\'zini taqdim etish (自己PR)')}</label>
            <textarea 
              id="selfPR"
              name="selfPR" 
              value={formData.selfPR} 
              onChange={handleChange}
              rows={3}
              className="glass-input"
            />
          </div>
        </div>

        {/* 6-BO'LIM: PDF Yuklab olish va Oldindan ko'rish */}
        <div className="step-content glass squircle text-center">
          {pdfStatus && pdfStatus !== 'completed' && pdfStatus !== 'failed' && (
            <div className="pdf-status-pill glass" style={{ margin: '8px auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={14} className="animate-spin text-blue" />
              <span>Yuklanmoqda...</span>
            </div>
          )}

          {pdfPreviewUrl ? (
            <div className="pdf-preview-box glass">
              <iframe src={pdfPreviewUrl} title="Resume PDF Preview" className="pdf-iframe-preview"></iframe>
            </div>
          ) : (
            <div className="pdf-preview-placeholder glass squircle">
              <span>{t('pdfPreviewRendering', '📄 PDF render qilinmoqda...')}</span>
            </div>
          )}

          <div className="action-buttons-group" style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'center' }}>
            <button type="button" onClick={handleDownloadPDF} className="download-pdf-btn squircle">
              📥 {t('downloadPDF', 'PDF yuklab olish')}
            </button>
            
            <button 
              type="button" 
              onClick={handleOpenPDFInNewTab} 
              className="open-pdf-tab-btn squircle"
            >
              👁️ {t('openInNewTab', 'Yangi oynada ochish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


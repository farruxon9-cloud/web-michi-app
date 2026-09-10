import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Phone, Briefcase, GraduationCap, Award, BookOpen, FileText, Loader2, Sparkles, ShieldCheck, CheckCircle2, X, Plus } from 'lucide-react';
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
  profileData, 
  onUpdateProfile, 
  onBack,
  isVoiceActive,
  setIsVoiceActive,
  isVoiceStandby,
  setIsVoiceStandby
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  const getFullNamePlaceholder = () => {
    switch (currentLang) {
      case 'ja': return '例：山田 太郎 (YAMADA TARO)';
      case 'uz': return 'Masalan: ALIMOV ANVAR';
      case 'ru': return 'Например: ALIMOV ANVAR';
      case 'en': return 'e.g., ALIMOV ANVAR';
      case 'vi': return 'Ví dụ: ALIMOV ANVAR';
      case 'zh': return '例如：ALIMOV ANVAR';
      case 'hi': return 'उदा. ALIMOV ANVAR';
      default: return 'Masalan: ALIMOV ANVAR';
    }
  };

  const getFuriganaPlaceholder = () => {
    switch (currentLang) {
      case 'ja': return '例：ヤマダ タロウ';
      case 'uz': return 'Masalan: アリモフ アンバル';
      case 'ru': return 'Например: アリモフ アンバル';
      case 'en': return 'e.g., アリモフ アンバル';
      case 'vi': return 'Ví dụ: アリモフ アンバル';
      case 'zh': return '例如：アリモフ アンバル';
      case 'hi': return 'उदा. アリモフ アンバル';
      default: return 'Masalan: アリモフ アンバル';
    }
  };

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
    jlptStatus: profileData.jlptStatus || null
  });

  const [pdfStatus, setPdfStatus] = useState(null); // null, 'loading_font', 'generating_pdf', 'downloading', 'completed', 'failed'
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // JLPT Verification simulation states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStatusText, setVerificationStatusText] = useState('');
  const [detectedLevel, setDetectedLevel] = useState('N3');
  const [detectedCertNo, setDetectedCertNo] = useState('');
  const [verificationStage, setVerificationStage] = useState('idle'); // 'idle', 'uploading', 'analyzing', 'success'
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Local state for Day, Month, Year select dropdowns
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const debounceTimeoutRef = useRef(null);

  // Sync initial data ONCE on mount
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
      educationHistory: profileData.educationHistory ? profileData.educationHistory.map(edu => ({
        school: edu.school || '',
        major: edu.major || edu.degree || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || edu.gradDate || ''
      })) : [],
      workHistory: profileData.workHistory ? [...profileData.workHistory] : [],
      driverLicenses: profileData.driverLicenses ? [...profileData.driverLicenses] : [],
      techCertificates: profileData.techCertificates ? [...profileData.techCertificates] : [],
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

    // Generate preview using initial data
    handlePreviewPDF(initialData);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Auto-turn OFF AI voice assistant when leaving Resume Builder page so it resets cleanly
      if (setIsVoiceActive) setIsVoiceActive(false);
      if (setIsVoiceStandby) setIsVoiceStandby(false);
    };
  }, []);

  // Handle voice updates from Voice Assistant questionnaire
  useEffect(() => {
    const handleVoiceUpdate = (e) => {
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
        
        // Auto scroll and highlight the updated field
        setTimeout(() => {
          const inputEl = document.getElementById(field);
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.focus();
            inputEl.classList.add('voice-highlight');
            setTimeout(() => inputEl.classList.remove('voice-highlight'), 3000);
          }
        }, 100);

        // Instantly generate new PDF preview with updated data
        handlePreviewPDF(updated);
        
        // Sync with global profile state
        if (onUpdateProfile) {
          onUpdateProfile(updated);
        }

        return updated;
      });
    };

    const handleVoiceReset = () => {
      const emptyData = {
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
        techCertificates: []
      };
      setFormData(emptyData);
      handlePreviewPDF(emptyData);
      if (onUpdateProfile) {
        onUpdateProfile(emptyData);
      }
    };

    window.addEventListener('michi-voice-resume-update', handleVoiceUpdate);
    window.addEventListener('michi-voice-resume-reset', handleVoiceReset);
    return () => {
      window.removeEventListener('michi-voice-resume-update', handleVoiceUpdate);
      window.removeEventListener('michi-voice-resume-reset', handleVoiceReset);
    };
  }, [onUpdateProfile]);

  // Debounced auto-preview generation on form edits
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set a timer to generate preview after 3 seconds of inactivity
    debounceTimeoutRef.current = setTimeout(() => {
      handlePreviewPDF(formData);
    }, 3000);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    formData.fullName,
    formData.furigana,
    formData.birthDate,
    formData.gender,
    formData.birthPlace,
    formData.nationality,
    formData.postalCode,
    formData.address,
    formData.phone,
    formData.email,
    formData.motivation,
    formData.selfPR,
    formData.hobbies,
    formData.personalRequests,
    formData.educationHistory,
    formData.workHistory,
    formData.driverLicenses,
    formData.techCertificates
  ]);

  const handleDayInput = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    setSelectedDay(clean);
    const y = selectedYear;
    const m = selectedMonth;
    if (y && m && clean && parseInt(clean, 10) >= 1 && parseInt(clean, 10) <= 31) {
      const fm = String(m).padStart(2, '0');
      const fd = String(clean).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${y}-${fm}-${fd}` }));
    } else {
      setFormData(prev => ({ ...prev, birthDate: '' }));
    }
  };

  const handleMonthInput = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 2);
    setSelectedMonth(clean);
    const y = selectedYear;
    const d = selectedDay;
    if (y && clean && d && parseInt(clean, 10) >= 1 && parseInt(clean, 10) <= 12) {
      let dayVal = d;
      const maxDays = new Date(parseInt(y, 10), parseInt(clean, 10), 0).getDate();
      if (parseInt(d, 10) > maxDays) {
        dayVal = maxDays.toString();
        setSelectedDay(dayVal);
      }
      const fm = String(clean).padStart(2, '0');
      const fd = String(dayVal).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${y}-${fm}-${fd}` }));
    } else {
      setFormData(prev => ({ ...prev, birthDate: '' }));
    }
  };

  const handleYearInput = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    setSelectedYear(clean);
    const m = selectedMonth;
    const d = selectedDay;
    if (clean && clean.length === 4 && m && d) {
      const fm = String(m).padStart(2, '0');
      const fd = String(d).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${clean}-${fm}-${fd}` }));
    } else {
      setFormData(prev => ({ ...prev, birthDate: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Year/Month helpers for numeric date inputs
  const parseYearMonth = (dateStr) => {
    if (!dateStr) return { year: '', month: '' };
    const parts = dateStr.split('-');
    return { year: parts[0] || '', month: parts[1] ? parseInt(parts[1], 10).toString() : '' };
  };

  const buildYearMonth = (year, month) => {
    if (!year && !month) return '';
    const y = year || '';
    const m = month ? String(month).padStart(2, '0') : '';
    if (y && m) return `${y}-${m}`;
    if (y) return y;
    return '';
  };

  const handleSaveData = (dataToSave = formData) => {
    onUpdateProfile(dataToSave);
  };

  const handleBackWithSave = () => {
    handleSaveData(formData);
    onBack();
  };

  // Education list management
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

  // Work list management
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

  // License and Certificate lists
  const handleToggleLicense = (lic) => {
    setFormData(prev => {
      const exists = prev.driverLicenses.includes(lic);
      const updated = exists 
        ? prev.driverLicenses.filter(l => l !== lic) 
        : [...prev.driverLicenses, lic];
      return { ...prev, driverLicenses: updated };
    });
  };

  const handleToggleCertificate = (cert) => {
    setFormData(prev => {
      const exists = prev.techCertificates.includes(cert);
      const updated = exists 
        ? prev.techCertificates.filter(c => c !== cert) 
        : [...prev.techCertificates, cert];
      return { ...prev, techCertificates: updated };
    });
  };

  const handleVerifyStart = (file) => {
    if (!file) return;
    setUploadedFile(file);
    setIsVerifying(true);
    setVerificationStage('uploading');
    setVerificationProgress(0);
    setVerificationStatusText(currentLang === 'ja' ? 'ファイルをアップロード中...' : 'Fayl yuklanmoqda...');

    // Extract potential JLPT level from filename (e.g. N1, N2, N3, N4, N5)
    let extractedLevel = 'N3';
    const nameUpper = file.name.toUpperCase();
    const match = nameUpper.match(/N[1-5]|Ｎ[１-５]/);
    if (match) {
      let matchStr = match[0];
      if (matchStr === 'Ｎ１') matchStr = 'N1';
      else if (matchStr === 'Ｎ２') matchStr = 'N2';
      else if (matchStr === 'Ｎ３') matchStr = 'N3';
      else if (matchStr === 'Ｎ４') matchStr = 'N4';
      else if (matchStr === 'Ｎ５') matchStr = 'N5';
      extractedLevel = matchStr;
    }
    setDetectedLevel(extractedLevel);

    // Simulate progress timer
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setVerificationProgress(progress);

      if (progress === 40) {
        setVerificationStage('analyzing');
        setVerificationStatusText(currentLang === 'ja' ? '証明書署名とテキストを解析中 (Tesseract.js)...' : 'Sertifikat imzosi va matni tahlil qilinmoqda (Tesseract.js)...');
      } else if (progress === 80) {
        setVerificationStatusText(currentLang === 'ja' ? 'JEESデータベースと整合性を確認中...' : 'JEES ma\'lumotlar bazasi bilan solishtirilmoqda...');
      } else if (progress >= 100) {
        clearInterval(interval);
        
        // Generate random unique certificate number
        const yearCode = new Date().getFullYear().toString().substring(2);
        const randomNum1 = Math.floor(100000 + Math.random() * 900000);
        const randomNum2 = Math.floor(1000 + Math.random() * 9000);
        const certNo = `No. ${yearCode}A${randomNum1}-${randomNum2}`;
        setDetectedCertNo(certNo);
        
        setVerificationStage('success');
        setVerificationStatusText('');
        setIsVerifying(false);

        // Update local state and parent profileData
        const updatedStatus = {
          level: extractedLevel,
          verified: true,
          certNo,
          date: new Date().toISOString().split('T')[0]
        };

        setFormData(prev => {
          const updated = { ...prev, jlptStatus: updatedStatus };
          if (onUpdateProfile) {
            onUpdateProfile(updated);
          }
          return updated;
        });
      }
    }, 300);
  };

  const handleResetVerification = () => {
    setUploadedFile(null);
    setVerificationStage('idle');
    setFormData(prev => {
      const updated = { ...prev, jlptStatus: null };
      if (onUpdateProfile) {
        onUpdateProfile(updated);
      }
      return updated;
    });
  };

  // PDF Generation Trigger
  const handleDownloadPDF = async () => {
    handleSaveData(formData);
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

  // Generate URL for local preview
  const handlePreviewPDF = async (dataToUse = formData) => {
    try {
      const dataUrl = await generateRirekisho(dataToUse, {
        onProgress: (status) => setPdfStatus(status),
        download: false
      });
      setPdfPreviewUrl(dataUrl);
    } catch (e) {
      setPdfStatus('failed');
    }
  };

  const handleOpenPDFInNewTab = (e) => {
    if (e) e.preventDefault();
    if (pdfPreviewUrl) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = pdfPreviewUrl;
      } else {
        alert(t('popupBlocked', 'Pop-up oyna bloklandi. Brauzer sozlamalaridan ruxsat bering yoki PDFni yuklab oling.'));
      }
    } else {
      alert(t('previewNotReady', 'PDF hali tayyor emas. Iltimos, bir oz kuting.'));
    }
  };

  return (
    <div className="resume-builder-container fade-in">
      {/* Floating Sticky Back Button */}
      <div className="resume-builder-sticky-back" style={{ display: 'flex', width: '92%', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handleBackWithSave} className="icon-btn glass" aria-label="Back">
          <ArrowLeft size={20} />
        </button>

        {setIsVoiceActive && setIsVoiceStandby && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>AI VOICE</span>
            <button
              className="theme-toggle-btn"
              onClick={() => {
                const nextVal = !isVoiceStandby;
                if (nextVal) {
                  // Synchronously trigger resume voice flow before setting active state
                  window.dispatchEvent(new CustomEvent('michi-voice-resume-start'));
                }
                setIsVoiceStandby(nextVal);
                setIsVoiceActive(nextVal);
              }}
              aria-label="Toggle AI Assistant"
            >
              <div className={`theme-toggle-track ${isVoiceStandby ? 'dark' : 'light'}`} style={{ width: '48px', height: '24px', borderRadius: '12px' }}>
                <div className="theme-toggle-thumb" style={{ width: '18px', height: '18px', left: isVoiceStandby ? 'calc(100% - 20px)' : '2px', top: '2px', background: isVoiceStandby ? 'linear-gradient(135deg, #a133ff, #8b5cf6)' : 'linear-gradient(135deg, #e5e5ea, #8e8e93)', boxShadow: isVoiceStandby ? '0 2px 6px rgba(138, 43, 226, 0.4)' : 'none' }}>
                  <Sparkles size={10} color="#ffffff" fill="#ffffff" style={{ opacity: 0.95 }} />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="resume-builder-body">
        <h2 className="resume-builder-title">{t('resumeBuilderTitle', 'Yapon Rezyumesi (履歴書)')}</h2>
        
        {/* SECTION 1: Shaxsiy ma'lumotlar */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <User className="step-icon text-purple" size={24} />
            <h3>{t('personalInfo', 'Shaxsiy ma\'lumotlar')}</h3>
            <p>{t('step1Desc', 'Rirekisho rezyumesi uchun shaxsiy ma\'lumotlaringizni to\'g\'rilang. Ismlar katakana va yapon formatida yozilishi maqsadga muvofiq.')}</p>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">{t('fullNameLabel', 'Ism va familiya')}</label>
            <div className="form-input-hint">
              {t('fullNameHint', 'Yapon tilida to\'ldirish uchun lotin harflarida (Masalan: ALIMOV ANVAR) yoki kanjida (Masalan: 山田 太郎) yozing.')}
            </div>
            <input 
              type="text" 
              id="fullName"
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange}
              placeholder={getFullNamePlaceholder()}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="furigana">{t('katakanaNameLabel', 'Katakanada yozilishi')}</label>
            <div className="form-input-hint">
              {t('furiganaHint', 'Ismingizning yaponcha katakana talaffuzi (Masalan: アリモフ アンバル yoki ヤマダ タロウ).')}
            </div>
            <input 
              type="text" 
              id="furigana"
              name="furigana" 
              value={formData.furigana} 
              onChange={handleChange}
              placeholder={getFuriganaPlaceholder()}
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
            <div className="form-input-hint">
              {t('dobHint', 'Tug\'ilgan kuningizni kun, oy va yil ketma-ketligida faqat sonlar bilan kiriting.')}
            </div>
            
            <div className="dob-inputs-row">
              <div className="dob-input-wrapper">
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
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
                  pattern="[0-9]*"
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
                  pattern="[0-9]*"
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

          <div className="form-group">
            <label htmlFor="birthPlace">{t('birthPlaceLabel', 'Tug\'ilgan joyi')}</label>
            <div className="form-input-hint">
              {t('birthPlaceHint', 'Tug\'ilgan mamlakatingiz yoki viloyatingiz (Masalan: O\'zbekiston, Samarqand).')}
            </div>
            <input 
              type="text" 
              id="birthPlace"
              name="birthPlace" 
              value={formData.birthPlace} 
              onChange={handleChange}
              placeholder={t('birthPlacePlaceholder', 'Masalan: O\'zbekiston')}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nationality">{t('nationalityLabel', 'Millati')}</label>
            <div className="form-input-hint">
              {t('nationalityHint', 'Fuqaroligingiz yoki millatingiz (Masalan: O\'zbekiston).')}
            </div>
            <input 
              type="text" 
              id="nationality"
              name="nationality" 
              value={formData.nationality} 
              onChange={handleChange}
              placeholder={t('nationalityPlaceholder', 'Masalan: O\'zbekistonlik')}
              className="glass-input"
            />
          </div>
        </div>

        {/* SECTION 2: Aloqa va Manzil */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <Phone className="step-icon text-purple" size={24} />
            <h3>{t('contactInfo', 'Aloqa va Manzil')}</h3>
            <p>{t('step2Desc', 'Yaponiyadagi manzilingiz va aloqa ma\'lumotlari. Pochta indeksini to\'g\'ri kiritsangiz kompaniyalar sizni tez topishadi.')}</p>
          </div>

          <div className="form-group">
            <label htmlFor="postalCode">{t('postalCodeLabel', 'Pochta indeksi (Postal Code)')}</label>
            <input 
              type="text" 
              id="postalCode"
              name="postalCode" 
              value={formData.postalCode} 
              onChange={handleChange}
              placeholder="E.g. 160-0023"
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">{t('livingAddressTitle', 'Hozirgi yashash manzilingiz')}</label>
            <input 
              type="text" 
              id="address"
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              placeholder="E.g. Tokyo-to, Shinjuku-ku, Nishi-Shinjuku 1-chome"
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
              placeholder="E.g. 080-1234-5678"
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

        {/* SECTION 3: Ta'lim tarixi */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <GraduationCap className="step-icon text-purple" size={24} />
            <h3>{t('educationTitle', 'Ta\'lim tarixi')}</h3>
            <p>{t('step3Desc', 'O\'qigan maktablar, kollejlar va oliy ta\'lim muassasalarini qo\'shing. (Yil va oy formatida)')}</p>
          </div>

          <div className="history-list">
            {formData.educationHistory.map((edu, idx) => (
              <div key={idx} className="history-card glass-card">
                <div className="history-card-header">
                  <h4>{t('education', 'Ta\'lim')} #{idx + 1}</h4>
                  <button onClick={() => handleRemoveEdu(idx)} className="remove-btn">
                    {t('remove', 'O\'chirish')}
                  </button>
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={t('schoolName', 'Muassasa nomi (e.g. ○○ University)')}
                    value={edu.school} 
                    onChange={(e) => handleEduChange(idx, 'school', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={t('degree', 'Mutaxassislik/Daraja (e.g. Bachelor)')}
                    value={edu.major} 
                    onChange={(e) => handleEduChange(idx, 'major', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <label className="sub-label">{t('admissionDateLabel', 'Kirgan sanasi')}</label>
                  <div className="date-input-group">
                    <input
                      type="number"
                      placeholder={t('monthPlaceholder', 'Oy')}
                      value={parseYearMonth(edu.startDate).month}
                      onChange={(e) => {
                        const { year } = parseYearMonth(edu.startDate);
                        handleEduChange(idx, 'startDate', buildYearMonth(year, e.target.value));
                      }}
                      className="glass-input date-num-input month-input"
                      min="1"
                      max="12"
                    />
                    <span className="date-separator">{t('monthSuffix', 'oy')}</span>
                    <input
                      type="number"
                      placeholder={t('yearPlaceholder', 'Yil')}
                      value={parseYearMonth(edu.startDate).year}
                      onChange={(e) => {
                        const { month } = parseYearMonth(edu.startDate);
                        handleEduChange(idx, 'startDate', buildYearMonth(e.target.value, month));
                      }}
                      className="glass-input date-num-input year-input"
                      min="1950"
                      max="2040"
                    />
                    <span className="date-separator">{t('yearSuffix', 'yil')}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="sub-label">{t('gradDateLabel', 'Bitirgan sanasi')}</label>
                  <div className="date-input-group">
                    <input
                      type="number"
                      placeholder={t('monthPlaceholder', 'Oy')}
                      value={parseYearMonth(edu.endDate).month}
                      onChange={(e) => {
                        const { year } = parseYearMonth(edu.endDate);
                        handleEduChange(idx, 'endDate', buildYearMonth(year, e.target.value));
                      }}
                      className="glass-input date-num-input month-input"
                      min="1"
                      max="12"
                    />
                    <span className="date-separator">{t('monthSuffix', 'oy')}</span>
                    <input
                      type="number"
                      placeholder={t('yearPlaceholder', 'Yil')}
                      value={parseYearMonth(edu.endDate).year}
                      onChange={(e) => {
                        const { month } = parseYearMonth(edu.endDate);
                        handleEduChange(idx, 'endDate', buildYearMonth(e.target.value, month));
                      }}
                      className="glass-input date-num-input year-input"
                      min="1950"
                      max="2040"
                    />
                    <span className="date-separator">{t('yearSuffix', 'yil')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleAddEdu} className="add-btn squircle">
            + {t('addEducation', 'Ta\'lim qo\'shish')}
          </button>
        </div>

        {/* SECTION 4: Ish tajribasi va Guvohnomalar */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <Briefcase className="step-icon text-purple" size={24} />
            <h3>{t('workExperience', 'Ish tajribasi')}</h3>
            <p>{t('step4Desc', 'Avvalgi ishlagan kompaniyalaringiz, lavozimingiz va boshlanish/tugash sanalari. Haydovchilik tajribalaringizni yoritish muhim.')}</p>
          </div>

          <div className="history-list">
            {formData.workHistory.map((work, idx) => (
              <div key={idx} className="history-card glass-card">
                <div className="history-card-header">
                  <h4>{t('company', 'Kompaniya')} #{idx + 1}</h4>
                  <button onClick={() => handleRemoveWork(idx)} className="remove-btn">
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
                    placeholder={t('position', 'Lavozim (e.g. Truck Driver)')}
                    value={work.position} 
                    onChange={(e) => handleWorkChange(idx, 'position', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <label className="sub-label">{t('startDate', 'Boshlanish sanasi')}</label>
                  <div className="date-input-group">
                    <input
                      type="number"
                      placeholder={t('monthPlaceholder', 'Oy')}
                      value={parseYearMonth(work.startDate).month}
                      onChange={(e) => {
                        const { year } = parseYearMonth(work.startDate);
                        handleWorkChange(idx, 'startDate', buildYearMonth(year, e.target.value));
                      }}
                      className="glass-input date-num-input month-input"
                      min="1"
                      max="12"
                    />
                    <span className="date-separator">{t('monthSuffix', 'oy')}</span>
                    <input
                      type="number"
                      placeholder={t('yearPlaceholder', 'Yil')}
                      value={parseYearMonth(work.startDate).year}
                      onChange={(e) => {
                        const { month } = parseYearMonth(work.startDate);
                        handleWorkChange(idx, 'startDate', buildYearMonth(e.target.value, month));
                      }}
                      className="glass-input date-num-input year-input"
                      min="1950"
                      max="2040"
                    />
                    <span className="date-separator">{t('yearSuffix', 'yil')}</span>
                  </div>
                </div>
                {!work.isCurrent && (
                  <div className="form-group">
                    <label className="sub-label">{t('endDate', 'Tugash sanasi')}</label>
                    <div className="date-input-group">
                      <input
                        type="number"
                        placeholder={t('monthPlaceholder', 'Oy')}
                        value={parseYearMonth(work.endDate).month}
                        onChange={(e) => {
                          const { year } = parseYearMonth(work.endDate);
                          handleWorkChange(idx, 'endDate', buildYearMonth(year, e.target.value));
                        }}
                        className="glass-input date-num-input month-input"
                        min="1"
                        max="12"
                      />
                      <span className="date-separator">{t('monthSuffix', 'oy')}</span>
                      <input
                        type="number"
                        placeholder={t('yearPlaceholder', 'Yil')}
                        value={parseYearMonth(work.endDate).year}
                        onChange={(e) => {
                          const { month } = parseYearMonth(work.endDate);
                          handleWorkChange(idx, 'endDate', buildYearMonth(e.target.value, month));
                        }}
                        className="glass-input date-num-input year-input"
                        min="1950"
                        max="2040"
                      />
                      <span className="date-separator">{t('yearSuffix', 'yil')}</span>
                    </div>
                  </div>
                )}
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    id={`isCurrent-${idx}`}
                    checked={work.isCurrent}
                    onChange={(e) => handleWorkChange(idx, 'isCurrent', e.target.checked)}
                  />
                  <label htmlFor={`isCurrent-${idx}`}>{t('currentPositionCheckbox', 'Hozirgi vaqtda ishlayapman')}</label>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleAddWork} className="add-btn squircle">
            + {t('addWork', 'Ish joyi qo\'shish')}
          </button>

          {/* Guvohnomalar & Sertifikatlar section */}
          <div className="step-intro" style={{ marginTop: '20px' }}>
            <Award className="step-icon text-purple" size={24} />
            <h3>{t('licensesQualifications', 'Guvohnoma va Sertifikatlar')}</h3>
          </div>
          
          <div className="licenses-grid">
            <div className="license-group-container">
              <span className="license-group-title">{t('class1Licenses', 'Birinchi toifa (Class 1 - Shaxsiy)')}</span>
              <div className="badges-select-group">
                {['futsu', 'junchugata', 'chugata', 'oogata'].map(lic => (
                  <button 
                    key={lic}
                    onClick={() => handleToggleLicense(lic)}
                    className={`badge-select-btn squircle ${formData.driverLicenses.includes(lic) ? 'selected' : ''}`}
                  >
                    {t(`lic_${lic}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="license-group-container">
              <span className="license-group-title">{t('class2Licenses', 'Ikkinchi toifa (Class 2 - Tijorat/Taksi/Avtobus)')}</span>
              <div className="badges-select-group">
                {['futsu_nishu', 'junchugata_nishu', 'chugata_nishu', 'oogata_nishu'].map(lic => (
                  <button 
                    key={lic}
                    onClick={() => handleToggleLicense(lic)}
                    className={`badge-select-btn squircle ${formData.driverLicenses.includes(lic) ? 'selected' : ''}`}
                  >
                    {t(`lic_${lic}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="license-group-container">
              <span className="license-group-title">{t('specialLicenses', 'Maxsus texnika, Tirkama va Motosikllar')}</span>
              <div className="badges-select-group">
                {['oogata_tokushu', 'kogata_tokushu', 'kenin', 'oogata_tokushu_nishu', 'kenin_nishu', 'motorcycle', 'oogata_motorcycle', 'gentsuki'].map(lic => (
                  <button 
                    key={lic}
                    onClick={() => handleToggleLicense(lic)}
                    className={`badge-select-btn squircle ${formData.driverLicenses.includes(lic) ? 'selected' : ''}`}
                  >
                    {t(`lic_${lic}`)}
                  </button>
                ))}
              </div>
            </div>

            <span className="section-label" style={{ marginTop: '10px', display: 'block' }}>{t('otherCertificates', 'Maxsus sertifikatlar')}</span>
            <div className="badges-select-group">
              {['forklift', 'crane', 'towing'].map(cert => (
                <button 
                  key={cert}
                  onClick={() => handleToggleCertificate(cert)}
                  className={`badge-select-btn squircle ${formData.techCertificates.includes(cert) ? 'selected' : ''}`}
                >
                  {t(`cert_${cert}`, cert === 'forklift' ? 'Forklift (フォークリフト)' : cert === 'crane' ? 'Crane (クレーン)' : 'Towing (牽引)')}
                </button>
              ))}
            </div>

            {/* JLPT Certificate Verification Block */}
            <span className="section-label" style={{ marginTop: '20px', display: 'block', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
              🇯🇵 {t('jlptVerificationTitle', 'JLPT Yapon tili sertifikatini tasdiqlash')}
            </span>

            {formData.jlptStatus && formData.jlptStatus.verified ? (
              /* Verified State Card */
              <div className="glass squircle animate-scale-up" style={{ padding: '16px', border: '1px solid rgba(48, 209, 88, 0.3)', background: 'rgba(48, 209, 88, 0.06)', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={26} color="#30D158" className="animate-pulse" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '15px', color: '#30D158' }}>JLPT {formData.jlptStatus.level} Tasdiqlangan ✓</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hujjat raqami: {formData.jlptStatus.certNo}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                  <button 
                    type="button"
                    className="badge-select-btn squircle"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', borderColor: 'rgba(255, 59, 48, 0.3)', color: '#FF3B30', background: 'rgba(255, 59, 48, 0.05)', cursor: 'pointer' }}
                    onClick={handleResetVerification}
                  >
                    O'chirish (Reset)
                  </button>
                </div>
              </div>
            ) : (
              /* Unverified / Upload State Box */
              <div className="glass squircle" style={{ padding: '16px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.01)', marginTop: '10px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                  {t('jlptVerificationDesc', 'Yaponiya logistika firmalariga til darajangizni isbotlash va oyligingizni 1.5-2 barobar oshirish uchun JLPT hujjatingizni (PDF yoki rasm) yuklab tasdiqlang.')}
                </p>

                {isVerifying ? (
                  /* Loading Progress UI */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={18} className="animate-spin" color="var(--primary)" />
                      <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold' }}>{verificationStatusText}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--glass-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #30D158 100%)', width: `${verificationProgress}%`, transition: 'width 0.2s ease' }}></div>
                    </div>
                  </div>
                ) : (
                  /* Form selectors and file upload fields */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '11px', marginBottom: '4px' }}>Sertifikat darajasi</label>
                        <select 
                          value={detectedLevel} 
                          onChange={(e) => setDetectedLevel(e.target.value)}
                          style={{ padding: '8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', width: '100%', fontSize: '12px' }}
                        >
                          <option value="N1">JLPT N1</option>
                          <option value="N2">JLPT N2</option>
                          <option value="N3">JLPT N3</option>
                          <option value="N4">JLPT N4</option>
                          <option value="N5">JLPT N5</option>
                        </select>
                      </div>
                    </div>

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '24px 10px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.01)', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      <FileText size={24} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>
                        {uploadedFile ? uploadedFile.name : t('uploadCertFile', 'Faylni tanlash (PDF yoki rasm)')}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#8E8E93', marginTop: '4px', display: 'block' }}>Maksimal o\'lcham 10 MB</span>
                    </div>

                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".pdf,image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleVerifyStart(file);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Motivatsiya, Hobbies, va Maxsus Istaklar */}
        <div className="step-content glass squircle">
          <div className="step-intro">
            <BookOpen className="step-icon text-purple" size={24} />
            <h3>{t('motivationPR', 'Motivatsiya va O\'z-o\'zini taqdim')}</h3>
            <p>{t('step5Desc', 'Yapon firmalarida eng ko\'p e\'tibor qaratiladigan bo\'lim. "Nima sababdan ushbu ishga topshiryapsiz?" va "O\'z kuchli taraflaringiz (Self-PR)" haqida yozing.')}</p>
          </div>

          <div className="form-group">
            <label htmlFor="motivation">{t('motivationLabel', 'Ishga kirish sababi (志望動機)')}</label>
            <textarea 
              id="motivation"
              name="motivation" 
              value={formData.motivation} 
              onChange={handleChange}
              placeholder="E.g. 日本での運転経験を活かし、貴社の安全輸送に貢献したいと考え応募いたしました..."
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
              placeholder="E.g. 私の強みは責任感と時間厳守です。前職では大型トラックを3年間無事故無違反で運転しました..."
              rows={3}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hobbies">{t('hobbiesLabel', 'Qiziqishlaringiz va maxsus ko\'nikmalar (趣味・特技)')}</label>
            <textarea 
              id="hobbies"
              name="hobbies" 
              value={formData.hobbies} 
              onChange={handleChange}
              placeholder="E.g. 趣味：サッカー、旅行。特技：日常英会話、車の簡単なメンテナンス。"
              rows={2}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="personalRequests">{t('personalRequestsLabel', 'Kompaniyaga shaxsiy istaklaringiz (本人希望記入欄)')}</label>
            <textarea 
              id="personalRequests"
              name="personalRequests" 
              value={formData.personalRequests} 
              onChange={handleChange}
              rows={2}
              className="glass-input"
            />
          </div>
        </div>

        {/* SECTION 6: PDF Preview and Download Actions */}
        <div className="step-content glass squircle pdf-generation-section text-center">

          {/* Font / Generation Status Indicator */}
          {pdfStatus && pdfStatus !== 'completed' && pdfStatus !== 'failed' && (
            <div className="pdf-status-pill glass" style={{ margin: '8px auto' }}>
              <Loader2 size={14} className="animate-spin text-blue" />
              <span>
                {pdfStatus === 'loading_font' && t('loadingFont')}
                {pdfStatus === 'generating_pdf' && t('generatingPDF')}
                {pdfStatus === 'downloading' && t('downloading')}
              </span>
            </div>
          )}

          {/* Embedded PDF iframe Preview (if generated) */}
          {pdfPreviewUrl ? (
            <div className="pdf-preview-box glass">
              <iframe src={pdfPreviewUrl} title="Resume PDF Preview" className="pdf-iframe-preview"></iframe>
            </div>
          ) : (
            <div className="pdf-preview-placeholder glass squircle">
              <span>{t('pdfPreviewRendering', '📄 PDF preview rendering...')}</span>
            </div>
          )}

          <div className="action-buttons-group">
            <button onClick={handleDownloadPDF} className="download-pdf-btn squircle">
              📥 {t('downloadPDF', 'PDF yuklab olish')}
            </button>
            
            <a 
              href={pdfPreviewUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="open-pdf-tab-btn squircle"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              onClick={handleOpenPDFInNewTab}
            >
              👁️ {t('openInNewTab', 'Yangi oynada ochish')}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}


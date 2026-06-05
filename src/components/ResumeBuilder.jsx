import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Phone, Briefcase, GraduationCap, Award, BookOpen, FileText, CheckCircle, Loader2 } from 'lucide-react';
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

export default function ResumeBuilder({ profileData, onUpdateProfile, onBack }) {
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

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: profileData.fullName || '',
    furigana: profileData.furigana || '',
    birthDate: profileData.birthDate || '',
    gender: profileData.gender || 'male',
    postalCode: profileData.postalCode || '',
    address: profileData.address || '',
    phone: profileData.phone || '',
    email: profileData.email || '',
    motivation: profileData.motivation || '',
    selfPR: profileData.selfPR || '',
    hobbies: profileData.hobbies || '',
    personalRequests: profileData.personalRequests || '貴社規定に従います。',
    educationHistory: profileData.educationHistory ? [...profileData.educationHistory] : [],
    workHistory: profileData.workHistory ? [...profileData.workHistory] : [],
    driverLicenses: profileData.driverLicenses ? [...profileData.driverLicenses] : [],
    techCertificates: profileData.techCertificates ? [...profileData.techCertificates] : []
  });

  const [pdfStatus, setPdfStatus] = useState(null); // null, 'loading_font', 'generating_pdf', 'downloading', 'completed', 'failed'
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // Local state for Day, Month, Year select dropdowns
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Auto-sync initial data
  useEffect(() => {
    const bDate = profileData.birthDate || '';
    setFormData(prev => ({
      ...prev,
      fullName: profileData.fullName || '',
      birthDate: bDate,
      email: profileData.email || '',
      educationHistory: profileData.educationHistory ? [...profileData.educationHistory] : [],
      workHistory: profileData.workHistory ? [...profileData.workHistory] : [],
      driverLicenses: profileData.driverLicenses ? [...profileData.driverLicenses] : [],
      techCertificates: profileData.techCertificates ? [...profileData.techCertificates] : []
    }));

    if (bDate) {
      const parts = bDate.split('-');
      if (parts.length === 3) {
        setSelectedYear(parts[0]);
        setSelectedMonth(parseInt(parts[1], 10).toString());
        setSelectedDay(parseInt(parts[2], 10).toString());
      }
    }
  }, [profileData]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year && selectedMonth && selectedDay) {
      const m = String(selectedMonth).padStart(2, '0');
      const d = String(selectedDay).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${year}-${m}-${d}` }));
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    let day = selectedDay;
    if (selectedYear && month && day) {
      const maxDays = new Date(parseInt(selectedYear, 10), parseInt(month, 10), 0).getDate();
      if (parseInt(day, 10) > maxDays) {
        day = maxDays.toString();
        setSelectedDay(day);
      }
    }
    if (selectedYear && month && day) {
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${selectedYear}-${m}-${d}` }));
    }
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    if (selectedYear && selectedMonth && day) {
      const m = String(selectedMonth).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      setFormData(prev => ({ ...prev, birthDate: `${selectedYear}-${m}-${d}` }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const scrollTimeout = useRef({});

  // Debounced scroll listener to select nearest snapped item
  const handleScroll = (type, e, list, handler, currentValue) => {
    const scrollTop = e.target.scrollTop;
    const index = Math.round(scrollTop / 36);
    const val = list[index];
    if (!val) return;

    if (scrollTimeout.current[type]) {
      clearTimeout(scrollTimeout.current[type]);
    }

    scrollTimeout.current[type] = setTimeout(() => {
      if (val.toString() !== currentValue) {
        handler(val.toString());
      }
    }, 150);
  };

  useEffect(() => {
    if (step === 1) {
      // Wait for DOM layout
      const timer = setTimeout(() => {
        if (selectedYear && yearRef.current) {
          const itemEl = yearRef.current.querySelector(`[data-value="${selectedYear}"]`);
          if (itemEl) yearRef.current.scrollTop = itemEl.offsetTop - 54;
        }
        if (selectedMonth && monthRef.current) {
          const itemEl = monthRef.current.querySelector(`[data-value="${selectedMonth}"]`);
          if (itemEl) monthRef.current.scrollTop = itemEl.offsetTop - 54;
        }
        if (selectedDay && dayRef.current) {
          const itemEl = dayRef.current.querySelector(`[data-value="${selectedDay}"]`);
          if (itemEl) dayRef.current.scrollTop = itemEl.offsetTop - 54;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Smooth scroll sync when selections change via clicks/snaps
  useEffect(() => {
    if (selectedYear && yearRef.current) {
      const itemEl = yearRef.current.querySelector(`[data-value="${selectedYear}"]`);
      if (itemEl) {
        const targetScroll = itemEl.offsetTop - 54;
        if (Math.abs(yearRef.current.scrollTop - targetScroll) > 2) {
          yearRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedMonth && monthRef.current) {
      const itemEl = monthRef.current.querySelector(`[data-value="${selectedMonth}"]`);
      if (itemEl) {
        const targetScroll = itemEl.offsetTop - 54;
        if (Math.abs(monthRef.current.scrollTop - targetScroll) > 2) {
          monthRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedDay && dayRef.current) {
      const itemEl = dayRef.current.querySelector(`[data-value="${selectedDay}"]`);
      if (itemEl) {
        const targetScroll = itemEl.offsetTop - 54;
        if (Math.abs(dayRef.current.scrollTop - targetScroll) > 2) {
          dayRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }
    }
  }, [selectedDay]);

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

  const handleSaveData = () => {
    onUpdateProfile(formData);
  };

  const handleNext = () => {
    handleSaveData();
    if (step < 6) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Education list management
  const handleAddEdu = () => {
    setFormData(prev => ({
      ...prev,
      educationHistory: [...prev.educationHistory, { school: '', degree: '', gradDate: '' }]
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

  // PDF Generation Trigger
  const handleDownloadPDF = async () => {
    handleSaveData();
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

  // Generate URL for local preview on the final step
  const handlePreviewPDF = async () => {
    handleSaveData();
    try {
      const dataUrl = await generateRirekisho(formData, {
        onProgress: (status) => setPdfStatus(status),
        download: false
      });
      setPdfPreviewUrl(dataUrl);
    } catch (e) {
      setPdfStatus('failed');
    }
  };

  useEffect(() => {
    if (step === 6) {
      handlePreviewPDF();
    } else {
      setPdfPreviewUrl(null);
      setPdfStatus(null);
    }
  }, [step]);

  return (
    <div className="resume-builder-container fade-in">
      {/* Top Header Navigation */}
      <div className="resume-builder-header">
        <button onClick={onBack} className="icon-btn glass" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('resumeBuilderTitle', 'Yapon Rezyumesi (履歴書)')}</h2>
        <span className="step-badge">
          {t('stepLabel', 'Bosqich')} {step}/6
        </span>
      </div>

      {/* Progress Line */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${(step / 6) * 100}%` }}></div>
      </div>

      {/* Main Content Area */}
      <div className="resume-builder-body">
        
        {/* STEP 1: Shaxsiy ma'lumotlar */}
        {step === 1 && (
          <div className="step-content glass squircle fade-in">
            <div className="step-intro">
              <User className="step-icon text-blue" size={28} />
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

            {(() => {
              const years = [];
              for (let y = 2015; y >= 1950; y--) {
                years.push(y);
              }
              const months = Array.from({ length: 12 }, (_, i) => i + 1);
              const maxDays = (selectedYear && selectedMonth) ? new Date(parseInt(selectedYear, 10), parseInt(selectedMonth, 10), 0).getDate() : 31;
              const days = Array.from({ length: maxDays }, (_, i) => i + 1);

              return (
                <div className="form-group">
                  <label>{t('dobLabel', "Tug'ilgan sana")}</label>
                  <div className="form-input-hint">
                    {t('dobHint', 'Tug\'ilgan kuningizni kun, oy va yaponcha davr (Era) yili ketma-ketligida tanlang.')}
                  </div>
                  
                  <div className="dob-spinner-container glass squircle">
                    {/* Highlight Selection Bar */}
                    <div className="dob-spinner-highlight"></div>

                    {/* Day Column */}
                    <div 
                      className="dob-spinner-column" 
                      ref={dayRef}
                      onScroll={(e) => handleScroll('day', e, days, handleDayChange, selectedDay)}
                    >
                      <div className="dob-spinner-spacer"></div>
                      {days.map(d => (
                        <div 
                          key={d} 
                          className={`dob-spinner-item ${selectedDay === d.toString() ? 'active' : ''}`}
                          data-value={d}
                          onClick={() => handleDayChange(d.toString())}
                        >
                          {d} {t('day', 'Kun')}
                        </div>
                      ))}
                      <div className="dob-spinner-spacer"></div>
                    </div>

                    {/* Month Column */}
                    <div 
                      className="dob-spinner-column" 
                      ref={monthRef}
                      onScroll={(e) => handleScroll('month', e, months, handleMonthChange, selectedMonth)}
                    >
                      <div className="dob-spinner-spacer"></div>
                      {months.map(m => (
                        <div 
                          key={m} 
                          className={`dob-spinner-item ${selectedMonth === m.toString() ? 'active' : ''}`}
                          data-value={m}
                          onClick={() => handleMonthChange(m.toString())}
                        >
                          {m} {t('month', 'Oy')}
                        </div>
                      ))}
                      <div className="dob-spinner-spacer"></div>
                    </div>

                    {/* Year Column */}
                    <div 
                      className="dob-spinner-column year-column" 
                      ref={yearRef}
                      onScroll={(e) => handleScroll('year', e, years, handleYearChange, selectedYear)}
                    >
                      <div className="dob-spinner-spacer"></div>
                      {years.map(y => (
                        <div 
                          key={y} 
                          className={`dob-spinner-item ${selectedYear === y.toString() ? 'active' : ''}`}
                          data-value={y}
                          onClick={() => handleYearChange(y.toString())}
                        >
                          {y} ({getJapaneseEra(y)})
                        </div>
                      ))}
                      <div className="dob-spinner-spacer"></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP 2: Aloqa va Manzil */}
        {step === 2 && (
          <div className="step-content glass squircle fade-in">
            <div className="step-intro">
              <Phone className="step-icon text-green" size={28} />
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
        )}

        {/* STEP 3: Ta'lim tarixi */}
        {step === 3 && (
          <div className="step-content glass squircle fade-in">
            <div className="step-intro">
              <GraduationCap className="step-icon text-purple" size={28} />
              <h3>{t('education', 'Ta\'lim tarixi')}</h3>
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
                      value={edu.degree} 
                      onChange={(e) => handleEduChange(idx, 'degree', e.target.value)}
                      className="glass-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="sub-label">{t('gradDateLabel', 'Bitirgan sanasi')}</label>
                    <div className="date-input-group">
                      <input
                        type="number"
                        placeholder={t('yearPlaceholder', 'Yil')}
                        value={parseYearMonth(edu.gradDate).year}
                        onChange={(e) => {
                          const { month } = parseYearMonth(edu.gradDate);
                          handleEduChange(idx, 'gradDate', buildYearMonth(e.target.value, month));
                        }}
                        className="glass-input date-num-input year-input"
                        min="1950"
                        max="2040"
                      />
                      <span className="date-separator">{t('yearSuffix', 'yil')}</span>
                      <input
                        type="number"
                        placeholder={t('monthPlaceholder', 'Oy')}
                        value={parseYearMonth(edu.gradDate).month}
                        onChange={(e) => {
                          const { year } = parseYearMonth(edu.gradDate);
                          handleEduChange(idx, 'gradDate', buildYearMonth(year, e.target.value));
                        }}
                        className="glass-input date-num-input month-input"
                        min="1"
                        max="12"
                      />
                      <span className="date-separator">{t('monthSuffix', 'oy')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleAddEdu} className="add-btn squircle">
              + {t('addEducation', 'Ta\'lim qo\'shish')}
            </button>
          </div>
        )}

        {/* STEP 4: Ish tajribasi */}
        {step === 4 && (
          <div className="step-content glass squircle fade-in">
            <div className="step-intro">
              <Briefcase className="step-icon text-orange" size={28} />
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
                    </div>
                  </div>
                  {!work.isCurrent && (
                    <div className="form-group">
                      <label className="sub-label">{t('endDate', 'Tugash sanasi')}</label>
                      <div className="date-input-group">
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
            <div className="step-intro" style={{ marginTop: '24px' }}>
              <Award className="step-icon text-blue" size={28} />
              <h3>{t('licensesQualifications', 'Guvohnoma va Sertifikatlar')}</h3>
            </div>
            
            <div className="licenses-grid">
              <span className="section-label">{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}</span>
              <div className="badges-select-group">
                {['futsu', 'chugata', 'oogata', 'tokushu'].map(lic => (
                  <button 
                    key={lic}
                    onClick={() => handleToggleLicense(lic)}
                    className={`badge-select-btn squircle ${formData.driverLicenses.includes(lic) ? 'selected' : ''}`}
                  >
                    {t(`lic_${lic}`)}
                  </button>
                ))}
              </div>

              <span className="section-label" style={{ marginTop: '12px', display: 'block' }}>{t('otherCertificates', 'Maxsus sertifikatlar')}</span>
              <div className="badges-select-group">
                {['forklift', 'crane', 'towing'].map(cert => (
                  <button 
                    key={cert}
                    onClick={() => handleToggleCertificate(cert)}
                    className={`badge-select-btn squircle ${formData.techCertificates.includes(cert) ? 'selected' : ''}`}
                  >
                    {cert === 'forklift' ? 'Forklift (フォークリフト)' : cert === 'crane' ? 'Crane (クレーン)' : 'Towing (牽引)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Motivatsiya, Hobbies, va Maxsus Istaklar */}
        {step === 5 && (
          <div className="step-content glass squircle fade-in">
            <div className="step-intro">
              <BookOpen className="step-icon text-yellow" size={28} />
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
                rows={4}
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
                rows={4}
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
        )}

        {/* STEP 6: Yuklab olish va ko'rib chiqish */}
        {step === 6 && (
          <div className="step-content glass squircle fade-in text-center">
            <div className="step-intro" style={{ alignItems: 'center' }}>
              <FileText className="step-icon text-blue animated-pulse" size={48} />
              <h3 style={{ marginTop: '12px' }}>{t('step6Title', 'Tayyor! PDF Rezyume Yaratildi')}</h3>
              <p style={{ maxWidth: '380px', margin: '8px auto 0 auto' }}>
                {t('step6Desc', 'Barcha ma\'lumotlar standart yapon Rirekisho formatidagi PDF shakliga keltirildi. Quyida uni tekshirishingiz yoki yuklab olishingiz mumkin.')}
              </p>
            </div>

            {/* Font / Generation Status Indicator */}
            {pdfStatus && (
              <div className="pdf-status-pill glass">
                <Loader2 size={16} className="animate-spin text-blue" />
                <span>
                  {pdfStatus === 'loading_font' && t('loadingFont')}
                  {pdfStatus === 'generating_pdf' && t('generatingPDF')}
                  {pdfStatus === 'downloading' && t('downloading')}
                  {pdfStatus === 'completed' && t('completed')}
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
                <span>📄 PDF preview rendering...</span>
              </div>
            )}

            <div className="action-buttons-group" style={{ marginTop: '24px' }}>
              <button onClick={handleDownloadPDF} className="download-pdf-btn squircle">
                📥 {t('downloadPDF', 'PDF yuklab olish')}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="resume-builder-footer">
        {step > 1 ? (
          <button onClick={handlePrev} className="footer-btn prev-btn squircle">
            {t('prevBtn', 'Orqaga')}
          </button>
        ) : (
          <div style={{ flex: 1 }}></div>
        )}
        
        {step < 6 ? (
          <button onClick={handleNext} className="footer-btn next-btn squircle" style={{ flex: 1 }}>
            {t('nextBtn', 'Keyingi')}
          </button>
        ) : (
          <button onClick={onBack} className="footer-btn next-btn squircle finish-btn" style={{ flex: 1 }}>
            {t('finishBtn', 'Tugatish')}
          </button>
        )}
      </div>
    </div>
  );
}

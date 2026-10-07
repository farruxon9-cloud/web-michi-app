import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, User, Phone, Briefcase, GraduationCap, 
  Award, BookOpen, FileText, Loader2, Sparkles, 
  CheckCircle2, Download, Eye
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { generateRirekishoBlob } from '../utils/resumeGenerator';
import { saveResumeBlob, safeResumeFilename, isMobileDevice } from '../utils/resumeDownload';
import ResumeVoiceAgent from './resume/ResumeVoiceAgent';
import './ResumeBuilder.css';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Typewriter speed: short values are typed visibly, long texts faster so it never feels slow
const typeDelay = (len) => (len <= 16 ? 60 : len <= 60 ? 34 : len <= 200 ? 16 : 7);

const JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'];

// Stable signature of the resume content — used to know whether a generated PDF is still up to date
const resumeSignature = (data) => {
  try { return JSON.stringify(data); } catch { return String(Date.now()); }
};

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
  // Dedicated resume interviewer (independent from the global AI bento assistant)
  const [isAgentOn, setIsAgentOn] = useState(false);
  const typingTokenRef = useRef(0);

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfNotice, setPdfNotice] = useState(null); // { type: 'success' | 'error', text }
  const lastBlobRef = useRef(null);      // last generated PDF blob
  const lastSigRef = useRef(null);       // signature of the data it was generated from
  const noticeTimerRef = useRef(null);
  const isMobile = isMobileDevice();

  // Auto-save: push edits to the app profile (which persists them) shortly after typing stops.
  // Guarded by isHydrated so the empty initial form can never overwrite saved data.
  const [isHydrated, setIsHydrated] = useState(false);
  const onUpdateProfileRef = useRef(onUpdateProfile);
  useEffect(() => { onUpdateProfileRef.current = onUpdateProfile; }, [onUpdateProfile]);
  useEffect(() => {
    if (!isHydrated) return undefined;
    const timer = setTimeout(() => onUpdateProfileRef.current?.(formData), 800);
    return () => clearTimeout(timer);
  }, [formData, isHydrated]);

  // Sana boshqaruvi
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

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
      // Legacy data from the old "verification" flow is kept only as a self-declared level
      jlptStatus: profileData.jlptStatus?.level
        ? { level: profileData.jlptStatus.level, selfDeclared: true }
        : null
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

    setIsHydrated(true);

    // The global AI bento assistant must stay quiet here: the resume interviewer owns the microphone
    if (setIsVoiceActive) setIsVoiceActive(false);
    if (setIsVoiceStandby) setIsVoiceStandby(false);

    // PDF is generated on demand (preview / download buttons), not on every mount or keystroke.

    return () => {
      typingTokenRef.current += 1; // finish any running typewriter instantly
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      if (previousUrlRef.current && previousUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
      lastBlobRef.current = null;
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
            // No focus(): focusing would pop up the on-screen keyboard on phones
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.classList.add('voice-highlight');
            setTimeout(() => inputEl.classList.remove('voice-highlight'), 2500);
          }
        }, 100);

        onUpdateProfile?.(updated);
        return updated;
      });
    };

    window.addEventListener('michi-voice-resume-update', handleVoiceUpdate);
    return () => window.removeEventListener('michi-voice-resume-update', handleVoiceUpdate);
  }, [onUpdateProfile]);

  const isPdfFresh = () => Boolean(lastBlobRef.current) && lastSigRef.current === resumeSignature(formData);

  const showNotice = (type, text) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setPdfNotice({ type, text });
    noticeTimerRef.current = setTimeout(() => setPdfNotice(null), 4000);
  };

  // Generate (or reuse) the PDF blob for the current form data
  const ensurePdfBlob = async () => {
    if (isPdfFresh()) return lastBlobRef.current;
    const sig = resumeSignature(formData);
    const blob = await generateRirekishoBlob(formData, {
      onProgress: (status) => setPdfStatus(status)
    });
    lastBlobRef.current = blob;
    lastSigRef.current = sig;
    setCleanPreviewUrl(URL.createObjectURL(blob));
    return blob;
  };

  // PDF Preview yaratish (faqat tugma bosilganda)
  const handlePreviewPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await ensurePdfBlob();
    } catch {
      setPdfStatus('failed');
      showNotice('error', t('pdfError', 'PDF yaratishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.'));
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF Yuklab olish / ulashish — barcha platformalarda ishonchli
  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    onUpdateProfile?.(formData);
    setIsGenerating(true);
    try {
      const blob = await ensurePdfBlob();
      const result = await saveResumeBlob(blob, safeResumeFilename(formData.fullName));
      if (result !== 'cancelled') {
        showNotice('success', t('resumeSaved', '✅ Rezyume saqlandi'));
      }
    } catch {
      setPdfStatus('failed');
      showNotice('error', t('pdfError', 'PDF yaratishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Yangi oynada xavfsiz ochish.
  // The tab is opened synchronously inside the click (so popup blockers allow it),
  // then pointed at the PDF once it is ready. 'noopener' is not passed because it makes
  // window.open() return null; the opener link is cut manually instead.
  const handleOpenPDFInNewTab = async (e) => {
    e.preventDefault();
    if (isGenerating) return;

    if (Capacitor.isNativePlatform()) {
      // WebViews ignore window.open — hand the file to the native viewer/share sheet
      return handleDownloadPDF();
    }

    const fresh = isPdfFresh();
    const win = window.open(fresh ? previousUrlRef.current : '', '_blank');
    if (win) win.opener = null;
    if (fresh) {
      if (!win) showNotice('error', t('popupBlocked', 'Pop-up oyna bloklandi. Brauzer sozlamalaridan ruxsat bering yoki PDFni yuklab oling.'));
      return;
    }

    setIsGenerating(true);
    try {
      await ensurePdfBlob();
      if (win && !win.closed) {
        win.location.href = previousUrlRef.current;
      } else {
        showNotice('error', t('popupBlocked', 'Pop-up oyna bloklandi. Brauzer sozlamalaridan ruxsat bering yoki PDFni yuklab oling.'));
      }
    } catch {
      if (win && !win.closed) win.close();
      setPdfStatus('failed');
      showNotice('error', t('pdfError', 'PDF yaratishda xatolik yuz berdi. Iltimos qayta urinib ko\'ring.'));
    } finally {
      setIsGenerating(false);
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

  // JLPT darajasi — haydovchining o'zi kiritadi (自己申告). Platforma tomonidan tasdiqlanmaydi.
  const handleSelectJlpt = (level) => {
    setFormData(prev => {
      const nextStatus = prev.jlptStatus?.level === level || !level
        ? null
        : { level, selfDeclared: true, date: new Date().toISOString().split('T')[0] };
      const updated = { ...prev, jlptStatus: nextStatus };
      onUpdateProfile?.(updated);
      return updated;
    });
  };

  /* ===== Resume Voice AI: writes on the user's behalf with a typewriter effect ===== */

  // Types `value` into the element `id` character by character. The field is read-only and never
  // focused while typing, so the on-screen keyboard does not appear.
  const typeInto = async (id, value, setValue) => {
    const token = typingTokenRef.current;
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    let el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.readOnly = true;
      el.classList.add('rva-typing');
    }
    await sleep(380);
    const chars = Array.from(String(value ?? ''));
    const delay = typeDelay(chars.length);
    for (let i = 1; i <= chars.length; i++) {
      if (token !== typingTokenRef.current) break;
      setValue(chars.slice(0, i).join(''));
      if (el && el.tagName === 'TEXTAREA') el.scrollTop = el.scrollHeight;
      await sleep(delay);
    }
    setValue(String(value ?? ''));
    el = document.getElementById(id) || el;
    if (el) {
      el.readOnly = false;
      el.classList.remove('rva-typing');
      el.classList.add('rva-written');
      setTimeout(() => el.classList.remove('rva-written'), 1700);
    }
  };

  const flashElement = async (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('rva-written');
      setTimeout(() => el.classList.remove('rva-written'), 1700);
    }
    await sleep(700);
  };

  const handleVoiceWrite = async (effect) => {
    if (!effect) return;
    switch (effect.type) {
      case 'text': {
        const { field, value } = effect;
        await typeInto(field, value, v => setFormData(prev => ({ ...prev, [field]: v })));
        break;
      }
      case 'birthDate': {
        const [y, m, d] = effect.value.split('-');
        await typeInto('dob-day', String(parseInt(d, 10)), setSelectedDay);
        await typeInto('dob-month', String(parseInt(m, 10)), setSelectedMonth);
        await typeInto('dob-year', y, setSelectedYear);
        setFormData(prev => ({ ...prev, birthDate: effect.value }));
        break;
      }
      case 'gender':
        setFormData(prev => ({ ...prev, gender: effect.value }));
        await flashElement('gender-group');
        break;
      case 'licenses':
        setFormData(prev => ({ ...prev, driverLicenses: Array.from(new Set([...(prev.driverLicenses || []), ...effect.value])) }));
        await flashElement('license-group');
        break;
      case 'jlpt':
        setFormData(prev => ({
          ...prev,
          jlptStatus: effect.value ? { level: effect.value, selfDeclared: true, date: new Date().toISOString().split('T')[0] } : null
        }));
        await flashElement('jlpt-group');
        break;
      case 'list': {
        const { list, index, key, value } = effect;
        const template = list === 'educationHistory'
          ? { school: '', major: '', startDate: '', endDate: '' }
          : { company: '', position: '', startDate: '', endDate: '', isCurrent: false };
        setFormData(prev => {
          const arr = [...(prev[list] || [])];
          while (arr.length <= index) arr.push({ ...template });
          return { ...prev, [list]: arr };
        });
        await sleep(90); // let the new card render before typing into it
        const prefix = list === 'educationHistory' ? 'edu' : 'work';
        await typeInto(`${prefix}-${index}-${key}`, value, v => setFormData(prev => {
          const arr = [...(prev[list] || [])];
          while (arr.length <= index) arr.push({ ...template });
          arr[index] = { ...arr[index], [key]: v };
          return { ...prev, [list]: arr };
        }));
        break;
      }
      default:
        break;
    }
  };

  const voiceLabels = {
    male: t('male', 'Erkak'),
    female: t('female', 'Ayol'),
    none: t('jlptNone', 'Yo\'q'),
    lic_futsu: t('lic_futsu', '普通'),
    lic_junchugata: t('lic_junchugata', '準中型'),
    lic_chugata: t('lic_chugata', '中型'),
    lic_oogata: t('lic_oogata', '大型')
  };

  return (
    <div className={`resume-builder-container fade-in ${isAgentOn ? 'rva-on' : ''}`}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>AI VOICE</span>
          <button
            type="button"
            id="resume-ai-voice-toggle"
            className="theme-toggle-btn"
            onClick={() => {
              typingTokenRef.current += 1;
              setIsAgentOn(v => !v);
            }}
            aria-label="AI Voice"
            aria-pressed={isAgentOn}
          >
            <div className={`theme-toggle-track ${isAgentOn ? 'dark' : 'light'}`} style={{ width: '48px', height: '24px', borderRadius: '12px' }}>
              <div className="theme-toggle-thumb" style={{ width: '18px', height: '18px', left: isAgentOn ? 'calc(100% - 20px)' : '2px', top: '2px' }}>
                <Sparkles size={10} color="#ffffff" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {isAgentOn && (
        <ResumeVoiceAgent
          formData={formData}
          lang={i18n.language}
          labels={voiceLabels}
          onWrite={handleVoiceWrite}
          onClose={() => {
            typingTokenRef.current += 1;
            setIsAgentOn(false);
          }}
        />
      )}

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
            <div className="gender-select-row" id="gender-group">
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
                  id="dob-day"
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
                  id="dob-month"
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
                  id="dob-year"
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
                    id={`edu-${idx}-school`}
                    placeholder={t('schoolName', 'Muassasa nomi')}
                    value={edu.school} 
                    onChange={(e) => handleEduChange(idx, 'school', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    id={`edu-${idx}-major`}
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
                    id={`work-${idx}-company`}
                    placeholder={t('companyName', 'Kompaniya nomi')}
                    value={work.company} 
                    onChange={(e) => handleWorkChange(idx, 'company', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    id={`work-${idx}-position`}
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
          
          <div className="badges-select-group" id="license-group">
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

          {/* JLPT darajasi — 自己申告 (o'zi kiritgan, platforma tasdiqlamaydi) */}
          <div className="step-intro" style={{ marginTop: '20px' }}>
            <FileText className="step-icon text-purple" size={24} />
            <h3>{t('jlptLevelLabel', 'Yapon tili darajasi (JLPT)')}</h3>
            <p>{t('jlptSelfDeclaredHint', 'O\'zingiz tanlaysiz (自己申告). Sertifikat suhbat paytida tekshiriladi.')}</p>
          </div>
          <div className="badges-select-group" id="jlpt-group" role="radiogroup" aria-label="JLPT">
            {JLPT_LEVELS.map(level => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={formData.jlptStatus?.level === level}
                onClick={() => handleSelectJlpt(level)}
                className={`badge-select-btn squircle ${formData.jlptStatus?.level === level ? 'selected' : ''}`}
              >
                {level}
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={!formData.jlptStatus?.level}
              onClick={() => handleSelectJlpt(null)}
              className={`badge-select-btn squircle ${!formData.jlptStatus?.level ? 'selected' : ''}`}
            >
              {t('jlptNone', 'Yo\'q')}
            </button>
          </div>
          {formData.jlptStatus?.level && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Award size={14} />
              <span>JLPT {formData.jlptStatus.level} · {t('jlptSelfDeclared', '自己申告')}</span>
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
          {isGenerating && (
            <div className="pdf-status-pill glass" role="status" aria-live="polite" style={{ margin: '8px auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={14} className="animate-spin text-blue" />
              <span>
                {pdfStatus === 'loading_font'
                  ? t('resumeLoadingFont', 'Shrift yuklanmoqda…')
                  : t('resumePreparing', 'PDF tayyorlanmoqda…')}
              </span>
            </div>
          )}

          {pdfNotice && (
            <div
              className="pdf-status-pill glass"
              role={pdfNotice.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              style={{ margin: '8px auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: pdfNotice.type === 'error' ? '#FF3B30' : 'var(--text-main)' }}
            >
              {pdfNotice.type === 'success' && <CheckCircle2 size={14} color="#30D158" />}
              <span>{pdfNotice.text}</span>
            </div>
          )}

          {/* Desktop: inline preview. Mobile browsers can't render PDFs inside iframes reliably,
              so phones get a tap-to-open card instead. */}
          {pdfPreviewUrl && !isMobile ? (
            <div className="pdf-preview-box glass">
              <iframe src={pdfPreviewUrl} title="Resume PDF Preview" className="pdf-iframe-preview"></iframe>
            </div>
          ) : (
            <button
              type="button"
              onClick={isMobile && pdfPreviewUrl ? handleOpenPDFInNewTab : handlePreviewPDF}
              disabled={isGenerating}
              className="pdf-preview-placeholder glass squircle"
              style={{ width: '100%', border: 'none', cursor: isGenerating ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}
            >
              <FileText size={28} style={{ color: 'var(--text-secondary)' }} />
              <span>
                {isMobile && pdfPreviewUrl
                  ? t('resumeTapToOpen', 'PDFni ko\'rish uchun bosing')
                  : t('resumePreviewBtn', 'Oldindan ko\'rish')}
              </span>
            </button>
          )}

          <div className="action-buttons-group" style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              aria-busy={isGenerating}
              className="download-pdf-btn squircle"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isGenerating ? 0.7 : 1 }}
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {t('downloadPDF', 'PDF yuklab olish')}
            </button>

            <button
              type="button"
              onClick={handleOpenPDFInNewTab}
              disabled={isGenerating}
              className="open-pdf-tab-btn squircle"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isGenerating ? 0.7 : 1 }}
            >
              <Eye size={16} />
              {t('openInNewTab', 'Yangi oynada ochish')}
            </button>
          </div>
        </div>
      </div>
      {/* Trailing clearance: last card stops 12px above the floating BottomNav (michi-subpage-spacing rule) */}
      <div aria-hidden="true" style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}


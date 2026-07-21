import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit3, X, Image as ImageIcon, Camera, ArrowLeft, Upload, Clock, Banknote, Share2, Briefcase, CheckCircle2, Globe } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { compressImage } from '../utils/imageCompressor';
import './DriverFeed.css';

const INITIAL_COMPANY_JOBS = [
  {
    id: 1, company: "Sagawa Express", title: "Mahalliy yetkazib berish (Local Delivery)", salary: "¥300,000 / oyiga",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Tokyo, Koto-ku", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
    nearestStation: "Kokusai-tenjijo Station", walkTime: 8
  },
  {
    id: 2, company: "Sagawa Express", title: "Xalqaro yuk tashish (Trailer)", salary: "¥500,000 / oyiga",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Kanagawa, Yokohama", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
    nearestStation: "Motomachi-Chukagai Station", walkTime: 12
  },
  {
    id: 3, company: "Sagawa Express", title: "Tungi reys haydovchisi (10t)", salary: "¥450,000 / oyiga",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Saitama, Omiya", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
    nearestStation: "Omiya Station", walkTime: 5
  },
  {
    id: 4, company: "Sagawa Express", title: "Ekskavator va Maxsus texnika haydovchisi", salary: "¥380,000 / oyiga",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Chiba, Matsudo", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
    nearestStation: "Tokiwadaira Station", walkTime: 15
  },
  {
    id: 5, company: "Sagawa Express", title: "Omborxona Forklift operatori", salary: "¥250,000 / oyiga",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Aichi, Nagoya", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
    nearestStation: "Nagoya Station", walkTime: 10
  }
];

const parseAddress = (fullAddress = '') => {
  if (!fullAddress) return { postalCode: '', prefecture: '', detailAddress: '' };
  
  // Extract postal code (e.g. 330-0854 or 〒330-0854)
  const pcMatch = fullAddress.match(/(\d{3}-\d{4})/);
  const postalCode = pcMatch ? pcMatch[1] : '';
  
  // Prefecture list (English/Japanese matching)
  const prefectures = [
    'Tokyo', 'Saitama', 'Chiba', 'Kanagawa', 'Osaka', 'Kyoto', 
    'Aichi', 'Fukuoka', 'Hyogo', 'Shizuoka', 'Hiroshima', 'Hokkaido',
    '東京', '埼玉', '千葉', '神奈川', '大阪', '京都', '愛知', '福岡', '兵庫', '静岡', '広島', '北海道'
  ];
  
  let prefecture = '';
  for (const pref of prefectures) {
    if (fullAddress.includes(pref)) {
      prefecture = pref;
      break;
    }
  }
  
  // Remaining part is detail address
  let detailAddress = fullAddress;
  if (postalCode) {
    detailAddress = detailAddress.replace(`〒${postalCode}`, '').replace(postalCode, '');
  }
  if (prefecture) {
    detailAddress = detailAddress.replace(prefecture, '');
  }
  
  // Clean punctuation
  detailAddress = detailAddress.trim().replace(/^,/, '').replace(/^[，、]/, '').trim();
  
  return { postalCode, prefecture, detailAddress };
};

export default function CompanyHome({ onJobClick, onSchoolClick, jobs, setJobs, schools, setSchools, profileData, jobToEdit, setJobToEdit, onFormToggle, onApply, onApplySchool, onShoukai, applications = [], schoolApplications = [] }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdTypeSelect, setShowAdTypeSelect] = useState(false);
  const [showJobTypeSelect, setShowJobTypeSelect] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState('job');
  const [jobImage, setJobImage] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (onFormToggle) {
      onFormToggle(showAddForm || showAdTypeSelect || showJobTypeSelect);
    }
  }, [showAddForm, showAdTypeSelect, showJobTypeSelect, onFormToggle]);

  React.useEffect(() => {
    if (jobToEdit) {
      const isCourse = (jobToEdit.courses || jobToEdit.langs) ? true : false;
      setSelectedAdType(isCourse ? 'school' : 'job');
      
      const parsed = parseAddress(jobToEdit.fullAddress);
      const postalCode = jobToEdit.postalCode || parsed.postalCode;
      const prefecture = jobToEdit.prefecture || parsed.prefecture;
      const detailAddress = jobToEdit.detailAddress || parsed.detailAddress;

      if (isCourse) {
        setNewJob({
          id: jobToEdit.id,
          title: jobToEdit.type || jobToEdit.title,
          salary: jobToEdit.price || jobToEdit.salary,
          bonus: jobToEdit.discount || jobToEdit.bonus || '',
          location: jobToEdit.location,
          fullAddress: jobToEdit.fullAddress,
          postalCode,
          prefecture,
          detailAddress,
          phone: jobToEdit.phone,
          email: jobToEdit.email,
          description: jobToEdit.description,
          langs: jobToEdit.langs || ['UZ', 'JP'],
          courses: jobToEdit.courses || ['Oogata', 'Chugata', 'Futsu'],
          hasShoukai: (jobToEdit.shoukaiFee > 0 || jobToEdit.hasShoukai === 'yes' || jobToEdit.hasShoukai === true) ? 'yes' : 'no',
          shoukaiFee: jobToEdit.shoukaiFee ? String(jobToEdit.shoukaiFee) : '',
          shoukaiConditions: jobToEdit.shoukaiConditions || '',
          phoneMode: jobToEdit.phoneMode || 'public',
          isInternational: jobToEdit.isInternational || false
        });
      } else {
        setNewJob({
          id: jobToEdit.id,
          title: jobToEdit.title,
          salary: jobToEdit.salary,
          location: jobToEdit.location,
          fullAddress: jobToEdit.fullAddress,
          postalCode,
          prefecture,
          detailAddress,
          phone: jobToEdit.phone,
          email: jobToEdit.email,
          hours: jobToEdit.hours || '',
          bonus: jobToEdit.bonus || '',
          insurance: jobToEdit.insurance || '',
          foreigners: jobToEdit.foreigners || '',
          housing: jobToEdit.housing || '',
          description: jobToEdit.description,
          dayOff: jobToEdit.dayOff || '',
          hasShoukai: (jobToEdit.hasShoukai === true || jobToEdit.hasShoukai === 'yes' || jobToEdit.shoukaiFee > 0) ? 'yes' : 'no',
          shoukaiFee: jobToEdit.shoukaiFee ? String(jobToEdit.shoukaiFee) : '',
          shoukaiConditions: jobToEdit.shoukaiConditions || '',
          license: jobToEdit.license || [],
          phoneMode: jobToEdit.phoneMode || 'public',
          isInternational: jobToEdit.isInternational || false,
          type: jobToEdit.type || 'fulltime',
          nearestStation: jobToEdit.nearestStation || '',
          walkTime: jobToEdit.walkTime ? String(jobToEdit.walkTime) : ''
        });
      }
      setJobImage(jobToEdit.image || null);
      setShowAddForm(true);
      if (setJobToEdit) setJobToEdit(null);
    }
  }, [jobToEdit, setJobToEdit]);
  
  const isDrivingSchool = profileData?.companyType === 'driving_school';
  const isAdCourse = selectedAdType === 'school';
  
  const [newJob, setNewJob] = useState({
    title: '', 
    salary: '', 
    location: '', 
    fullAddress: '', 
    postalCode: '',
    prefecture: '',
    detailAddress: '',
    phone: '', 
    email: '', 
    hours: '', 
    bonus: '', 
    insurance: '', 
    foreigners: '', 
    housing: '', 
    description: '', 
    dayOff: '',
    hasShoukai: '', // Empty initially to force a selection
    shoukaiFee: '', 
    shoukaiConditions: '',
    langs: ['UZ', 'JP'], // Default driving school languages
    courses: ['Oogata', 'Chugata', 'Futsu'], // Default driving school courses
    license: [], // Array for regular job licenses if needed
    phoneMode: 'public',
    isInternational: false,
    type: 'fulltime',
    nearestStation: '',
    walkTime: ''
  });
  const [errors, setErrors] = useState({});

  const WORK_HOURS_OPTIONS = [
    { value: '08:00 - 17:00 (Kunduzgi)', key: 'wh_day' },
    { value: '20:00 - 05:00 (Tungi)', key: 'wh_night' },
    { value: 'Smenali ish (Jadval)', key: 'wh_shift' },
    { value: 'Erkin grafik', key: 'wh_flex' },
    { value: 'Boshqa', key: 'wh_other' }
  ];
  const DAY_OFF_OPTIONS = [
    { value: 'Shanba va Yakshanba', key: 'do_weekend' },
    { value: 'Haftada 2 kun (Smenali)', key: 'do_2days' },
    { value: 'Haftada 1 kun', key: 'do_1day' },
    { value: 'Boshqa', key: 'do_other' }
  ];
  const INSURANCE_OPTIONS = [
    { value: 'To\'liq ijtimoiy sug\'urta', key: 'ins_full' },
    { value: 'Koyo Hoken (Bandlik)', key: 'ins_koyo' },
    { value: 'Yo\'q', key: 'ins_none' }
  ];
  const FOREIGNERS_OPTIONS = [
    { value: 'foreigners_visa', key: 'foreigners_visa' },
    { value: 'foreigners_visa_renew', key: 'foreigners_visa_renew' },
    { value: 'foreigners_ok', key: 'foreigners_ok' },
    { value: 'foreigners_n4', key: 'foreigners_n4' },
    { value: 'foreigners_n3', key: 'foreigners_n3' },
    { value: 'foreigners_n2', key: 'foreigners_n2' }
  ];
  const HOUSING_OPTIONS = [
    { value: 'Yotoqxona mavjud', key: 'hou_dorm' },
    { value: 'Ijara yordami bor (Yachin hojo)', key: 'hou_rent' },
    { value: 'Ko\'chib kelish to\'lanadi', key: 'hou_move' },
    { value: 'Yo\'q', key: 'hou_none' }
  ];
  const LICENSE_OPTIONS = [
    { value: 'Futsu (Oddiy)', key: 'lic_futsu_opt' },
    { value: 'Chugata (O\'rta yuk)', key: 'lic_chugata_opt' },
    { value: 'Oogata (Katta yuk)', key: 'lic_oogata_opt' },
    { value: 'Tokushu (Maxsus)', key: 'lic_tokushu_opt' },
    { value: 'Forklift', key: 'lic_forklift_opt' },
    { value: 'Talab qilinmaydi', key: 'lic_none_opt' }
  ];


  const companyJobs = (jobs || []).filter(j => j.company === (profileData?.fullName || "Sagawa Express"));
  const companySchools = (schools || []).filter(s => s.name === (profileData?.fullName || "Koyama Driving School"));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.7);
        setJobImage(compressed);
      } catch (err) {
        console.error("Job image compression failed:", err);
        const reader = new FileReader();
        reader.onloadend = () => setJobImage(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  // Toggle selection in array
  const handleToggleCourse = (course) => {
    setNewJob(prev => {
      const exists = prev.courses.includes(course);
      return {
        ...prev,
        courses: exists ? prev.courses.filter(c => c !== course) : [...prev.courses, course]
      };
    });
  };

  const handleToggleLang = (lang) => {
    setNewJob(prev => {
      const exists = prev.langs.includes(lang);
      return {
        ...prev,
        langs: exists ? prev.langs.filter(l => l !== lang) : [...prev.langs, lang]
      };
    });
  };

  const handleFormBack = () => {
    if (showAddForm) {
      setShowAddForm(false);
      setErrors({});
      setJobImage(null);
      
      if (jobToEdit) {
        setJobToEdit(null);
        return;
      }
      
      if (selectedAdType === 'school') {
        setShowAdTypeSelect(true);
      } else {
        setShowJobTypeSelect(true);
      }
    } else if (showJobTypeSelect) {
      setShowJobTypeSelect(false);
      if (profileData?.companyType === 'driving_school') {
        setShowAdTypeSelect(true);
      }
    } else if (showAdTypeSelect) {
      setShowAdTypeSelect(false);
    }
  };

  const handleAddJob = () => {
    // 1. Mandatory Fields Validation with inline errors
    const newErrors = {};
    if (!newJob.title) newErrors.title = t('reqTitle', 'Sarlavha kiritilishi shart');
    if (!newJob.salary) newErrors.salary = t('reqSalary', 'Narx/Maosh kiritilishi shart');
    if (!newJob.phone) newErrors.phone = t('reqPhone', 'Telefon raqam kiritilishi shart');
    if (!newJob.email) newErrors.email = t('reqEmail', 'Email kiritilishi shart');
    if (!newJob.description) newErrors.description = t('reqDesc', 'Batafsil ma\'lumot kiritilishi shart');
    if (newJob.hasShoukai === '') newErrors.hasShoukai = t('reqShoukai', 'Shoukai holatini belgilash shart');
    if (newJob.hasShoukai === 'yes' && !newJob.shoukaiFee) newErrors.shoukaiFee = t('reqShoukaiSum', 'Shoukai summasini kiritish shart');

    // Structured address validations
    if (!newJob.postalCode) {
      newErrors.postalCode = t('reqPostalCode', 'Pochta indeksi kiritilishi shart');
    } else if (!/^\d{3}-\d{4}$/.test(newJob.postalCode)) {
      newErrors.postalCode = t('invalidPostalCode', 'Pochta indeksi xxx-xxxx formatida bo\'lishi shart');
    }
    if (!newJob.prefecture) {
      newErrors.prefecture = t('reqPrefecture', 'Prefektura tanlanishi shart');
    }
    if (!newJob.detailAddress) {
      newErrors.detailAddress = t('reqDetailAddress', 'Batafsil manzil kiritilishi shart');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const errorList = [];
      if (newErrors.title) errorList.push(isAdCourse ? t('schoolTypeLabel', 'Toifalar') : t('jobTitleLabel', 'Sarlavha'));
      if (newErrors.salary) errorList.push(isAdCourse ? t('schoolPriceLabel', 'Boshlang\'ich narxi') : t('salaryLabel', 'Maosh'));
      if (newErrors.postalCode) errorList.push(t('postalCodeLabel', 'Pochta indeksi'));
      if (newErrors.prefecture) errorList.push(t('prefectureLabel', 'Prefektura'));
      if (newErrors.detailAddress) errorList.push(t('detailAddressLabel', 'Batafsil manzil'));
      if (newErrors.phone) errorList.push(t('phoneLabel', 'Telefon'));
      if (newErrors.email) errorList.push(t('emailLabel', 'Email'));
      if (newErrors.description) errorList.push(isAdCourse ? t('schoolDescLabel', 'Tavsif') : t('jobDescLabel', 'Batafsil tavsif'));
      if (newErrors.hasShoukai) errorList.push(t('shoukaiSettings', 'Shoukai sozlamalari'));
      if (newErrors.shoukaiFee) errorList.push(t('shoukaiSumLabel', 'Shoukai summasi'));

      alert(`${t('validationFailedAlert', 'Iltimos, barcha majburiy maydonlarni to\'ldiring')}:\n- ${errorList.join('\n- ')}`);
      return;
    }
    
    setErrors({});

    // Compute short location and full address from 3 fields
    const cityPart = newJob.detailAddress.split(',')[0].split(' ')[0].trim();
    const generatedLocation = `${newJob.prefecture}, ${cityPart || newJob.prefecture}`;
    const generatedFullAddress = `〒${newJob.postalCode} ${newJob.prefecture}, ${newJob.detailAddress}`;

    if (isAdCourse) {
      const school = {
        id: newJob.id || Date.now(),
        name: profileData?.fullName || "Koyama Driving School",
        type: newJob.title,
        price: newJob.salary,
        discount: newJob.bonus || "¥10,000",
        image: jobImage || "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
        verified: true,
        location: generatedLocation,
        fullAddress: generatedFullAddress,
        postalCode: newJob.postalCode,
        prefecture: newJob.prefecture,
        detailAddress: newJob.detailAddress,
        description: newJob.description,
        courses: newJob.courses,
        phone: newJob.phone,
        email: newJob.email,
        langs: newJob.langs,
        shoukaiFee: newJob.hasShoukai === 'yes' ? Number(newJob.shoukaiFee) : 0,
        shoukaiConditions: newJob.shoukaiConditions || t('defaultSchoolShoukaiConditions', 'O\'qishni boshlagandan so\'ng mukofot to\'lanadi.'),
        shoukai: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : '0'
      };

      if (newJob.id) {
        setSchools(schools.map(s => s.id === newJob.id ? school : s));
      } else {
        setSchools([school, ...schools]);
      }
    } else {
      const job = {
        id: newJob.id || Date.now(),
        company: profileData?.fullName || "Sagawa Express",
        title: newJob.title,
        salary: newJob.salary,
        location: generatedLocation,
        fullAddress: generatedFullAddress,
        postalCode: newJob.postalCode,
        prefecture: newJob.prefecture,
        detailAddress: newJob.detailAddress,
        phone: newJob.phone,
        email: newJob.email,
        hours: newJob.hours,
        bonus: newJob.bonus,
        insurance: newJob.insurance,
        foreigners: newJob.foreigners,
        housing: newJob.housing,
        description: newJob.description,
        dayOff: newJob.dayOff,
        image: jobImage || "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
        verified: true,
        logo: profileData?.avatar || "https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&size=100",
        hasShoukai: newJob.hasShoukai === 'yes',
        shoukaiFee: newJob.hasShoukai === 'yes' ? Number(newJob.shoukaiFee) : 0,
        shoukaiAmount: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : "0",
        shoukai: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : "0",
        shoukaiConditions: newJob.shoukaiConditions || t('defaultJobShoukaiConditions', 'Tavsiya qilingan nomzod ishga qabul qilinib, kamida 3 oy ishlasa shoukai puli to\'lab beriladi.'),
        phoneMode: newJob.phoneMode || 'public',
        isInternational: newJob.isInternational || false,
        type: newJob.type || 'fulltime',
        nearestStation: newJob.nearestStation || '',
        walkTime: newJob.walkTime ? Number(newJob.walkTime) : ''
      };

      if (newJob.id) {
        setJobs(jobs.map(j => j.id === newJob.id ? job : j));
      } else {
        setJobs([job, ...jobs]);
      }
    }

    setShowAddForm(false);
    setJobImage(null);
    setNewJob({
      title: '', 
      salary: '', 
      location: '', 
      fullAddress: '', 
      postalCode: '',
      prefecture: '',
      detailAddress: '',
      phone: '', 
      email: '', 
      hours: '', 
      bonus: '', 
      insurance: '', 
      foreigners: '', 
      housing: '', 
      description: '', 
      dayOff: '',
      hasShoukai: '',
      shoukaiFee: '', 
      shoukaiConditions: '',
      langs: ['UZ', 'JP'],
      courses: ['Oogata', 'Chugata', 'Futsu'],
      phoneMode: 'public',
      isInternational: false
    });
  };

  // ===== ADD NEW JOB FORM (Full Page Premium) =====
  if (showAddForm) {
    const renderChips = (options, fieldName, isMulti = false) => {
      const selectedValue = newJob[fieldName];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {options.map(optObj => {
            const opt = typeof optObj === 'string' ? optObj : optObj.value;
            const label = typeof optObj === 'string' ? t(optObj, optObj) : t(optObj.key, optObj.value);
            const isSelected = isMulti ? (selectedValue && selectedValue.includes(opt)) : selectedValue === opt;
            return (
              <button
                key={opt}
                type="button"
                className={`form-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (isMulti) {
                    const current = selectedValue || [];
                    if (isSelected) {
                      setNewJob({ ...newJob, [fieldName]: current.filter(v => v !== opt) });
                    } else {
                      setNewJob({ ...newJob, [fieldName]: [...current, opt] });
                    }
                  } else {
                    setNewJob({ ...newJob, [fieldName]: isSelected ? '' : opt });
                  }
                  if (errors[fieldName]) {
                    setErrors(prev => ({ ...prev, [fieldName]: null }));
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      );
    };

    return (
      <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px', position: 'relative' }}>
        {/* Pinned Sticky Back Button */}
        <div style={{ 
          position: 'sticky', 
          top: '12px', 
          left: '16px', 
          zIndex: 120, 
          width: 'fit-content',
          marginBottom: '-40px',
          pointerEvents: 'none'
        }}>
          <button 
            className="icon-btn glass animate-scale-up" 
            onClick={handleFormBack}
            style={{ 
              pointerEvents: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 72px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
            {isAdCourse ? t('addNewSchoolAd', "Yangi avtomaktab e'loni") : t('addNewJob', "Yangi ish e'loni qo'shish")}
          </h2>
        </div>

        {/* International Recruitment Mode Badge Indicator */}
        {!isAdCourse && newJob.isInternational && (
          <div 
            className="glass squircle animate-fade-in"
            style={{ 
              margin: '0 16px 20px 16px', 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.1), rgba(175, 82, 222, 0.1))', 
              border: '1px solid rgba(175, 82, 222, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #5E5CE6, #AF52DE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={20} color="#FFF" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                {t('recruitmentInternational', "Xalqaro vakansiya / Tokutei Ginou")}
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.85 }}>
                Chet eldagi nomzodlarni jalb qilish uchun maxsus viza va yordam so'rovnomasi faol.
              </p>
            </div>
          </div>
        )}

        <div style={{ padding: '0 16px' }}>
          {/* Image Upload Section */}
          <div 
            className="glass squircle"
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              height: '180px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              marginBottom: '24px',
              overflow: 'hidden',
              position: 'relative',
              border: '2px dashed var(--primary)'
            }}
          >
            {jobImage ? (
              <>
                <img src={jobImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '26px' }} />
                <div style={{ 
                  position: 'absolute', bottom: '10px', right: '10px', 
                  background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', 
                  borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Camera size={14} /> {t('changePhoto', "Rasmni o'zgartirish")}
                </div>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--primary)" />
                <span style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>
                  {t('uploadAdImage', "E'lon rasmini yuklang")}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.8, marginTop: '4px' }}>
                  {t('optionalField', '(Ixtiyoriy ammo tavsiya etiladi)')}
                </span>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageChange}
          />

          {/* BLOCK 1: Asosiy Ma'lumotlar */}
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
              <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                {t('jobBasicInfo', "Asosiy ma'lumotlar")}
              </h4>
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolTypeLabel', 'Toifalar / Kategoriya') : t('jobTitleLabel', 'Sarlavha (Vakansiya)')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.title} 
                onChange={e => { setNewJob({...newJob, title: e.target.value}); setErrors(prev => ({...prev, title: null})); }} 
                placeholder={isAdCourse ? t('schoolTypePlaceholder', "Masalan: Katta yuk va maxsus, Barcha toifalar") : t('jobTitlePlaceholder', "Masalan: Mahalliy yetkazib beruvchi (4t)")} 
                className="auth-input"
                style={{ borderColor: errors.title ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={50}
              />
              {errors.title && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolPriceLabel', 'Boshlang\'ich o\'qish narxi') : t('salaryLabel', 'Oylik maosh (O\'rtacha)')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.salary} 
                onChange={e => { setNewJob({...newJob, salary: e.target.value}); setErrors(prev => ({...prev, salary: null})); }} 
                placeholder={isAdCourse ? t('schoolPricePlaceholder', "Masalan: ¥280,000~") : t('salaryPlaceholder', "Masalan: ¥300,000 / oyiga")} 
                className="auth-input"
                style={{ borderColor: errors.salary ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={30}
              />
              {errors.salary && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.salary}</span>}
            </div>

            {!isAdCourse && (
              <div className="input-group chip-group-container" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('jobTypeLabel', 'Ish turi / Bandlik shakli')} <span style={{ color: '#FF3B30' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { value: 'fulltime', label: t('jobType_fulltime', 'Doimiy (Seishain)') },
                    { value: 'contract', label: t('jobType_contract', 'Shartnoma (Keiyaku)') },
                    { value: 'parttime', label: t('jobType_parttime', 'Kunbay/Soatbay (Arubaito)') }
                  ].map(opt => {
                    const isSelected = newJob.type === opt.value;
                    const isDisabled = newJob.isInternational && opt.value === 'parttime';
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`form-chip ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        disabled={isDisabled}
                        onClick={() => {
                          setNewJob({ ...newJob, type: opt.value });
                        }}
                        style={{
                          opacity: isDisabled ? 0.45 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          textDecoration: isDisabled ? 'line-through' : 'none'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {newJob.isInternational && (
                  <span style={{ fontSize: '11.5px', color: '#FF9F0A', marginTop: '8px', display: 'block', fontWeight: '500', lineHeight: '1.4' }}>
                    {t('sswArubaitoWarning', '⚠️ Tokutei Ginou (SSW) vizasi qonunchiligiga ko\'ra, part-time (arubaito) ishlash taqiqlanadi.')}
                  </span>
                )}
              </div>
            )}

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolDiscountLabel', 'A\'zolar uchun chegirma (Ixtiyoriy)') : t('bonusLabel', 'Bonus puli bormi? (Ixtiyoriy)')}
              </label>
              <input 
                type="text" 
                value={newJob.bonus} 
                onChange={e => setNewJob({...newJob, bonus: e.target.value})} 
                placeholder={isAdCourse ? t('schoolDiscountPlaceholder', "Masalan: ¥20,000 chegirma") : t('bonusPlaceholder', "Masalan: Yiliga 2 marta (Yoz va Qish)")} 
                className="auth-input"
                maxLength={50}
              />
            </div>
            
            {/* 3-Part Structured Address Questionnaire */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('postalCodeLabel', 'Pochta indeksi')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.postalCode} 
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9-]/g, '');
                  if (val.length === 3 && !val.includes('-')) {
                    val = val + '-';
                  }
                  setNewJob({...newJob, postalCode: val}); 
                  setErrors(prev => ({...prev, postalCode: null})); 
                }} 
                placeholder="100-0001" 
                className="auth-input"
                style={{ borderColor: errors.postalCode ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={8}
              />
              {errors.postalCode && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.postalCode}</span>}
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('prefectureLabel', 'Prefektura (Viloyat)')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <select
                value={newJob.prefecture}
                onChange={e => {
                  setNewJob({...newJob, prefecture: e.target.value});
                  setErrors(prev => ({...prev, prefecture: null}));
                }}
                className="auth-input"
                style={{ 
                  borderColor: errors.prefecture ? '#FF3B30' : 'var(--glass-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  padding: '12px'
                }}
              >
                <option value="">-- {t('selectPrefecture', 'Prefekturani tanlang')} --</option>
                {['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Osaka', 'Kyoto', 'Aichi', 'Fukuoka', 'Hokkaido', 'Boshqa'].map(pref => (
                  <option key={pref} value={pref}>{t(pref, pref)}</option>
                ))}
              </select>
              {errors.prefecture && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.prefecture}</span>}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('detailAddressLabel', 'Batafsil ko\'cha va bino raqami')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.detailAddress} 
                onChange={e => {
                  setNewJob({...newJob, detailAddress: e.target.value}); 
                  setErrors(prev => ({...prev, detailAddress: null})); 
                }} 
                placeholder="Chiyoda-ku, Marunouchi 1-1" 
                className="auth-input"
                style={{ borderColor: errors.detailAddress ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={100}
              />
              {errors.detailAddress && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.detailAddress}</span>}
            </div>

            {!isAdCourse && (
              <>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('nearestStationLabel', 'Eng yaqin metro/poyezd bekati')}
                  </label>
                  <input 
                    type="text" 
                    value={newJob.nearestStation} 
                    onChange={e => setNewJob({...newJob, nearestStation: e.target.value})} 
                    placeholder="Masalan: Shinjuku bekati, Omiya bekati" 
                    className="auth-input"
                    maxLength={50}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('walkTimeLabel', 'Bekatgacha piyoda yurish vaqti')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number" 
                      value={newJob.walkTime} 
                      onChange={e => setNewJob({...newJob, walkTime: e.target.value.replace(/[^0-9]/g, '')})} 
                      placeholder="Masalan: 8" 
                      className="auth-input"
                      style={{ flex: 1 }}
                      min={0}
                      max={60}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>
                      {t('minutesUnit', 'daqiqa')}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* BLOCK 2: Ish Sharoitlari (Chips) */}
          {!isAdCourse && (
            <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                  {t('jobConditionsTitle', 'Ish sharoitlari va Imtiyozlar')}
                </h4>
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('workHoursLabel', 'Ish vaqti (Ixtiyoriy)')}
                </label>
                {renderChips(WORK_HOURS_OPTIONS, 'hours')}
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('dayOffLabel', 'Dam olish kunlari (Ixtiyoriy)')}
                </label>
                {renderChips(DAY_OFF_OPTIONS, 'dayOff')}
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('insuranceLabel', "Sug'urta to'lovlari (Ixtiyoriy)")}
                </label>
                {renderChips(INSURANCE_OPTIONS, 'insurance')}
              </div>

              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('foreignersLabel', "Chet elliklar va Viza (Ixtiyoriy)")}
                </label>
                {renderChips(FOREIGNERS_OPTIONS, 'foreigners')}
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('housingLabel', "Uy-joy / Ijara (Ixtiyoriy)")}
                </label>
                {renderChips(HOUSING_OPTIONS, 'housing')}
              </div>

              <div className="input-group chip-group-container" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('licenseLabel', "Talab qilinadigan guvohnoma (Ixtiyoriy)")}
                </label>
                {renderChips(LICENSE_OPTIONS, 'license', true)}
              </div>
            </div>
          )}

          {/* Conditional Sections For Driving School */}
          {isAdCourse && (
            <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                  {t('schoolCoursesLanguages', "Kurslar va Dars tillari")}
                </h4>
              </div>

              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableCoursesLabel', 'Mavjud toifalar')}
                </label>
                {renderChips(['Oogata', 'Chugata', 'Futsu', 'Tokushu', 'Nirin', 'Forklift'], 'courses', true)}
              </div>

              <div className="input-group chip-group-container" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableLangsLabel', 'Dars beriladigan tillar')}
                </label>
                {renderChips(['UZ', 'JP', 'EN', 'RU', 'VI', 'ZH'], 'langs', true)}
              </div>
            </div>
          )}

          {/* BLOCK 3: Contact & Description */}
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {isAdCourse ? '3' : '3'}
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                {t('contactInfoAndDesc', "Vakansiya bo'yicha to'liq tavsif (Aloqa)")}
              </h4>
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('phoneLabel', 'Aloqa telefon raqami')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.phone} 
                onChange={e => { setNewJob({...newJob, phone: e.target.value}); setErrors(prev => ({...prev, phone: null})); }} 
                placeholder={t('phonePlaceholder', "+81 48-555-1234")} 
                className="auth-input"
                style={{ borderColor: errors.phone ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={25}
              />
              {errors.phone && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
            </div>

            <div className="input-group chip-group-container" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                {t('phoneModeLabel', 'Telefon raqam maxfiyligi')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`form-chip ${newJob.phoneMode === 'public' ? 'selected' : ''}`}
                  onClick={() => setNewJob({...newJob, phoneMode: 'public'})}
                >
                  {t('phoneModePublic', 'Hammaga ochiq (Qo\'ng\'iroq qilish ochiq)')}
                </button>
                <button
                  type="button"
                  className={`form-chip ${newJob.phoneMode === 'interview_only' ? 'selected' : ''}`}
                  onClick={() => setNewJob({...newJob, phoneMode: 'interview_only'})}
                >
                  {t('phoneModeInterview', 'Faqat suhbatga taklif qilinganlarga')}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('emailLabel', 'Aloqa emaili')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="email" 
                value={newJob.email} 
                onChange={e => { setNewJob({...newJob, email: e.target.value}); setErrors(prev => ({...prev, email: null})); }} 
                placeholder={t('emailContactPlaceholder', "info@saitama-auto.jp")} 
                className="auth-input"
                style={{ borderColor: errors.email ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={50}
              />
              {errors.email && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolDescLabel', 'Maktab haqida batafsil ma\'lumot') : t('jobDescLabel', 'Batafsil tavsif')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <textarea 
                value={newJob.description} 
                onChange={e => { setNewJob({...newJob, description: e.target.value}); setErrors(prev => ({...prev, description: null})); }} 
                placeholder={isAdCourse ? t('schoolDescPlaceholder', "さいたま市中心部に広大な教習コースを持つ自動車学校...") : t('jobDescPlaceholder', "Ish haqida qiziqarli ma'lumotlarni yozing...")}
                className="auth-input"
                style={{ 
                  minHeight: '120px', 
                  resize: 'vertical', 
                  borderColor: errors.description ? '#FF3B30' : 'var(--glass-border)',
                  lineHeight: '1.5'
                }}
                maxLength={500}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                {errors.description ? <span style={{ color: '#FF3B30', fontSize: '12px' }}>{errors.description}</span> : <span></span>}
                <span style={{ fontSize: '12px', color: newJob.description?.length >= 500 ? '#FF3B30' : '#8E8E93', fontWeight: '600' }}>
                  {newJob.description?.length || 0}/500
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK 4: Shoukai (Referral) */}
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '32px', border: errors.hasShoukai ? '2px solid #FF3B30' : '2px solid rgba(255, 159, 10, 0.3)', background: 'linear-gradient(145deg, rgba(255, 159, 10, 0.05) 0%, rgba(255, 159, 10, 0.01) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FF9F0A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {isAdCourse ? '4' : '4'}
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#FF9F0A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} />
                {t('shoukaiSettings', "Shoukai (Tavsiya) Sozlamalari")}
              </h4>
            </div>

            {/* Shoukai Choice Selection (Mandatory) */}
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14.5px', fontWeight: '600', marginBottom: '12px', display: 'block', color: 'var(--text-main)' }}>
                {t('hasShoukaiPrompt', "Ushbu e'londa do'stlarni taklif qilganlik uchun shoukai mukofot puli beriladimi?")} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setNewJob({...newJob, hasShoukai: 'yes'}); setErrors(prev => ({...prev, hasShoukai: null})); }}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: newJob.hasShoukai === 'yes' ? '2px solid #FF9F0A' : '1px solid var(--glass-border)',
                    background: newJob.hasShoukai === 'yes' ? 'rgba(255, 159, 10, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: newJob.hasShoukai === 'yes' ? '#FF9F0A' : 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: newJob.hasShoukai === 'yes' ? '0 4px 12px rgba(255, 159, 10, 0.2)' : 'none'
                  }}
                >
                  🎉 {t('yesOption', 'Ha, mukofot bor')}
                </button>
                <button
                  type="button"
                  onClick={() => { setNewJob({...newJob, hasShoukai: 'no', shoukaiFee: '', shoukaiConditions: ''}); setErrors(prev => ({...prev, hasShoukai: null, shoukaiFee: null})); }}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: newJob.hasShoukai === 'no' ? '2px solid var(--text-secondary)' : '1px solid var(--glass-border)',
                    background: newJob.hasShoukai === 'no' ? 'rgba(142, 142, 147, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: newJob.hasShoukai === 'no' ? 'var(--text-secondary)' : 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  ❌ {t('noOption', 'Yo\'q, pul berilmaydi')}
                </button>
              </div>
              {errors.hasShoukai && <span style={{ color: '#FF3B30', fontSize: '13px', marginTop: '8px', display: 'block', fontWeight: 'bold' }}>{errors.hasShoukai}</span>}
            </div>

            {/* If Shoukai is Active, reveal secret fee & conditions fields */}
            {newJob.hasShoukai === 'yes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiSumLabel', 'Showkai puli summasi (Faqat kompaniya o\'zi eslab qolishi uchun)')} <span style={{ color: '#FF3B30' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)', fontWeight: 'bold' }}>¥</span>
                    <input 
                      type="number" 
                      value={newJob.shoukaiFee} 
                      onChange={e => { setNewJob({...newJob, shoukaiFee: e.target.value}); setErrors(prev => ({...prev, shoukaiFee: null})); }} 
                      placeholder={t('shoukaiFeePlaceholder', "5000")} 
                      className="auth-input"
                      style={{ paddingLeft: '34px', width: '100%', borderColor: errors.shoukaiFee ? '#FF3B30' : 'var(--glass-border)' }}
                    />
                  </div>
                  {errors.shoukaiFee && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.shoukaiFee}</span>}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', opacity: 0.8, lineHeight: '1.4' }}>
                    🔒 {t('shoukaiSecretNote', 'Ushbu summani hech kim ko\'rmaydi, do\'stini taklif qiluvchilar faqat "Puli bor" belgisi hamda quyidagi shartlarni ko\'radi xolos.')}
                  </span>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiConditionsInputLabel', 'Showkai berilish shartlari va izohlari (Batafsil)')}
                  </label>
                  <textarea 
                    value={newJob.shoukaiConditions} 
                    onChange={e => setNewJob({...newJob, shoukaiConditions: e.target.value})} 
                    placeholder={t('shoukaiConditionsPlaceholder', 'Masalan: Agar tavsiya qilingan odam kamida 3 oy ishlasa, shoukai puli keyin to\'lab beriladi.')}
                    className="auth-input"
                    style={{ minHeight: '90px', resize: 'vertical', fontSize: '13px', lineHeight: '1.4' }}
                    maxLength={250}
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            className="btn-primary squircle" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '17px', 
              fontWeight: '700', 
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(90, 85, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }} 
            onClick={handleAddJob}
          >
            <Plus size={20} />
            {isAdCourse ? t('publishSchoolAd', "Avtomaktab e'lonini joylash") : t('publishJob', "Ish e'lonini joylash")}
          </button>
        </div>
      </div>
    );
  }

  if (showJobTypeSelect) {
    return (
      <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px', position: 'relative' }}>
        {/* Pinned Sticky Back Button */}
        <div style={{ 
          position: 'sticky', 
          top: '12px', 
          left: '16px', 
          zIndex: 120, 
          width: 'fit-content',
          marginBottom: '-40px',
          pointerEvents: 'none'
        }}>
          <button 
            className="icon-btn glass animate-scale-up" 
            onClick={handleFormBack}
            style={{ 
              pointerEvents: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 72px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
            {t('recruitmentTypeSelectTitle', "Ish e'loni so'rovnomasi turini tanlang")}
          </h2>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t('recruitmentChooseDesc', "Nomzodlarni qayerdan jalb qilmoqchisiz? Chet eldagi nomzodlar so'rovnomasida viza va qo'llab-quvvatlash parametrlari kiritiladi.")}
          </p>

          {/* Option A: Local Recruitment */}
          <div 
            className="glass squircle animate-fade-in"
            onClick={() => {
              setNewJob(prev => ({
                ...prev,
                isInternational: false,
                foreigners: '',
                housing: ''
              }));
              setShowAddForm(true);
              setShowJobTypeSelect(false);
            }}
            style={{ padding: '24px 20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--glass-bg)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {t('recruitmentLocal', "Mahalliy vakansiya (Yaponiya ichidagi nomzodlar uchun)")}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('recruitmentLocalDesc', "Yaponiyada yashayotgan va ishlash huquqiga ega nomzodlar uchun oddiy e'lon so'rovnomasi.")}
              </p>
            </div>
          </div>

          {/* Option B: International Recruitment */}
          <div 
            className="glass squircle animate-fade-in"
            onClick={() => {
              setNewJob(prev => ({
                ...prev,
                isInternational: true,
                foreigners: 'foreigners_visa',
                housing: 'housing_dorm',
                type: prev.type === 'parttime' ? 'fulltime' : (prev.type || 'fulltime')
              }));
              setShowAddForm(true);
              setShowJobTypeSelect(false);
            }}
            style={{ padding: '24px 20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid rgba(175, 82, 222, 0.3)', display: 'flex', gap: '16px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(94, 92, 230, 0.05), rgba(175, 82, 222, 0.05))' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(175, 82, 222, 0.1)', color: '#AF52DE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#AF52DE' }}>
                {t('recruitmentInternational', "Xalqaro vakansiya / Tokutei Ginou (Chet eldagi nomzodlar uchun)")} 🌐
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('recruitmentInternationalDesc', "Chet eldagi (masalan, O'zbekiston) nomzodlarni jalb qilish va Tokutei Ginou viza yordami so'rovnomasi.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAdTypeSelect) {
    return (
      <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px', position: 'relative' }}>
        {/* Pinned Sticky Back Button */}
        <div style={{ 
          position: 'sticky', 
          top: '12px', 
          left: '16px', 
          zIndex: 120, 
          width: 'fit-content',
          marginBottom: '-40px',
          pointerEvents: 'none'
        }}>
          <button 
            className="icon-btn glass animate-scale-up" 
            onClick={handleFormBack}
            style={{ 
              pointerEvents: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 72px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
            {t('chooseAdTypeTitle', "E'lon turini tanlang")}
          </h2>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t('chooseAdTypeDesc', "Qanday turdagi e'lon joylashtirmoqchisiz?")}
          </p>

          <div 
            className="glass squircle animate-fade-in"
            onClick={() => {
              setSelectedAdType('job');
              setShowJobTypeSelect(true);
              setShowAdTypeSelect(false);
            }}
            style={{ padding: '24px 20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--glass-bg)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {t('adTypeJob', "Ish vakansiyasi (Ishga qabul qilish)")}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('adTypeJobDesc', "Haydovchilar yoki xodimlarni ishga olish uchun e'lon")}
              </p>
            </div>
          </div>

          <div 
            className="glass squircle animate-fade-in"
            onClick={() => {
              setSelectedAdType('school');
              setShowAddForm(true);
              setShowAdTypeSelect(false);
            }}
            style={{ padding: '24px 20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--glass-bg)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(175, 82, 222, 0.1)', color: '#AF52DE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {t('adTypeSchool', "O'quv kursi (Avtomaktab/Sertifikat)")}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('adTypeSchoolDesc', "Haydovchilarni o'qitish va yangi o'quvchilarni jalb qilish uchun")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  // ===== MAIN JOB LIST =====
  return (
    <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px' }}>
      
      {/* ADD ANNOUNCEMENT BUTTON CARD */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div 
          onClick={() => {
            if (profileData?.companyType === 'driving_school') {
              setShowAdTypeSelect(true);
            } else {
              setSelectedAdType('job');
              setShowJobTypeSelect(true);
            }
          }}
          style={{ 
            border: '2px dashed var(--primary)', 
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            background: 'var(--primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px', boxShadow: '0 4px 12px rgba(90, 85, 234, 0.3)'
          }}>
            <Plus size={28} />
          </div>
          <h3 style={{ fontSize: '16.5px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>
            {t('addNewJob', "Yangi e'lon qo'shish")}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {profileData?.companyType === 'driving_school' 
              ? t('addNewSchoolAdDesc', "Haydovchilarni o'qitish yoki ish vakansiyasi e'lonini joylang.") 
              : t('addNewJobDesc', "Haydovchilar yoki xodimlar qidirish uchun yangi vakansiya yarating.")
            }
          </p>
        </div>
      </div>

      {/* SECTION 1: JOB VACANCIES LIST (ACTIVE FOR ALL COMPANIES) */}
      <div style={{ padding: '0 16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💼 {t('yourJobs', "Sizning ish e'lonlaringiz")}
        </h2>
      </div>

      <div className="jobs-list hide-scrollbar" style={{ marginBottom: '24px' }}>
        {companyJobs.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            {t('noJobsYet', "Hozircha ish e'lonlari joylanmagan.")}
          </p>
        ) : (
          companyJobs.map(job => (
            <div key={job.id} className="job-card-hz glass" onClick={() => onJobClick({...job})}>
              <div className="job-card-main-layout">
                <div className="job-card-img">
                  <img 
                    src={job.image} 
                    alt={t(`job_${job.id}_title`, job.title)} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; }}
                  />
                  <span className={`job-type-badge type-${job.type || 'fulltime'}`}>
                    {t(`jobType_${job.type || 'fulltime'}`, (job.type || 'fulltime') === 'fulltime' ? '正社員' : (job.type || 'fulltime') === 'parttime' ? 'アルバイト' : '契約')}
                  </span>
                </div>

                <div className="job-card-body">
                  <div className="job-card-company">
                    <img src={job.logo} alt={job.company} className="job-card-company-logo" />
                    <span>{job.company}</span>
                    {job.verified && <VerifiedBadge size={14} />}
                  </div>

                  <h3 className="job-card-title">{t(`job_${job.id}_title`, job.title)}</h3>

                  <div className="job-card-salary">
                    <Banknote size={15} />
                    <span>{job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : ''}</span>
                  </div>

                  <div className="job-card-chips">
                    <span className="job-chip">
                      <MapPin size={12} />
                      {t(`job_${job.id}_location`, job.location)}
                    </span>
                    {job.hours && (
                      <span className="job-chip">
                        <Clock size={12} />
                        {job.hours === 'shift' ? t('shiftWork', 'Smenali') : t(job.hours, job.hours)}
                      </span>
                    )}
                    {job.shoukaiFee > 0 && (
                      <span className="job-chip chip-highlight">
                        <Share2 size={10} />
                        {t('shoukaiAvailable', 'Shoukai puli bor')}
                        <span style={{ opacity: 0.8, marginLeft: '4px', fontWeight: 'bold' }}>
                          (¥{job.shoukaiFee.toLocaleString()})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="job-card-actions">
                <button 
                  className="job-card-btn btn-apply"
                  onClick={(e) => {
                    e.stopPropagation();
                    setJobToEdit(job);
                  }}
                  style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                >
                  <Edit3 size={13} />
                  {t('editJob', 'Tahrirlash')}
                </button>
                {((job.shoukai && job.shoukai !== "0") || job.hasShoukai || job.shoukaiFee > 0) && (
                  <button 
                    className="job-card-btn btn-shoukai"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onShoukai && onShoukai(job); 
                    }}
                    style={{ flex: 1 }}
                  >
                    <Share2 size={13} />
                    {t('shoukaiAvailableLabel', 'Puli Bor')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 2: ACADEMY COURSES LIST (ONLY FOR DRIVING SCHOOLS) */}
      {profileData?.companyType === 'driving_school' && (
        <>
          <div style={{ padding: '0 16px', marginBottom: '12px', marginTop: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎓 {t('yourSchools', "Sizning avtomaktab kurslaringiz")}
            </h2>
          </div>

          <div className="jobs-list hide-scrollbar">
            {companySchools.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                {t('noSchoolsYet', "Hozircha avtomaktab e'lonlari joylanmagan.")}
              </p>
            ) : (
              companySchools.map(school => (
                <div key={school.id} className="job-card-hz glass" onClick={() => onSchoolClick ? onSchoolClick(school) : onJobClick(school)}>
                  <div className="job-card-main-layout">
                    <div className="job-card-img">
                      <img 
                        src={school.image} 
                        alt={t(`school_${school.id}_name`, school.name)} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
                      />
                      <div className="job-type-badge type-fulltime">
                        {school.langs ? school.langs.join(', ') : 'UZ, JP'}
                      </div>
                    </div>

                    <div className="job-card-body">
                      <div className="job-card-company">
                        <span>{t(`school_${school.id}_name`, school.name)}</span>
                        <VerifiedBadge size={14} />
                      </div>

                      <h3 className="job-card-title">{t(`school_${school.id}_type`, school.type)}</h3>

                      <div className="job-card-salary">
                        <Banknote size={15} color="#30D158" />
                        <span>{school.price}</span>
                        {school.discount && (
                          <span className="discount-tag" style={{ marginLeft: '4px', fontSize: '9px', padding: '1.5px 4px' }}>
                            -{school.discount}
                          </span>
                        )}
                      </div>

                      <div className="job-card-chips">
                        <span className="job-chip">
                          <MapPin size={10} />
                          {t(`school_${school.id}_location`, school.location)}
                        </span>
                        {school.shoukaiFee > 0 && (
                          <span className="job-chip chip-highlight">
                            <Share2 size={10} />
                            {t('shoukaiAvailable', 'Shoukai puli bor')}
                            <span style={{ opacity: 0.8, marginLeft: '4px', fontWeight: 'bold' }}>
                              (¥{school.shoukaiFee.toLocaleString()})
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="job-card-actions">
                    <button 
                      className="job-card-btn btn-apply"
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobToEdit(school);
                      }}
                      style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                    >
                      <Edit3 size={13} />
                      {t('editJob', 'Tahrirlash')}
                    </button>
                    {((school.shoukai && school.shoukai !== "0") || school.shoukaiFee > 0) && (
                      <button 
                        className="job-card-btn btn-shoukai"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onShoukai && onShoukai({
                            ...school,
                            shoukai: school.shoukai || (school.shoukaiFee ? `¥${Number(school.shoukaiFee).toLocaleString()}` : undefined)
                          }); 
                        }}
                        style={{ flex: 1 }}
                      >
                        <Share2 size={13} />
                        {t('shoukaiAvailableLabel', 'Puli Bor')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );

}

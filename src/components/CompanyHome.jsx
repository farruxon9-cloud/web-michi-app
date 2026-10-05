import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit3, Trash2, Camera, ArrowLeft, Upload, Clock, Banknote, Share2, Briefcase, Globe, Phone } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import CustomInlineDropdown from './CustomInlineDropdown';
import BranchListEditor from './BranchListEditor';
import { compressImage } from '../utils/imageCompressor';
import { lookupJapaneseZipcode, JAPAN_PREFECTURE_MAP } from '../utils/japaneseZipcodeLookup';
import { ALL_47_PREFECTURES } from '../data/japanRegions.js';
import { getCitiesByPrefecture } from '../data/japanCities.js';
import { getAllTrainLineOptions, getStationsByLine } from '../data/japanStations.js';
import './DriverFeed.css';
import { JOB_CATEGORIES } from '../data/jobCategories';
import { submitJobToBackend, updateJobInBackend, deleteJobInBackend, fetchJobs } from '../services/michiJobsApiService';
import ConfirmSheet from './ConfirmSheet';
import { createSchoolInBackend } from '../services/schoolService';
import { API_ENDPOINTS } from '../config/api';
import { apiFetch } from '../services/apiClient';
import { normalizeOwnJobPosting, jobValueLabel } from '../utils/jobPostingNormalizer';
import { validateBranch } from '../utils/branchUtils';

// Single figure → max = 0 ("not given"); unparseable → 0/0. The typed text is still sent as `salary`.
export function parseSalaryRange(salaryStr) {
  if (!salaryStr) return { min: 0, max: 0 };

  if (typeof salaryStr === 'object' && salaryStr !== null) {
    const min = Number(salaryStr.min) || 0;
    const max = Number(salaryStr.max) || 0;
    return { min, max };
  }

  if (typeof salaryStr === 'number') {
    return { min: salaryStr, max: 0 };
  }

  const str = String(salaryStr).replace(/,/g, '');

  const manMatches = str.match(/(\d+(?:\.\d+)?)\s*万/g);
  if (manMatches && manMatches.length > 0) {
    const numbers = manMatches.map(m => parseFloat(m) * 10000);
    if (numbers.length >= 2) {
      return { min: Math.min(...numbers), max: Math.max(...numbers) };
    } else if (numbers.length === 1) {
      return { min: numbers[0], max: 0 };
    }
  }

  const digitMatches = str.match(/\d+/g);
  if (digitMatches && digitMatches.length > 0) {
    const numbers = digitMatches.map(Number).filter(n => n > 0);
    if (numbers.length >= 2) {
      return { min: Math.min(...numbers), max: Math.max(...numbers) };
    } else if (numbers.length === 1) {
      return { min: numbers[0], max: 0 };
    }
  }

  return { min: 0, max: 0 };
}




const parseAddress = (fullAddressInput = '') => {
  const fullAddress = fullAddressInput || '';
  if (!fullAddress) return { postalCode: '', prefecture: '', detailAddress: '', townAddress: '', buildingAddress: '' };
  
  // Extract postal code (e.g. 330-0854 or 〒330-0854)
  const pcMatch = fullAddress.match(/(\d{3}-\d{4})/);
  const postalCode = pcMatch ? pcMatch[1] : '';
  
  let prefectureKey = '';
  let matchedPrefStr = '';

  // 1. Check all 47 Japanese Prefectures
  for (const [prefJa, info] of Object.entries(JAPAN_PREFECTURE_MAP)) {
    if (fullAddress.includes(prefJa) || fullAddress.includes(info.key) || fullAddress.includes(info.en)) {
      prefectureKey = info.key;
      matchedPrefStr = fullAddress.includes(prefJa) ? prefJa : info.key;
      break;
    }
  }

  // 2. Clean detail address
  let detailAddress = fullAddress;
  if (postalCode) {
    detailAddress = detailAddress.replace(`〒${postalCode}`, '').replace(postalCode, '');
  }
  if (matchedPrefStr) {
    detailAddress = detailAddress.replace(matchedPrefStr, '');
  }
  
  // Clean punctuation
  detailAddress = detailAddress
    .replace(/^\s*[,()（），、]\s*/, '')
    .replace(/\s*[,()（），、]\s*$/, '')
    .trim();
  
  return {
    postalCode,
    prefecture: prefectureKey,
    detailAddress
  };
};

export default function CompanyHome({ onJobClick, onSchoolClick, jobs, setJobs, onJobCreated, schools, setSchools, profileData, jobToEdit, setJobToEdit, onFormToggle, onApply, onApplySchool, onShoukai, applications = [], schoolApplications = [], userRole = 'company' }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ja';
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: 'job' | 'school', id }
  const [showAdTypeSelect, setShowAdTypeSelect] = useState(false);
  const [showJobTypeSelect, setShowJobTypeSelect] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState('job'); // 'job' | 'school'
  const [jobImage, setJobImage] = useState(null);
  const fileInputRef = useRef(null);
  const savingJobRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const accountId = profileData?.accountId;
    // Own jobs are matched by the server account id (jobs.authorId), never by the company name.
    if (!accountId) return undefined;
    const loadCompanyJobs = async () => {
      try {
        const myJobs = await fetchJobs({ authorId: String(accountId) });
        if (cancelled) return;
        if (Array.isArray(myJobs) && typeof setJobs === 'function') {
          // Own dashboard keeps private branch phones (normalizeOwnJobPosting)
          setJobs(myJobs.map((j) => normalizeOwnJobPosting(j)).filter(Boolean).map((j) => ({ ...j, isMine: true })));
        }
      } catch (err) {
        console.error('Failed to load company jobs:', err);
      }
    };
    loadCompanyJobs();
    return () => { cancelled = true; };
  }, [profileData?.accountId, setJobs]);

  // Address lookup state
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [addressLookupStatus, setAddressLookupStatus] = useState(null); // { success: boolean, text: string }

  const fetchAddressByZip = async (rawZip) => {
    const digits = String(rawZip || '').replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0)).replace(/\D/g, '');
    if (digits.length !== 7) return;

    setIsFetchingAddress(true);
    setAddressLookupStatus(null);
    try {
      const result = await lookupJapaneseZipcode(digits);
      if (result.success) {
        const formattedZip = `${digits.slice(0, 3)}-${digits.slice(3)}`;
        
        // Find matching prefecture object from ALL_47_PREFECTURES
        const matchedPref = ALL_47_PREFECTURES.find(p => 
          p.id.toLowerCase() === (result.prefectureKey || '').toLowerCase() ||
          p.kanji === result.prefJa ||
          (result.prefJa && p.name.includes(result.prefJa))
        );
        const prefId = matchedPref ? matchedPref.id : (result.prefectureKey || result.prefJa);

        // Find city list for this prefecture
        const cities = getCitiesByPrefecture(prefId);
        const cityKanji = result.detailAddress || result.cityJa || '';
        const matchedCity = cities.find(c => 
          c.kanji === cityKanji || 
          c.name === cityKanji || 
          (cityKanji && (cityKanji.includes(c.kanji) || c.kanji.includes(cityKanji)))
        );
        const cityValue = matchedCity ? matchedCity.name : cityKanji;
        const townValue = result.townAddress || result.townJa || '';

        setNewJob(prev => ({
          ...prev,
          postalCode: formattedZip,
          prefecture: prefId,
          detailAddress: cityValue,
          townAddress: townValue
        }));
        setErrors(prev => ({
          ...prev,
          postalCode: null,
          prefecture: null,
          detailAddress: null,
          townAddress: null
        }));
        setAddressLookupStatus({
          success: true,
          text: `${result.prefJa || matchedPref?.kanji || ''} ${cityValue} ${townValue}`.trim()
        });
      } else {
        const formattedZip = `${digits.slice(0, 3)}-${digits.slice(3)}`;
        setNewJob(prev => ({
          ...prev,
          postalCode: formattedZip
        }));
        setErrors(prev => ({
          ...prev,
          postalCode: null
        }));
        setAddressLookupStatus({
          success: true,
          isManualTip: true,
          text: t('manualAddressTip', '💡 郵便番号が確認されました。都道府県・市区町村をリストから選択してください')
        });
      }
    } catch (err) {
      console.warn('Ultra-precise zipcode lookup error:', err);
      setAddressLookupStatus({ success: false, text: 'エラーが発生しました' });
    } finally {
      setIsFetchingAddress(false);
    }
  };

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
      const postalCode = jobToEdit.postalCode || parsed.postalCode || '';
      const prefecture = jobToEdit.prefecture || parsed.prefecture || '';
      const detailAddress = jobToEdit.detailAddress || parsed.detailAddress || '';
      const townAddress = jobToEdit.townAddress || parsed.townAddress || '';
      const buildingAddress = jobToEdit.buildingAddress || parsed.buildingAddress || '';

      if (isCourse) {
        setNewJob({
          id: jobToEdit.id,
          title: jobToEdit.type || jobToEdit.title || '',
          salary: jobToEdit.price || jobToEdit.salary || '',
          bonus: jobToEdit.discount || jobToEdit.bonus || '',
          location: jobToEdit.location || '',
          fullAddress: jobToEdit.fullAddress || '',
          postalCode,
          prefecture,
          detailAddress,
          townAddress,
          buildingAddress,
          phone: jobToEdit.phone || '',
          email: jobToEdit.email || '',
          description: jobToEdit.description || '',
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
          title: jobToEdit.title || '',
          salary: jobToEdit.salary || '',
          location: jobToEdit.location || '',
          fullAddress: jobToEdit.fullAddress || '',
          postalCode,
          prefecture,
          detailAddress,
          townAddress,
          buildingAddress,
          trainLine: jobToEdit.trainLine || '',
          subcategory: jobToEdit.subcategory || '',
          phone: jobToEdit.phone || '',
          email: jobToEdit.email || '',
          hours: jobToEdit.hours || '',
          bonus: jobToEdit.bonus || '',
          insurance: jobToEdit.insurance || '',
          foreigners: jobToEdit.foreigners || '',
          housing: jobToEdit.housing || '',
          description: jobToEdit.description || '',
          dayOff: jobToEdit.dayOff || '',
          hasShoukai: (jobToEdit.hasShoukai === true || jobToEdit.hasShoukai === 'yes' || jobToEdit.shoukaiFee > 0) ? 'yes' : 'no',
          shoukaiFee: jobToEdit.shoukaiFee ? String(jobToEdit.shoukaiFee) : '',
          shoukaiConditions: jobToEdit.shoukaiConditions || '',
          license: jobToEdit.license || [],
          phoneMode: jobToEdit.phoneMode || 'public',
          isInternational: jobToEdit.isInternational || false,
          type: jobToEdit.type || 'fulltime',
          nearestStation: jobToEdit.nearestStation || '',
          walkTime: jobToEdit.walkTime ? String(jobToEdit.walkTime) : '',
          branches: Array.isArray(jobToEdit.branches) ? jobToEdit.branches : [],
          hiringScope: (jobToEdit.hiringScope === 'branch' && Array.isArray(jobToEdit.branches) && jobToEdit.branches.length > 0) ? 'branch' : 'headquarters'
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
    townAddress: '',
    buildingAddress: '',
    trainLine: '',
    nearestStation: '',
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
    type: '',
    subcategory: '',
    nearestStation: '',
    walkTime: '',
    branches: [],
    hiringScope: 'headquarters'
  });
  const [errors, setErrors] = useState({});
  const [isSubcategoryPickerOpen, setIsSubcategoryPickerOpen] = useState(false);
  const [isPrefecturePickerOpen, setIsPrefecturePickerOpen] = useState(false);
  const [isBonusPickerOpen, setIsBonusPickerOpen] = useState(false);

  const WORK_HOURS_OPTIONS = [
    { value: 'wh_day', key: 'wh_day', label: '08:00 - 17:00 (Kunduzgi)' },
    { value: 'wh_night', key: 'wh_night', label: '20:00 - 05:00 (Tungi)' },
    { value: 'wh_shift', key: 'wh_shift', label: 'Smenali ish (Jadval)' },
    { value: 'wh_flex', key: 'wh_flex', label: 'Erkin grafik' },
    { value: 'wh_other', key: 'wh_other', label: 'Boshqa' }
  ];
  const DAY_OFF_OPTIONS = [
    { value: 'do_weekend', key: 'do_weekend', label: 'Shanba va Yakshanba' },
    { value: 'do_2days', key: 'do_2days', label: 'Haftada 2 kun (Smenali)' },
    { value: 'do_1day', key: 'do_1day', label: 'Haftada 1 kun' },
    { value: 'do_other', key: 'do_other', label: 'Boshqa' }
  ];
  const INSURANCE_OPTIONS = [
    { value: 'insurance_full', key: 'ins_full', label: 'To\'liq ijtimoiy sug\'urta' },
    { value: 'insurance_employment', key: 'ins_koyo', label: 'Koyo Hoken (Bandlik)' },
    { value: 'insurance_none', key: 'ins_none', label: 'Yo\'q' }
  ];
  const FOREIGNERS_OPTIONS = [
    { value: 'foreigners_visa', key: 'for_visa', label: 'Viza yordami bor' },
    { value: 'foreigners_visa_renew', key: 'for_visa_renew', label: 'Viza uzaytirish yordami' },
    { value: 'foreigners_ok', key: 'for_all', label: 'Chet elliklar qabul qilinadi' },
    { value: 'foreigners_n4', key: 'for_n4', label: 'JLPT N4 darajasi' },
    { value: 'foreigners_n3', key: 'for_n3', label: 'JLPT N3 darajasi' },
    { value: 'foreigners_n2', key: 'for_n2', label: 'JLPT N2 darajasi' }
  ];
  const HOUSING_OPTIONS = [
    { value: 'housing_dorm', key: 'hou_dorm', label: 'Yotoqxona mavjud' },
    { value: 'housing_rent', key: 'hou_rent', label: 'Ijara yordami bor (Yachin hojo)' },
    { value: 'housing_move', key: 'hou_move', label: 'Ko\'chib kelish to\'lanadi' },
    { value: 'housing_none', key: 'hou_none', label: 'Yo\'q' }
  ];
  const LICENSE_OPTIONS = [
    { value: 'lic_futsu', key: 'lic_futsu_opt', label: 'Futsu (Oddiy)' },
    { value: 'lic_chugata', key: 'lic_chugata_opt', label: 'Chugata (O\'rta yuk)' },
    { value: 'lic_oogata', key: 'lic_oogata_opt', label: 'Oogata (Katta yuk)' },
    { value: 'lic_tokushu', key: 'lic_tokushu_opt', label: 'Tokushu (Maxsus)' },
    { value: 'lic_forklift', key: 'lic_forklift_opt', label: 'Forklift' },
    { value: 'lic_none', key: 'lic_none_opt', label: 'Talab qilinmaydi' }
  ];


  // Security: never treat a job as "mine" just because the profile name is missing.
  const isMyJob = (job) => {
    if (!job) return false;
    if (job.isMine) return true;
    const myId = profileData?.accountId || profileData?.companyId || profileData?.id;
    if (myId && job.companyId) return String(job.companyId) === String(myId);
    // Legacy records without companyId: fall back to an exact, non-empty company name match.
    const myName = (profileData?.fullName || '').trim();
    if (!myName || myName === 'Mehmon') return false;
    return !job.companyId && job.company === myName;
  };

  const isMySchool = (school) => {
    const myName = profileData?.fullName;
    if (!myName || myName === 'Mehmon') return true;
    return school.name === myName || (myName === 'Koyama Driving School' && school.name === 'Koyama Driving School') || Boolean(school.isMine);
  };

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

  const handleAddJob = async () => {
    // 1. Mandatory Fields Validation with inline errors
    const newErrors = {};
    if (!newJob.title) newErrors.title = t('reqTitle');
    if (!newJob.salary) newErrors.salary = t('reqSalary');
    if (!isAdCourse && !newJob.type) newErrors.type = t('reqJobType', '選択してください');
    if (!newJob.bonus) newErrors.bonus = t('reqBonus', '選択してください');
    if (!isAdCourse && !newJob.subcategory) newErrors.subcategory = t('reqSubcategory', '選択してください');
    if (!isAdCourse && !newJob.trainLine) newErrors.trainLine = t('reqTrainLine', '利用路線を選択してください');
    if (!isAdCourse && !newJob.nearestStation) newErrors.nearestStation = t('reqNearestStation', '最寄り駅を選択または入力してください');
    if (!newJob.phone) newErrors.phone = t('reqPhone');
    if (!newJob.email) newErrors.email = t('reqEmail');
    if (!newJob.description) newErrors.description = t('reqDesc');
    if (newJob.hasShoukai === '') newErrors.hasShoukai = t('reqShoukai');
    if (newJob.hasShoukai === 'yes' && !newJob.shoukaiFee) newErrors.shoukaiFee = t('reqShoukaiSum');

    // Structured address validations
    if (!newJob.postalCode) {
      newErrors.postalCode = t('reqPostalCode');
    } else if (!/^\d{3}-\d{4}$/.test(newJob.postalCode)) {
      newErrors.postalCode = t('invalidPostalCode');
    }
    if (!newJob.prefecture) {
      newErrors.prefecture = t('reqPrefecture');
    }
    if (!newJob.detailAddress) {
      newErrors.detailAddress = t('reqDetailAddress');
    }
    if (!newJob.townAddress) {
      newErrors.townAddress = t('reqTownAddress', '町名・丁目を入力してください');
    }

    // 支店・営業所での募集: 1件以上、かつ全件が有効であること
    if (!isAdCourse && newJob.hiringScope === 'branch') {
      const list = Array.isArray(newJob.branches) ? newJob.branches : [];
      if (list.length === 0) {
        newErrors.branches = '募集する支店・営業所を1件以上追加してください';
      } else {
        const badIdx = list.findIndex((b) => Object.keys(validateBranch(b)).length > 0);
        if (badIdx >= 0) newErrors.branches = `「${list[badIdx].name || `支店${badIdx + 1}`}」の入力内容に不備があります。編集して修正してください`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const errorList = [];
      if (newErrors.title) errorList.push(isAdCourse ? t('schoolTypeLabel') : t('jobTitleLabel'));
      if (newErrors.salary) errorList.push(isAdCourse ? t('schoolPriceLabel') : t('salaryLabel'));
      if (newErrors.type) errorList.push(t('jobTypeLabel'));
      if (newErrors.bonus) errorList.push(isAdCourse ? t('schoolDiscountLabel') : t('bonusLabel'));
      if (newErrors.subcategory) errorList.push(t('jobSubcategoryLabel'));
      if (newErrors.trainLine) errorList.push(t('trainLineLabel', '利用路線'));
      if (newErrors.nearestStation) errorList.push(t('nearestStationLabel', '最寄り駅'));
      if (newErrors.postalCode) errorList.push(t('postalCodeLabel'));
      if (newErrors.prefecture) errorList.push(t('prefectureLabel'));
      if (newErrors.detailAddress) errorList.push(t('detailAddressLabel'));
      if (newErrors.townAddress) errorList.push(t('townAddressLabel', '町名・丁目'));
      if (newErrors.phone) errorList.push(t('phoneLabel'));
      if (newErrors.email) errorList.push(t('emailLabel'));
      if (newErrors.description) errorList.push(isAdCourse ? t('schoolDescLabel') : t('jobDescLabel'));
      if (newErrors.hasShoukai) errorList.push(t('shoukaiSettings'));
      if (newErrors.shoukaiFee) errorList.push(t('shoukaiSumLabel'));
      if (newErrors.branches) errorList.push(newErrors.branches);

      alert(`${t('validationFailedAlert')}:\n- ${errorList.join('\n- ')}`);
      return;
    }
    
    setErrors({});

    // Compute short location and full address from 4 structured fields
    const cityPart = newJob.detailAddress;
    const townPart = newJob.townAddress;
    const buildingPart = newJob.buildingAddress;
    const generatedLocation = `${newJob.prefecture}, ${cityPart}`.trim();
    const constructedFullAddress = `${newJob.prefecture}${cityPart}${townPart}${buildingPart ? ' ' + buildingPart : ''}`;
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
        townAddress: newJob.townAddress || '',
        buildingAddress: newJob.buildingAddress || '',
        description: newJob.description,
        courses: newJob.courses,
        phone: newJob.phone,
        email: newJob.email,
        langs: newJob.langs,
        shoukaiFee: newJob.hasShoukai === 'yes' ? Number(newJob.shoukaiFee) : 0,
        shoukaiConditions: newJob.shoukaiConditions || t('defaultSchoolShoukaiConditions'),
        shoukai: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : '0'
      };

      if (newJob.id) {
        setSchools(schools.map(s => s.id === newJob.id ? school : s));
      } else {
        setSchools([school, ...schools]);
        // Send driving school payload to VPS backend (POST /api/schools)
        createSchoolInBackend({
          name: school.name,
          prefecture: school.prefecture || 'Tokyo',
          city: school.detailAddress || '',
          lat: 35.6686,
          lng: 139.4776,
          courses: Array.isArray(school.courses) ? school.courses.map(c => ({ name: typeof c === 'string' ? c : (c.name || 'Course'), license: 'Heavy', price: 300000 })) : [{ name: school.type || 'Course', license: 'Heavy', price: 300000 }],
          tags: school.langs || []
        }).catch(err => {
          console.warn('[CompanyHome] Backend school post warning:', err.message);
        });
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
        townAddress: newJob.townAddress || '',
        buildingAddress: newJob.buildingAddress || '',
        trainLine: newJob.trainLine || '',
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
        shoukaiConditions: newJob.shoukaiConditions || t('defaultJobShoukaiConditions'),
        phoneMode: newJob.phoneMode || 'public',
        isInternational: newJob.isInternational || false,
        category: 'delivery_driver',
        subcategory: newJob.subcategory || 'delivery_local',
        license: newJob.license || 'lic_futsu',
        type: newJob.type || 'fulltime',
        nearestStation: newJob.nearestStation || '',
        walkTime: newJob.walkTime ? Number(newJob.walkTime) : '',
        hiringScope: newJob.hiringScope === 'branch' ? 'branch' : 'headquarters',
        branches: newJob.hiringScope === 'branch' ? (newJob.branches || []) : [],
        companyId: profileData?.accountId || profileData?.companyId || profileData?.id || null,
        isMine: true
      };

      const backendPayload = {
        companyId: job.companyId,
        title: job.title,
        company: job.company,
        salary: job.salary,
        employmentType: job.type,
        bonusPrivilege: job.bonus,
        postalCode: job.postalCode,
        prefecture: job.prefecture,
        city: job.detailAddress,
        addressLine: job.townAddress,
        building: job.buildingAddress,
        trainLine: job.trainLine,
        subcategory: job.subcategory,
        nearestStation: job.nearestStation,
        walkMinutes: job.walkTime,
        licenses: Array.isArray(job.license) ? job.license : [job.license],
        workShift: job.hours,
        holidayType: job.dayOff,
        socialInsurance: job.insurance,
        dormitorySupport: job.housing,
        foreignerSupport: Array.isArray(job.foreigners) ? job.foreigners : (job.foreigners ? [job.foreigners] : []),
        isInternational: Boolean(job.isInternational),
        callReceptionStyle: job.phoneMode,
        phone: job.phone,
        email: job.email,
        image: job.image,
        logo: profileData?.avatar || '',
        description: job.description,
        hasShoukai: job.hasShoukai,
        shoukaiAmount: job.shoukaiFee,
        shoukaiConditions: job.shoukaiConditions || '',
        hiringScope: job.hiringScope,
        branches: job.branches
      };

      if (savingJobRef.current) return; // prevent double submit while awaiting the API
      savingJobRef.current = true;
      try {
        const parsedSalary = parseSalaryRange(newJob.salary);
        const payload = { ...backendPayload, minSalary: parsedSalary.min, maxSalary: parsedSalary.max };
        if (newJob.id) {
          const result = await updateJobInBackend(newJob.id, payload);
          const savedRaw = result && (result.job || result.data);
          const saved = savedRaw && savedRaw.id ? normalizeOwnJobPosting({ ...job, ...savedRaw }) : null;
          setJobs((prev) => (prev || []).map(j => j.id === newJob.id ? (saved ? { ...saved, isMine: true } : job) : j));
        } else {
          // 3-BOSQICH: Send job payload to VPS backend (POST /api/jobs) — awaited, so the feed
          // refresh below sees the new job and a failure keeps the form open.
          const result = await submitJobToBackend(payload);
          const savedRaw = result && (result.job || result.data || result);
          const saved = savedRaw && savedRaw.id ? normalizeOwnJobPosting({ ...job, ...savedRaw }) : null;
          setJobs((prev) => [saved ? { ...saved, isMine: true } : job, ...(prev || [])]);
        }
      } catch (err) {
        console.error('[CompanyHome] Job save failed:', err);
        alert('求人の保存に失敗しました。通信環境を確認して再度お試しください。');
        return; // keep the form open with the user's input
      } finally {
        savingJobRef.current = false;
      }

      if (typeof onJobCreated === 'function') {
        try {
          await onJobCreated();
        } catch (err) {
          console.warn('[CompanyHome] Feed refresh failed:', err);
        }
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
      townAddress: '',
      buildingAddress: '',
      trainLine: '',
      subcategory: '',
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
      isInternational: false,
      branches: [],
      hiringScope: 'headquarters'
    });
  };

  const performDeleteJob = async (jobId) => {
    try {
      await deleteJobInBackend(jobId);
      setJobs((prev) => (prev || []).filter(j => j.id !== jobId));
    } catch (err) {
      alert(t('deleteError', 'O\'chirishda xatolik yuz berdi'));
      return;
    }
    if (typeof onJobCreated === 'function') {
      try { await onJobCreated(); } catch { /* feed will catch up on next poll */ }
    }
  };

  const performDeleteSchool = async (schoolId) => {
    try {
      await apiFetch(`${API_ENDPOINTS.SCHOOLS}/${schoolId}`, { method: 'DELETE' });
      setSchools((prev) => (prev || []).filter(s => s.id !== schoolId));
    } catch (err) {
      alert(t('deleteError', 'O\'chirishda xatolik yuz berdi'));
    }
  };

  // Ask first (in-app sheet), then delete
  const handleDeleteJob = (jobId) => setPendingDelete({ type: 'job', id: jobId });
  const handleDeleteSchool = (schoolId) => setPendingDelete({ type: 'school', id: schoolId });
  const confirmPendingDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (!target) return;
    if (target.type === 'school') await performDeleteSchool(target.id);
    else await performDeleteJob(target.id);
  };

  // ===== ADD NEW JOB FORM (Full Page Premium) =====
  if (showAddForm) {
    const renderChips = (options, fieldName, isMulti = false) => {
      const selectedValue = newJob[fieldName];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {options.map(optObj => {
            const opt = typeof optObj === 'string' ? optObj : optObj.value;
            const label = typeof optObj === 'string' 
              ? t(optObj, optObj) 
              : (optObj.key ? t(optObj.key, optObj.label || optObj.value) : (optObj.label || optObj.value || optObj.name || ''));
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
      <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', height: 'auto', maxHeight: 'none', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px', position: 'relative' }}>
        {/* Pinned Sticky Back Button */}
        <div className="profile-sticky-back" style={{ zIndex: 300, top: '16px' }}>
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
            {isAdCourse ? t('addNewSchoolAd') : t('addNewJob')}
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
                {t('recruitmentInternational')}
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.85 }}>
                {t('recruitmentInternationalDesc', '海外からの候補者採用および特定技能ビザ支援用求人票フォーム。')}
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
                  <Camera size={14} /> {t('changePhoto')}
                </div>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--primary)" />
                <span style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>
                  {t('uploadAdImage')}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.8, marginTop: '4px' }}>
                  {t('optionalField')}
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
          <div className="glass squircle-form-card" style={{ padding: '24px 20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
              <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                {t('jobBasicInfo')}
              </h4>
            </div>

            {/* Kompaniya Filiallari (支店・営業所) Muharriri */}
            {!isAdCourse && (
              <div style={{ marginBottom: '16px' }} id="hiring-scope-section">
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                  勤務地の募集方法 <span style={{ color: '#FF3B30' }}>*</span>
                </div>
                <div role="radiogroup" aria-label="勤務地の募集方法" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { value: 'headquarters', title: '本社・単一の勤務地で募集', sub: 'このフォームの住所欄に入力した1か所で募集します' },
                    { value: 'branch', title: '複数の支店・営業所で募集', sub: '勤務地ごとに名称・住所・電話番号を登録できます' }
                  ].map((opt) => {
                    const selected = (newJob.hiringScope || 'headquarters') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        id={`hiring-scope-${opt.value}`}
                        onClick={() => { setNewJob(prev => ({ ...prev, hiringScope: opt.value })); setErrors(prev => ({ ...prev, branches: null })); }}
                        style={{
                          textAlign: 'left',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: `1.5px solid ${selected ? '#007AFF' : 'var(--glass-border)'}`,
                          background: selected ? 'rgba(0,122,255,0.08)' : 'var(--glass-bg)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start'
                        }}
                      >
                        <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? '#007AFF' : 'var(--text-secondary)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#007AFF' }} />}
                        </span>
                        <span>
                          <span style={{ display: 'block', fontWeight: 700, fontSize: '14px' }}>{opt.title}</span>
                          <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: 2 }}>{opt.sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {newJob.hiringScope === 'branch' && (
                  <BranchListEditor
                    branches={newJob.branches || []}
                    error={errors.branches || ''}
                    onChange={(updatedBranches) => { setNewJob(prev => ({ ...prev, branches: updatedBranches })); setErrors(prev => ({ ...prev, branches: null })); }}
                  />
                )}
              </div>
            )}
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolTypeLabel') : t('jobTitleLabel')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.title} 
                onChange={e => { setNewJob({...newJob, title: e.target.value}); setErrors(prev => ({...prev, title: null})); }} 
                placeholder={isAdCourse ? t('schoolTypePlaceholder') : t('jobTitlePlaceholder')} 
                className="auth-input"
                style={{ borderColor: errors.title ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={50}
              />
              {errors.title && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolPriceLabel') : t('salaryLabel')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.salary} 
                onChange={e => { setNewJob({...newJob, salary: e.target.value}); setErrors(prev => ({...prev, salary: null})); }} 
                placeholder={isAdCourse ? t('schoolPricePlaceholder') : t('salaryPlaceholder')} 
                className="auth-input"
                style={{ borderColor: errors.salary ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={30}
              />
              {errors.salary && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.salary}</span>}
            </div>

            {!isAdCourse && (
              <>
                <CustomInlineDropdown
                  label={t('jobTypeLabel')}
                  required={true}
                  value={newJob.type}
                  placeholder={`-- ${t('jobTypeLabel')} --`}
                  error={errors.type}
                  options={[
                    { id: 'fulltime', name: t('jobType_fulltime') },
                    { id: 'contract', name: t('jobType_contract') },
                    { id: 'parttime', name: t('jobType_parttime') },
                    { id: 'outsourcing', name: t('jobType_outsourcing') },
                    { id: 'dispatch', name: t('jobType_dispatch') },
                    { id: 'intern', name: t('jobType_intern') }
                  ]}
                  onChange={(val) => {
                    setNewJob({ ...newJob, type: val });
                    setErrors(prev => ({ ...prev, type: null }));
                  }}
                />
                {newJob.isInternational && newJob.type === 'parttime' && (
                  <span style={{ fontSize: '11.5px', color: '#FF9F0A', marginBottom: '12px', display: 'block', fontWeight: '500', lineHeight: '1.4' }}>
                    {t('sswArubaitoWarning')}
                  </span>
                )}
              </>
            )}

            <CustomInlineDropdown
              label={isAdCourse ? t('schoolDiscountLabel') : t('bonusLabel')}
              required={true}
              value={newJob.bonus}
              placeholder={isAdCourse ? t('schoolDiscountPlaceholder') : `-- ${t('bonusLabel')} --`}
              error={errors.bonus}
              options={[
                { id: 'bonus_none', name: t('bonus_none', '賞与なし') },
                { id: 'bonus_1', name: t('bonus_1', '賞与年1回') },
                { id: 'bonus_2', name: t('bonus_2', '賞与年2回') },
                { id: 'bonus_3', name: t('bonus_3', '賞与年3回') },
                { id: 'bonus_performance', name: t('bonus_performance', '業績連動賞与') },
                { id: 'bonus_signon', name: t('bonus_signon', '入社祝い金あり') }
              ]}
              onChange={(val) => {
                setNewJob({ ...newJob, bonus: val });
                setErrors(prev => ({ ...prev, bonus: null }));
              }}
              allowCustom={true}
              customPlaceholder={t('customBonusPlaceholder')}
            />

            {!isAdCourse && (
              <CustomInlineDropdown
                label={t('jobSubcategoryLabel', '職種・免許')}
                required={true}
                value={newJob.subcategory}
                placeholder={`-- ${t('jobSubcategoryLabel', '職種・免許')} --`}
                error={errors.subcategory}
                options={JOB_CATEGORIES[0]?.subcategories.map(sub => ({
                  id: sub.id,
                  name: currentLang === 'uz' ? sub.nameUz : currentLang === 'en' ? (sub.nameEn || sub.name) : sub.name
                })) || []}
                onChange={(val) => {
                  setNewJob({ ...newJob, subcategory: val });
                  setErrors(prev => ({ ...prev, subcategory: null }));
                }}
              />
            )}
            
            {/* 3-Part Structured Address Questionnaire */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>
                  {t('postalCodeLabel', '郵便番号')} <span style={{ color: '#FF3B30' }}>*</span>
                </label>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #8e8e93)', display: 'block', lineHeight: '1.4' }}>
                  {t('postalCodeHelp', '※ 郵便番号（7桁）を入力すると住所が自動入力されます')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  {/* Classic Japanese Postal Symbol 〒 Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      fontWeight: '800',
                      fontSize: '15px',
                      color: 'var(--primary, #0084FF)',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  >
                    〒
                  </span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    name="michi_job_postal_code"
                    data-lpignore="true"
                    value={newJob.postalCode || ''} 
                    onChange={e => {
                      const raw = e.target.value.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
                      const digits = raw.replace(/\D/g, '').slice(0, 7);
                      let val = digits;
                      if (digits.length > 3) {
                        val = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                      }
                      setNewJob(prev => ({ ...prev, postalCode: val })); 
                      setErrors(prev => ({ ...prev, postalCode: null })); 
                      if (digits.length === 7) {
                        fetchAddressByZip(digits);
                      } else {
                        setAddressLookupStatus(null);
                      }
                    }} 
                    placeholder={t('postalCodePlaceholder', '100-0001')} 
                    className="auth-input"
                    style={{ 
                      paddingLeft: '32px',
                      borderColor: errors.postalCode ? '#FF3B30' : addressLookupStatus?.success ? '#30D158' : 'var(--glass-border)',
                      fontWeight: '600',
                      letterSpacing: '1px'
                    }}
                    maxLength={8}
                  />
                </div>

                {/* Auto-fill Button */}
                <button
                  type="button"
                  onClick={() => fetchAddressByZip(newJob.postalCode || '')}
                  disabled={isFetchingAddress || (newJob.postalCode || '').replace(/[^0-9]/g, '').length !== 7}
                  style={{
                    background: (newJob.postalCode || '').replace(/[^0-9]/g, '').length === 7 ? 'var(--primary, #0084FF)' : 'var(--card-bg, rgba(120, 120, 128, 0.16))',
                    color: (newJob.postalCode || '').replace(/[^0-9]/g, '').length === 7 ? '#ffffff' : 'var(--text-secondary, #8e8e93)',
                    border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.12))',
                    borderRadius: '12px',
                    padding: '0 14px',
                    height: '44px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: (newJob.postalCode || '').replace(/[^0-9]/g, '').length === 7 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: (newJob.postalCode || '').replace(/[^0-9]/g, '').length === 7 ? '0 4px 12px rgba(0, 132, 255, 0.3)' : 'none'
                  }}
                >
                  {isFetchingAddress ? (
                    <span>⏳ ...</span>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>{t('autoFillAddress')}</span>
                    </>
                  )}
                </button>
              </div>

              {errors.postalCode && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.postalCode}</span>}

              {/* Status Feedback Badge */}
              {addressLookupStatus && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: addressLookupStatus.success ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255, 159, 10, 0.12)',
                    border: `1px solid ${addressLookupStatus.success ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 159, 10, 0.35)'}`,
                    color: addressLookupStatus.success ? '#28a745' : '#D97706',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    lineHeight: '1.4'
                  }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{addressLookupStatus.success ? '✓' : '💡'}</span>
                  <span>
                    {addressLookupStatus.success 
                      ? `${t('addressAutoFilled')}: ${addressLookupStatus.text}` 
                      : t('manualAddressTip')}
                  </span>
                </div>
              )}
            </div>

            <CustomInlineDropdown
              label={t('prefectureLabel')}
              required={true}
              value={newJob.prefecture}
              placeholder={`-- ${t('selectPrefecture')} --`}
              error={errors.prefecture}
              options={ALL_47_PREFECTURES.map(pref => ({
                id: pref.id,
                name: pref.kanji,
                kanji: pref.kanji
              }))}
              onChange={(val) => {
                setNewJob({ ...newJob, prefecture: val });
                setErrors(prev => ({ ...prev, prefecture: null }));
              }}
            />

            <CustomInlineDropdown
              label={t('cityAddressLabel', '市区町村')}
              required={true}
              value={newJob.detailAddress}
              placeholder={newJob.prefecture ? `-- ${t('cityAddressLabel', '市区町村')} --` : t('selectPrefectureFirst', '-- 都道府県を先に選択してください --')}
              error={errors.detailAddress}
              options={getCitiesByPrefecture(newJob.prefecture)}
              onChange={(val) => {
                setNewJob({ ...newJob, detailAddress: val });
                setErrors(prev => ({ ...prev, detailAddress: null }));
              }}
              allowCustom={Boolean(newJob.prefecture)}
              customPlaceholder={t('cityAddressPlaceholder', '例：松戸市 / 千代田区')}
            />

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('townAddressLabel', '町名・丁目')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.townAddress || ''} 
                onChange={e => {
                  setNewJob({ ...newJob, townAddress: e.target.value }); 
                  setErrors(prev => ({ ...prev, townAddress: null })); 
                }} 
                placeholder={t('townAddressPlaceholder', '例：常盤平 2-25 / 丸の内 1-1')} 
                className="auth-input"
                style={{ borderColor: errors.townAddress ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={80}
              />
              {errors.townAddress && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.townAddress}</span>}
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('buildingAddressLabel', '建物名・部屋番号（任意）')}
              </label>
              <input 
                type="text" 
                value={newJob.buildingAddress || ''} 
                onChange={e => setNewJob({ ...newJob, buildingAddress: e.target.value })} 
                placeholder={t('buildingAddressPlaceholder', '例：公団住宅 1-38-305 / 常盤平ビル 3F')} 
                className="auth-input"
                maxLength={100}
              />
            </div>

            {!isAdCourse && (
              <>
                <CustomInlineDropdown
                  label={t('trainLineLabel', '利用路線')}
                  required={true}
                  value={newJob.trainLine}
                  placeholder={`-- ${t('trainLineLabel', '利用路線を選択')} --`}
                  error={errors.trainLine}
                  options={getAllTrainLineOptions()}
                  onChange={(val) => {
                    setNewJob({ ...newJob, trainLine: val, nearestStation: '' });
                    setErrors(prev => ({ ...prev, trainLine: null, nearestStation: null }));
                  }}
                  allowCustom={true}
                  customPlaceholder={t('trainLinePlaceholder', '例：JR山手線 / JR常磐線 / 東京メトロ丸ノ内線')}
                />

                <CustomInlineDropdown
                  label={t('nearestStationLabel', '最寄り駅')}
                  required={true}
                  value={newJob.nearestStation}
                  placeholder={newJob.trainLine ? `-- ${t('nearestStationLabel', '最寄り駅を選択')} --` : t('selectTrainLineFirst', '-- 路線を先に選択してください --')}
                  error={errors.nearestStation}
                  options={getStationsByLine(newJob.trainLine)}
                  onChange={(val) => {
                    setNewJob({ ...newJob, nearestStation: val });
                    setErrors(prev => ({ ...prev, nearestStation: null }));
                  }}
                  allowCustom={Boolean(newJob.trainLine)}
                  customPlaceholder={t('nearestStationPlaceholder', '例：新宿駅 / 松戸駅 / 梅田駅')}
                />

                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('walkTimeLabel')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number" 
                      value={newJob.walkTime} 
                      onChange={e => setNewJob({...newJob, walkTime: e.target.value.replace(/[^0-9]/g, '')})} 
                      placeholder={t('walkTimePlaceholder')} 
                      className="auth-input"
                      style={{ flex: 1 }}
                      min={0}
                      max={60}
                    />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '14px' }}>
                      {t('minutesUnit')}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* BLOCK 2: Ish Sharoitlari (Chips) */}
          {!isAdCourse && (
            <div className="glass squircle-form-card" style={{ padding: '24px 20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                  {t('jobConditionsTitle')}
                </h4>
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('workHoursLabel')}
                </label>
                {renderChips(WORK_HOURS_OPTIONS, 'hours')}
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('dayOffLabel')}
                </label>
                {renderChips(DAY_OFF_OPTIONS, 'dayOff')}
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('insuranceLabel')}
                </label>
                {renderChips(INSURANCE_OPTIONS, 'insurance')}
              </div>

              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('foreignersLabel')}
                </label>
                {renderChips(FOREIGNERS_OPTIONS, 'foreigners')}
              </div>
              
              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('housingLabel')}
                </label>
                {renderChips(HOUSING_OPTIONS, 'housing')}
              </div>

              <div className="input-group chip-group-container" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('licenseLabel')}
                </label>
                {renderChips(LICENSE_OPTIONS, 'license', true)}
              </div>
            </div>
          )}

          {/* Conditional Sections For Driving School */}
          {isAdCourse && (
            <div className="glass squircle-form-card" style={{ padding: '24px 20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                  {t('schoolCoursesLanguages')}
                </h4>
              </div>

              <div className="input-group chip-group-container">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableCoursesLabel')}
                </label>
                {renderChips(['Oogata', 'Chugata', 'Futsu', 'Tokushu', 'Nirin', 'Forklift'], 'courses', true)}
              </div>

              <div className="input-group chip-group-container" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableLangsLabel')}
                </label>
                {renderChips(['UZ', 'JP', 'EN', 'RU', 'VI', 'ZH'], 'langs', true)}
              </div>
            </div>
          )}

          {/* BLOCK 3: Contact & Description */}
          <div className="glass squircle-form-card" style={{ padding: '24px 20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {isAdCourse ? '3' : '3'}
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                {t('contactInfoAndDesc')}
              </h4>
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('phoneLabel')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.phone} 
                onChange={e => { setNewJob({...newJob, phone: e.target.value}); setErrors(prev => ({...prev, phone: null})); }} 
                placeholder={t('phonePlaceholder')} 
                className="auth-input"
                style={{ borderColor: errors.phone ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={25}
              />
              {errors.phone && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
            </div>

            <div className="input-group chip-group-container" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                {t('phoneModeLabel')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`form-chip ${newJob.phoneMode === 'public' ? 'selected' : ''}`}
                  onClick={() => setNewJob({...newJob, phoneMode: 'public'})}
                >
                  {t('phoneModePublic')}
                </button>
                <button
                  type="button"
                  className={`form-chip ${newJob.phoneMode === 'interview_only' ? 'selected' : ''}`}
                  onClick={() => setNewJob({...newJob, phoneMode: 'interview_only'})}
                >
                  {t('phoneModeInterview')}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('emailLabel')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="email" 
                value={newJob.email} 
                onChange={e => { setNewJob({...newJob, email: e.target.value}); setErrors(prev => ({...prev, email: null})); }} 
                placeholder={t('emailContactPlaceholder')} 
                className="auth-input"
                style={{ borderColor: errors.email ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={50}
              />
              {errors.email && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isAdCourse ? t('schoolDescLabel') : t('jobDescLabel')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <textarea 
                value={newJob.description} 
                onChange={e => { setNewJob({...newJob, description: e.target.value}); setErrors(prev => ({...prev, description: null})); }} 
                placeholder={isAdCourse ? t('schoolDescPlaceholder') : t('jobDescPlaceholder')}
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
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '12px', border: errors.hasShoukai ? '2px solid #FF3B30' : '2px solid rgba(255, 159, 10, 0.3)', background: 'linear-gradient(145deg, rgba(255, 159, 10, 0.05) 0%, rgba(255, 159, 10, 0.01) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FF9F0A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {isAdCourse ? '4' : '4'}
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#FF9F0A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} />
                {t('shoukaiSettings')}
              </h4>
            </div>

            {/* Shoukai Choice Selection (Mandatory) */}
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14.5px', fontWeight: '600', marginBottom: '12px', display: 'block', color: 'var(--text-main)' }}>
                {t('hasShoukaiPrompt')} <span style={{ color: '#FF3B30' }}>*</span>
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
                  🎉 {t('yesOption')}
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
                  ❌ {t('noOption')}
                </button>
              </div>
              {errors.hasShoukai && <span style={{ color: '#FF3B30', fontSize: '13px', marginTop: '8px', display: 'block', fontWeight: 'bold' }}>{errors.hasShoukai}</span>}
            </div>

            {/* If Shoukai is Active, reveal secret fee & conditions fields */}
            {newJob.hasShoukai === 'yes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiSumLabel')} <span style={{ color: '#FF3B30' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {['30000', '50000', '100000', '200000'].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        className={`form-chip ${String(newJob.shoukaiFee) === amount ? 'selected' : ''}`}
                        onClick={() => {
                          setNewJob({ ...newJob, shoukaiFee: amount });
                          setErrors(prev => ({ ...prev, shoukaiFee: null }));
                        }}
                      >
                        ¥{Number(amount).toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)', fontWeight: 'bold' }}>¥</span>
                    <input 
                      type="number" 
                      value={newJob.shoukaiFee} 
                      onChange={e => { setNewJob({...newJob, shoukaiFee: e.target.value}); setErrors(prev => ({...prev, shoukaiFee: null})); }} 
                      placeholder={t('shoukaiFeePlaceholder')} 
                      className="auth-input"
                      style={{ paddingLeft: '34px', width: '100%', borderColor: errors.shoukaiFee ? '#FF3B30' : 'var(--glass-border)' }}
                    />
                  </div>
                  {errors.shoukaiFee && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.shoukaiFee}</span>}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', opacity: 0.8, lineHeight: '1.4' }}>
                    🔒 {t('shoukaiSecretNote')}
                  </span>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiConditionsInputLabel')}
                  </label>
                  <textarea 
                    value={newJob.shoukaiConditions} 
                    onChange={e => setNewJob({...newJob, shoukaiConditions: e.target.value})} 
                    placeholder={t('shoukaiConditionsPlaceholder')}
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
              padding: '14px', 
              fontSize: '16px', 
              fontWeight: '700', 
              marginBottom: '0px',
              boxShadow: '0 6px 20px rgba(90, 85, 234, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }} 
            onClick={handleAddJob}
          >
            <Plus size={20} />
            {isAdCourse ? t('publishSchoolAd') : t('publishJob')}
          </button>

          {/* 76px clearance spacer yielding exact visual clearance above floating BottomNav */}
          <div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />
        </div>
      </div>
    );
  }

  if (showJobTypeSelect) {
    return (
      <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', height: 'auto', maxHeight: 'none', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px', position: 'relative' }}>
        {/* Pinned Sticky Back Button */}
        <div className="profile-sticky-back" style={{ zIndex: 300, top: '16px' }}>
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
            {t('recruitmentTypeSelectTitle')}
          </h2>
        </div>

        <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t('recruitmentChooseDesc')}
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
                {t('recruitmentLocal')}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('recruitmentLocalDesc')}
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
                {t('recruitmentInternational')} 🌐
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('recruitmentInternationalDesc')}
              </p>
            </div>
          </div>
          {/* 76px clearance spacer yielding exact visual clearance above floating BottomNav */}
          <div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />
        </div>
      </div>
    );
  }

  if (showAdTypeSelect) {
    return (
      <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', height: 'auto', maxHeight: 'none', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px', position: 'relative' }}>
        {/* Pinned Sticky Back Button */}
        <div className="profile-sticky-back" style={{ zIndex: 300, top: '16px' }}>
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
            {t('chooseAdTypeTitle')}
          </h2>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t('chooseAdTypeDesc')}
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
                {t('adTypeJob')}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('adTypeJobDesc')}
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
                {t('adTypeSchool')}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('adTypeSchoolDesc')}
              </p>
            </div>
          </div>
          {/* 76px clearance spacer yielding exact visual clearance above floating BottomNav */}
          <div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />
        </div>
      </div>
    );
  }

  
  // ===== MAIN JOB LIST =====
  return (
    <div className="feed-container fade-in" style={{ display: 'block', flex: 'none', minHeight: 'auto', height: 'auto', maxHeight: 'none', overflowY: 'visible', paddingTop: '10px', paddingBottom: '0px' }}>
      <ConfirmSheet
        open={Boolean(pendingDelete)}
        id="delete-ad-confirm-sheet"
        title={pendingDelete?.type === 'school'
          ? t('confirmDeleteSchool', 'Bu avtomaktab e\'lonini o\'chirmoqchimisiz?')
          : t('confirmDeleteJob', 'Bu e\'lonni o\'chirmoqchimisiz?')}
        message={t('deleteAdIrreversible', '削除すると元に戻せません。')}
        confirmLabel={t('delete', '削除')}
        cancelLabel={t('cancel', 'キャンセル')}
        onConfirm={confirmPendingDelete}
        onCancel={() => setPendingDelete(null)}
      />
      
      {/* ADD ANNOUNCEMENT BUTTON CARD */}
      <div style={{ padding: '0 14px', marginBottom: '24px' }}>
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
            {t('addNewJob')}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {profileData?.companyType === 'driving_school' 
              ? t('addNewSchoolAdDesc') 
              : t('addNewJobDesc')
            }
          </p>
        </div>
      </div>

      {/* SECTION 1: JOB VACANCIES LIST (ACTIVE FOR ALL COMPANIES) */}
      <div style={{ padding: '0 16px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💼 {t('yourJobs')}
        </h2>
      </div>

      <div className="jobs-list hide-scrollbar" style={{ marginBottom: '0px', paddingBottom: '0px' }}>
        {(jobs || []).filter(job => isMyJob(job)).length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            {t('noJobsYet')}
          </p>
        ) : (
          (jobs || []).filter(job => isMyJob(job)).map(job => {
            const isMine = isMyJob(job);
            return (
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
                      <span>{job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth')}`) : t('notProvided', '未入力')}</span>
                    </div>

                    <div className="job-card-chips">
                      <span className="job-chip">
                        <MapPin size={12} />
                        {t(`job_${job.id}_location`, job.location)}
                      </span>
                      <span className="job-chip">
                        <Clock size={12} />
                        {jobValueLabel(t, job.hours)}
                      </span>
                      {job.shoukaiFee > 0 && (
                        <span className="job-chip chip-highlight">
                          <Share2 size={10} />
                          {t('shoukaiAvailable')}
                          <span style={{ opacity: 0.8, marginLeft: '4px', fontWeight: 'bold' }}>
                            (¥{job.shoukaiFee.toLocaleString()})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="job-card-actions">
                  {isMine ? (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                      <button 
                        className="job-card-btn btn-apply"
                        onClick={(e) => {
                          e.stopPropagation();
                          setJobToEdit(job);
                        }}
                        style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                      >
                        <Edit3 size={13} />
                        {t('editJob')}
                      </button>
                      <button 
                        className="job-card-btn btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job.id);
                        }}
                        style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)', padding: '0 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <Trash2 size={13} />
                        {t('deleteJob', 'O\'chirish')}
                      </button>
                    </div>
                  ) : userRole === 'company' ? (
                    <button 
                      className="job-card-btn btn-apply"
                      disabled={!job.phone}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.phone) window.location.href = `tel:${job.phone}`;
                      }}
                      style={{ flex: 1, background: '#505759', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: job.phone ? 1 : 0.5 }}
                    >
                      <Phone size={13} />
                      <span>{t('callCompany', '電話する')}</span>
                    </button>
                  ) : (
                    <button 
                      className="job-card-btn btn-apply"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply && onApply(job);
                      }}
                      style={{ flex: 1 }}
                    >
                      {t('applyJob')}
                    </button>
                  )}
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
                      {t('shoukaiAvailableLabel')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SECTION 2: ACADEMY COURSES LIST (ONLY FOR DRIVING SCHOOLS) */}
      {profileData?.companyType === 'driving_school' && (
        <>
          <div style={{ padding: '0 16px', marginBottom: '12px', marginTop: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎓 {t('yourSchools')}
            </h2>
          </div>

          <div className="jobs-list hide-scrollbar" style={{ marginBottom: '0px', paddingBottom: '0px' }}>
            {(schools || []).filter(school => isMySchool(school)).length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                {t('noSchoolsYet')}
              </p>
            ) : (
              (schools || []).filter(school => isMySchool(school)).map(school => {
                const isMine = isMySchool(school);
                return (
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
                              {t('shoukaiAvailable')}
                              <span style={{ opacity: 0.8, marginLeft: '4px', fontWeight: 'bold' }}>
                                (¥{school.shoukaiFee.toLocaleString()})
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="job-card-actions">
                      {isMine ? (
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <button 
                            className="job-card-btn btn-apply"
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobToEdit(school);
                            }}
                            style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                          >
                            <Edit3 size={13} />
                            {t('editJob')}
                          </button>
                          <button 
                            className="job-card-btn btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSchool(school.id);
                            }}
                            style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)', padding: '0 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '600' }}
                          >
                            <Trash2 size={13} />
                            {t('deleteJob', 'O\'chirish')}
                          </button>
                        </div>
                      ) : userRole === 'company' ? (
                        <button 
                          className="job-card-btn btn-apply"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${school.phone || '03-1234-5678'}`;
                          }}
                          style={{ flex: 1, background: '#505759', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                          <Phone size={13} />
                          <span>{t('callCompany', '電話する')}</span>
                        </button>
                      ) : (
                        <button 
                          className="job-card-btn btn-apply"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplySchool && onApplySchool(school);
                          }}
                          style={{ flex: 1 }}
                        >
                          {t('applySchool')}
                        </button>
                      )}
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
                          {t('shoukaiAvailableLabel')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}


      {/* 76px clearance spacer yielding exact visual clearance above floating BottomNav */}
      <div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}

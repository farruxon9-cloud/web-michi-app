import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { MOCK_SCHOOLS } from '../data/mockJobsAndSchools';

import SchoolCardHorizontal from './academy/SchoolCardHorizontal';
import AcademySearchHeader from './academy/AcademySearchHeader';
import SchoolDetailModal from './academy/SchoolDetailModal';
import AcademyFilterDrawer from './academy/AcademyFilterDrawer';

export { MOCK_SCHOOLS };

export default function DrivingAcademy({ 
  isContractActive, onApplySchool, schoolApplications = [], onShoukaiPaid, 
  profileData, onShoukai, verifiedCompanies = [], onToggleSave, userRole,
  selectedSchool, setSelectedSchool, onBackPress, schools = MOCK_SCHOOLS, setSchools,
  onEditJob, searchQuery = '', setSearchQuery
}) {
  const { t } = useTranslation();

  const [showShoukaiInput, setShowShoukaiInput] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  // Filter States
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedCitiesList, setSelectedCitiesList] = useState([]);
  const [expandedCities, setExpandedCities] = useState({});
  const [selectedStations, setSelectedStations] = useState([]);
  const [expandedLines, setExpandedLines] = useState({});
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState('course');
  const [isPrefPickerOpen, setIsPrefPickerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Accordion open/close states (default false per Rule 20)
  const [isLocationSectionOpen, setIsLocationSectionOpen] = useState(false);
  const [isStationsSectionOpen, setIsStationsSectionOpen] = useState(false);
  const [isCourseSectionOpen, setIsCourseSectionOpen] = useState(false);
  const [isStyleSectionOpen, setIsStyleSectionOpen] = useState(false);
  const [isLangSectionOpen, setIsLangSectionOpen] = useState(false);
  const [isPriceSectionOpen, setIsPriceSectionOpen] = useState(false);
  const [isFeatureSectionOpen, setIsFeatureSectionOpen] = useState(false);

  const hasActiveFilters = selectedPrefecture !== 'all' || 
    selectedCitiesList.length > 0 ||
    selectedStations.length > 0 ||
    selectedCourses.length > 0 || 
    selectedStyles.length > 0 || 
    selectedLang !== 'all' || 
    selectedPriceRange !== 'all' || 
    selectedFeatures.length > 0 || 
    (searchQuery && searchQuery.length > 0);

  const resetFilters = () => {
    setSelectedPrefecture('all');
    setSelectedCitiesList([]);
    setExpandedCities({});
    setSelectedStations([]);
    setExpandedLines({});
    setSelectedCourses([]);
    setSelectedStyles([]);
    setSelectedLang('all');
    setSelectedPriceRange('all');
    setSelectedFeatures([]);
    if (setSearchQuery) setSearchQuery('');

    setIsLocationSectionOpen(false);
    setIsStationsSectionOpen(false);
    setIsCourseSectionOpen(false);
    setIsStyleSectionOpen(false);
    setIsLangSectionOpen(false);
    setIsPriceSectionOpen(false);
    setIsFeatureSectionOpen(false);

    setActiveFilterTab('course');
    setVisibleCount(10);
  };

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedPrefecture, selectedCitiesList, selectedStations, selectedCourses, selectedStyles, selectedLang, selectedPriceRange, selectedFeatures]);

  const filteredSchools = (schools || []).filter(school => {
    const query = (searchQuery || '').toLowerCase();
    const localizedName = t(`school_${school.id}_name`, school.name).toLowerCase();
    const localizedLocation = t(`school_${school.id}_location`, school.location).toLowerCase();
    const localizedType = t(`school_${school.id}_type`, school.type).toLowerCase();
    
    const matchesSearch = !searchQuery || 
      localizedName.includes(query) ||
      school.name.toLowerCase().includes(query) ||
      localizedLocation.includes(query) ||
      school.location.toLowerCase().includes(query) ||
      localizedType.includes(query) ||
      school.type.toLowerCase().includes(query);

    const matchesCourse = selectedCourses.length === 0 || 
      selectedCourses.some(c => (school.courses || []).includes(c) || (school.type || '').includes(c));

    const matchesStyle = selectedStyles.length === 0 ||
      selectedStyles.some(s => (school.trainingStyle || []).includes(s));

    const matchesPrefecture = selectedPrefecture === 'all' ||
      (school.prefecture && school.prefecture.toLowerCase() === selectedPrefecture.toLowerCase()) ||
      (school.location && school.location.toLowerCase().includes(selectedPrefecture.toLowerCase())) ||
      (school.fullAddress && school.fullAddress.toLowerCase().includes(selectedPrefecture.toLowerCase()));

    const matchesCitiesList = !selectedCitiesList || selectedCitiesList.length === 0 ||
      selectedCitiesList.some(c => (school.location || '').includes(c) || (school.fullAddress || '').includes(c) || (school.name || '').includes(c));

    const matchesStations = !selectedStations || selectedStations.length === 0 ||
      selectedStations.some(st => (school.location || '').includes(st) || (school.fullAddress || '').includes(st) || (school.name || '').includes(st) || (school.description || '').includes(st));

    const matchesLang = selectedLang === 'all' ||
      (school.langs && school.langs.includes(selectedLang));

    const price = school.priceValue || 250000;
    let matchesPrice = true;
    if (selectedPriceRange === 'under250k') matchesPrice = price <= 250000;
    else if (selectedPriceRange === '250k_300k') matchesPrice = price > 250000 && price <= 300000;
    else if (selectedPriceRange === '300k_350k') matchesPrice = price > 300000 && price <= 350000;
    else if (selectedPriceRange === 'over350k') matchesPrice = price > 350000;

    const matchesFeatures = selectedFeatures.length === 0 ||
      selectedFeatures.every(f => f === 'shoukai' ? school.shoukaiFee > 0 : (school.features || []).includes(f));

    return matchesSearch && matchesCourse && matchesStyle && matchesPrefecture && matchesCitiesList && matchesStations && matchesLang && matchesPrice && matchesFeatures;
  });

  const getCourseLabel = (id) => {
    const map = {
      'Futsu': t('lic_futsu', '普通自動車'),
      'Oogata': t('lic_oogata', '大型自動車'),
      'Chugata': t('lic_chugata', '中型自動車'),
      'JunChugata': t('lic_junchugata', '準中型自動車'),
      'FutsuNishu': t('lic_futsunishu', '普通二種'),
      'OogataNishu': t('lic_oogatanishu', '大型二種'),
      'Forklift': t('lic_forklift', 'フォークリフト'),
      'Tokushu': t('lic_tokushu', '大型特殊'),
      'Nirin': t('lic_nirin', '自動二輪車')
    };
    return map[id] || id;
  };

  const getStyleLabel = (id) => {
    const map = {
      'Tsugaku': t('style_tsugaku', '通学コース'),
      'Gashuku': t('style_gashuku', '合宿免許'),
      'ShortTerm': t('style_shortterm', '短期集中'),
      'OnlineTheory': t('style_onlinetheory', 'オンライン学科')
    };
    return map[id] || id;
  };

  const getAcademyFeatureLabel = (id) => {
    const map = {
      'shuttle': t('feat_shuttle', '無料送迎バス'),
      'dormitory': t('feat_dormitory', '宿舎・食事付き'),
      'subsidy': t('feat_subsidy', '教育訓練給付金'),
      'installment': t('feat_installment', 'ローン・分割払い'),
      'nightClass': t('feat_nightclass', 'ナイター教習'),
      'femaleInstructor': t('feat_female', '女性指導員'),
      'kidsRoom': t('feat_kidsroom', '託児所あり'),
      'shoukai': t('feat_shoukai', '紹介手当あり')
    };
    return map[id] || id;
  };

  const getAcademyLangLabel = (code) => {
    const map = {
      'UZ': t('lang_uz', 'ウズベク語'),
      'JP': t('lang_jp', '日本語'),
      'EN': t('lang_en', '英語'),
      'RU': t('lang_ru', 'ロシア語'),
      'VI': t('lang_vi', 'ベトナム語'),
      'ZH': t('lang_zh', '中国語'),
      'NE': t('lang_ne', 'ネパール語')
    };
    return map[code] || code;
  };

  const getAcademyPriceLabel = (val) => {
    const map = {
      'under20': t('price_under20', '20万円以下'),
      'under20万': t('price_under20', '20万円以下'),
      'under250k': t('price_under250k', '25万円以下'),
      '20to30': t('price_20to30', '20万円〜30万円'),
      '20to30万': t('price_20to30', '20万円〜30万円'),
      '250k_300k': t('price_250k_300k', '25万円〜30万円'),
      '300k_350k': t('price_300k_350k', '30万円〜35万円'),
      'over30': t('price_over30', '30万円以上'),
      'over30万': t('price_over30', '30万円以上'),
      'over350k': t('price_over350k', '35万円以上')
    };
    return map[val] || val;
  };

  /* Detail View Modal / Page */
  if (selectedSchool) {
    return (
      <SchoolDetailModal
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        onBackPress={onBackPress}
        showShoukaiInput={showShoukaiInput}
        setShowShoukaiInput={setShowShoukaiInput}
        referrerName={referrerName}
        setReferrerName={setReferrerName}
        isContractActive={isContractActive}
        onApplySchool={onApplySchool}
        schoolApplications={schoolApplications}
        onShoukaiPaid={onShoukaiPaid}
        profileData={profileData}
        onShoukai={onShoukai}
        onToggleSave={onToggleSave}
        userRole={userRole}
        onEditJob={onEditJob}
      />
    );
  }

  /* Inline Filter Drawer View */
  if (isFilterOpen) {
    return (
      <AcademyFilterDrawer
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        resetFilters={resetFilters}
        activeFilterTab={activeFilterTab}
        setActiveFilterTab={setActiveFilterTab}
        isLocationSectionOpen={isLocationSectionOpen}
        setIsLocationSectionOpen={setIsLocationSectionOpen}
        selectedPrefecture={selectedPrefecture}
        setSelectedPrefecture={setSelectedPrefecture}
        selectedCitiesList={selectedCitiesList}
        setSelectedCitiesList={setSelectedCitiesList}
        expandedCities={expandedCities}
        setExpandedCities={setExpandedCities}
        isPrefPickerOpen={isPrefPickerOpen}
        setIsPrefPickerOpen={setIsPrefPickerOpen}
        isStationsSectionOpen={isStationsSectionOpen}
        setIsStationsSectionOpen={setIsStationsSectionOpen}
        selectedStations={selectedStations}
        setSelectedStations={setSelectedStations}
        expandedLines={expandedLines}
        setExpandedLines={setExpandedLines}
        isCourseSectionOpen={isCourseSectionOpen}
        setIsCourseSectionOpen={setIsCourseSectionOpen}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        isStyleSectionOpen={isStyleSectionOpen}
        setIsStyleSectionOpen={setIsStyleSectionOpen}
        selectedStyles={selectedStyles}
        setSelectedStyles={setSelectedStyles}
        isLangSectionOpen={isLangSectionOpen}
        setIsLangSectionOpen={setIsLangSectionOpen}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        isPriceSectionOpen={isPriceSectionOpen}
        setIsPriceSectionOpen={setIsPriceSectionOpen}
        selectedPriceRange={selectedPriceRange}
        setSelectedPriceRange={setSelectedPriceRange}
        isFeatureSectionOpen={isFeatureSectionOpen}
        setIsFeatureSectionOpen={setIsFeatureSectionOpen}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        filteredSchoolsCount={filteredSchools.length}
      />
    );
  }

  /* List View */
  return (
    <div className="feed-container fade-in">
      <AcademySearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        getCourseLabel={getCourseLabel}
        selectedStyles={selectedStyles}
        setSelectedStyles={setSelectedStyles}
        getStyleLabel={getStyleLabel}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        getAcademyFeatureLabel={getAcademyFeatureLabel}
        selectedStations={selectedStations}
        setSelectedStations={setSelectedStations}
        selectedCitiesList={selectedCitiesList}
        setSelectedCitiesList={setSelectedCitiesList}
        selectedPrefecture={selectedPrefecture}
        setSelectedPrefecture={setSelectedPrefecture}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        getAcademyLangLabel={getAcademyLangLabel}
        selectedPriceRange={selectedPriceRange}
        setSelectedPriceRange={setSelectedPriceRange}
        getAcademyPriceLabel={getAcademyPriceLabel}
        resetFilters={resetFilters}
      />

      {/* Schools List */}
      <div className="jobs-list hide-scrollbar">
        {filteredSchools.slice(0, visibleCount).map(school => (
          <SchoolCardHorizontal
            key={school.id}
            school={school}
            isContractActive={isContractActive}
            onSelectSchool={setSelectedSchool}
            userRole={userRole}
            profileData={profileData}
            onEditJob={onEditJob}
            schoolApplications={schoolApplications}
            onApplySchool={onApplySchool}
            onShoukai={onShoukai}
          />
        ))}

        {visibleCount < filteredSchools.length && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px 0', width: '100%' }}>
            <button 
              type="button"
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="glass squircle animate-scale-up"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                padding: '12px 24px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <span>{t('loadMore', "Ko'proq yuklash")}</span>
            </button>
          </div>
        )}

        {filteredSchools.length === 0 && (
          <div className="empty-feed">
            <Search size={40} color="#C7C7CC" />
            <p>{t('noSchoolsFound', "Mos avtomaktab topilmadi")}</p>
          </div>
        )}
      </div>

      {/* 92px Dock Clearance Spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}

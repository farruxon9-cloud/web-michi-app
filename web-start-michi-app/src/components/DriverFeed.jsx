import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import JobCardHorizontal from './jobs/JobCardHorizontal';
import JobFeedSearchHeader from './jobs/JobFeedSearchHeader';
import TownworkFilterDrawer from './jobs/TownworkFilterDrawer';
import JobSkeletonCard from './jobs/JobSkeletonCard';
import './DriverFeed.css';
import { REGIONS, PREFECTURES, CITIES_BY_PREFECTURE, TRAIN_LINES_BY_PREFECTURE, getAllTrainLines, getAllCities } from '../data/japanLocationDB';
import { JOB_CATEGORIES } from '../data/jobCategories';
import { MOCK_JOBS } from '../data/mockJobsAndSchools';

export const RADIUS_OPTIONS = [
  { value: 1, label: '1km以内', labelUz: '1km radiusda', labelEn: 'Within 1km', sublabel: '徒歩15分くらい', sublabelUz: '15 daqiqa piyoda', sublabelEn: '~15 mins walk' },
  { value: 2, label: '2km以内', labelUz: '2km radiusda', labelEn: 'Within 2km', sublabel: '徒歩30分くらい', sublabelUz: '30 daqiqa piyoda', sublabelEn: '~30 mins walk' },
  { value: 3, label: '3km以内', labelUz: '3km radiusda', labelEn: 'Within 3km', sublabel: '車10分くらい', sublabelUz: 'Moshinada 10 daqiqa', sublabelEn: '~10 mins by car' },
  { value: 5, label: '5km以内', labelUz: '5km radiusda', labelEn: 'Within 5km', sublabel: '車15分くらい', sublabelUz: 'Moshinada 15 daqiqa', sublabelEn: '~15 mins by car' },
  { value: 7, label: '7km以内', labelUz: '7km radiusda', labelEn: 'Within 7km', sublabel: '車20分くらい', sublabelUz: 'Moshinada 20 daqiqa', sublabelEn: '~20 mins by car' },
  { value: 10, label: '10km以内', labelUz: '10km radiusda', labelEn: 'Within 10km', sublabel: '車30分くらい', sublabelUz: 'Moshinada 30 daqiqa', sublabelEn: '~30 mins by car' },
  { value: 15, label: '15km以内', labelUz: '15km radiusda', labelEn: 'Within 15km', sublabel: '車45分くらい', sublabelUz: 'Moshinada 45 daqiqa', sublabelEn: '~45 mins by car' },
  { value: 20, label: '20km以内', labelUz: '20km radiusda', labelEn: 'Within 20km', sublabel: '車1時間くらい', sublabelUz: 'Moshinada 1 soat', sublabelEn: '~1 hour by car' }
];

export { MOCK_JOBS };
export { JobSkeletonCard as SkeletonCard };

export default function DriverFeed({ 
  onJobClick, isContractActive, verifiedCompanies = [], onShoukai, 
  jobs = MOCK_JOBS, userRole, profileData, onEditJob, onApply, applications = [],
  searchQuery = '', setSearchQuery, activeSegment = 'all', setActiveSegment,
  selectedLicenses = [], setSelectedLicenses,
  selectedLangLevel = 'all', setSelectedLangLevel,
  selectedBenefits = [], setSelectedBenefits,
  minSalary = 0, setMinSalary,
  selectedPrefecture = 'all', setSelectedPrefecture,
  selectedCity = 'all', setSelectedCity,
  stationQuery = '', setStationQuery,
  onlyNearStation = false, setOnlyNearStation,
  isLoading = false
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'uz';
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [localLoading, setLocalLoading] = useState(false);

  // Filter States
  const [selectedRadius, setSelectedRadius] = useState(0);
  const [selectedStations, setSelectedStations] = useState([]);
  const [selectedCitiesList, setSelectedCitiesList] = useState([]);
  const [selectedJobCategories, setSelectedJobCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setVisibleCount(10);
    setLocalLoading(true);
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [
    searchQuery, activeSegment, selectedLicenses,
    selectedLangLevel, selectedBenefits, minSalary,
    selectedPrefecture, selectedCity, stationQuery, onlyNearStation,
    selectedRadius, selectedStations, selectedCitiesList,
    selectedJobCategories, selectedEmploymentTypes, selectedDurations,
    selectedTimeSlots, selectedFeatures, sortBy
  ]);

  const showLoading = isLoading || localLoading;

  const getSalaryNumber = (salaryStr) => {
    if (!salaryStr) return 0;
    const num = parseInt(salaryStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const hasActiveFilters = selectedLicenses.length > 0 
    || selectedLangLevel !== 'all' 
    || selectedBenefits.length > 0 
    || minSalary > 0 
    || selectedPrefecture !== 'all'
    || selectedCity !== 'all'
    || stationQuery !== ''
    || onlyNearStation === true
    || selectedRadius > 0
    || selectedStations.length > 0
    || selectedCitiesList.length > 0
    || selectedJobCategories.length > 0
    || selectedSubcategories.length > 0
    || selectedEmploymentTypes.length > 0
    || selectedDurations.length > 0
    || selectedTimeSlots.length > 0
    || selectedFeatures.length > 0;

  const handleResetFilters = () => {
    setSelectedLicenses([]);
    setSelectedLangLevel('all');
    setSelectedBenefits([]);
    setMinSalary(0);
    setSelectedPrefecture('all');
    setSelectedCity('all');
    setStationQuery('');
    setOnlyNearStation(false);
    setSelectedRadius(0);
    setSelectedStations([]);
    setSelectedCitiesList([]);
    setSelectedJobCategories([]);
    setSelectedSubcategories([]);
    setSelectedEmploymentTypes([]);
    setSelectedDurations([]);
    setSelectedTimeSlots([]);
    setSelectedFeatures([]);
  };

  const filteredJobs = (jobs || []).filter(job => {
    if (!job) return false;

    const matchSegment = !activeSegment || activeSegment === 'all' 
      || (activeSegment === 'international' && job.isInternational === true)
      || (activeSegment === 'permanent' && job.type === 'fulltime')
      || (activeSegment === 'hourly' && (job.type === 'parttime' || job.type === 'contract'));
      
    const sq = (searchQuery || '').toLowerCase();
    const matchSearch = !sq || 
      (job.title && job.title.toLowerCase().includes(sq)) ||
      (job.company && job.company.toLowerCase().includes(sq)) ||
      (job.location && job.location.toLowerCase().includes(sq)) ||
      (job.description && job.description.toLowerCase().includes(sq));

    const matchLicense = !selectedLicenses || selectedLicenses.length === 0 || selectedLicenses.includes(job.license);

    const langMap = { 'all': 4, 'none': 0, 'n5_n4': 1, 'n3': 2, 'n2_n1': 3, 'N5': 1, 'N4': 1, 'N3': 2, 'N2': 3, 'N1': 3 };
    const userVal = langMap[selectedLangLevel] ?? 4;
    const jobVal = {
      'foreigners_n4': 1,
      'foreigners_nolang': 1,
      'foreigners_ok': 1,
      'foreigners_visa': 1,
      'foreigners_visa_renew': 1,
      'foreigners_n3': 2,
      'foreigners_n2': 3
    }[job.foreigners] || 0;
    const matchLang = userVal >= jobVal;

    const matchBenefits = !selectedBenefits || selectedBenefits.length === 0 || selectedBenefits.every(b => {
      if (b === 'housing') return job.housing && job.housing !== 'housing_none';
      if (b === 'shoukai') return job.hasShoukai || job.shoukaiFee > 0;
      if (b === 'insurance') return job.insurance && job.insurance.startsWith('insurance_');
      return true;
    });

    const jobSalNum = getSalaryNumber(job.salary);
    const matchSalary = minSalary === 0 || jobSalNum >= minSalary;

    const matchPrefecture = !selectedPrefecture || selectedPrefecture === 'all' || (job.location && job.location.toLowerCase().includes(selectedPrefecture.toLowerCase()));

    return matchSegment && matchSearch && matchLicense && matchLang && matchBenefits && matchSalary && matchPrefecture;
  }).sort((a, b) => {
    if (sortBy === 'salary_high') return getSalaryNumber(b.salary) - getSalaryNumber(a.salary);
    if (sortBy === 'salary_low') return getSalaryNumber(a.salary) - getSalaryNumber(b.salary);
    return (b.id || 0) - (a.id || 0);
  });

  const getJobCategoryLabel = (catId) => {
    for (const cat of JOB_CATEGORIES) {
      if (cat.id === catId) {
        if (currentLang === 'uz') return cat.nameUz || cat.name;
        if (currentLang === 'en') return cat.nameEn || cat.name;
        return cat.name;
      }
    }
    return catId;
  };

  const handleToggleBookmark = (job) => {
    const isSaved = profileData?.savedItems?.jobs?.some(j => j.id === job.id);
    if (profileData && profileData.setSavedItems) {
      profileData.setSavedItems(prev => {
        const currentJobs = prev?.jobs || [];
        const nextJobs = isSaved ? currentJobs.filter(j => j.id !== job.id) : [...currentJobs, job];
        return { ...prev, jobs: nextJobs };
      });
    }
  };

  return (
    <div className="feed-container fade-in hide-scrollbar" style={{ flex: 1, height: '100%', maxHeight: '100%', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '6px 14px 0 14px', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* 1. Header Search & Segment Bar */}
      <JobFeedSearchHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSegment={activeSegment}
        setActiveSegment={setActiveSegment}
        selectedPrefecture={selectedPrefecture}
        setSelectedPrefecture={setSelectedPrefecture}
        setIsFilterDrawerOpen={setIsFilterDrawerOpen}
        hasActiveFilters={hasActiveFilters}
        handleResetFilters={handleResetFilters}
        filteredJobsCount={filteredJobs.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedLicenses={selectedLicenses}
        setSelectedLicenses={setSelectedLicenses}
        selectedStations={selectedStations}
        setSelectedStations={setSelectedStations}
        selectedCitiesList={selectedCitiesList}
        setSelectedCitiesList={setSelectedCitiesList}
        selectedJobCategories={selectedJobCategories}
        setSelectedJobCategories={setSelectedJobCategories}
        selectedEmploymentTypes={selectedEmploymentTypes}
        setSelectedEmploymentTypes={setSelectedEmploymentTypes}
        selectedDurations={selectedDurations}
        setSelectedDurations={setSelectedDurations}
        selectedTimeSlots={selectedTimeSlots}
        setSelectedTimeSlots={setSelectedTimeSlots}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        selectedRadius={selectedRadius}
        setSelectedRadius={setSelectedRadius}
        onlyNearStation={onlyNearStation}
        setOnlyNearStation={setOnlyNearStation}
        getJobCategoryLabel={getJobCategoryLabel}
      />

      {/* 2. Job Listings (Goo-net style horizontal cards) */}
      <div className="jobs-list hide-scrollbar">
        {showLoading ? (
          <>
            <JobSkeletonCard />
            <JobSkeletonCard />
            <JobSkeletonCard />
          </>
        ) : filteredJobs.length === 0 ? (
          <div className="no-jobs glass" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px', width: '100%' }}>
            {t('noJobsFound', '該当する求人が見つかりませんでした')}
          </div>
        ) : (
          filteredJobs.slice(0, visibleCount).map(job => {
            const showVerified = (verifiedCompanies || []).includes(job.company) || isContractActive;
            const isSaved = profileData?.savedItems?.jobs?.some(j => j.id === job.id);
            return (
              <JobCardHorizontal
                key={job.id}
                job={job}
                onJobClick={onJobClick}
                isVerified={showVerified}
                onBookmark={handleToggleBookmark}
                isBookmarked={isSaved}
              />
            );
          })
        )}

        {visibleCount < filteredJobs.length && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px 0', width: '100%' }}>
            <button 
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
            >
              <span>{t('loadMore', 'もっと見る')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 92px Clearance Spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />

      {/* 3. Townwork-Style 3-Tab Filter Drawer */}
      <TownworkFilterDrawer 
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        handleResetFilters={handleResetFilters}
        filteredJobsCount={filteredJobs.length}
        selectedPrefecture={selectedPrefecture}
        setSelectedPrefecture={setSelectedPrefecture}
        selectedCitiesList={selectedCitiesList}
        setSelectedCitiesList={setSelectedCitiesList}
        selectedStations={selectedStations}
        setSelectedStations={setSelectedStations}
        selectedRadius={selectedRadius}
        setSelectedRadius={setSelectedRadius}
        selectedJobCategories={selectedJobCategories}
        setSelectedJobCategories={setSelectedJobCategories}
        selectedLicenses={selectedLicenses}
        setSelectedLicenses={setSelectedLicenses}
        selectedLangLevel={selectedLangLevel}
        setSelectedLangLevel={setSelectedLangLevel}
        selectedBenefits={selectedBenefits}
        setSelectedBenefits={setSelectedBenefits}
        minSalary={minSalary}
        setMinSalary={setMinSalary}
        selectedEmploymentTypes={selectedEmploymentTypes}
        setSelectedEmploymentTypes={setSelectedEmploymentTypes}
        selectedDurations={selectedDurations}
        setSelectedDurations={setSelectedDurations}
        selectedTimeSlots={selectedTimeSlots}
        setSelectedTimeSlots={setSelectedTimeSlots}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        getJobCategoryLabel={getJobCategoryLabel}
      />
    </div>
  );
}

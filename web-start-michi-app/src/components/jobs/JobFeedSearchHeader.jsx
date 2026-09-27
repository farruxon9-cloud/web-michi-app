import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, SlidersHorizontal, RotateCcw, X, ShieldCheck, Train, Briefcase, FileText, Calendar, Clock, Star, Target, Navigation } from 'lucide-react';

export default function JobFeedSearchHeader({
  searchQuery,
  setSearchQuery,
  activeSegment,
  setActiveSegment,
  selectedPrefecture,
  setSelectedPrefecture,
  setIsFilterDrawerOpen,
  hasActiveFilters,
  handleResetFilters,
  filteredJobsCount,
  sortBy,
  setSortBy,
  selectedLicenses = [],
  setSelectedLicenses,
  selectedStations = [],
  setSelectedStations,
  selectedCitiesList = [],
  setSelectedCitiesList,
  selectedJobCategories = [],
  setSelectedJobCategories,
  selectedEmploymentTypes = [],
  setSelectedEmploymentTypes,
  selectedDurations = [],
  setSelectedDurations,
  selectedTimeSlots = [],
  setSelectedTimeSlots,
  selectedFeatures = [],
  setSelectedFeatures,
  selectedRadius = 0,
  setSelectedRadius,
  onlyNearStation = false,
  setOnlyNearStation,
  getJobCategoryLabel,
  getEmploymentLabel,
  getDurationLabel,
  getTimeSlotLabel,
  getFeatureLabel
}) {
  const { t } = useTranslation();

  return (
    <div className="feed-header-sticky-wrapper">
      {/* Search Input Bar */}
      <div className="feed-header">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder', 'Ish unvoni, kalit so\'z yoki joylashuv...')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button 
          type="button" 
          className={`filter-btn ${hasActiveFilters ? 'active' : ''}`}
          onClick={() => setIsFilterDrawerOpen(true)}
          aria-label="Open Filters"
        >
          <SlidersHorizontal size={18} />
          {hasActiveFilters && <span className="filter-badge-dot" />}
        </button>
      </div>

      {/* Segment Tabs (Barchasi, Haydovchilik, SSW Viza) */}
      <div className="segment-pills-row">
        <button 
          type="button" 
          className={`segment-pill ${activeSegment === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSegment('all')}
        >
          {t('segmentAll', 'Barchasi')}
        </button>
        <button 
          type="button" 
          className={`segment-pill ${activeSegment === 'international' ? 'active' : ''}`}
          onClick={() => setActiveSegment('international')}
        >
          🇯🇵 {t('segmentSSWVisa', 'SSW Viza (特定技能)')}
        </button>
        <button 
          type="button" 
          className={`segment-pill ${activeSegment === 'permanent' ? 'active' : ''}`}
          onClick={() => setActiveSegment('permanent')}
        >
          {t('segmentFulltime', 'To\'liq stavka (正社員)')}
        </button>
        <button 
          type="button" 
          className={`segment-pill ${activeSegment === 'hourly' ? 'active' : ''}`}
          onClick={() => setActiveSegment('hourly')}
        >
          {t('segmentParttime', 'Soatbay (アルバイト)')}
        </button>
      </div>

      {/* Active Filter Chips Strip */}
      {hasActiveFilters && (
        <div className="active-filters-strip">
          <div className="active-chips-scroll">
            {selectedLicenses.length > 0 && (
              selectedLicenses.length <= 2 ? (
                selectedLicenses.map(lic => (
                  <span key={lic} className="active-chip" onClick={() => setSelectedLicenses(prev => prev.filter(item => item !== lic))}>
                    <ShieldCheck size={13} className="chip-svg-icon" /> {lic} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedLicenses([])} title={selectedLicenses.join(', ')}>
                  <ShieldCheck size={13} className="chip-svg-icon" /> {selectedLicenses[0]} <span className="active-chip-count">外{selectedLicenses.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedStations.length > 0 && (
              selectedStations.length <= 2 ? (
                selectedStations.map(st => (
                  <span key={st} className="active-chip" onClick={() => setSelectedStations(prev => prev.filter(item => item !== st))}>
                    <Train size={13} className="chip-svg-icon" /> {st} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedStations([])} title={selectedStations.join(', ')}>
                  <Train size={13} className="chip-svg-icon" /> {selectedStations[0]} <span className="active-chip-count">外{selectedStations.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedCitiesList.length > 0 && (
              selectedCitiesList.length <= 2 ? (
                selectedCitiesList.map(c => (
                  <span key={c} className="active-chip" onClick={() => setSelectedCitiesList(prev => prev.filter(item => item !== c))}>
                    <MapPin size={13} className="chip-svg-icon" /> {c} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedCitiesList([])} title={selectedCitiesList.join(', ')}>
                  <MapPin size={13} className="chip-svg-icon" /> {selectedCitiesList[0]} <span className="active-chip-count">外{selectedCitiesList.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedJobCategories.map(catId => (
              <span key={catId} className="active-chip" onClick={() => setSelectedJobCategories(prev => prev.filter(item => item !== catId))}>
                <Briefcase size={13} className="chip-svg-icon" /> {getJobCategoryLabel ? getJobCategoryLabel(catId) : catId} <span className="active-chip-close"><X size={11} /></span>
              </span>
            ))}
            {selectedRadius > 0 && (
              <span className="active-chip" onClick={() => setSelectedRadius(0)}>
                <Target size={13} className="chip-svg-icon" /> {selectedRadius}km <span className="active-chip-close"><X size={11} /></span>
              </span>
            )}
          </div>
          <button type="button" className="clear-all-chip sticky-reset-btn" onClick={handleResetFilters} title={t('clearAll', 'リセット')}>
            <RotateCcw size={13} className="reset-spin-icon" />
            <span>{t('clearAll', 'リセット')}</span>
          </button>
        </div>
      )}

      {/* Sort & Results Bar */}
      <div className="sort-results-bar">
        <span className="result-count">{t('jobsCountResult', '{{count}} 件の求人', { count: filteredJobsCount })}</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
          <option value="newest">{t('newest', '新着順')}</option>
          <option value="salary_high">{t('salary_high', '給料が高い順')}</option>
          <option value="salary_low">{t('salary_low', '給料が低い順')}</option>
        </select>
      </div>
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, Car, GraduationCap, Sparkles, Train, MapPin, Globe, Banknote, X, RotateCcw } from 'lucide-react';

export default function AcademySearchHeader({
  searchQuery = '',
  setSearchQuery,
  hasActiveFilters,
  isFilterOpen,
  setIsFilterOpen,
  selectedCourses = [],
  setSelectedCourses,
  getCourseLabel,
  selectedStyles = [],
  setSelectedStyles,
  getStyleLabel,
  selectedFeatures = [],
  setSelectedFeatures,
  getAcademyFeatureLabel,
  selectedStations = [],
  setSelectedStations,
  selectedCitiesList = [],
  setSelectedCitiesList,
  selectedPrefecture = 'all',
  setSelectedPrefecture,
  selectedLang = 'all',
  setSelectedLang,
  getAcademyLangLabel,
  selectedPriceRange = 'all',
  setSelectedPriceRange,
  getAcademyPriceLabel,
  resetFilters
}) {
  const { t } = useTranslation();

  return (
    <div className="feed-header glass">
      <div className="search-row">
        <div className="search-bar">
          <Search size={20} color="#8E8E93" />
          <input 
            type="text" 
            placeholder={t('searchSchoolPlaceholder', "Avtomaktab yoki shahar nomi...")} 
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          type="button"
          className={`filter-toggle-btn ${hasActiveFilters ? 'active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          title={t('schoolFilters', 'Avtomaktab filtrlari')}
        >
          <SlidersHorizontal size={20} />
          {hasActiveFilters && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="active-filter-chips-container" style={{ marginTop: '8px' }}>
          <div className="active-filter-chips-row hide-scrollbar">
            {selectedCourses.length > 0 && (
              selectedCourses.length <= 2 ? (
                selectedCourses.map(course => (
                  <span key={course} className="active-chip" onClick={() => setSelectedCourses(prev => prev.filter(c => c !== course))}>
                    <Car size={13} className="chip-svg-icon" /> {getCourseLabel(course)} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedCourses([])} title={selectedCourses.map(getCourseLabel).join(', ')}>
                  <Car size={13} className="chip-svg-icon" /> {getCourseLabel(selectedCourses[0])} <span className="active-chip-count">外{selectedCourses.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedStyles.length > 0 && (
              selectedStyles.length <= 2 ? (
                selectedStyles.map(style => (
                  <span key={style} className="active-chip" onClick={() => setSelectedStyles(prev => prev.filter(s => s !== style))}>
                    <GraduationCap size={13} className="chip-svg-icon" /> {getStyleLabel(style)} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedStyles([])} title={selectedStyles.map(getStyleLabel).join(', ')}>
                  <GraduationCap size={13} className="chip-svg-icon" /> {getStyleLabel(selectedStyles[0])} <span className="active-chip-count">外{selectedStyles.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedFeatures.length > 0 && (
              selectedFeatures.length <= 2 ? (
                selectedFeatures.map(feat => (
                  <span key={feat} className="active-chip" onClick={() => setSelectedFeatures(prev => prev.filter(f => f !== feat))}>
                    <Sparkles size={13} className="chip-svg-icon" /> {getAcademyFeatureLabel(feat)} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedFeatures([])} title={selectedFeatures.map(getAcademyFeatureLabel).join(', ')}>
                  <Sparkles size={13} className="chip-svg-icon" /> {getAcademyFeatureLabel(selectedFeatures[0])} <span className="active-chip-count">外{selectedFeatures.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedStations.length > 0 && (
              selectedStations.length <= 2 ? (
                selectedStations.map(st => (
                  <span key={st} className="active-chip" onClick={() => setSelectedStations(prev => prev.filter(s => s !== st))}>
                    <Train size={13} className="chip-svg-icon" /> {st} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedStations([])} title={selectedStations.join(', ')}>
                  <Train size={13} className="chip-svg-icon" /> {selectedStations[0]} <span className="active-chip-count">外{selectedStations.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedCitiesList.length > 0 ? (
              selectedCitiesList.length <= 2 ? (
                selectedCitiesList.map(c => (
                  <span key={c} className="active-chip" onClick={() => setSelectedCitiesList(prev => prev.filter(x => x !== c))}>
                    <MapPin size={13} className="chip-svg-icon" /> {c} <span className="active-chip-close"><X size={11} /></span>
                  </span>
                ))
              ) : (
                <span className="active-chip" onClick={() => setSelectedCitiesList([])} title={selectedCitiesList.join(', ')}>
                  <MapPin size={13} className="chip-svg-icon" /> {selectedCitiesList[0]} <span className="active-chip-count">外{selectedCitiesList.length - 1}件</span> <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            ) : (
              selectedPrefecture !== 'all' && (
                <span className="active-chip" onClick={() => setSelectedPrefecture('all')}>
                  <MapPin size={13} className="chip-svg-icon" /> {selectedPrefecture} <span className="active-chip-close"><X size={11} /></span>
                </span>
              )
            )}
            {selectedLang !== 'all' && (
              <span className="active-chip" onClick={() => setSelectedLang('all')}>
                <Globe size={13} className="chip-svg-icon" /> {getAcademyLangLabel(selectedLang)} <span className="active-chip-close"><X size={11} /></span>
              </span>
            )}
            {selectedPriceRange !== 'all' && (
              <span className="active-chip" onClick={() => setSelectedPriceRange('all')}>
                <Banknote size={13} className="chip-svg-icon" /> {getAcademyPriceLabel(selectedPriceRange)} <span className="active-chip-close"><X size={11} /></span>
              </span>
            )}
            {searchQuery && searchQuery.length > 0 && (
              <span className="active-chip" onClick={() => setSearchQuery && setSearchQuery('')}>
                <Search size={13} className="chip-svg-icon" /> {searchQuery} <span className="active-chip-close"><X size={11} /></span>
              </span>
            )}
          </div>
          <button type="button" className="clear-all-chip sticky-reset-btn" onClick={resetFilters} title={t('clearAll', 'リセット')}>
            <RotateCcw size={13} className="reset-spin-icon" />
            <span>{t('clearAll', 'リセット')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCcw, MapPin, Train, Target, Briefcase, FileText, Calendar, Clock, Star, ChevronDown, ChevronUp, Check, Search, ShieldCheck } from 'lucide-react';
import CustomMobilePickerModal from '../CustomMobilePickerModal';
import { REGIONS, PREFECTURES, CITIES_BY_PREFECTURE, TRAIN_LINES_BY_PREFECTURE, getAllTrainLines, getAllCities } from '../../data/japanLocationDB';
import { JOB_CATEGORIES } from '../../data/jobCategories';
import { JOB_FEATURES } from '../../data/jobFeatures';

export default function TownworkFilterDrawer({
  isOpen,
  onClose,
  handleResetFilters,
  filteredJobsCount,
  selectedPrefecture,
  setSelectedPrefecture,
  selectedCitiesList,
  setSelectedCitiesList,
  selectedStations,
  setSelectedStations,
  selectedRadius,
  setSelectedRadius,
  selectedJobCategories,
  setSelectedJobCategories,
  selectedLicenses,
  setSelectedLicenses,
  selectedLangLevel,
  setSelectedLangLevel,
  selectedBenefits,
  setSelectedBenefits,
  minSalary,
  setMinSalary,
  selectedEmploymentTypes,
  setSelectedEmploymentTypes,
  selectedDurations,
  setSelectedDurations,
  selectedTimeSlots,
  setSelectedTimeSlots,
  selectedFeatures,
  setSelectedFeatures,
  getJobCategoryLabel,
  getEmploymentLabel,
  getDurationLabel,
  getTimeSlotLabel,
  getFeatureLabel,
  RADIUS_OPTIONS = []
}) {
  const { t } = useTranslation();
  const [isPrefPickerOpen, setIsPrefPickerOpen] = useState(false);
  const [isLocationSectionOpen, setIsLocationSectionOpen] = useState(false);
  const [isStationsSectionOpen, setIsStationsSectionOpen] = useState(false);
  const [isRadiusSectionOpen, setIsRadiusSectionOpen] = useState(false);
  const [isJobCatSectionOpen, setIsJobCatSectionOpen] = useState(false);
  const [isFeatureSectionOpen, setIsFeatureSectionOpen] = useState(false);
  const [expandedCities, setExpandedCities] = useState({ city_sendai: true });
  const [expandedLines, setExpandedLines] = useState({ line_tohoku: true, line_senzan: true });

  if (!isOpen) return null;

  return (
    <div className="filter-drawer-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center' }}>
      <div className="feed-container fade-in hide-scrollbar" style={{ flex: 1, height: '100%', maxHeight: '100%', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '6px 14px 0 14px', boxSizing: 'border-box', position: 'relative' }}>
        
        {/* ONLY Pinned Sticky Back Button (Stays sticky at top: 0, z-index: 300) */}
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 300,
          pointerEvents: 'none',
          marginBottom: '-40px',
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          width: '40px'
        }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              pointerEvents: 'auto',
              width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)', transition: 'transform 0.15s ease', flexShrink: 0
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Scrollable Header Title Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '40px',
          marginBottom: '4px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '900',
            color: 'var(--text-main)',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap'
          }}>
            {t('advancedFilters', '詳細検索')}
          </h3>

          <button 
            type="button" 
            onClick={handleResetFilters}
            style={{
              pointerEvents: 'auto',
              position: 'absolute',
              right: 0,
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(10, 132, 255, 0.08)', border: 'none',
              color: 'var(--primary)', fontWeight: '700', fontSize: '12.5px',
              padding: '6px 12px', borderRadius: '14px', cursor: 'pointer',
              transition: 'all 0.15s ease', flexShrink: 0
            }}
          >
            <RotateCcw size={12} color="var(--primary)" />
            <span>{t('clearAll', 'リセット')}</span>
          </button>
        </div>

        {/* Filter Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Section 1: Cities & Prefecture */}
          <div className="job-category-section" style={{ background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <div 
              className="category-section-header"
              onClick={() => setIsLocationSectionOpen(!isLocationSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('searchByCities', '都道府県・市区町村から探す')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    エリア・勤務地の指定
                  </span>
                </div>
              </div>
              {isLocationSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isLocationSectionOpen && (
              <div style={{ padding: '14px 16px' }}>
                <button 
                  type="button" 
                  className="prefecture-pill-btn" 
                  onClick={() => setIsPrefPickerOpen(true)}
                  style={{ width: '100%', padding: '10px', borderRadius: '14px', background: 'var(--primary)', color: '#FFF', fontWeight: '800', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
                >
                  {selectedPrefecture === 'all' ? t('allPrefectures', '全ての地域 (全国)') : selectedPrefecture} ▾
                </button>
              </div>
            )}
          </div>

          {/* Section 2: License & Category */}
          <div className="job-category-section" style={{ background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <div 
              className="category-section-header"
              onClick={() => setIsJobCatSectionOpen(!isJobCatSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #AF52DE 0%, #5E5CE6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Briefcase size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('searchByJobCategory', '職種・免許から探す')}
                  </span>
                </div>
              </div>
              {isJobCatSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {isJobCatSectionOpen && (
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Mopeda (原付)', 'Kichik truck (準中型)', 'O\'rta truck (中型)', 'Katta truck (大型)', 'Tirkama (牽引)', 'Forklift (フォークリフト)'].map(lic => (
                  <label key={lic} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    <input 
                      type="checkbox"
                      checked={selectedLicenses.includes(lic)}
                      onChange={() => setSelectedLicenses(prev => prev.includes(lic) ? prev.filter(l => l !== lic) : [...prev, lic])}
                    />
                    <span>{lic}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 78px clearance spacer */}
        <div style={{ height: '78px', minHeight: '78px', width: '100%', flexShrink: 0, clear: 'both' }} />

        {/* Floating Search CTA Dock */}
        <div className="floating-search-cta-dock" style={{ position: 'fixed', bottom: '96px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 250 }}>
          <button 
            type="button"
            className="townwork-btn-search-cta"
            onClick={onClose}
            style={{ pointerEvents: 'auto', width: 'calc(100% - 28px)', maxWidth: '792px', padding: '14px 20px', borderRadius: '20px', background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)', color: '#FFF', fontWeight: '900', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(10, 132, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Search size={18} color="#FFF" />
            <span>{t('applyFiltersCTA', 'この条件で検索する ({{count}}件)', { count: filteredJobsCount })}</span>
          </button>
        </div>

        <CustomMobilePickerModal 
          isOpen={isPrefPickerOpen}
          onClose={() => setIsPrefPickerOpen(false)}
          title={t('selectPrefecture', '都道府県を選択')}
          options={[{ value: 'all', label: t('allPrefectures', '全ての地域 (全国)') }, ...PREFECTURES.map(p => ({ value: p.nameEn, label: p.name }))]}
          value={selectedPrefecture}
          onSelect={(val) => { setSelectedPrefecture(val); setIsPrefPickerOpen(false); }}
        />
      </div>
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCcw, Car, MapPin, Sparkles } from 'lucide-react';
import CustomMobilePickerModal from '../CustomMobilePickerModal';
import { PREFECTURES } from '../../data/japanLocationDB';

import AcademyFilterLocationSection from './filters/AcademyFilterLocationSection';
import AcademyFilterStationsSection from './filters/AcademyFilterStationsSection';
import AcademyFilterCoursesSection from './filters/AcademyFilterCoursesSection';
import AcademyFilterStylesSection from './filters/AcademyFilterStylesSection';
import AcademyFilterLangsSection from './filters/AcademyFilterLangsSection';
import AcademyFilterPriceSection from './filters/AcademyFilterPriceSection';
import AcademyFilterFeaturesSection from './filters/AcademyFilterFeaturesSection';
import AcademyFilterFloatingCTA from './filters/AcademyFilterFloatingCTA';

export default function AcademyFilterDrawer({
  isFilterOpen,
  setIsFilterOpen,
  resetFilters,
  activeFilterTab,
  setActiveFilterTab,
  isLocationSectionOpen,
  setIsLocationSectionOpen,
  selectedPrefecture,
  setSelectedPrefecture,
  selectedCitiesList,
  setSelectedCitiesList,
  expandedCities,
  setExpandedCities,
  isPrefPickerOpen,
  setIsPrefPickerOpen,
  isStationsSectionOpen,
  setIsStationsSectionOpen,
  selectedStations,
  setSelectedStations,
  expandedLines,
  setExpandedLines,
  isCourseSectionOpen,
  setIsCourseSectionOpen,
  selectedCourses,
  setSelectedCourses,
  isStyleSectionOpen,
  setIsStyleSectionOpen,
  selectedStyles,
  setSelectedStyles,
  isLangSectionOpen,
  setIsLangSectionOpen,
  selectedLang,
  setSelectedLang,
  isPriceSectionOpen,
  setIsPriceSectionOpen,
  selectedPriceRange,
  setSelectedPriceRange,
  isFeatureSectionOpen,
  setIsFeatureSectionOpen,
  selectedFeatures,
  setSelectedFeatures,
  filteredSchoolsCount
}) {
  const { t } = useTranslation();
  if (!isFilterOpen) return null;

  const toggleMultiSelect = (setter, list, item) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  return (
    <div className="feed-container fade-in hide-scrollbar" style={{ flex: 1, height: '100%', maxHeight: '100%', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 14px 0 14px', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Pinned Sticky Back Button */}
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
          onClick={() => setIsFilterOpen(false)}
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
        height: '40px',
        marginBottom: '14px',
        boxSizing: 'border-box'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16.5px',
          fontWeight: '900',
          color: 'var(--text-main)',
          letterSpacing: '-0.3px',
          whiteSpace: 'nowrap'
        }}>
          {t('schoolFilters', '自動車学校の絞り込み')}
        </h3>

        <button 
          type="button" 
          onClick={resetFilters}
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

      {/* Townwork Signature 3-Tab Header */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[
          { id: 'course', icon: <Car size={15} color={activeFilterTab === 'course' ? '#000000' : 'var(--primary)'} />, label: t('coursesTab', '取得可能免許') },
          { id: 'location', icon: <MapPin size={15} color={activeFilterTab === 'location' ? '#000000' : '#0A84FF'} />, label: t('prefectureTab', '都道府県・地域') },
          { id: 'features', icon: <Sparkles size={15} color={activeFilterTab === 'features' ? '#000000' : '#FF2D55'} />, label: t('perksTab', 'こだわり条件') }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveFilterTab(tab.id);
              if (tab.id === 'course') setIsCourseSectionOpen(true);
              if (tab.id === 'location') setIsLocationSectionOpen(true);
              if (tab.id === 'features') setIsFeatureSectionOpen(true);
            }}
            style={{
              flex: 1, padding: '10px 8px', borderRadius: '14px', border: 'none',
              background: activeFilterTab === tab.id ? '#FFCC00' : 'var(--card-bg)',
              color: activeFilterTab === tab.id ? '#000000' : 'var(--text-secondary)',
              fontWeight: activeFilterTab === tab.id ? '800' : '600', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: activeFilterTab === tab.id ? '0 4px 14px rgba(255, 204, 0, 0.35)' : 'none',
              cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form Sections Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AcademyFilterLocationSection
          isLocationSectionOpen={isLocationSectionOpen}
          setIsLocationSectionOpen={setIsLocationSectionOpen}
          selectedPrefecture={selectedPrefecture}
          setSelectedPrefecture={setSelectedPrefecture}
          selectedCitiesList={selectedCitiesList}
          setSelectedCitiesList={setSelectedCitiesList}
          expandedCities={expandedCities}
          setExpandedCities={setExpandedCities}
          setIsPrefPickerOpen={setIsPrefPickerOpen}
        />

        <AcademyFilterStationsSection
          isStationsSectionOpen={isStationsSectionOpen}
          setIsStationsSectionOpen={setIsStationsSectionOpen}
          selectedPrefecture={selectedPrefecture}
          selectedStations={selectedStations}
          setSelectedStations={setSelectedStations}
          expandedLines={expandedLines}
          setExpandedLines={setExpandedLines}
        />

        <AcademyFilterCoursesSection
          isCourseSectionOpen={isCourseSectionOpen}
          setIsCourseSectionOpen={setIsCourseSectionOpen}
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          toggleMultiSelect={toggleMultiSelect}
        />

        <AcademyFilterStylesSection
          isStyleSectionOpen={isStyleSectionOpen}
          setIsStyleSectionOpen={setIsStyleSectionOpen}
          selectedStyles={selectedStyles}
          setSelectedStyles={setSelectedStyles}
          toggleMultiSelect={toggleMultiSelect}
        />

        <AcademyFilterLangsSection
          isLangSectionOpen={isLangSectionOpen}
          setIsLangSectionOpen={setIsLangSectionOpen}
          selectedLang={selectedLang}
          setSelectedLang={setSelectedLang}
        />

        <AcademyFilterPriceSection
          isPriceSectionOpen={isPriceSectionOpen}
          setIsPriceSectionOpen={setIsPriceSectionOpen}
          selectedPriceRange={selectedPriceRange}
          setSelectedPriceRange={setSelectedPriceRange}
        />

        <AcademyFilterFeaturesSection
          isFeatureSectionOpen={isFeatureSectionOpen}
          setIsFeatureSectionOpen={setIsFeatureSectionOpen}
          selectedFeatures={selectedFeatures}
          setSelectedFeatures={setSelectedFeatures}
          toggleMultiSelect={toggleMultiSelect}
        />
      </div>

      <AcademyFilterFloatingCTA
        filteredSchoolsCount={filteredSchoolsCount}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Custom Mobile Prefecture Picker Modal Sheet */}
      {isPrefPickerOpen && (
        <CustomMobilePickerModal
          isOpen={isPrefPickerOpen}
          onClose={() => setIsPrefPickerOpen(false)}
          title={t('selectPrefecture', '都道府県を選択')}
          options={[
            { value: 'all', label: `📍 ${t('allPrefectures', '全ての地域')}` },
            ...PREFECTURES.map(p => ({
              value: p.nameEn,
              label: `${p.name} (${p.nameEn})`
            }))
          ]}
          selectedValue={selectedPrefecture}
          onSelect={(val) => {
            setSelectedPrefecture(val);
            setIsPrefPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

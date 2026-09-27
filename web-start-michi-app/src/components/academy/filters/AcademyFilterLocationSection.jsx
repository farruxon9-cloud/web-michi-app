import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { PREFECTURES, CITIES_BY_PREFECTURE, getAllCities } from '../../../data/japanLocationDB';

export default function AcademyFilterLocationSection({
  isLocationSectionOpen,
  setIsLocationSectionOpen,
  selectedPrefecture,
  setSelectedPrefecture,
  selectedCitiesList,
  setSelectedCitiesList,
  expandedCities,
  setExpandedCities,
  setIsPrefPickerOpen
}) {
  const { t } = useTranslation();

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsLocationSectionOpen(!isLocationSectionOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#0A84FF15',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MapPin size={18} color="#0A84FF" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('prefectureHeader', '都道府県・市区町村から探す')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedCitiesList.length > 0 
                ? `${selectedCitiesList.length} ${t('selected', '件選択中')}` 
                : (selectedPrefecture === 'all' ? t('allLocations', 'すべての地域') : selectedPrefecture)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedCitiesList.length > 0 && (
            <span style={{
              background: 'var(--primary)', color: '#FFFFFF', fontSize: '11px',
              fontWeight: '800', padding: '2px 8px', borderRadius: '10px'
            }}>
              {selectedCitiesList.length}件
            </span>
          )}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: isLocationSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
          }}>
            <ChevronDown size={16} color="var(--text-secondary)" />
          </div>
        </div>
      </button>

      {isLocationSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)' }}>
          {/* Prefecture Selection Header Card */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px', padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.07) 0%, rgba(94, 92, 230, 0.07) 100%)',
            borderRadius: '16px', border: '1px solid rgba(10, 132, 255, 0.2)',
            boxShadow: '0 4px 14px rgba(10, 132, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(10, 132, 255, 0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <MapPin size={17} color="var(--primary)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {t('targetAreaLabel', '対象エリア (地域)')}
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-main)', marginTop: '1px' }}>
                  {selectedPrefecture === 'all' 
                    ? t('allPrefectures', '全ての地域 (全国)') 
                    : PREFECTURES.find(p => p.nameEn === selectedPrefecture)?.name || selectedPrefecture}
                </span>
              </div>
            </div>

            <button 
              type="button"
              className="prefecture-pill-btn"
              onClick={() => setIsPrefPickerOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                border: 'none', background: 'var(--primary)',
                color: '#FFFFFF', fontWeight: '800', fontSize: '12.5px',
                padding: '7px 14px', borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)',
                transition: 'transform 0.15s ease'
              }}
            >
              <span>{t('change', '変更')}</span>
              <ChevronDown size={14} color="#FFF" />
            </button>
          </div>

          {/* Cities / Wards checkboxes */}
          <div className="tab-cities-wrapper">
            {(() => {
              const prefKey = (selectedPrefecture || 'all').toLowerCase();
              const citiesList = prefKey === 'all' ? getAllCities() : (CITIES_BY_PREFECTURE[prefKey] || []);
              return citiesList.map(city => {
                const isExpanded = !!expandedCities[city.id];
                const hasWards = city.wards && city.wards.length > 0;
                const isCityChecked = selectedCitiesList.includes(city.name);

                return (
                  <div key={city.id} className="townwork-accordion-item">
                    <div className="townwork-accordion-header">
                      <label 
                        className="townwork-checkbox-label"
                        onClick={() => {
                          setSelectedCitiesList(prev => 
                            prev.includes(city.name) ? prev.filter(c => c !== city.name) : [...prev, city.name]
                          );
                        }}
                      >
                        <div className={`townwork-square-checkbox ${isCityChecked ? 'checked' : ''}`}>
                          {isCityChecked && <Check size={14} color="#FFF" />}
                        </div>
                        <span>{city.name}</span>
                      </label>
                      {hasWards && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCities(prev => ({ ...prev, [city.id]: !prev[city.id] }));
                          }}
                          style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      )}
                    </div>

                    {hasWards && isExpanded && (
                      <div className="townwork-accordion-body">
                        {city.wards.map(ward => {
                          const isWardChecked = selectedCitiesList.includes(ward);
                          return (
                            <div 
                              key={ward} 
                              className="townwork-sub-checkbox-item"
                              onClick={() => {
                                setSelectedCitiesList(prev => 
                                  prev.includes(ward) ? prev.filter(w => w !== ward) : [...prev, ward]
                                );
                              }}
                            >
                              <div className={`townwork-square-checkbox ${isWardChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                                {isWardChecked && <Check size={11} color="#FFF" />}
                              </div>
                              <span>{ward}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

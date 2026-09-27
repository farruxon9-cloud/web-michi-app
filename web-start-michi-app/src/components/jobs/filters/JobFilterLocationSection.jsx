import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Train, ChevronDown, ChevronUp, Check } from 'lucide-react';
import CustomMobilePickerModal from '../../CustomMobilePickerModal';
import { PREFECTURES, CITIES_BY_PREFECTURE, TRAIN_LINES_BY_PREFECTURE, getAllTrainLines, getAllCities } from '../../../data/japanLocationDB';

export default function JobFilterLocationSection({
  selectedPrefecture,
  setSelectedPrefecture,
  selectedCitiesList,
  setSelectedCitiesList,
  selectedStations,
  setSelectedStations
}) {
  const { t } = useTranslation();
  const [isPrefPickerOpen, setIsPrefPickerOpen] = useState(false);
  const [isLocationSectionOpen, setIsLocationSectionOpen] = useState(true);
  const [isStationsSectionOpen, setIsStationsSectionOpen] = useState(false);
  const [expandedCities, setExpandedCities] = useState({ city_sendai: true });
  const [expandedLines, setExpandedLines] = useState({ line_tohoku: true, line_senzan: true });

  const prefKey = (selectedPrefecture || 'all').toLowerCase();
  const citiesList = prefKey === 'all' ? getAllCities() : (CITIES_BY_PREFECTURE[prefKey] || []);
  const trainLinesList = prefKey === 'all' ? getAllTrainLines() : (TRAIN_LINES_BY_PREFECTURE[prefKey] || []);

  return (
    <>
      {/* SECTION 1: Prefektura va Shaharlar (市区町村) */}
      <div className="job-category-section" style={{
        background: 'var(--card-bg)', borderRadius: '20px',
        border: selectedCitiesList.length > 0 ? '1px solid rgba(10, 132, 255, 0.4)' : '1px solid var(--glass-border)',
        boxShadow: selectedCitiesList.length > 0 ? '0 8px 24px rgba(10, 132, 255, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden', transition: 'all 0.25s ease'
      }}>
        <div 
          className="category-section-header"
          onClick={() => setIsLocationSectionOpen(!isLocationSectionOpen)}
          style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(10, 132, 255, 0.35)', flexShrink: 0
            }}>
              <MapPin size={20} color="#FFFFFF" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                {t('searchByCities', '都道府県・市区町村から探す')}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                エリア・勤務地の指定
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedCitiesList.length > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', color: '#FFF',
                boxShadow: '0 2px 8px rgba(10, 132, 255, 0.3)'
              }}>
                {selectedCitiesList.length}件
              </span>
            )}
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isLocationSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
            </div>
          </div>
        </div>

        {isLocationSectionOpen && (
          <div style={{ padding: '14px 16px' }}>
            {/* Apple-style Banner Card */}
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
                    対象エリア (地域)
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
                <span>変更</span>
                <ChevronDown size={14} color="#FFF" />
              </button>
            </div>

            {/* Cities & Wards List */}
            <div className="tab-cities-wrapper">
              {citiesList.map(city => {
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
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Bekat va Liniyalar (駅・路線) */}
      <div className="job-category-section" style={{
        background: 'var(--card-bg)', borderRadius: '20px',
        border: selectedStations.length > 0 ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid var(--glass-border)',
        boxShadow: selectedStations.length > 0 ? '0 8px 24px rgba(48, 209, 88, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden', transition: 'all 0.25s ease'
      }}>
        <div 
          className="category-section-header"
          onClick={() => setIsStationsSectionOpen(!isStationsSectionOpen)}
          style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #30D158 0%, #248A3D 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(48, 209, 88, 0.35)', flexShrink: 0
            }}>
              <Train size={20} color="#FFFFFF" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                {t('searchByTrainLines', '沿線・駅から探す')}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                路線・最寄り駅の指定
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedStations.length > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #30D158, #34C759)', color: '#FFF',
                boxShadow: '0 2px 8px rgba(48, 209, 88, 0.3)'
              }}>
                {selectedStations.length}件
              </span>
            )}
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isStationsSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
            </div>
          </div>
        </div>

        {isStationsSectionOpen && (
          <div style={{ padding: '14px 16px' }}>
            <div className="tab-lines-wrapper">
              {trainLinesList.map(line => {
                const isExpanded = !!expandedLines[line.id];
                return (
                  <div key={line.id} className="townwork-accordion-item">
                    <div className="townwork-accordion-header" onClick={() => setExpandedLines(prev => ({ ...prev, [line.id]: !prev[line.id] }))}>
                      <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-main)' }}>{line.name}</span>
                      <div style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="townwork-accordion-body">
                        {line.stations.map(station => {
                          const isStationChecked = selectedStations.includes(station);
                          return (
                            <div 
                              key={station} 
                              className="townwork-sub-checkbox-item"
                              onClick={() => {
                                setSelectedStations(prev => 
                                  prev.includes(station) ? prev.filter(s => s !== station) : [...prev, station]
                                );
                              }}
                            >
                              <div className={`townwork-square-checkbox ${isStationChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                                {isStationChecked && <Check size={11} color="#FFF" />}
                              </div>
                              <span>{station}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CustomMobilePickerModal 
        isOpen={isPrefPickerOpen}
        onClose={() => setIsPrefPickerOpen(false)}
        title={t('selectPrefecture', '都道府県を選択')}
        options={[{ value: 'all', label: t('allPrefectures', '全ての地域 (全国)') }, ...PREFECTURES.map(p => ({ value: p.nameEn, label: p.name }))]}
        value={selectedPrefecture}
        onSelect={(val) => { setSelectedPrefecture(val); setIsPrefPickerOpen(false); }}
      />
    </>
  );
}

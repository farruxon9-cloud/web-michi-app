import React from 'react';
import { useTranslation } from 'react-i18next';
import { Train, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { TRAIN_LINES_BY_PREFECTURE, getAllTrainLines } from '../../../data/japanLocationDB';

export default function AcademyFilterStationsSection({
  isStationsSectionOpen,
  setIsStationsSectionOpen,
  selectedPrefecture,
  selectedStations,
  setSelectedStations,
  expandedLines,
  setExpandedLines
}) {
  const { t } = useTranslation();

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: selectedStations.length > 0 ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid var(--glass-border)',
      boxShadow: selectedStations.length > 0 ? '0 8px 24px rgba(48, 209, 88, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsStationsSectionOpen(!isStationsSectionOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#30D15815',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Train size={18} color="#30D158" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('searchByStations', '沿線・駅から探す')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedStations.length === 0 ? t('allStations', '路線名・最寄り駅の指定') : `${selectedStations.length} ${t('selected', '件選択中')}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedStations.length > 0 && (
            <span style={{
              background: '#30D158', color: '#FFFFFF', fontSize: '11px',
              fontWeight: '800', padding: '2px 8px', borderRadius: '10px'
            }}>
              {selectedStations.length}件
            </span>
          )}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: isStationsSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
          }}>
            <ChevronDown size={16} color="var(--text-secondary)" />
          </div>
        </div>
      </button>

      {isStationsSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)' }}>
          <div className="tab-stations-wrapper">
            {(() => {
              const prefKey = (selectedPrefecture || 'all').toLowerCase();
              const linesList = prefKey === 'all' ? getAllTrainLines() : (TRAIN_LINES_BY_PREFECTURE[prefKey] || []);
              return linesList.map(line => {
                const isExpanded = !!expandedLines[line.id];
                const isLineSelected = line.stations.length > 0 && line.stations.every(st => selectedStations.includes(st));

                return (
                  <div key={line.id} className="townwork-accordion-item">
                    <div className="townwork-accordion-header">
                      <label 
                        className="townwork-checkbox-label"
                        onClick={() => {
                          if (isLineSelected) {
                            setSelectedStations(prev => prev.filter(st => !line.stations.includes(st)));
                          } else {
                            setSelectedStations(prev => Array.from(new Set([...prev, ...line.stations])));
                          }
                        }}
                      >
                        <div className={`townwork-square-checkbox ${isLineSelected ? 'checked' : ''}`}>
                          {isLineSelected && <Check size={14} color="#FFF" />}
                        </div>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: line.color, boxShadow: `0 0 6px ${line.color}` }} />
                        <span>{line.name}</span>
                      </label>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLines(prev => ({ ...prev, [line.id]: !prev[line.id] }));
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="townwork-accordion-body">
                        {line.stations.map(st => {
                          const isStChecked = selectedStations.includes(st);
                          return (
                            <div 
                              key={st} 
                              className="townwork-sub-checkbox-item"
                              onClick={() => {
                                setSelectedStations(prev => 
                                  prev.includes(st) ? prev.filter(item => item !== st) : [...prev, st]
                                );
                              }}
                            >
                              <div className={`townwork-square-checkbox ${isStChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                                {isStChecked && <Check size={11} color="#FFF" />}
                              </div>
                              <span>{st}</span>
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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, ChevronDown, ChevronUp, Check, ShieldCheck } from 'lucide-react';
import { JOB_CATEGORIES } from '../../../data/jobCategories';

export default function JobFilterCategorySection({
  selectedJobCategories,
  setSelectedJobCategories,
  selectedLicenses,
  setSelectedLicenses,
  getJobCategoryLabel
}) {
  const { t } = useTranslation();
  const [isJobCatSectionOpen, setIsJobCatSectionOpen] = useState(true);
  const [expandedJobCats, setExpandedJobCats] = useState({});

  const DRIVER_LICENSES = [
    'Mopeda (原付)',
    'Kichik truck (準中型)',
    'O\'rta truck (中型)',
    'Katta truck (大型)',
    'Tirkama (牽引)',
    'Forklift (フォークリフト)'
  ];

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '20px',
      border: (selectedJobCategories.length > 0 || selectedLicenses.length > 0) ? '1px solid rgba(175, 82, 222, 0.4)' : '1px solid var(--glass-border)',
      boxShadow: (selectedJobCategories.length > 0 || selectedLicenses.length > 0) ? '0 8px 24px rgba(175, 82, 222, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden', transition: 'all 0.25s ease'
    }}>
      <div 
        className="category-section-header"
        onClick={() => setIsJobCatSectionOpen(!isJobCatSectionOpen)}
        style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #AF52DE 0%, #5E5CE6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(175, 82, 222, 0.35)', flexShrink: 0
          }}>
            <Briefcase size={20} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
              {t('searchByJobCategory', '職種・免許から探す')}
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
              職種・必要な資格の指定
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(selectedJobCategories.length + selectedLicenses.length) > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #AF52DE, #5E5CE6)', color: '#FFF',
              boxShadow: '0 2px 8px rgba(175, 82, 222, 0.3)'
            }}>
              {selectedJobCategories.length + selectedLicenses.length}件
            </span>
          )}
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isJobCatSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
          </div>
        </div>
      </div>

      {isJobCatSectionOpen && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Driver Licenses Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              🪪 {t('driverLicensesFilter', '運転免許・資格')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DRIVER_LICENSES.map(lic => {
                const isChecked = selectedLicenses.includes(lic);
                return (
                  <button
                    key={lic}
                    type="button"
                    onClick={() => {
                      setSelectedLicenses(prev => 
                        prev.includes(lic) ? prev.filter(l => l !== lic) : [...prev, lic]
                      );
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                      border: isChecked ? '1.5px solid #AF52DE' : '1px solid var(--glass-border)',
                      background: isChecked ? 'rgba(175, 82, 222, 0.12)' : 'var(--card-bg)',
                      color: isChecked ? '#AF52DE' : 'var(--text-main)',
                      fontWeight: isChecked ? '800' : '600', fontSize: '12.5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ShieldCheck size={14} color={isChecked ? '#AF52DE' : 'var(--text-secondary)'} />
                    <span>{lic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Categories Accordion */}
          <div className="tab-cities-wrapper" style={{ marginTop: '6px' }}>
            {JOB_CATEGORIES.map(cat => {
              const isCatChecked = selectedJobCategories.includes(cat.id);
              const isExpanded = !!expandedJobCats[cat.id];
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;

              return (
                <div key={cat.id} className="townwork-accordion-item">
                  <div className="townwork-accordion-header">
                    <label 
                      className="townwork-checkbox-label"
                      onClick={() => {
                        setSelectedJobCategories(prev => 
                          prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                        );
                      }}
                    >
                      <div className={`townwork-square-checkbox ${isCatChecked ? 'checked' : ''}`}>
                        {isCatChecked && <Check size={14} color="#FFF" />}
                      </div>
                      <span>{getJobCategoryLabel ? getJobCategoryLabel(cat.id) : cat.name}</span>
                    </label>
                    {hasSubs && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedJobCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }));
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    )}
                  </div>

                  {hasSubs && isExpanded && (
                    <div className="townwork-accordion-body">
                      {cat.subcategories.map(sub => {
                        const isSubChecked = selectedJobCategories.includes(sub.id);
                        return (
                          <div 
                            key={sub.id} 
                            className="townwork-sub-checkbox-item"
                            onClick={() => {
                              setSelectedJobCategories(prev => 
                                prev.includes(sub.id) ? prev.filter(s => s !== sub.id) : [...prev, sub.id]
                              );
                            }}
                          >
                            <div className={`townwork-square-checkbox ${isSubChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                              {isSubChecked && <Check size={11} color="#FFF" />}
                            </div>
                            <span>{getJobCategoryLabel ? getJobCategoryLabel(sub.id) : sub.name}</span>
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
  );
}

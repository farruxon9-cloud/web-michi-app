import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ChevronDown, ChevronUp, Banknote } from 'lucide-react';
import { JOB_FEATURES } from '../../../data/jobFeatures';

export default function JobFilterConditionsSection({
  minSalary,
  setMinSalary,
  selectedEmploymentTypes,
  setSelectedEmploymentTypes,
  selectedFeatures,
  setSelectedFeatures,
  getFeatureLabel
}) {
  const { t } = useTranslation();
  const [isFeatureSectionOpen, setIsFeatureSectionOpen] = useState(true);

  const SALARY_OPTIONS = [
    { value: 0, label: 'すべて (Cheklovsiz)' },
    { value: 200000, label: '200,000円〜 (Oyiga)' },
    { value: 250000, label: '250,000円〜 (Oyiga)' },
    { value: 300000, label: '300,000円〜 (Oyiga)' },
    { value: 350000, label: '350,000円〜 (Oyiga)' },
    { value: 400000, label: '400,000円〜 (Oyiga)' }
  ];

  const EMPLOYMENT_TYPES = [
    { id: 'fulltime', label: '正社員 (To\'liq stavka)' },
    { id: 'parttime', label: 'アルバイト (Soatbay)' },
    { id: 'contract', label: '契約社員 (Shartnoma)' }
  ];

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '20px',
      border: (selectedFeatures.length > 0 || minSalary > 0 || selectedEmploymentTypes.length > 0) ? '1px solid rgba(255, 149, 0, 0.4)' : '1px solid var(--glass-border)',
      boxShadow: (selectedFeatures.length > 0 || minSalary > 0 || selectedEmploymentTypes.length > 0) ? '0 8px 24px rgba(255, 149, 0, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden', transition: 'all 0.25s ease'
    }}>
      <div 
        className="category-section-header"
        onClick={() => setIsFeatureSectionOpen(!isFeatureSectionOpen)}
        style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 149, 0, 0.35)', flexShrink: 0
          }}>
            <Star size={20} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
              {t('searchByConditions', 'こだわり条件・給与から探す')}
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
              給与・特定技能・福利厚生の指定
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(selectedFeatures.length + (minSalary > 0 ? 1 : 0) + selectedEmploymentTypes.length) > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF9500, #FF3B30)', color: '#FFF',
              boxShadow: '0 2px 8px rgba(255, 149, 0, 0.3)'
            }}>
              {selectedFeatures.length + (minSalary > 0 ? 1 : 0) + selectedEmploymentTypes.length}件
            </span>
          )}
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isFeatureSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
          </div>
        </div>
      </div>

      {isFeatureSectionOpen && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Minimum Salary Option 2-Column Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              💰 {t('minSalaryFilterLabel', '希望月給 (Minimal maosh)')}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {SALARY_OPTIONS.map(opt => {
                const isSelected = minSalary === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMinSalary(opt.value)}
                    style={{
                      padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                      border: isSelected ? '1.5px solid #FF9500' : '1px solid var(--glass-border)',
                      background: isSelected ? 'rgba(255, 149, 0, 0.12)' : 'var(--card-bg)',
                      color: isSelected ? '#FF9500' : 'var(--text-main)',
                      fontWeight: isSelected ? '800' : '600', fontSize: '12.5px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Banknote size={14} color={isSelected ? '#FF9500' : 'var(--text-secondary)'} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employment Type Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              💼 {t('employmentTypeLabel', '雇用形態 (Ish shakli)')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMPLOYMENT_TYPES.map(emp => {
                const isChecked = selectedEmploymentTypes.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmploymentTypes(prev => 
                        prev.includes(emp.id) ? prev.filter(e => e !== emp.id) : [...prev, emp.id]
                      );
                    }}
                    style={{
                      padding: '8px 14px', borderRadius: '12px', cursor: 'pointer',
                      border: isChecked ? '1.5px solid #0A84FF' : '1px solid var(--glass-border)',
                      background: isChecked ? 'rgba(10, 132, 255, 0.12)' : 'var(--card-bg)',
                      color: isChecked ? '#0A84FF' : 'var(--text-main)',
                      fontWeight: isChecked ? '800' : '600', fontSize: '12.5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{emp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Features Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              ✨ {t('specialFeaturesLabel', '特徴・福利厚生 (Maxsus sharoitlar)')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(JOB_FEATURES || []).map(feat => {
                const isChecked = selectedFeatures.includes(feat.id);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => {
                      setSelectedFeatures(prev => 
                        prev.includes(feat.id) ? prev.filter(f => f !== feat.id) : [...prev, feat.id]
                      );
                    }}
                    style={{
                      padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                      border: isChecked ? '1.5px solid var(--primary)' : '1px solid var(--glass-border)',
                      background: isChecked ? 'rgba(94, 92, 230, 0.15)' : 'var(--card-bg)',
                      color: isChecked ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isChecked ? '800' : '600', fontSize: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{getFeatureLabel ? getFeatureLabel(feat.id) : feat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

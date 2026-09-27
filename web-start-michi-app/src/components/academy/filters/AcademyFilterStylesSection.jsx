import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Building2, Clock, Globe, ChevronDown } from 'lucide-react';

export default function AcademyFilterStylesSection({
  isStyleSectionOpen,
  setIsStyleSectionOpen,
  selectedStyles,
  setSelectedStyles,
  toggleMultiSelect
}) {
  const { t } = useTranslation();

  const styleOptions = [
    { id: 'Tsugaku', icon: <Building2 size={15} />, name: t('style_tsugaku', '通学コース') },
    { id: 'Gashuku', icon: <GraduationCap size={15} />, name: t('style_gashuku', '合宿免許') },
    { id: 'ShortTerm', icon: <Clock size={15} />, name: t('style_shortterm', '短期集中コース') },
    { id: 'OnlineTheory', icon: <Globe size={15} />, name: t('style_onlinetheory', 'オンライン学科対応') }
  ];

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsStyleSectionOpen(!isStyleSectionOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#FF950015',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GraduationCap size={18} color="#FF9500" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('trainingStyleHeader', '教習スタイル・受講形態')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedStyles.length === 0 ? t('allStyles', 'すべての受講形態') : `${selectedStyles.length} ${t('selected', '件選択中')}`}
            </p>
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isStyleSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
        }}>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
      </button>

      {isStyleSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {styleOptions.map(s => {
            const isSelected = selectedStyles.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleMultiSelect(setSelectedStyles, selectedStyles, s.id)}
                style={{
                  padding: '8px 12px', borderRadius: '12px', border: isSelected ? '1px solid #FF9500' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(255, 149, 0, 0.12)' : 'var(--glass-bg)',
                  color: isSelected ? '#FF9500' : 'var(--text-main)',
                  fontWeight: isSelected ? '800' : '600', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {s.icon}
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

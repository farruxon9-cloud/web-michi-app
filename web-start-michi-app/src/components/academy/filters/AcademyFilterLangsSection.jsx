import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export default function AcademyFilterLangsSection({
  isLangSectionOpen,
  setIsLangSectionOpen,
  selectedLang,
  setSelectedLang
}) {
  const { t } = useTranslation();

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsLangSectionOpen(!isLangSectionOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#AF52DE15',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Globe size={18} color="#AF52DE" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('languageHeader', '授業言語・通訳サポート')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedLang === 'all' ? t('allLanguages', 'すべての言語') : selectedLang}
            </p>
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isLangSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
        }}>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
      </button>

      {isLangSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { id: 'all', label: t('allLanguages', 'すべての言語'), fullWidth: true },
            { id: 'UZ', label: t('lang_uz', "ウズベク語 (UZ)") },
            { id: 'JP', label: t('lang_jp', '日本語 (JP)') },
            { id: 'EN', label: t('lang_en', '英語 (EN)') },
            { id: 'RU', label: t('lang_ru', 'ロシア語 (RU)') }
          ].map(l => {
            const isSelected = selectedLang === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedLang(l.id)}
                style={{
                  gridColumn: l.fullWidth ? 'span 2' : 'span 1',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: isSelected ? '1.5px solid #AF52DE' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(175, 82, 222, 0.12)' : 'var(--card-bg)',
                  color: isSelected ? '#AF52DE' : 'var(--text-main)',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '12.5px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(175, 82, 222, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.15s ease'
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

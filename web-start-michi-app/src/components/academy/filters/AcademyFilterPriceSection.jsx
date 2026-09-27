import React from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, ChevronDown } from 'lucide-react';

export default function AcademyFilterPriceSection({
  isPriceSectionOpen,
  setIsPriceSectionOpen,
  selectedPriceRange,
  setSelectedPriceRange
}) {
  const { t } = useTranslation();

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsPriceSectionOpen(!isPriceSectionOpen)}
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
            <Banknote size={18} color="#30D158" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('priceHeader', '受講料・価格帯')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedPriceRange === 'all' ? t('allPrices', 'すべての価格帯') : selectedPriceRange}
            </p>
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isPriceSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
        }}>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
      </button>

      {isPriceSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { id: 'all', label: t('allPrices', 'すべての価格帯'), fullWidth: true },
            { id: 'under250k', label: '~¥250,000' },
            { id: '250k_300k', label: '¥250,000 ~ ¥300,000' },
            { id: '300k_350k', label: '¥300,000 ~ ¥350,000' },
            { id: 'over350k', label: '¥350,000~' }
          ].map(p => {
            const isSelected = selectedPriceRange === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPriceRange(p.id)}
                style={{
                  gridColumn: p.fullWidth ? 'span 2' : 'span 1',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: isSelected ? '1.5px solid #30D158' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(48, 209, 88, 0.12)' : 'var(--card-bg)',
                  color: isSelected ? '#30D158' : 'var(--text-main)',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '12.5px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(48, 209, 88, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Truck, Bus, Layers, Award, ChevronDown } from 'lucide-react';

export default function AcademyFilterCoursesSection({
  isCourseSectionOpen,
  setIsCourseSectionOpen,
  selectedCourses,
  setSelectedCourses,
  toggleMultiSelect
}) {
  const { t } = useTranslation();

  const courseOptions = [
    { id: 'Futsu', icon: <Car size={15} />, name: t('lic_futsu', '普通自動車') },
    { id: 'Oogata', icon: <Truck size={15} />, name: t('lic_oogata', '大型自動車') },
    { id: 'Chugata', icon: <Truck size={15} />, name: t('lic_chugata', '中型自動車') },
    { id: 'JunChugata', icon: <Truck size={15} />, name: t('lic_junchugata', '準中型自動車') },
    { id: 'FutsuNishu', icon: <Car size={15} />, name: t('lic_futsunishu', '普通二種 (タクシー)') },
    { id: 'OogataNishu', icon: <Bus size={15} />, name: t('lic_oogatanishu', '大型二種 (バス)') },
    { id: 'Forklift', icon: <Layers size={15} />, name: t('lic_forklift', 'フォークリフト') },
    { id: 'Tokushu', icon: <Award size={15} />, name: t('lic_tokushu', '大型特殊') },
    { id: 'Nirin', icon: <Car size={15} />, name: t('lic_nirin', '自動二輪車') }
  ];

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsCourseSectionOpen(!isCourseSectionOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#34C75915',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Car size={18} color="#34C759" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('coursesOfferedHeader', '取得希望の免許・コース')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedCourses.length === 0 ? t('allCourses', 'すべてのコース') : `${selectedCourses.length} ${t('selected', '件選択中')}`}
            </p>
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isCourseSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
        }}>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
      </button>

      {isCourseSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {courseOptions.map(c => {
            const isSelected = selectedCourses.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleMultiSelect(setSelectedCourses, selectedCourses, c.id)}
                style={{
                  padding: '8px 12px', borderRadius: '12px', border: isSelected ? '1px solid #0A84FF' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(10, 132, 255, 0.12)' : 'var(--glass-bg)',
                  color: isSelected ? '#0A84FF' : 'var(--text-main)',
                  fontWeight: isSelected ? '800' : '600', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {c.icon}
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, Briefcase, Sparkles, Filter, CheckCircle2, Truck, ShieldCheck, MapPin } from 'lucide-react';
import DriverFeed from '../../../components/DriverFeed';
import { AppleLogoIcon } from './HomeMacOS';
import './JobsMacOS.css';
import { pickText } from '../../../utils/localize';

export default function JobsMacOS(props) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const QUICK_DESKTOP_FILTERS = [
    { id: 'all', icon: <Briefcase size={16} />, label: t('filterAllJobs', 'Barcha Ishlar'), labelJa: 'すべての求人' },
    { id: 'tokutei_ginou', icon: <Sparkles size={16} />, label: t('filterTokuteiGinou', 'Tokutei Ginou'), labelJa: '特定技能' },
    { id: 'fulltime', icon: <CheckCircle2 size={16} />, label: t('filterFullTime', 'Doimiy Xodim'), labelJa: '正社員' },
    { id: 'truck', icon: <Truck size={16} />, label: t('filterHeavyTruck', 'Yuk Mashinasi'), labelJa: 'トラック運転手' },
    { id: 'high_salary', icon: <ShieldCheck size={16} />, label: t('filterHighSalary', 'Yuqori Maosh (¥250k+)'), labelJa: '高収入・月給25万〜' }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.jobs-search-input, .feed-search-input, input[type="text"]');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="macos-jobs-container fade-in hide-scrollbar">
      {/* 🍎 macOS Native Seamless Titlebar Header */}
      <div className="macos-titlebar-header">
        <div className="macos-traffic-lights">
          <span className="macos-traffic-dot macos-close" title="Close (Cmd+W)" />
          <span className="macos-traffic-dot macos-minimize" title="Minimize (Cmd+M)" />
          <span className="macos-traffic-dot macos-maximize" title="Maximize (Cmd+Ctrl+F)" />
        </div>
        <div className="macos-titlebar-title">
          <AppleLogoIcon /> 求人情報 — Michi Jobs Desktop (macOS)
        </div>
        <div className="macos-platform-badge">
          <span> macOS Native • Cmd+F Search</span>
        </div>
      </div>

      {/* Desktop macOS Split Layout */}
      <div className="macos-jobs-split-body">
        
        {/* macOS Left Quick Filter Sidebar */}
        <aside className="macos-jobs-sidebar">
          <div className="macos-sidebar-section-title">
            <Filter size={14} />
            <span>{pickText(currentLang, { ja: 'クイック条件', uz: 'Tezkor Filtrlar', en: 'Quick Filters', ru: 'Быстрые фильтры', zh: '快速筛选', vi: 'Bộ lọc nhanh', ne: 'द्रुत फिल्टर' })}</span>
          </div>

          <div className="macos-sidebar-filter-list">
            {QUICK_DESKTOP_FILTERS.map(item => (
              <button
                key={item.id}
                className={`macos-sidebar-filter-item ${activeCategoryFilter === item.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter(item.id)}
              >
                <span className="macos-filter-icon">{item.icon}</span>
                <span className="macos-filter-label">{currentLang === 'ja' ? item.labelJa : item.label}</span>
              </button>
            ))}
          </div>

          <div className="macos-sidebar-footer-info">
            <MapPin size={13} />
            <span>47 都道府県対応</span>
          </div>
        </aside>

        {/* macOS Main Jobs Feed Canvas */}
        <main className="macos-jobs-feed-wrapper">
          <DriverFeed {...props} />
        </main>
      </div>
    </div>
  );
}

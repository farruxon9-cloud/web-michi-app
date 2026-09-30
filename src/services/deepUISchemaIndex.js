/**
 * 🔬 Michi AI — Ultra-Deep UI Element & Input Field Schema Index
 * 
 * Provides microscopic, element-level inspection data for every section, modal,
 * input field, state prop, button, dropdown, and filter control across all pages.
 */

export const DEEP_UI_ELEMENT_SCHEMA = Object.freeze({
  // 1. HOME DASHBOARD DEEP FIELDS
  home: {
    header: {
      langSwitcher: {
        type: 'button_group',
        selector: '.lang-switcher',
        values: ['uz', 'ja', 'en', 'ru', 'zh'],
        labels: {
          uz: "Tilni o'zgartirish (O'zbek/Yapon/Ingliz/Rus/Xitoy)",
          ja: '言語切替 (日本語/ウズベク語/英語/ロシア語/中国語)',
          en: 'Language Switcher',
          ru: 'Переключение языка',
          zh: '语言切换'
        },
        action: 'CYCLE_LANGUAGE'
      },
      darkModeToggle: {
        type: 'toggle_switch',
        selector: '.theme-toggle-btn',
        stateProp: 'darkMode',
        labels: { uz: 'Tungi/Kunduzgi rejim', ja: 'ダークモード切替', en: 'Dark Mode Toggle', ru: 'Тёмнаяテーマ', zh: '深色模式' },
        action: 'TOGGLE_DARK_MODE'
      },
      aiButton: {
        type: 'floating_avatar_button',
        selector: '.voice-assistant-trigger',
        labels: { uz: 'AI Voice Assistant (Ovozli yordamchi)', ja: 'AI音声アシスタント', en: 'AI Voice Assistant', ru: 'Голосовой ИИ', zh: '语音助手' }
      }
    },
    quickCategoryCards: {
      driverJobsCard: {
        targetTab: 'jobs',
        label: { uz: "Vakansiyalar (Haydovchilik ishlari)", ja: 'トラック求人一覧', en: 'Driver Vacancies', ru: 'Вакансии водителей', zh: '货车司机招聘' },
        action: 'NAVIGATE_TO_JOBS'
      },
      drivingSchoolsCard: {
        targetTab: 'academy',
        label: { uz: "Avtomaktablar (Litsenziya kurslari)", ja: '教習所・アカデミー', en: 'Driving Schools', ru: 'Автошколы', zh: '驾校课程' },
        action: 'NAVIGATE_TO_ACADEMY'
      },
      companyAdsCard: {
        targetTab: 'company',
        label: { uz: "Kompaniya E'lonlarim (マイ掲載一覧)", ja: 'マイ掲載一覧・企業管理', en: 'My Posted Ads', ru: 'Мои объявления', zh: '企业招聘管理' },
        action: 'NAVIGATE_TO_MY_ADS'
      },
      utilityToolsCard: {
        targetTab: 'tools',
        label: { uz: "Asboblar & Maosh kalkulyatori", ja: '便利ツール・給与計算機', en: 'Utility Tools', ru: 'Полезные инструменты', zh: '实用工具与薪资计算' },
        action: 'NAVIGATE_TO_TOOLS'
      }
    },
    radioPlayer: {
      controls: {
        playPauseBtn: { selector: '.music-play-btn', action: 'MUSIC_PLAY / MUSIC_PAUSE' },
        nextTrackBtn: { selector: '.music-next-btn', action: 'MUSIC_NEXT' },
        prevTrackBtn: { selector: '.music-prev-btn', action: 'MUSIC_PREV' },
        volumeSlider: { selector: '.music-volume-slider', type: 'range', range: [0, 100] }
      }
    }
  },

  // 2. DRIVER JOBS FEED DEEP FIELDS
  jobs: {
    searchSection: {
      searchInput: {
        type: 'text_input',
        selector: '.job-search-input',
        stateProp: 'jobSearchQuery',
        placeholder: { uz: "Kompaniya nomi yoki shahar (masalan: Tokyo)...", ja: '会社名や勤務地（例：東京、大阪）...', en: 'Search location or company...', ru: 'Поиск по гороdu или компании...', zh: '搜索地点或公司...' }
      },
      resetBtn: {
        type: 'button',
        selector: '.reset-filters-btn',
        action: 'RESET_JOB_FILTERS'
      }
    },
    filtersModal: {
      prefecturePicker: {
        type: 'modal_picker',
        stateProp: 'selectedPrefecture',
        options: ['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Osaka', 'Kyoto', 'Aichi', 'Fukuoka', 'Hokkaido', 'Okinawa'],
        action: 'FILTER_JOBS(prefecture)'
      },
      licenseMultiSelect: {
        type: 'checkbox_group',
        stateProp: 'selectedLicenses',
        options: [
          { code: '普通', label: { uz: 'Oddiy haydovchilik (Ordinary)', ja: '普通免許', en: 'Ordinary License' } },
          { code: '準中型', label: { uz: 'Kichik yuk (Semi-Medium)', ja: '準中型免許', en: 'Semi-Medium License' } },
          { code: '中型', label: { uz: "O'rta yuk (Medium Truck)", ja: '中型免許', en: 'Medium License' } },
          { code: '大型', label: { uz: 'Katta yuk (Heavy Truck)', ja: '大型免許', en: 'Heavy License' } },
          { code: '牽引', label: { uz: 'Tirkamali (Towing/Trailer)', ja: '牽引免許', en: 'Towing License' } }
        ],
        action: 'FILTER_JOBS(licenses)'
      },
      salaryRangeSlider: {
        type: 'range_slider',
        stateProp: 'minSalary',
        range: [200000, 600000],
        step: 10000,
        unit: 'JPY',
        labels: { uz: "Eng kam oylik maosh (yen)", ja: '最低月給 (円)', en: 'Min Salary (JPY)', ru: 'Мин. зарплата (иен)', zh: '最低月薪 (日元)' },
        action: 'FILTER_JOBS(minSalary)'
      },
      segmentTabs: {
        type: 'tab_group',
        stateProp: 'jobActiveSegment',
        options: [
          { id: 'all', label: { uz: 'Barchasi', ja: 'すべて', en: 'All' } },
          { id: 'permanent', label: { uz: "Doimiy ish (正社員)", ja: '正社員', en: 'Full-time' } },
          { id: 'hourly', label: { uz: "Soatbay (アルバイト)", ja: 'アルバイト', en: 'Part-time' } },
          { id: 'tokutei', label: { uz: "Tokutei Ginou (特定技能)", ja: '特定技能', en: 'Specified Skilled' } }
        ]
      }
    },
    jobCardFields: {
      companyName: { path: 'job.companyName', type: 'text' },
      salary: { path: 'job.salary', type: 'currency_jpy' },
      location: { path: 'job.prefecture', type: 'badge' },
      requiredLicense: { path: 'job.license', type: 'badge' },
      hasHousing: { path: 'job.housingProvided', type: 'boolean_tag', label: { uz: 'Yotoqxona mavjud', ja: '寮完備', en: 'Dormitory Provided' } },
      acceptsForeigners: { path: 'job.acceptsForeigners', type: 'boolean_tag', label: { uz: 'Chet elliklar uchun mos', ja: '外国人歓迎', en: 'Foreigners Welcome' } },
      applyBtn: { type: 'action_button', action: 'APPLY_JOB(jobId)' }
    }
  },

  // 3. ACADEMY & DRIVING SCHOOL DEEP FIELDS
  academy: {
    searchSection: {
      searchInput: { 
        type: 'text_input', 
        stateProp: 'schoolSearchQuery',
        placeholder: { uz: "Avtomaktab qidirish...", ja: '教習所を検索...', en: 'Search driving school...' }
      },
      licenseFilter: { 
        type: 'select', 
        stateProp: 'schoolLicenseFilter',
        options: ['all', '普通', '中型', '大型', '二種']
      }
    }
  },

  // 4. UTILITY TOOLS & CALCULATORS DEEP FIELDS
  tools: {
    salaryCalculator: {
      hourlyRateInput: { type: 'number_input', stateProp: 'calcHourlyRate', unit: 'JPY' },
      hoursPerDayInput: { type: 'number_input', stateProp: 'calcDailyHours', default: 8 },
      daysPerMonthInput: { type: 'number_input', stateProp: 'calcMonthlyDays', default: 22 },
      taxDeductionToggle: { type: 'toggle', stateProp: 'calcIncludeTax', default: true }
    },
    licenseConverter: {
      originCountrySelect: { type: 'select', stateProp: 'converterOriginCountry' },
      checkRequirementsBtn: { type: 'button', action: 'CHECK_LICENSE_REQUIREMENTS' }
    }
  },

  // 5. COMPANY DASHBOARD & MY ADS DEEP FIELDS
  company: {
    myAdsSection: {
      postNewAdBtn: {
        type: 'button',
        selector: '.post-new-ad-btn',
        label: { uz: "Yangi e'lon joylashtirish", ja: '新規求人を投稿する', en: 'Post New Job' },
        action: 'POST_NEW_JOB'
      },
      adCardItems: {
        title: { path: 'ad.title' },
        status: { path: 'ad.status', options: ['active', 'paused', 'expired'] },
        applicantsCount: { path: 'ad.applicantsCount' },
        editBtn: { type: 'button', action: 'EDIT_JOB_AD(adId)' },
        pauseBtn: { type: 'button', action: 'TOGGLE_AD_STATUS(adId)' }
      }
    }
  },

  // 6. USER PROFILE DEEP FIELDS
  profile: {
    mainView: {
      progressCompletionBar: { type: 'progress', stateProp: 'profileCompletionPercent' },
      editProfileBtn: { type: 'button', action: 'NAVIGATE_TO_PERSONAL_INFO' },
      applicationsHistoryLink: { type: 'link', action: 'NAVIGATE_TO_MY_APPLICATIONS' }
    },
    personalInfoFields: {
      fullNameInput: { stateProp: 'profileData.fullName', type: 'text' },
      phoneInput: { stateProp: 'profileData.phone', type: 'tel' },
      addressInput: { stateProp: 'profileData.address', type: 'text' },
      licenseCheckboxes: { stateProp: 'profileData.licenses', type: 'multi_select' },
      visaSelect: { stateProp: 'profileData.visaType', options: ['Tokutei Ginou', 'Permanent Resident', 'Spouse', 'Student', 'Other'] }
    }
  }
});

class DeepUISchemaService {
  /**
   * Get microscopic element details for a specific section or field
   * @param {string} tab 
   * @param {string} section 
   */
  getDeepSectionFields(tab, section) {
    if (!tab || !section) return null;
    const cleanTab = tab.toLowerCase().trim();
    const pageSchema = DEEP_UI_ELEMENT_SCHEMA[cleanTab];
    if (!pageSchema) return null;
    return pageSchema[section] || null;
  }

  /**
   * Get localized label string for a field object safely
   * @param {Object} fieldObj 
   * @param {string} lang 
   */
  getFieldLabel(fieldObj, lang = 'uz') {
    if (!fieldObj || (!fieldObj.label && !fieldObj.labels)) return '';
    const labelsMap = fieldObj.labels || fieldObj.label;
    if (typeof labelsMap === 'string') return labelsMap;
    if (typeof labelsMap !== 'object') return '';

    const cleanLang = (lang || 'uz').substring(0, 2).toLowerCase();
    return labelsMap[cleanLang] || labelsMap.uz || labelsMap.ja || labelsMap.en || '';
  }

  /**
   * Summarize available input fields and controls for LLM context (Token-Optimized)
   * @param {string} activeTab 
   * @param {string} lang 
   */
  getDeepContextSummary(activeTab, lang = 'ja') {
    if (!activeTab) return '';
    const cleanTab = activeTab.toLowerCase().trim();
    const pageSchema = DEEP_UI_ELEMENT_SCHEMA[cleanTab];
    if (!pageSchema) return '';

    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    let summary = `🔬 CHUQUR EKRAN BOSHQARUVI (${cleanTab.toUpperCase()}):\n`;

    for (const [sectionKey, sectionObj] of Object.entries(pageSchema)) {
      summary += `  📌 Bo'lim: [${sectionKey}]\n`;
      for (const [fieldKey, fieldObj] of Object.entries(sectionObj)) {
        if (!fieldObj || typeof fieldObj !== 'object') continue;

        const label = this.getFieldLabel(fieldObj, cleanLang);
        const type = fieldObj.type || 'element';
        const action = fieldObj.action ? ` -> Action: ${fieldObj.action}` : '';
        const prop = fieldObj.stateProp ? ` (state: ${fieldObj.stateProp})` : '';

        summary += `    • ${fieldKey} [${type}]${prop}${label ? `: "${label}"` : ''}${action}\n`;
      }
    }

    return summary;
  }
}

export const deepUISchemaIndex = new DeepUISchemaService();

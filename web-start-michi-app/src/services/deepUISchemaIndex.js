/**
 * 🔬 Michi AI — Ultra-Deep UI Element & Input Field Schema Index
 * 
 * Provides microscopic, element-level inspection data for every section, modal,
 * input field, state prop, button, dropdown, and filter control across all pages.
 */

export const DEEP_UI_ELEMENT_SCHEMA = {
  // 1. HOME DASHBOARD DEEP FIELDS
  home: {
    header: {
      langSwitcher: {
        type: 'button_group',
        selector: '.lang-switcher',
        values: ['uz', 'ja', 'en'],
        labels: { uz: "Tilni o'zgartirish (O'zbek/Yapon/Ingliz)", ja: '言語切替 (日本語/ウズベク語/英語)', en: 'Language Switcher' },
        action: 'CYCLE_LANGUAGE'
      },
      darkModeToggle: {
        type: 'toggle_switch',
        selector: '.theme-toggle-btn',
        stateProp: 'darkMode',
        labels: { uz: 'Tungi/Kunduzgi rejim', ja: 'ダークモード切替', en: 'Dark Mode Toggle' },
        action: 'TOGGLE_DARK_MODE'
      },
      aiButton: {
        type: 'floating_avatar_button',
        selector: '.voice-assistant-trigger',
        labels: { uz: 'AI Voice Assistant (Ovozli yordamchi)', ja: 'AI音声アシスタント', en: 'AI Voice Assistant' }
      }
    },
    quickCategoryCards: {
      driverJobsCard: {
        targetTab: 'jobs',
        label: { uz: "Vakansiyalar (Haydovchilik ishlari)", ja: 'トラック求人一覧', en: 'Driver Vacancies' },
        action: 'NAVIGATE_TO_JOBS'
      },
      drivingSchoolsCard: {
        targetTab: 'academy',
        label: { uz: "Avtomaktablar (Litsenziya kurslari)", ja: '教習所・アカデミー', en: 'Driving Schools' },
        action: 'NAVIGATE_TO_ACADEMY'
      },
      companyAdsCard: {
        targetTab: 'company',
        label: { uz: "Kompaniya E'lonlarim (マイ掲載一覧)", ja: 'マイ掲載一覧・企業管理', en: 'My Posted Ads' },
        action: 'NAVIGATE_TO_MY_ADS'
      },
      utilityToolsCard: {
        targetTab: 'tools',
        label: { uz: "Asboblar & Maosh kalkulyatori", ja: '便利ツール・給与計算機', en: 'Utility Tools' },
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
        placeholder: { uz: "Kompaniya nomi yoki shahar (masalan: Tokyo)...", ja: '会社名や勤務地（例：東京、大阪）...', en: 'Search location or company...' }
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
          { code: '普通', label: { uz: 'Oddiy haydovchilik (Ordinary)', ja: '普通免許' } },
          { code: '準中型', label: { uz: 'Kichik yuk (Semi-Medium)', ja: '準中型免許' } },
          { code: '中型', label: { uz: "O'rta yuk (Medium Truck)", ja: '中型免許' } },
          { code: '大型', label: { uz: 'Katta yuk (Heavy Truck)', ja: '大型免許' } },
          { code: '牽引', label: { uz: 'Tirkamali (Towing/Trailer)', ja: '牽引免許' } }
        ],
        action: 'FILTER_JOBS(licenses)'
      },
      salaryRangeSlider: {
        type: 'range_slider',
        stateProp: 'minSalary',
        range: [200000, 600000],
        step: 10000,
        unit: 'JPY',
        labels: { uz: "Eng kam oylik maosh (yen)", ja: '最低月給 (円)', en: 'Min Salary (JPY)' },
        action: 'FILTER_JOBS(minSalary)'
      },
      segmentTabs: {
        type: 'tab_group',
        stateProp: 'jobActiveSegment',
        options: [
          { id: 'all', label: { uz: 'Barchasi', ja: 'すべて' } },
          { id: 'permanent', label: { uz: "Doimiy ish (正社員)", ja: '正社員' } },
          { id: 'hourly', label: { uz: "Soatbay (アルバイト)", ja: 'アルバイト' } },
          { id: 'tokutei', label: { uz: "Tokutei Ginou (特定技能)", ja: '特定技能' } }
        ]
      }
    },
    jobCardFields: {
      companyName: { path: 'job.companyName', type: 'text' },
      salary: { path: 'job.salary', type: 'currency_jpy' },
      location: { path: 'job.prefecture', type: 'badge' },
      requiredLicense: { path: 'job.license', type: 'badge' },
      hasHousing: { path: 'job.housingProvided', type: 'boolean_tag', label: { uz: 'Yotoqxona mavjud', ja: '寮完備' } },
      acceptsForeigners: { path: 'job.acceptsForeigners', type: 'boolean_tag', label: { uz: 'Chet elliklar uchun mos', ja: '外国人歓迎' } },
      applyBtn: { type: 'action_button', action: 'APPLY_JOB(jobId)' }
    }
  },

  // 3. COMPANY DASHBOARD & MY ADS DEEP FIELDS
  company: {
    myAdsSection: {
      postNewAdBtn: {
        type: 'button',
        selector: '.post-new-ad-btn',
        label: { uz: "Yangi e'lon joylashtirish", ja: '新規求人を投稿する' },
        action: 'POST_NEW_JOB'
      },
      adCardItems: {
        title: { path: 'ad.title' },
        status: { path: 'ad.status', options: ['active', 'paused', 'expired'] },
        applicantsCount: { path: 'ad.applicantsCount' },
        editBtn: { type: 'button', action: 'EDIT_JOB_AD(adId)' },
        pauseBtn: { type: 'button', action: 'TOGGLE_AD_STATUS(adId)' }
      }
    },
    applicationsSection: {
      candidateCard: {
        candidateName: { path: 'app.applicantName' },
        licenseHeld: { path: 'app.license' },
        japaneseLevel: { path: 'app.japaneseLevel' },
        statusDropdown: { path: 'app.status', options: ['new', 'interview_scheduled', 'hired', 'rejected'] }
      }
    }
  },

  // 4. USER PROFILE DEEP FIELDS
  profile: {
    mainView: {
      progressCompletionBar: { type: 'progress', stateProp: 'profileCompletionPercent' },
      editProfileBtn: { type: 'button', action: 'NAVIGATE_TO_PERSONAL_INFO' },
      applicationsHistoryLink: { type: 'link', action: 'NAVIGATE_TO_MY_APPLICATIONS' },
      referralLink: { type: 'link', action: 'NAVIGATE_TO_MY_SHOUKAI' }
    },
    personalInfoFields: {
      fullNameInput: { stateProp: 'profileData.fullName', type: 'text' },
      phoneInput: { stateProp: 'profileData.phone', type: 'tel' },
      addressInput: { stateProp: 'profileData.address', type: 'text' },
      licenseCheckboxes: { stateProp: 'profileData.licenses', type: 'multi_select' },
      visaSelect: { stateProp: 'profileData.visaType', options: ['Tokutei Ginou', 'Permanent Resident', 'Spouse', 'Student', 'Other'] }
    }
  }
};

class DeepUISchemaService {
  /**
   * Get microscopic element details for a specific section or field
   * @param {string} tab 
   * @param {string} section 
   */
  getDeepSectionFields(tab, section) {
    const pageSchema = DEEP_UI_ELEMENT_SCHEMA[tab];
    if (!pageSchema) return null;
    return pageSchema[section] || null;
  }

  /**
   * Summarize all available input fields and controls for LLM context
   * @param {string} activeTab 
   */
  getDeepContextSummary(activeTab) {
    const pageSchema = DEEP_UI_ELEMENT_SCHEMA[activeTab];
    if (!pageSchema) return '';

    let summary = `🔬 CHUQUR EKRAN MAYDONLARI VA BOSHQARUV TIZIMI (${activeTab.toUpperCase()}):\n`;

    for (const [sectionKey, sectionObj] of Object.entries(pageSchema)) {
      summary += `  📌 Bo'lim: [${sectionKey}]\n`;
      for (const [fieldKey, fieldObj] of Object.entries(sectionObj)) {
        if (fieldObj.type) {
          summary += `    • ${fieldKey} (${fieldObj.type}): ${JSON.stringify(fieldObj.labels || fieldObj.options || fieldObj.action || '')}\n`;
        } else {
          summary += `    • ${fieldKey}: ${Object.keys(fieldObj).join(', ')}\n`;
        }
      }
    }

    return summary;
  }
}

export const deepUISchemaIndex = new DeepUISchemaService();

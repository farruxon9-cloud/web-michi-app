/**
 * 🗺️ Michi AI — Comprehensive Screen & UI Structure Knowledge Base
 * 
 * Indexes all pages, sub-pages, sections, modals, filter options, input fields,
 * and button capabilities across the entire Michi App.
 */

export const APP_UI_STRUCTURE_MAP = {
  // 1. HOME DASHBOARD
  home: {
    title: { ja: 'ホームダッシュボード', uz: 'Asosiy Sahifa (Dashboard)', en: 'Home Dashboard' },
    description: {
      ja: 'アプリのメイン画面。求人検索、教習所、マイ掲載、ラジオプレーヤーなどの主要カードが表示されています。',
      uz: "Ilovaning asosiy sahifasi. Ish e'lonlari, avtomaktablar, kompaniya e'lonlari boshqaruvi va musiqa pleyeri joylashgan.",
      en: 'Main home dashboard with job search, driving academy, my posted ads, and music player.'
    },
    sections: [
      { id: 'header', name: 'Header Navigation', elements: ['Language Switcher', 'Dark Mode Toggle', 'Notifications Bell', 'AI Assistant Button'] },
      { id: 'hero', name: 'Hero Banner', elements: ['Featured Vacancy Banner', 'Quick Search Input'] },
      { id: 'categories', name: 'Quick Category Cards', elements: ['Driver Vacancies (jobs)', 'Driving Schools (academy)', 'Company Portal (company)', 'My Posted Ads (my_ads)', 'Utility Tools (tools)'] },
      { id: 'music_widget', name: 'Radio Player Widget', elements: ['Play/Pause', 'Next Track', 'Volume Control', 'Station Select'] },
      { id: 'recent_jobs', name: 'Recent Job Listings Carousel', elements: ['Job Cards', 'Salary Tags', 'Location Badges'] },
      { id: 'my_posted_ads_card', name: 'My Posted Ads Card', elements: ['Click to open Company Ads Management (my_ads)'] }
    ],
    availableActions: ['NAVIGATE_TO_JOBS', 'NAVIGATE_TO_ACADEMY', 'NAVIGATE_TO_COMPANY_HOME', 'NAVIGATE_TO_MY_ADS', 'NAVIGATE_TO_PROFILE', 'MUSIC_PLAY', 'MUSIC_PAUSE', 'TOGGLE_DARK_MODE']
  },

  // 2. DRIVER JOBS FEED
  jobs: {
    title: { ja: 'トラックドライバー求人一覧', uz: 'Vakansiyalar Ro\'yxati', en: 'Driver Job Listings' },
    description: {
      ja: '日本全国のトラックドライバー・物流求人一覧画面。免許種別、勤務地、月給、寮完備などの絞り込みが可能です。',
      uz: "Yaponiya bo'yicha haydovchilik ish e'lonlari. Litsenziya turi, hudud, maosh va yotoqxona bo'yicha filtrlanadi.",
      en: 'Driver job vacancies feed in Japan. Filterable by license, location, salary, and housing.'
    },
    sections: [
      { id: 'search_bar', name: 'Job Search Bar', elements: ['Keyword/Company Input', 'Search Button', 'Reset Filters Button'] },
      { id: 'filters_row', name: 'Filter Chips & Modals', elements: ['Prefecture Picker (Tokyo, Osaka, etc.)', 'License Type Filter (普通, 中型, 大型, 牽引)', 'Minimum Salary Slider', 'Segment Tabs (All, Permanent, Hourly, Tokutei Ginou)'] },
      { id: 'job_list', name: 'Job Cards Feed', elements: ['Company Name', 'Job Title', 'Salary Tag', 'Location Badge', 'Housing Included Tag', 'Foreigners Welcome Tag', 'View Details Button', 'Apply Now Button'] }
    ],
    availableActions: ['FILTER_JOBS', 'APPLY_JOB', 'SHARE_JOB', 'GO_BACK']
  },

  // 3. DRIVING ACADEMY FEED
  academy: {
    title: { ja: '自動車教習所・ロジスティクスアカデミー', uz: 'Avtomaktablar va Akademiyalar', en: 'Logistics Driving Academy' },
    description: {
      ja: '大型・中型・牽引・フォークリフト免許を取得できる教習所一覧画面。合宿免許や補助金制度の検索が可能です。',
      uz: "Katta va o'rta yuk avtomobili hamda Forklift litsenziyalarini olish uchun avtomaktablar va subsidiyali kurslar.",
      en: 'Driving school listing for heavy truck, towing, and forklift licenses with training subsidies.'
    },
    sections: [
      { id: 'academy_search', name: 'School Search Bar', elements: ['Location & School Name Search Input'] },
      { id: 'license_courses', name: 'License Course Selector', elements: ['大型免許 (Heavy)', '中型免許 (Medium)', '牽引免許 (Towing)', 'フォークリフト (Forklift)'] },
      { id: 'school_list', name: 'School Cards', elements: ['School Name', 'Course Prices', 'Dormitory Info', 'Apply for Consultation Button'] }
    ],
    availableActions: ['SEARCH_ACADEMY', 'APPLY_SCHOOL', 'GO_BACK']
  },

  // 4. COMPANY MANAGEMENT PORTAL
  company: {
    title: { ja: '企業向けマイページ・掲載管理', uz: 'Kompaniya E\'lonlar Boshqaruvi', en: 'Company Management Portal' },
    description: {
      ja: '求人企業向けの管理画面。求人情報の新規投稿、マイ掲載一覧の編集・停止、応募者の確認が可能です。',
      uz: "Ish beruvchi kompaniyalar boshqaruv sahifasi. Yangi e'lon berish, e'lonlarni tahrirlash va arizalarni ko'rish.",
      en: 'Employer dashboard for posting new job listings, editing active ads, and reviewing candidates.'
    },
    sections: [
      { id: 'company_header', name: 'Company Stats Header', elements: ['Active Ads Count', 'Received Applications Count', 'Post New Job Button'] },
      { id: 'my_ads_list', name: 'My Posted Ads (マイ掲載一覧)', elements: ['Ad Title', 'Status (Active/Paused)', 'Applicant Count', 'Edit Job Button', 'Delete/Pause Button'] },
      { id: 'received_apps', name: 'Received Applications Tab', elements: ['Candidate Resume Cards', 'Contact Button', 'Status Change Dropdown'] },
      { id: 'employees_roster', name: 'Employee Roster Tab', elements: ['Hired Drivers List', 'Shift Info'] }
    ],
    availableActions: ['NAVIGATE_TO_MY_ADS', 'POST_NEW_JOB', 'EDIT_JOB_AD', 'GO_BACK']
  },

  // 5. USER PROFILE & MY PAGE
  profile: {
    title: { ja: 'マイページ・プロフィール設定', uz: 'Mening Sahifam va Profil Sozlamalari', en: 'User Profile & My Page' },
    description: {
      ja: '求職者マイページ。履歴書情報（職歴・免許）、応募履歴、保存した求人、友達紹介（紹介コード）を管理できます。',
      uz: "Foydalanuvchi shaxsiy sahifasi. Rezyume (litsenziya va tajriba), topshirilgan arizalar, saqlangan e'lonlar va taklif kodlari.",
      en: 'User My Page for managing resume, application history, saved bookmarks, and referral rewards.'
    },
    subPages: {
      main: { name: 'Main Profile View', elements: ['Avatar Photo', 'Resume Progress Bar (% completion)', 'Edit Resume Button', 'Sub-page Navigation Links'] },
      personalInfo: { name: 'Personal Details & Licenses', elements: ['Full Name', 'Phone', 'Address', 'License Details (Ordinary/Medium/Heavy)', 'Visa Status (Tokutei Ginou / PR)'] },
      applications: { name: 'Application History (応募履歴)', elements: ['Applied Job Cards', 'Application Date', 'Status (Reviewing/Interview/Hired)'] },
      saved_items: { name: 'Saved Bookmarks', elements: ['Bookmarked Jobs & Schools List'] },
      my_shoukai: { name: 'Referral & Rewards (紹介コード)', elements: ['Personal Referral Code', 'Earned Bonus Balance', 'Share Link Button'] },
      settings: { name: 'App Settings', elements: ['Language Selector (Uzbek/Japanese/English)', 'Dark Mode Toggle', 'Notification Settings', 'Logout Button'] }
    },
    availableActions: ['NAVIGATE_TO_MY_APPLICATIONS', 'NAVIGATE_TO_PERSONAL_INFO', 'START_RESUME_FILLING', 'TOGGLE_DARK_MODE', 'GO_BACK']
  },

  // 6. COMMUNITY & DRIVER FORUM
  community: {
    title: { ja: 'ドライバーコミュニティ・掲示板', uz: 'Haydovchilar Jamiyati va Forumi', en: 'Driver Community & Forum' },
    description: {
      ja: 'トラックドライバー同士の交流掲示板。高速道路情報、運転のコツ、求人評判についての意見交換ができます。',
      uz: "Haydovchilar uchun o'zaro tajriba almashish va forum. Yo'l holati, magistral ma'lumotlari va haydovchilik maslahatlari.",
      en: 'Driver community board for discussing highway conditions, driving tips, and job reviews.'
    },
    sections: [
      { id: 'forum_tabs', name: 'Forum Categories', elements: ['General Chat', 'Highway & Traffic Updates', 'Job Reviews & Salary Chat', 'License Tips'] },
      { id: 'post_feed', name: 'Community Post Feed', elements: ['Post Author', 'Topic Title', 'Comments Count', 'Like Button', 'Reply Input'] }
    ],
    availableActions: ['NAVIGATE_TO_COMMUNITY', 'CREATE_POST', 'GO_BACK']
  },

  // 7. UTILITY TOOLS
  tools: {
    title: { ja: 'ドライバー向け便利ツール', uz: 'Haydovchilar Uchun Asboblar', en: 'Driver Utility Tools' },
    description: {
      ja: '手取り給与計算機、日本の運転免許切り替えチェック、トラックの寸法・積載量計算ツールです。',
      uz: "Qo'lga tegadigan maosh kalkulyatori, yapon litsenziyasini almashtirish talablari va yuk hajm hisoblagichi.",
      en: 'Take-home salary calculator, Japanese license converter check, and truck load capacity tool.'
    },
    sections: [
      { id: 'salary_calc', name: 'Net Salary Calculator', elements: ['Gross Salary Input', 'Tax Deductions Estimate', 'Take-Home Net Salary Output'] },
      { id: 'license_check', name: 'License Converter Tool', elements: ['Home Country License Select', 'Japanese Conversion Steps Checker'] }
    ],
    availableActions: ['NAVIGATE_TO_TOOLS', 'GO_BACK']
  }
};

import { deepUISchemaIndex } from './deepUISchemaIndex.js';

class ScreenStructureService {
  /**
   * Get comprehensive context summary for AI system prompt or voice context
   * @param {string} activeTab 
   * @param {string} [profileSubPage] 
   * @param {string} [userLang] 
   * @param {boolean} [includeDeepFields=true]
   */
  getRichScreenContext(activeTab = 'home', profileSubPage = 'main', userLang = 'uz', includeDeepFields = true) {
    const pageObj = APP_UI_STRUCTURE_MAP[activeTab] || APP_UI_STRUCTURE_MAP['home'];
    const cleanLang = userLang.substring(0, 2).toLowerCase();
    
    const pageTitle = pageObj.title[cleanLang] || pageObj.title['uz'] || pageObj.title['ja'];
    const pageDesc = pageObj.description[cleanLang] || pageObj.description['uz'] || pageObj.description['ja'];

    let contextText = `📌 XOZIRGI SAHIFA: ${pageTitle}\n📝 TAVSIF: ${pageDesc}\n`;

    if (activeTab === 'profile' && pageObj.subPages?.[profileSubPage]) {
      const sub = pageObj.subPages[profileSubPage];
      contextText += `📂 SUB-SAHIFA: ${sub.name}\n📋 EKRANDAGI ELEMENTLAR: ${sub.elements.join(', ')}\n`;
    } else if (pageObj.sections) {
      contextText += `📋 EKRANDAGI BO'LIMLAR:\n`;
      for (const sec of pageObj.sections) {
        contextText += `  • ${sec.name}: ${sec.elements.join(', ')}\n`;
      }
    }

    if (includeDeepFields) {
      const deepDetails = deepUISchemaIndex.getDeepContextSummary(activeTab);
      if (deepDetails) {
        contextText += `\n${deepDetails}`;
      }
    }

    if (pageObj.availableActions) {
      contextText += `\n⚡ MUMKIN BO'LGAN BUYRUQLAR: ${pageObj.availableActions.join(', ')}`;
    }

    return contextText;
  }
}

export const screenStructureIndex = new ScreenStructureService();

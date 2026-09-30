/**
 * 🤖 Michi AI — Central AI Action Registry
 * 
 * Scalable, type-safe registry for registering, finding, and executing
 * AI voice actions, tool calls, and UI state mutations in Michi App.
 */

class AIActionRegistry {
  constructor() {
    this.actions = new Map();
    this.categories = new Map();
  }

  /**
   * Register a new action definition
   * @param {Object} config
   */
  register(config) {
    if (!config || !config.name) {
      throw new Error('[AIActionRegistry] Action configuration must include a valid name');
    }

    const defaultParams = {
      type: 'object',
      properties: {},
      required: []
    };

    const actionEntry = {
      name: config.name,
      category: config.category || 'general',
      description: config.description || '',
      parameters: config.parameters ? {
        type: 'object',
        properties: config.parameters.properties || {},
        required: config.parameters.required || []
      } : defaultParams,
      examples: Array.isArray(config.examples) ? [...config.examples] : [],
      responses: config.responses || {},
      requiresOnline: Boolean(config.requiresOnline),
      isDelayed: config.isDelayed !== undefined ? Boolean(config.isDelayed) : true,
      execute: this.wrapWithSafety(config.execute || (async () => ({ success: true })), config.name)
    };

    this.actions.set(config.name, actionEntry);

    // Group by category
    if (!this.categories.has(actionEntry.category)) {
      this.categories.set(actionEntry.category, []);
    }
    this.categories.get(actionEntry.category).push(actionEntry.name);

    return actionEntry;
  }

  /**
   * Safe execution wrapper with logging and error catching
   */
  wrapWithSafety(fn, name) {
    return async (params = {}, context = {}) => {
      try {
        const safeParams = params && typeof params === 'object' ? params : {};
        const safeContext = context && typeof context === 'object' ? context : {};
        const result = await fn(safeParams, safeContext);
        return { success: true, result };
      } catch (error) {
        console.error(`[AIActionRegistry] ❌ Error executing action ${name}:`, error);
        return { success: false, error: error.message || 'Execution error' };
      }
    };
  }

  get(commandName) {
    return this.actions.get(commandName) || null;
  }

  has(commandName) {
    return this.actions.has(commandName);
  }

  /**
   * Execute an action by name
   */
  async execute(commandName, params = {}, context = {}) {
    const action = this.actions.get(commandName);
    if (!action) {
      console.warn(`[AIActionRegistry] ⚠️ Unknown command requested: ${commandName}`);
      return { success: false, error: `Unknown command: ${commandName}` };
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (action.requiresOnline && !isOnline) {
      const fallbackMsg = action.responses?.offline || {
        uz: "Ushbu buyruq uchun internet aloqasi kerak.",
        ja: "このコマンドにはインターネット接続が必要です。",
        en: "Internet connection is required for this command.",
        ru: "Для этой команды требуется подключение к интернету.",
        zh: "此命令需要互联网连接。"
      };
      return { success: false, error: 'offline', fallbackMsg };
    }

    return action.execute(params || {}, context || {});
  }

  /**
   * Get OpenAI/vLLM standard Tool Definitions
   */
  getToolDefinitions() {
    return Array.from(this.actions.values())
      .filter(action => action.name !== 'NONE')
      .map(action => ({
        type: 'function',
        function: {
          name: action.name,
          description: action.description,
          parameters: action.parameters
        }
      }));
  }

  getIntentExamples() {
    const examplesMap = {};
    for (const [name, action] of this.actions) {
      if (action.examples && action.examples.length > 0) {
        examplesMap[name] = [...action.examples];
      }
    }
    return examplesMap;
  }

  /**
   * Get natural localized response string for a command across 5 languages
   */
  getResponse(commandName, lang = 'uz') {
    const action = this.actions.get(commandName);
    if (!action || !action.responses) return null;
    const cleanLang = (lang || 'uz').substring(0, 2).toLowerCase();
    
    return action.responses[cleanLang] || 
           action.responses['ja'] || 
           action.responses['uz'] || 
           action.responses['en'] || 
           null;
  }

  listActionNames() {
    return Array.from(this.actions.keys());
  }
}

export const actionRegistry = new AIActionRegistry();

// ════════════════════════════════════════════════════════════════════════════
// 📋 REGISTER ALL BUILT-IN MICHI APP ACTIONS
// ════════════════════════════════════════════════════════════════════════════

// 🌐 NAVIGATION ACTIONS
actionRegistry.register({
  name: 'NAVIGATE_TO_HOME',
  category: 'navigation',
  description: 'Navigate to the main home dashboard page',
  examples: ['ホームに行く', 'ホーム画面', 'bosh sahifaga o\'t', 'go home', 'uy sahifasini och', 'main page'],
  responses: {
    ja: 'ホーム画面を開きます。',
    uz: 'Bosh sahifani ochaman.',
    en: 'Opening home page.',
    ru: 'Открываю главную страницу.',
    zh: '打开主页。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setActiveTab?.('home');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_JOBS',
  category: 'navigation',
  description: 'Navigate to jobs/vacancies listing page',
  examples: ['仕事を探す', '求人を見る', 'ishlarni ko\'rsat', 'show jobs', 'vakansiyalar', 'find work', '仕事一覧'],
  responses: {
    ja: '求人一覧ページを開きます。',
    uz: 'Ish joylari ro\'yxatini ochaman.',
    en: 'Opening jobs page.',
    ru: 'Открываю список вакансий.',
    zh: '打开职位列表。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setActiveTab?.('jobs');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_ACADEMY',
  category: 'navigation',
  description: 'Navigate to logistics driving school / academy page',
  examples: ['教習所を探す', '学校一覧', 'akademiya', 'driving school', 'o\'quv markazi', 'maktablarni ko\'rsat'],
  responses: {
    ja: '自動車教習所・アカデミーページを開きます。',
    uz: 'Haydovchilik akademiyasi sahifasini ochaman.',
    en: 'Opening driving academy page.',
    ru: 'Открываю страницу автошколы.',
    zh: '打开驾校页面。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setActiveTab?.('academy');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_COMPANY_HOME',
  category: 'navigation',
  description: 'Navigate to company employer dashboard or company my_ads page',
  examples: ['求人掲載', 'マイ掲載一覧', 'kompaniya sahifasi', 'company portal', 'e\'lonlarim', 'my posted ads'],
  responses: {
    ja: '企業マイページ・掲載一覧を開きます。',
    uz: 'Kompaniya e\'lonlar boshqaruvi sahifasini ochaman.',
    en: 'Opening company management portal.',
    ru: 'Открываю кабинет компании.',
    zh: '打开企业中心。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setActiveTab?.('company');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_PROFILE',
  category: 'navigation',
  description: 'Navigate to user profile / My Page',
  examples: ['プロフィール', 'マイページ', 'profilimni och', 'my profile', 'mening sahifam', 'shaxsiy sahifa'],
  responses: {
    ja: 'マイページ・プロフィールを開きます。',
    uz: 'Mening sahifamni ochaman.',
    en: 'Opening profile page.',
    ru: 'Открываю профиль.',
    zh: '打开个人中心。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setProfileActivePage?.('main');
    ctx.setActiveTab?.('profile');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_MY_APPLICATIONS',
  category: 'navigation',
  description: 'Navigate to user job application history inside profile page',
  examples: ['応募履歴', 'arizalarim', 'my applications', 'topshirgan ishlarim', 'sent applications'],
  responses: {
    ja: '応募履歴を開きます。',
    uz: 'Topshirilgan arizalar sahifasini ochaman.',
    en: 'Opening job application history.',
    ru: 'Открываю историю откликов.',
    zh: '打开应聘记录。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setProfileActivePage?.('applications');
    ctx.setActiveTab?.('profile');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_COMMUNITY',
  category: 'navigation',
  description: 'Navigate to driver community chat / forum page',
  examples: ['コミュニティ', '掲示板', 'jamiyat', 'forum', 'chat', 'haydovchilar guruhi'],
  responses: {
    ja: 'ドライバーコミュニティを開きます。',
    uz: 'Haydovchilar jamiyati chatini ochaman.',
    en: 'Opening community forum.',
    ru: 'Открываю сообщество водителей.',
    zh: '打开司机社区。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setActiveTab?.('community');
  }
});

actionRegistry.register({
  name: 'NAVIGATE_TO_TOOLS',
  category: 'navigation',
  description: 'Navigate to utility tools section (salary calculator, license converter, etc.)',
  examples: ['ツール', '計算機', 'asboblar', 'kalkulyator', 'calculator', 'utility tools'],
  responses: {
    ja: '便利ツールを開きます。',
    uz: 'Foydali asboblar sahifasini ochaman.',
    en: 'Opening utility tools.',
    ru: 'Открываю полезные инструменты.',
    zh: '打开实用工具。'
  },
  execute: async (params, ctx) => {
    ctx.setSelectedJob?.(null);
    ctx.setSelectedSchool?.(null);
    ctx.setActiveTab?.('tools');
  }
});

actionRegistry.register({
  name: 'GO_BACK',
  category: 'navigation',
  description: 'Close current detail view or go back to previous view',
  examples: ['戻る', '閉じる', 'orqaga', 'yop', 'go back', 'close'],
  responses: {
    ja: '前の画面に戻ります。',
    uz: 'Orqaga qaytaman.',
    en: 'Going back.',
    ru: 'Возвращаюсь назад.',
    zh: '返回上一页。'
  },
  execute: async (params, ctx) => {
    if (ctx.selectedJob) {
      ctx.setSelectedJob?.(null);
    } else if (ctx.selectedSchool) {
      ctx.setSelectedSchool?.(null);
    } else {
      ctx.setActiveTab?.('home');
    }
  }
});

// 🎵 MUSIC PLAYER ACTIONS
actionRegistry.register({
  name: 'MUSIC_PLAY',
  category: 'music',
  description: 'Play radio or music in the app player',
  examples: ['音楽をかけて', 'ラジオ再生', 'musiqa qo\'y', 'play music', 'qo\'shiq yoq', 'music start'],
  responses: {
    ja: 'ラジオ・音楽を再生します。',
    uz: 'Musiqani qo\'yaman.',
    en: 'Playing music.',
    ru: 'Включаю музыку.',
    zh: '播放音乐。'
  },
  execute: async (params, ctx) => {
    ctx.musicPlayer?.play?.();
  }
});

actionRegistry.register({
  name: 'MUSIC_PAUSE',
  category: 'music',
  description: 'Pause radio or music',
  examples: ['音楽を止めて', 'ストップ', "musiqani to'xtat", 'pause music', 'stop song'],
  responses: {
    ja: '音楽を一時停止します。',
    uz: 'Musiqani to\'xtataman.',
    en: 'Pausing music.',
    ru: 'Останавливаю музыку.',
    zh: '暂停音乐。'
  },
  execute: async (params, ctx) => {
    ctx.musicPlayer?.pause?.();
  }
});

actionRegistry.register({
  name: 'MUSIC_NEXT',
  category: 'music',
  description: 'Skip to next music track or station',
  examples: ['次の曲', 'スキップ', 'keyingi qo\'shiq', 'next track', 'next song'],
  responses: {
    ja: '次の曲に移動します。',
    uz: 'Keyingi qo\'shiqqa o\'taman.',
    en: 'Next song.',
    ru: 'Следующий треク.',
    zh: '下一首。'
  },
  execute: async (params, ctx) => {
    ctx.musicPlayer?.next?.();
  }
});

actionRegistry.register({
  name: 'MUSIC_PREV',
  category: 'music',
  description: 'Go to previous music track or station',
  examples: ['前の曲', 'oldingi qo\'shiq', 'previous track'],
  responses: {
    ja: '前の曲に戻ります。',
    uz: 'Oldingi qo\'shiqqa o\'taman.',
    en: 'Previous song.',
    ru: 'Предыдущий трек.',
    zh: '上一首。'
  },
  execute: async (params, ctx) => {
    ctx.musicPlayer?.previous?.();
  }
});

// 📊 DATA & FILTER ACTIONS
actionRegistry.register({
  name: 'FILTER_JOBS',
  category: 'data',
  description: 'Search and filter job listings by location, salary, license type, etc.',
  parameters: {
    type: 'object',
    properties: {
      searchQuery: { type: 'string', description: 'Location, company, or keyword' },
      prefecture: { type: 'string', description: 'Prefecture name in English/Japanese (e.g. Tokyo, Osaka)' },
      minSalary: { type: 'number', description: 'Minimum monthly salary in JPY' },
      license: { type: 'string', description: 'License type required (大型, 中型, 普通, 牽引)' }
    },
    required: []
  },
  examples: ['東京の仕事を探して', 'Tokyoda ish qidir', 'find jobs in Tokyo', '月給30万以上の求人', '300000 maoshli ish'],
  responses: {
    ja: '条件に合う求人を検索します。',
    uz: 'Berilgan shartlarga mos ishlarni qidirmoqdaman.',
    en: 'Filtering job listings.',
    ru: 'Ищу подходящие вакансии.',
    zh: '正在根据条件筛选职位。'
  },
  execute: async (params, ctx) => {
    if (params.searchQuery) ctx.setJobSearchQuery?.(params.searchQuery);
    if (params.prefecture) ctx.setSelectedPrefecture?.(params.prefecture);
    if (params.minSalary) ctx.setMinSalary?.(params.minSalary);
    if (params.license) ctx.setSelectedLicenses?.([params.license]);
    ctx.setSelectedJob?.(null);
    ctx.setActiveTab?.('jobs');
  }
});

// ⚙️ SYSTEM ACTIONS
actionRegistry.register({
  name: 'TOGGLE_DARK_MODE',
  category: 'system',
  description: 'Toggle between dark mode and light mode theme',
  examples: ['ダークモード', '夜間モード', 'tungi rejim', 'dark mode', 'kunduzgi rejim', 'light mode'],
  responses: {
    ja: 'テーマモードを切り替えます。',
    uz: 'Ekran rejimini o\'zgartiraman.',
    en: 'Toggling theme mode.',
    ru: 'Переключаю тему оформления.',
    zh: '切换界面主题。'
  },
  execute: async (params, ctx) => {
    ctx.toggleDarkMode?.();
  }
});

actionRegistry.register({
  name: 'WEB_SEARCH',
  category: 'tool',
  description: 'Search the internet for real-time live data, weather, traffic or news',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Query text to search on internet' }
    },
    required: ['query']
  },
  examples: ['今日の天気は', 'bugungi ob-havo', 'what is weather today', '最新ニュース', 'yangiliklar'],
  requiresOnline: true,
  execute: async (params, ctx) => {
    return { query: params.query, info: 'Live search trigger' };
  }
});

actionRegistry.register({
  name: 'NONE',
  category: 'general',
  description: 'General conversational query or response without UI navigation',
  parameters: { type: 'object', properties: {}, required: [] },
  execute: async () => ({ success: true })
});

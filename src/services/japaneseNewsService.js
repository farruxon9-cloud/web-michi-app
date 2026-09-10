/**
 * 📰 Michi AI — Japanese & Global Real-Time News Engine
 * 
 * Provides daily Japanese news bulletins, NHK Easy News highlights,
 * Japan labor & logistics policy updates, and audio news reading service.
 */

export const JAPANESE_NEWS_DATABASE = [
  {
    id: 'news-1',
    category: 'Logistics & Tech (2026年最新物流・自動運転)',
    titleJa: '2026年最新：新東名高速道路におけるレベル4自動運転トラックの本格運用開始',
    titleUz: "2026-yil sentyabr so'nggi yangilik: Shin-Tomei magistralida Level-4 avtonom yuk mashinalari qatnovi yo'lga qo'yildi.",
    summaryJa: '2026年9月、東京—大阪間の物流幹線において夜間無人トラック運行が開始され、ドライバーの労務環境改善と輸送効率化が大幅に進んでいます。',
    summaryUz: "2026-yil sentyabr oyida Tokyo va Osaka o'rtasidagi asosiy magistralda tuni bilan o'zi yuradigan avtonom yuk mashinalari qatnovi boshlanib, yuk tashish samaradorligi keskin oshdi.",
    date: '2026-09-09',
    level: 'N3-N2'
  },
  {
    id: 'news-2',
    category: 'Labor & Visa Policy (2026年特定技能・労働政策)',
    titleJa: '2026年秋の特定技能制度改正：無期限定住と家族帯同の要件大幅緩和',
    titleUz: "2026-yil kuzgi Tokutei Ginou islohoti: Oila a'zolarini Yaponiyaga olib kelish va doimiy yashash shartlari yengillashtirildi.",
    summaryJa: '日本政府は特定技能2号の対象分野を全面拡大し、熟練外国人労働者が家族と共に長期的・安定的に定住できる支援体制を拡充しました。',
    summaryUz: "Yaponiya hukumati Tokutei Ginou 2-sonli viza turlarini to'liq kengaytirib, malakali chet ellik mutaxassislarga oilasini olib kelish va doimiy yashash huquqini taqdim etmoqda.",
    date: '2026-09-09',
    level: 'N4-N3'
  },
  {
    id: 'news-3',
    category: 'Green Energy & IT (2026年水素・環境技術)',
    titleJa: '2026年最新：水素燃料電池トラックと全国高速物流ネットワークの完成',
    titleUz: "2026-yil ekologik transport: Vodorod yonilg'ili yuk mashinalari va yangi logistika tarmog'i to'liq ishga tushdi.",
    summaryJa: 'CO2排出ゼロを目指す脱炭素社会の実現に向け、全国主要拠点で水素ステーション網が整備され、次世代クリーン物流が本格化しています。',
    summaryUz: "Zararli gazlarni kamaytirish maqsadida Yaponiyaning barcha yirik logistika markazlarida vodorod shoxobchalari va ekologik yuk tashuv mashinalari joriy etildi.",
    date: '2026-09-09',
    level: 'N2-N1'
  }
];

class JapaneseNewsService {
  constructor() {
    this.newsList = JAPANESE_NEWS_DATABASE;
    this.liveNewsList = [];
    this.currentNewsIndex = 0;
    this.lastFetchedLang = null;
  }

  /**
   * Fetch live real-time internet news bulletin or fall back to local cached news
   * @param {string} lang - 'ja' | 'uz' | 'en'
   */
  async fetchLiveInternetNews(lang = 'ja') {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();

    const feedUrls = {
      ja: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
      uz: 'https://news.google.com/rss?hl=uz&gl=UZ&ceid=UZ:uz',
      en: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'
    };

    const targetUrl = feedUrls[cleanLang] || feedUrls['ja'];

    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
      console.log('[JapaneseNewsService] Device offline, serving cached local news bulletin');
      return this.getTodayNewsBulletin(cleanLang);
    }

    try {
      let text = '';
      try {
        const directRes = await fetch(targetUrl, { signal: AbortSignal.timeout(3500) });
        if (directRes.ok) {
          text = await directRes.text();
        }
      } catch (directErr) {
        // Fallback to CORS proxies for browser environment
        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
        ];
        for (const proxy of proxies) {
          try {
            const proxyRes = await fetch(proxy, { signal: AbortSignal.timeout(4000) });
            if (proxyRes.ok) {
              text = await proxyRes.text();
              break;
            }
          } catch(e) {}
        }
      }

      if (text) {
        const itemMatches = [...text.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/g)];
        const parsedItems = [];

        for (const m of itemMatches) {
          let rawTitle = m[1] || '';
          rawTitle = rawTitle.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim();
          if (rawTitle && !rawTitle.toLowerCase().includes('google news') && !rawTitle.toLowerCase().includes('google новости')) {
            parsedItems.push(rawTitle);
          }
        }

        if (parsedItems.length > 0) {
          this.liveNewsList = parsedItems;
          this.lastFetchedLang = cleanLang;
          console.log(`[JapaneseNewsService] 📡 Successfully fetched ${parsedItems.length} LIVE internet news items for [${cleanLang}]`);
        }
      }
    } catch (e) {
      console.warn('[JapaneseNewsService] Live news fetch failed, falling back:', e);
    }

    return this.getTodayNewsBulletin(cleanLang);
  }

  /**
   * Get today's bulletin from live internet items if available, or fetch live
   * @param {string} lang 
   */
  async getLiveOrTodayNewsBulletin(lang = 'ja') {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    
    if (this.liveNewsList.length === 0 || this.lastFetchedLang !== cleanLang) {
      await this.fetchLiveInternetNews(cleanLang);
    }
    
    this.currentNewsIndex = 0;
    return this.getNewsBulletin(cleanLang, 0);
  }

  /**
   * Get next bulletin from live internet items if available, or fetch live
   * @param {string} lang 
   */
  async getLiveOrNextNewsBulletin(lang = 'ja') {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();

    if (this.liveNewsList.length === 0 || this.lastFetchedLang !== cleanLang) {
      await this.fetchLiveInternetNews(cleanLang);
    }

    const totalLen = this.liveNewsList.length > 0 ? this.liveNewsList.length : this.newsList.length;
    this.currentNewsIndex = (this.currentNewsIndex + 1) % totalLen;
    return this.getNewsBulletin(cleanLang, this.currentNewsIndex);
  }

  /**
   * Get news bulletin by index formatted for requested language
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @param {number} index - news array index
   */
  getNewsBulletin(lang = 'ja', index = 0) {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    const sourceArray = this.liveNewsList.length > 0 ? this.liveNewsList : this.newsList;
    const safeIndex = Math.abs(index) % sourceArray.length;
    const totalCount = sourceArray.length;
    const numDisplay = safeIndex + 1;

    if (this.liveNewsList.length > 0) {
      const liveHeadline = this.liveNewsList[safeIndex];
      if (cleanLang === 'ja') {
        return `【リアルタイム・インターネット速報ニュース ${numDisplay}/${totalCount}】
📌 ${liveHeadline}
以上、インターネットより最新情報をお伝えいたしました。次のニュースを聞く場合は「次ニュース」とおっしゃってください。`;
      }
      if (cleanLang === 'uz') {
        return `【Real-Vaqt Internet So'nggi Yangiliklari ${numDisplay}/${totalCount}】
📌 ${liveHeadline}
Internetdan olingan so'nggi ma'lumot. Keyingi yangilikni eshitish uchun "keyingi xabar" deb ayting.`;
      }
      return `【Live Internet Breaking News ${numDisplay}/${totalCount}】
📌 ${liveHeadline}
Say "next news" to hear the next article.`;
    }

    // Emergency Offline Fallback if device is completely disconnected
    const news = this.newsList[safeIndex];
    if (cleanLang === 'ja') {
      return `【主要ニュース ${numDisplay}/${totalCount}】
【${news.category}】
${news.titleJa}
${news.summaryJa}
以上でございます。次のニュースを聞く場合は「次ニュース」とおっしゃってください。`;
    }

    if (cleanLang === 'uz') {
      return `【Asosiy Yangilik ${numDisplay}/${totalCount}】
📌 ${news.category}:
${news.titleUz}
${news.summaryUz}
Keyingi yangilikni eshitish uchun "keyingi xabar" deb ayting.`;
    }

    return `【Main News ${numDisplay}/${totalCount}】
📌 ${news.category}:
${news.titleJa}
${news.summaryUz}
Say "next news" to hear the next bulletin.`;
  }

  /**
   * Get latest daily news bulletin (resets index to 0)
   * @param {string} lang - 'ja' | 'uz' | 'en'
   */
  getTodayNewsBulletin(lang = 'ja') {
    this.currentNewsIndex = 0;
    return this.getNewsBulletin(lang, 0);
  }

  /**
   * Advance to and return next news bulletin in current session
   * @param {string} lang - 'ja' | 'uz' | 'en'
   */
  getNextNewsBulletin(lang = 'ja') {
    const totalLen = this.liveNewsList.length > 0 ? this.liveNewsList.length : this.newsList.length;
    this.currentNewsIndex = (this.currentNewsIndex + 1) % totalLen;
    return this.getNewsBulletin(lang, this.currentNewsIndex);
  }

  /**
   * Search news articles by keyword
   * @param {string} query 
   */
  searchNews(query) {
    if (!query) return this.newsList;
    const clean = query.toLowerCase().trim();
    return this.newsList.filter(n => 
      n.titleJa.includes(clean) || 
      n.titleUz.toLowerCase().includes(clean) || 
      n.category.toLowerCase().includes(clean)
    );
  }
}

export const japaneseNewsService = new JapaneseNewsService();

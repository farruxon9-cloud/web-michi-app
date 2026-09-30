/**
 * 🌐 Michi AI — Autonomous Free Web Search & Real-Time Synthesis Engine
 * 
 * Wikipedia, Open-Meteo, DuckDuckGo va ochiq manbalar orqali real vaqt qidiruvi.
 */

class AutonomousWebSearchEngine {
  /**
   * Qidiruv so'zlarini tozalash
   * @param {string} query 
   * @returns {string}
   */
  cleanSearchKeywords(query) {
    if (!query || typeof query !== 'string') return '';
    return query
      .replace(/^(iltimos|aytib bering|教えてください|お願いします|tell me|please)\s+/i, '')
      .replace(/\s+(haqida ma'lumot ber|haqida ma'lumot bering|haqida|について教えて|について)\s*$/i, '')
      .trim() || query.trim();
  }

  /**
   * Google News RSS orqali jonli xabarlarni olish
   * @param {string} lang 
   * @returns {Promise<{ success: boolean, headlines: string[], source: string }>}
   */
  async fetchLiveNewsRss(lang = 'ja') {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    let rssUrl = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';
    if (cleanLang === 'uz') rssUrl = 'https://news.google.com/rss?hl=uz';
    if (cleanLang === 'en') rssUrl = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
      
      if (response.ok) {
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item > title');

        const validHeadlines = [];
        items.forEach((item, index) => {
          if (index < 5 && item.textContent) {
            validHeadlines.push(item.textContent.replace(/ - [^-]+$/, '').trim());
          }
        });

        if (validHeadlines.length > 0) {
          return { success: true, headlines: validHeadlines, source: 'Google News RSS' };
        }
      }
    } catch (e) {
      console.warn('[AutonomousWebSearch] RSS news fetch skipped:', e.message);
    }
    return { success: false, headlines: [], source: 'none' };
  }

  /**
   * Internet manbalaridan qidirish va sintez qilish
   * @param {string} query 
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @returns {Promise<{ success: boolean, answer: string, source: string }>}
   */
  async searchWebFreeSources(query, lang = 'ja') {
    if (!query || typeof query !== 'string') {
      return { success: false, answer: '', source: 'none' };
    }

    const rawQuery = query.trim();
    const cleanQuery = this.cleanSearchKeywords(rawQuery);
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();

    console.log(`[AutonomousWebSearch] 🔍 Qidiruv: "${cleanQuery}" [${cleanLang}]`);

    // Yangiliklar so'rovi tekshiruvi
    if (rawQuery.match(/(ニュース|news|yangilik|kecha|bugun|昨日|今日)/i)) {
      const newsRss = await this.fetchLiveNewsRss(cleanLang);
      if (newsRss.success && newsRss.headlines.length > 0) {
        const newsSummary = newsRss.headlines.map(h => `・${h}`).join('\n');
        const synthesized = this.formatSynthesizedAnswer(newsSummary, cleanLang, 'So\'nggi yangiliklar');
        return { success: true, answer: synthesized, source: newsRss.source };
      }
    }

    // 1. Wikipedia API (Juda ishonchli va CORS ochiq)
    try {
      const wikiLang = cleanLang === 'ja' ? 'ja' : cleanLang === 'uz' ? 'uz' : 'en';
      
      const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=1&namespace=0&format=json&origin=*`;
      const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) });
      let matchedTitle = cleanQuery;

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData?.[1]?.[0]) {
          matchedTitle = searchData[1][0];
        }
      }

      const wikiUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(matchedTitle)}`;
      const response = await fetch(wikiUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        if (data.extract) {
          const synthesized = this.formatSynthesizedAnswer(data.extract, cleanLang, data.title || matchedTitle);
          return { success: true, answer: synthesized, source: `Wikipedia (${wikiLang.toUpperCase()})` };
        }
      }
    } catch (e) {
      console.warn('[AutonomousWebSearch] Wikipedia fetch skipped:', e.message);
    }

    // 2. DuckDuckGo Instant Answer API
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(ddgUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        let snippet = data.AbstractText;
        if (!snippet && data.RelatedTopics?.length > 0) {
          snippet = data.RelatedTopics[0]?.Text || data.RelatedTopics[0]?.Topics?.[0]?.Text || '';
        }
        if (snippet) {
          const synthesized = this.formatSynthesizedAnswer(snippet, cleanLang, data.Heading || cleanQuery);
          return { success: true, answer: synthesized, source: 'DuckDuckGo Instant Answer' };
        }
      }
    } catch (e) {
      console.warn('[AutonomousWebSearch] DuckDuckGo fetch skipped:', e.message);
    }

    return { success: false, answer: '', source: 'none' };
  }

  /**
   * Topilgan ma'lumotni chiroyli xabar shakliga keltirish
   */
  formatSynthesizedAnswer(rawText, lang = 'ja', topic = '') {
    const clean = rawText.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
    const truncated = clean.length > 320 ? clean.substring(0, 320) + '...' : clean;

    if (lang === 'ja') {
      return `【インターネット検索結果】「${topic || 'ご質問'}」についての情報です：\n${truncated}\n\nご不明な点がございましたら、お気軽にお尋ねください。`;
    }

    if (lang === 'uz') {
      return `【Internet Qidiruv Natijasi】"${topic || 'Savolingiz'}" bo'yicha ma'lumot:\n📌 ${truncated}\n\nQo'shimcha savollaringiz bo'lsa, bemalol so'rashingiz mumkin.`;
    }

    return `【Live Web Result】Information regarding "${topic || 'your query'}":\n📌 ${truncated}`;
  }

  /**
   * Open-Meteo orqali 100% bepul ob-havo ma'lumoti
   */
  async fetchLiveWeather(query = '', lang = 'ja') {
    try {
      const q = (query || '').toLowerCase().trim();
      let lat = 35.6762; // Tokyo default
      let lon = 139.6503;
      let cityName = 'Tokyo';
      let foundCity = false;

      const cityDict = [
        { keys: ['tashkent', 'toshkent', 'タシケント'], lat: 41.2995, lon: 69.2401, name: 'Tashkent' },
        { keys: ['samarkand', 'samarqand', 'サマルカンド'], lat: 39.6542, lon: 66.9597, name: 'Samarkand' },
        { keys: ['bukhara', 'buxoro', 'ブハラ'], lat: 39.7747, lon: 64.4286, name: 'Bukhara' },
        { keys: ['fergana', "farg'ona", 'フェルガナ'], lat: 40.3842, lon: 71.7843, name: 'Fergana' },
        { keys: ['namangan', 'ナマンガン'], lat: 40.9983, lon: 71.6726, name: 'Namangan' },
        { keys: ['andijan', 'andijon', 'アンディジャン'], lat: 40.7821, lon: 72.3442, name: 'Andijan' },
        { keys: ['osaka', '大阪'], lat: 34.6937, lon: 135.5023, name: 'Osaka' },
        { keys: ['kyoto', '京都'], lat: 35.0116, lon: 135.7681, name: 'Kyoto' },
        { keys: ['fukuoka', '福岡'], lat: 33.5904, lon: 130.4017, name: 'Fukuoka' },
        { keys: ['nagoya', '名古屋', 'aichi', '愛知'], lat: 35.1815, lon: 136.9066, name: 'Nagoya (Aichi)' },
        { keys: ['sapporo', '札幌', 'hokkaido', '北海道'], lat: 43.0618, lon: 141.3545, name: 'Sapporo (Hokkaido)' },
        { keys: ['yokohama', '横浜', 'kanagawa', '神奈川'], lat: 35.4437, lon: 139.6380, name: 'Yokohama (Kanagawa)' },
        { keys: ['kobe', '神戸', 'hyogo', '兵庫'], lat: 34.6901, lon: 135.1955, name: 'Kobe (Hyogo)' },
        { keys: ['hiroshima', '広島'], lat: 34.3853, lon: 132.4553, name: 'Hiroshima' },
        { keys: ['sendai', '仙台', 'miyagi', '宮城'], lat: 38.2682, lon: 140.8694, name: 'Sendai (Miyagi)' },
        { keys: ['tokiwadaira', '常盤平', 'matsudo', '松戸'], lat: 35.8037, lon: 139.9575, name: 'Tokiwadaira (Matsudo, Chiba)' },
        { keys: ['kashiwa', '柏'], lat: 35.8622, lon: 139.9773, name: 'Kashiwa (Chiba)' },
        { keys: ['funabashi', '船橋'], lat: 35.6947, lon: 139.9825, name: 'Funabashi (Chiba)' },
        { keys: ['narita', '成田'], lat: 35.7767, lon: 140.3188, name: 'Narita (Chiba)' },
        { keys: ['shinjuku', '新宿'], lat: 35.6938, lon: 139.7034, name: 'Shinjuku (Tokyo)' },
        { keys: ['shibuya', '渋谷'], lat: 35.6580, lon: 139.7016, name: 'Shibuya (Tokyo)' },
        { keys: ['chiba', '千葉'], lat: 35.6074, lon: 140.1065, name: 'Chiba' },
        { keys: ['naha', '那覇', 'okinawa', '沖縄'], lat: 26.2124, lon: 127.6809, name: 'Naha (Okinawa)' }
      ];

      for (const entry of cityDict) {
        if (entry.keys.some(k => q.includes(k))) {
          lat = entry.lat;
          lon = entry.lon;
          cityName = entry.name;
          foundCity = true;
          break;
        }
      }

      if (!foundCity && q.length > 2) {
        try {
          const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en`;
          const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3000) });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData?.results?.[0]) {
              lat = geoData.results[0].latitude;
              lon = geoData.results[0].longitude;
              cityName = geoData.results[0].name;
            }
          }
        } catch (gErr) {
          console.warn('[AutonomousWebSearch] Geocoding API skipped:', gErr.message);
        }
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const current = data.current_weather;
        const daily = data.daily;

        const interpretCode = (code) => {
          if (code === 0) return { ja: '晴れ（快晴）', uz: 'Musaffo ochiq havo', en: 'Clear sky' };
          if (code <= 3) return { ja: '晴れ時々くもり', uz: 'Biroz bulutli havo', en: 'Partly cloudy' };
          if (code === 45 || code === 48) return { ja: '霧（濃霧）', uz: 'Tumanli havo', en: 'Foggy' };
          if (code >= 51 && code <= 55) return { ja: '小雨・霧雨', uz: 'Yengil yomg\'ir (shivalama)', en: 'Light drizzle' };
          if (code >= 61 && code <= 65) return { ja: '雨', uz: 'Yomg\'ir', en: 'Rain' };
          if (code >= 71 && code <= 77) return { ja: '雪・降雪', uz: 'Qor yog\'ishi', en: 'Snowfall' };
          if (code >= 80 && code <= 82) return { ja: 'にわか雨', uz: 'Jala yomg\'ir', en: 'Rain showers' };
          if (code >= 95) return { ja: '雷雨・荒天', uz: 'Momaqaldiroqli havo', en: 'Thunderstorm' };
          return { ja: 'くもり', uz: 'Bulutli havo', en: 'Cloudy' };
        };

        const cleanLang = (lang || 'ja').substring(0, 2);
        const weatherDesc = interpretCode(current.weathercode);
        const todayMax = daily?.temperature_2m_max?.[0] ?? current.temperature;
        const todayMin = daily?.temperature_2m_min?.[0] ?? current.temperature;
        const tomorrowMax = daily?.temperature_2m_max?.[1] ?? todayMax;
        const tomorrowMin = daily?.temperature_2m_min?.[1] ?? todayMin;
        const tomorrowCode = daily?.weathercode?.[1] ?? current.weathercode;
        const tomorrowDesc = interpretCode(tomorrowCode);

        return {
          success: true,
          cityName,
          currentTemp: current.temperature,
          weatherText: weatherDesc[cleanLang] || weatherDesc.ja,
          todayMax, todayMin,
          tomorrowMax, tomorrowMin,
          tomorrowText: tomorrowDesc[cleanLang] || tomorrowDesc.ja,
          rawJson: data
        };
      }
    } catch (e) {
      console.warn('[AutonomousWebSearch] Open-Meteo weather fetch failed:', e.message);
    }
    return { success: false };
  }
}

export const autonomousWebSearchEngine = new AutonomousWebSearchEngine();

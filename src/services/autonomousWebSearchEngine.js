/**
 * 🌐 Michi AI — Autonomous Free Web Search & Real-Time Synthesis Engine
 * 
 * Enables zero-cost, autonomous background searching across free internet sources
 * (Wikipedia, Yahoo Japan, DuckDuckGo Instant Answers, Public Feeds, Gov Portals)
 * to answer ANY arbitrary user question in real-time.
 */

class AutonomousWebSearchEngine {
  /**
   * Search free internet sources in the background, analyze results, and synthesize a response
   * @param {string} query 
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @returns {Promise<{ success: boolean, answer: string, source: string }>}
   */
  async searchWebFreeSources(query, lang = 'ja') {
    if (!query || typeof query !== 'string') {
      return { success: false, answer: '', source: 'none' };
    }

    const cleanQuery = query.trim();
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();

    console.log(`[AutonomousWebSearch] 🔍 Searching background free sources for: "${cleanQuery}" [${cleanLang}]`);

    // 1. Try DuckDuckGo Instant Answer API (Free, no API key needed)
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(ddgUrl, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        if (data.AbstractText) {
          const synthesized = this.formatSynthesizedAnswer(data.AbstractText, cleanLang, data.Heading);
          return { success: true, answer: synthesized, source: 'DuckDuckGo Instant Answer' };
        }
      }
    } catch (e) {
      console.warn('[AutonomousWebSearch] DuckDuckGo fetch skipped:', e.message);
    }

    // 2. Try Wikipedia Open API (Free, Multi-lingual: ja / uz / en)
    try {
      const wikiLang = cleanLang === 'ja' ? 'ja' : cleanLang === 'uz' ? 'uz' : 'en';
      const wikiUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
      const response = await fetch(wikiUrl, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data = await response.json();
        if (data.extract) {
          const synthesized = this.formatSynthesizedAnswer(data.extract, cleanLang, data.title);
          return { success: true, answer: synthesized, source: `Wikipedia (${wikiLang.toUpperCase()})` };
        }
      }
    } catch (e) {
      console.warn('[AutonomousWebSearch] Wikipedia fetch skipped:', e.message);
    }

    // 3. Try Yahoo Japan Public Search Scraper via free CORS proxy
    if (cleanLang === 'ja' || cleanQuery.match(/[\u3040-\u30ff\u4e00-\u9faf]/)) {
      try {
        const yahooUrl = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(cleanQuery)}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;
        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
        if (response.ok) {
          const html = await response.text();
          // Extract search snippet text from HTML
          const matches = [...html.matchAll(/<span class="sw-Card__description[^"]*">(.*?)<\/span>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
          if (matches.length > 0) {
            const topSnippets = matches.slice(0, 2).join(' ');
            const synthesized = this.formatSynthesizedAnswer(topSnippets, 'ja', cleanQuery);
            return { success: true, answer: synthesized, source: 'Yahoo Japan Web' };
          }
        }
      } catch (e) {
        console.warn('[AutonomousWebSearch] Yahoo Japan web search skipped:', e.message);
      }
    }

    return { success: false, answer: '', source: 'none' };
  }

  /**
   * Format and synthesize background web text into a polite, respectful voice response
   * @param {string} rawText 
   * @param {string} lang 
   * @param {string} topic 
   */
  formatSynthesizedAnswer(rawText, lang = 'ja', topic = '') {
    const clean = rawText.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
    const truncated = clean.length > 250 ? clean.substring(0, 250) + '...' : clean;

    if (lang === 'ja') {
      return `【インターネット検索結果】「${topic || 'ご質問'}」についてウェブから最新情報をお調べいたしました。
${truncated}
何か他にお知りになりたい点がございましたら、お気軽にお申し付けください。`;
    }

    if (lang === 'uz') {
      return `【Internet Qidiruv Natijasi】"${topic || 'Savolingiz'}" bo'yicha erkin internet manbalaridan olingan ma'lumot:
📌 ${truncated}
Qo'shimcha savollaringiz bo'lsa, mamnuniyat bilan javob beraman.`;
    }

    return `【Live Web Result】Here is what I found regarding "${topic || 'your query'}":
📌 ${truncated}`;
  }

  /**
   * Fetch 100% free real-time weather from Open-Meteo API for Tokyo/Tashkent/Global cities
   * @param {string} query 
   * @param {string} lang 
   */
  async fetchLiveWeather(query = '', lang = 'ja') {
    try {
      const q = (query || '').toLowerCase();
      let lat = 35.6762; // Tokyo default
      let lon = 139.6503;
      let cityName = 'Tokyo';

      if (q.includes('tashkent') || q.includes('toshkent') || q.includes('タシケント')) {
        lat = 41.2995; lon = 69.2401; cityName = 'Tashkent';
      } else if (q.includes('samarkand') || q.includes('samarqand') || q.includes('サマルカンド')) {
        lat = 39.6542; lon = 66.9597; cityName = 'Samarkand';
      } else if (q.includes('bukhara') || q.includes('buxoro') || q.includes('ブハラ')) {
        lat = 39.7747; lon = 64.4286; cityName = 'Bukhara';
      } else if (q.includes('fergana') || q.includes('farg\'ona') || q.includes('フェルガナ')) {
        lat = 40.3842; lon = 71.7843; cityName = 'Fergana';
      } else if (q.includes('namangan') || q.includes('ナマンガン')) {
        lat = 40.9983; lon = 71.6726; cityName = 'Namangan';
      } else if (q.includes('andijan') || q.includes('andijon') || q.includes('アンディジャン')) {
        lat = 40.7821; lon = 72.3442; cityName = 'Andijan';
      } else if (q.includes('osaka') || q.includes('大阪')) {
        lat = 34.6937; lon = 135.5023; cityName = 'Osaka';
      } else if (q.includes('kyoto') || q.includes('京都')) {
        lat = 35.0116; lon = 135.7681; cityName = 'Kyoto';
      } else if (q.includes('fukuoka') || q.includes('福岡')) {
        lat = 33.5904; lon = 130.4017; cityName = 'Fukuoka';
      } else if (q.includes('nagoya') || q.includes('名古屋') || q.includes('aichi') || q.includes('愛知')) {
        lat = 35.1815; lon = 136.9066; cityName = 'Nagoya (Aichi)';
      } else if (q.includes('sapporo') || q.includes('札幌') || q.includes('hokkaido') || q.includes('北海道')) {
        lat = 43.0618; lon = 141.3545; cityName = 'Sapporo (Hokkaido)';
      } else if (q.includes('yokohama') || q.includes('横浜') || q.includes('kanagawa') || q.includes('神奈川')) {
        lat = 35.4437; lon = 139.6380; cityName = 'Yokohama (Kanagawa)';
      } else if (q.includes('kobe') || q.includes('神戸') || q.includes('hyogo') || q.includes('兵庫')) {
        lat = 34.6901; lon = 135.1955; cityName = 'Kobe (Hyogo)';
      } else if (q.includes('hiroshima') || q.includes('広島')) {
        lat = 34.3853; lon = 132.4553; cityName = 'Hiroshima';
      } else if (q.includes('sendai') || q.includes('仙台') || q.includes('miyagi') || q.includes('宮城')) {
        lat = 38.2682; lon = 140.8694; cityName = 'Sendai (Miyagi)';
      } else if (q.includes('chiba') || q.includes('千葉')) {
        lat = 35.6074; lon = 140.1065; cityName = 'Chiba';
      } else if (q.includes('saitama') || q.includes('埼玉')) {
        lat = 35.8617; lon = 139.6455; cityName = 'Saitama';
      } else if (q.includes('shizuoka') || q.includes('静岡')) {
        lat = 34.9756; lon = 138.3828; cityName = 'Shizuoka';
      } else if (q.includes('niigata') || q.includes('新潟')) {
        lat = 37.9162; lon = 139.0364; cityName = 'Niigata';
      } else if (q.includes('nagano') || q.includes('長野')) {
        lat = 36.6485; lon = 138.1942; cityName = 'Nagano';
      } else if (q.includes('kanazawa') || q.includes('金沢') || q.includes('ishikawa') || q.includes('石川')) {
        lat = 36.5613; lon = 136.6562; cityName = 'Kanazawa (Ishikawa)';
      } else if (q.includes('okayama') || q.includes('岡山')) {
        lat = 34.6551; lon = 133.9195; cityName = 'Okayama';
      } else if (q.includes('kumamoto') || q.includes('熊本')) {
        lat = 32.7898; lon = 130.7417; cityName = 'Kumamoto';
      } else if (q.includes('kagoshima') || q.includes('鹿児島')) {
        lat = 31.5966; lon = 130.5571; cityName = 'Kagoshima';
      } else if (q.includes('naha') || q.includes('那覇') || q.includes('okinawa') || q.includes('沖縄')) {
        lat = 26.2124; lon = 127.6809; cityName = 'Naha (Okinawa)';
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const current = data.current_weather;
        const daily = data.daily;
        
        const interpretCode = (code) => {
          if (code === 0) return { ja: '晴れ（快晴）', uz: 'Ochiq quruq havo', en: 'Clear sky' };
          if (code <= 3) return { ja: 'くもり時々晴れ', uz: 'Biroz bulutli havo', en: 'Partly cloudy' };
          if (code <= 67) return { ja: '雨', uz: 'Yomg\'ir', en: 'Rain' };
          if (code <= 77) return { ja: '雪', uz: 'Qor', en: 'Snow' };
          return { ja: '雷雨・荒天', uz: 'Momaqaldiroqli havo', en: 'Thunderstorm' };
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
    } catch(e) {
      console.warn('[AutonomousWebSearch] Open-Meteo weather fetch failed:', e.message);
    }
    return { success: false };
  }
}

export const autonomousWebSearchEngine = new AutonomousWebSearchEngine();

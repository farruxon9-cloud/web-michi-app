/**
 * 🧠 Michi AI — Logical Reasoning & Chain-of-Thought (CoT) Engine
 * 
 * Enables multi-step goal decomposition, constraint deduction, license-visa compatibility
 * inference, and step-by-step logical decision-making for complex queries.
 */

import { actionRegistry } from './actionRegistry.js';
import { screenStructureIndex } from './screenStructureIndex.js';

class LogicalReasoningEngine {
  /**
   * Decompose a complex user prompt into a sequence of atomic action steps
   * @param {string} userPrompt 
   * @param {Object} [currentContext] 
   */
  decomposeGoal(userPrompt, currentContext = {}) {
    if (!userPrompt || typeof userPrompt !== 'string') return [];

    const clean = userPrompt.toLowerCase();
    const steps = [];

    // 1. Full 47 Prefectures & Major Cities Extraction
    let prefMatch = null;
    let cityMatch = null;
    const prefMap = {
      'tokyo': 'Tokyo', 'tokyoda': 'Tokyo', '東京': 'Tokyo', 'とうきょう': 'Tokyo', 'shinjuku': 'Tokyo', 'shibuya': 'Tokyo', 'ginza': 'Tokyo',
      'osaka': 'Osaka', 'osakada': 'Osaka', '大阪': 'Osaka', 'おおさか': 'Osaka', 'sakai': 'Osaka',
      'kyoto': 'Kyoto', 'kyotoda': 'Kyoto', '京都': 'Kyoto', 'きょうと': 'Kyoto',
      'aichi': 'Aichi', 'aichida': 'Aichi', '愛知': 'Aichi', 'nagoya': 'Aichi', 'nagoyada': 'Aichi', '名古屋': 'Aichi',
      'kanagawa': 'Kanagawa', 'kanagawada': 'Kanagawa', '神奈川': 'Kanagawa', 'yokohama': 'Kanagawa', 'yokohamada': 'Kanagawa', '横浜': 'Kanagawa', 'kawasaki': 'Kanagawa', '川崎': 'Kanagawa',
      'saitama': 'Saitama', 'saitamada': 'Saitama', '埼玉': 'Saitama', 'さいたま': 'Saitama',
      'chiba': 'Chiba', 'chibada': 'Chiba', '千葉': 'Chiba', 'ちば': 'Chiba',
      'fukuoka': 'Fukuoka', 'fukuokada': 'Fukuoka', '福岡': 'Fukuoka', 'kitakyushu': 'Fukuoka', '北九州': 'Fukuoka',
      'hokkaido': 'Hokkaido', 'hokkaidoda': 'Hokkaido', '北海道': 'Hokkaido', 'sapporo': 'Hokkaido', '札幌': 'Hokkaido',
      'okinawa': 'Okinawa', 'okinawada': 'Okinawa', '沖縄': 'Okinawa', 'naha': 'Okinawa', '那覇': 'Okinawa',
      'hyogo': 'Hyogo', 'hyogoda': 'Hyogo', '兵庫': 'Hyogo', 'kobe': 'Hyogo', 'kobeda': 'Hyogo', '神戸': 'Hyogo',
      'shizuoka': 'Shizuoka', '静岡': 'Shizuoka', 'hamamatsu': 'Shizuoka', '浜松': 'Shizuoka',
      'hiroshima': 'Hiroshima', '広島': 'Hiroshima',
      'miyagi': 'Miyagi', '宮城': 'Miyagi', 'sendai': 'Miyagi', '仙台': 'Miyagi',
      'gifu': 'Gifu', '岐阜': 'Gifu',
      'ibaraki': 'Ibaraki', '茨城': 'Ibaraki',
      'gunma': 'Gunma', '群馬': 'Gunma',
      'tochigi': 'Tochigi', '栃木': 'Tochigi',
      'mie': 'Mie', '三重': 'Mie',
      'shiga': 'Shiga', '滋賀': 'Shiga',
      'nara': 'Nara', '奈良': 'Nara',
      'okayama': 'Okayama', '岡山': 'Okayama',
      'kumamoto': 'Kumamoto', '熊本': 'Kumamoto',
      'kagoshima': 'Kagoshima', '鹿児島': 'Kagoshima',
      'nagano': 'Nagano', '長野': 'Nagano',
      'niigata': 'Niigata', '新潟': 'Niigata',
      'ishikawa': 'Ishikawa', '石川': 'Ishikawa', 'kanazawa': 'Ishikawa', '金沢': 'Ishikawa',
      'toyama': 'Toyama', '富山': 'Toyama',
      'fukui': 'Fukui', '福井': 'Fukui',
      'yamanashi': 'Yamanashi', '山梨': 'Yamanashi',
      'iwate': 'Iwate', '岩手': 'Iwate',
      'aomori': 'Aomori', '青森': 'Aomori',
      'akita': 'Akita', '秋田': 'Akita',
      'yamagata': 'Yamagata', '山形': 'Yamagata',
      'fukushima': 'Fukushima', '福島': 'Fukushima',
      'tottori': 'Tottori', '鳥取': 'Tottori',
      'shimane': 'Shimane', '島根': 'Shimane',
      'yamaguchi': 'Yamaguchi', '山口': 'Yamaguchi',
      'tokushima': 'Tokushima', '徳島': 'Tokushima',
      'kagawa': 'Kagawa', '香川': 'Kagawa',
      'ehime': 'Ehime', '愛媛': 'Ehime',
      'kochi': 'Kochi', '高知': 'Kochi',
      'saga': 'Saga', '佐賀': 'Saga',
      'nagasaki': 'Nagasaki', '長崎': 'Nagasaki',
      'oita': 'Oita', '大分': 'Oita',
      'miyazaki': 'Miyazaki', '宮崎': 'Miyazaki'
    };

    for (const [kw, pref] of Object.entries(prefMap)) {
      if (clean.includes(kw)) {
        prefMatch = pref;
        cityMatch = kw;
        break;
      }
    }

    // 2. Salary extraction (e.g. 350000, 35万, 300000)
    let salaryMatch = null;
    const salaryRegex = /(\d+)\s*万|(\d{6,})|(\d+)\s*ming/i;
    const sMatch = clean.match(salaryRegex);
    if (sMatch) {
      if (sMatch[1]) salaryMatch = parseInt(sMatch[1], 10) * 10000;
      else if (sMatch[2]) salaryMatch = parseInt(sMatch[2], 10);
      else if (sMatch[3]) salaryMatch = parseInt(sMatch[3], 10) * 1000;
    }

    // 3. License extraction (大型, 中型, 普通, 牽引)
    let licenseMatch = null;
    if (/大型|katta yuk|heavy/i.test(clean)) licenseMatch = '大型';
    else if (/中型|o'rta yuk|medium/i.test(clean)) licenseMatch = '中型';
    else if (/普通|oddiy|ordinary/i.test(clean)) licenseMatch = '普通';
    else if (/牽引|tirkama|trailer|towing/i.test(clean)) licenseMatch = '牽引';

    // 4. Build Multi-Step Execution Plan
    // Ensure general questions/news queries containing city/prefecture names (e.g., "今日東京で何かあった")
    // are NOT hijacked into job filters unless explicit job search keywords are present.
    const isGeneralQuery = /(何|あった|どう|ニュース|天気|事件|事故|イベント|どこ|どんな|なぜ|いつ|nima|bo'ldi|yangilik|xabar|ob-havo|voqea|qayer|what|happen|news|weather|event)/i.test(clean);
    const isExplicitJobSearch = /(求人|仕事|ワーク|探す|募集|給料|正社員|アルバイト|免許|ドライバー|ish|vakansiya|maosh|oylik|litsenziya|haydovchi|topish|qidir|job|work|vacancy|hire|apply)/i.test(clean);

    if (prefMatch && isGeneralQuery && !isExplicitJobSearch) {
      console.log(`[ReasoningEngine] Location query "${clean}" detected as general/news question. Skipping job filter execution.`);
      return steps;
    }

    if (prefMatch || salaryMatch || licenseMatch) {
      steps.push({
        step: 1,
        thought: `Foydalanuvchi ma'lumotlar filterlashni so'radi (${prefMatch || ''} ${salaryMatch || ''} ${licenseMatch || ''}).`,
        action: 'FILTER_JOBS',
        params: {
          prefecture: prefMatch,
          minSalary: salaryMatch,
          license: licenseMatch
        }
      });
    }

    // Check if user also wants to apply
    if (/topshir|ariza|apply|応募/i.test(clean)) {
      steps.push({
        step: steps.length + 1,
        thought: "Foydalanuvchi mos ishni topib ariza topshirmoqchi. Kerakli e'lon tanlangach tasdiqlash so'raladi.",
        action: 'CONFIRM_APPLICATION',
        params: {}
      });
    }

    return steps;
  }

  /**
   * Infer license and job compatibility restrictions based on user profile
   * @param {Object} userProfile - { licenseHeld, visaType, japaneseLevel }
   */
  inferJobCompatibility(userProfile = {}) {
    const { licenseHeld = '普通', visaType = '', japaneseLevel = 'N4' } = userProfile;
    const restrictions = [];
    const recommendations = [];

    // Deduction Rule 1: License hierarchy
    if (licenseHeld === '普通') {
      restrictions.push("Sizda faqat Oddiy (普通) litsenziya bor. Katta (大型) yuk mashinalarini boshqara olmaysiz.");
      recommendations.push({
        action: 'NAVIGATE_TO_ACADEMY',
        reason: "Katta maoshli ishlar uchun 大型 litsenziyasi kerak. Avtomaktab bo'limida o'qish imkoniyatlarini ko'rishingiz mumkin."
      });
    }

    // Deduction Rule 2: Visa restrictions
    if (visaType === 'Student') {
      restrictions.push("Talaba vizasi bilan haftasiga ko'pi bilan 28 soat soatbay (アルバイト) ishlash mumkin. Doimiy (正社員) ish tavsiya etilmaydi.");
    }

    return { restrictions, recommendations };
  }

  /**
   * Generate Step-by-Step Chain-of-Thought (CoT) explanation
   * @param {string} userQuery 
   * @param {string} activeTab 
   */
  reasonStepByStep(userQuery, activeTab = 'home') {
    const steps = this.decomposeGoal(userQuery);
    const screenCtxSummary = screenStructureIndex.getRichScreenContext(activeTab);

    let reasoningText = `💭 MANTIQIY TAHLIL VA QADAMLAR ZANJIRI (CoT):\n`;
    reasoningText += `  1. So'rov mazmuni tahlil qilindi: "${userQuery}"\n`;

    if (steps.length > 0) {
      reasoningText += `  2. Mantiqiy qadamlar rejalashtirildi (${steps.length} ta micro-harakat):\n`;
      for (const s of steps) {
        reasoningText += `     • [Qadam ${s.step}] ${s.thought} → Action: ${s.action} (${JSON.stringify(s.params)})\n`;
      }
    } else {
      reasoningText += `  2. Bir martalik to'g'ridan-to'g'ri buyruq yoki muloqot so'ralgan.\n`;
    }

    return {
      reasoningText,
      executionSteps: steps
    };
  }
}

export const reasoningEngine = new LogicalReasoningEngine();

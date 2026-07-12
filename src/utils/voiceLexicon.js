// src/utils/voiceLexicon.js

// Levenshtein Distance algorithm to calculate string similarity percentage
export const getSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return (maxLength - distance) / maxLength;
};

// Centralized dictionary of voice patterns, commands, and local responses
export const VOICE_LEXICON = [
  {
    command: 'NAVIGATE_TO_HOME',
    patterns: {
      uz: ['bosh sahifa', 'asosiy sahifa', 'uyga o\'tish', 'uy sahifa', 'boshiga', 'dashboard', 'home', 'go home'],
      ja: ['ホーム', 'メイン画面', 'トップページ', 'メイン', 'トップ', 'ダッシュボード'],
      en: ['home', 'go home', 'dashboard', 'main page']
    },
    responses: {
      uz: "Bosh sahifaga o'tilmoqda.",
      ja: "ホーム画面に移動します。",
      en: "Navigating to home page."
    }
  },
  {
    command: 'NAVIGATE_TO_JOBS',
    patterns: {
      uz: ['ish top', 'ish qidir', 'ishlar', 'ish e\'lonlari', 'vakansiyalar', 'rabota', 'ishlarni ko\'rsat', 'ishlar bo\'limi', 'jobs', 'find jobs', 'work'],
      ja: ['求人', '仕事', 'ワーク', '求人検索', '仕事を探して', '求人情報'],
      en: ['jobs', 'job listings', 'find jobs', 'vacancies', 'work']
    },
    responses: {
      uz: "Ish e'lonlari sahifasiga o'tilmoqda.",
      ja: "求人情報ページに移動します。",
      en: "Opening job listings."
    }
  },
  {
    command: 'NAVIGATE_TO_ACADEMY',
    patterns: {
      uz: ['maktab', 'avtomaktab', 'avto maktab', 'haydovchilik maktabi', 'kurslar', 'prava kurslari', 'prava', 'guvohnoma', 'academy', 'school', 'driving school'],
      ja: ['免許', '教習所', '学校', '自動車学校', 'アカデミー', 'ドライビングスクール'],
      en: ['academy', 'driving school', 'license school', 'courses']
    },
    responses: {
      uz: "Avtomaktablar sahifasiga o'tilmoqda.",
      ja: "自動車学校のページに移動します。",
      en: "Opening driving schools page."
    }
  },
  {
    command: 'NAVIGATE_TO_SERVICE',
    patterns: {
      uz: ['servis', 'xizmat', 'xizmatlar', 'servislar', 'coming soon', 'tez kunda', 'service', 'services'],
      ja: ['サービス', 'その他'],
      en: ['service', 'services', 'coming soon']
    },
    responses: {
      uz: "Xizmatlar bo'limiga o'tilmoqda.",
      ja: "サービスページに移動します。",
      en: "Opening services page."
    }
  },
  {
    command: 'NAVIGATE_TO_PROFILE',
    patterns: {
      uz: ['profilim', 'profilni och', 'mening sahifam', 'kabinetim', 'sozlamalar', 'shaxsiy kabinet', 'kabinetga', 'profile', 'my page', 'settings'],
      ja: ['マイページ', 'プロフィール', '設定', 'マイアカウント'],
      en: ['profile', 'my page', 'settings', 'account']
    },
    responses: {
      uz: "Profil sahifasiga o'tilmoqda.",
      ja: "マイページに移動します。",
      en: "Navigating to profile."
    }
  },
  {
    command: 'MUSIC_PLAY',
    patterns: {
      uz: ['musiqa qo\'y', 'musiqani yoq', 'qo\'shiq qo\'y', 'yoq', 'boshla', 'ijro et', 'ijro', 'chal', 'pusk', 'pleyni bos', 'play', 'music on', 'turn on music'],
      ja: ['音楽', '曲', 'かけて', '流して', '再生', 'プレイ', 'スタート', 'ミュージック'],
      en: ['play', 'music', 'play music', 'resume music', 'turn on music']
    },
    responses: {
      uz: "Musiqa qo'yilmoqda.",
      ja: "音楽を再生します。",
      en: "Playing music."
    }
  },
  {
    command: 'MUSIC_PAUSE',
    patterns: {
      uz: ['to\'xtat', 'toxtat', 'o\'chir', 'uchir', 'pauza', 'jim', 'stop', 'pause', 'mute', 'turn off music'],
      ja: ['止めて', '停止', 'ストップ', '消して', 'オフ', '静かに', '一時停止'],
      en: ['pause', 'stop', 'mute', 'turn off music', 'quiet']
    },
    responses: {
      uz: "Musiqa to'xtatildi.",
      ja: "音楽を停止します。",
      en: "Pausing music."
    }
  },
  {
    command: 'MUSIC_NEXT',
    patterns: {
      uz: ['keyingi', 'oldinga', 'skip', 'o\'tkaz', 'otkaz', 'keyingisi', 'almashtir', 'boshqa qo\'shiq', 'next track', 'next song'],
      ja: ['次の曲', '次へ', 'ネクスト', 'スキップ', '変えて', 'かえて'],
      en: ['next', 'skip', 'forward', 'another song', 'next song']
    },
    responses: {
      uz: "Keyingi qo'shiqni qo'yaman.",
      ja: "次の曲を再生します。",
      en: "Playing next track."
    }
  },
  {
    command: 'TOGGLE_THEME',
    patterns: {
      uz: ['tema', 'tungi rejim', 'mavzu', 'rang', 'qorong\'i', 'yorug\'', 'tun', 'kun', 'switch theme', 'dark mode', 'light mode'],
      ja: ['テーマ', 'ダークモード', 'ライトモード', '黒', '白', '明るく', '暗く', 'モード切り替え'],
      en: ['theme', 'dark mode', 'light mode', 'change theme', 'colors']
    },
    responses: {
      uz: "Mavzuni o'zgartiraman.",
      ja: "テーマを切り替えます。",
      en: "Switching app theme."
    }
  },
  {
    command: 'OPEN_RESUME',
    patterns: {
      uz: ['rezyume', 'anketa', 'rezume', 'hujjat', 'cv', 'resume', 'curriculum vitae'],
      ja: ['履歴書', 'レジュメ', '履歴書作成'],
      en: ['resume', 'cv', 'resume builder', 'curriculum vitae']
    },
    responses: {
      uz: "Rezyume yaratish bo'limini ochaman.",
      ja: "履歴書作成画面を開きます。",
      en: "Opening resume builder."
    }
  }
];

// Matches user input text against the lexicon patterns using direct matching & fuzzy similarity
export const matchLexiconCommand = (text, userLang = 'uz') => {
  const cleanText = text.toLowerCase().trim();
  if (!cleanText) return null;

  const targetLang = userLang.startsWith('uz') ? 'uz' : userLang.startsWith('ja') ? 'ja' : 'en';

  // 1. Direct Match Check (Substring inclusion)
  for (const entry of VOICE_LEXICON) {
    const list = entry.patterns[targetLang] || [];
    for (const pattern of list) {
      if (cleanText.includes(pattern) || pattern.includes(cleanText)) {
        return {
          command: entry.command,
          response: entry.responses[targetLang] || entry.responses['en'],
          language: targetLang
        };
      }
    }
  }

  // 2. Fuzzy Similarity Check (Levenshtein Distance)
  let bestMatch = null;
  let highestScore = 0.0;

  for (const entry of VOICE_LEXICON) {
    const list = entry.patterns[targetLang] || [];
    for (const pattern of list) {
      const score = getSimilarity(cleanText, pattern);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          command: entry.command,
          response: entry.responses[targetLang] || entry.responses['en'],
          language: targetLang
        };
      }
    }
  }

  // If match score exceeds 75% threshold, accept it! (handles typos and minor pronunciation variations)
  if (highestScore >= 0.75) {
    console.log(`Fuzzy NLP match: Matched command "${bestMatch.command}" with score ${Math.round(highestScore*100)}%`);
    return bestMatch;
  }

  // 3. Special Language Switch Interceptions
  if (/(yaponchaga|日本語に|japanese)/i.test(cleanText)) {
    return { command: 'CHANGE_LANGUAGE', response: "日本語に変更します。", language: 'ja', targetLang: 'ja' };
  }
  if (/(o'zbekchaga|ウズベク|uzbek)/i.test(cleanText)) {
    return { command: 'CHANGE_LANGUAGE', response: "O'zbek tiliga o'zgartiraman.", language: 'uz', targetLang: 'uz' };
  }
  if (/(inglizchaga|英語に|english)/i.test(cleanText)) {
    return { command: 'CHANGE_LANGUAGE', response: "Switching to English.", language: 'en', targetLang: 'en' };
  }

  return null;
};

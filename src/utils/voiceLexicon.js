// src/utils/voiceLexicon.js
import { japaneseNewsService } from '../services/japaneseNewsService.js';

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
      uz: ['bosh sahifa', 'asosiy sahifa', 'uyga o\'tish', 'uyga otish', 'uy sahifa', 'boshiga', 'dashboard', 'home', 'go home', 'bosh sahifaga o\'tish', 'bosh sahifaga otish', 'bosh sahifani och', 'asosiy', 'bosh', 'asosiy sahifaga o\'tish', 'uyga', 'bosh sahifani ko\'rsat'],
      ja: ['ホーム', 'メイン画面', 'トップページ', 'メイン', 'トップ', 'ダッシュボード', 'ホーム画面', 'ホームに戻る', 'ホームを開いて', 'トップ画面'],
      en: ['home', 'go home', 'dashboard', 'main page', 'home page', 'open home', 'show home']
    },
    responses: {
      uz: "Xo'p, bosh sahifaga o'tkazaman!",
      ja: "はい、ホーム画面に移動いたします！",
      en: "Sure, navigating to home page!"
    }
  },
  {
    command: 'NAVIGATE_TO_JOBS',
    patterns: {
      uz: ['ish top', 'ish qidir', 'ishlar', 'ish e\'lonlari', 'ish elonlari', 'vakansiyalar', 'rabota', 'ishlarni ko\'rsat', 'ishlarni korsat', 'ishlar bo\'limi', 'ishlar bolimi', 'jobs', 'find jobs', 'work', 'ish e\'lonlariga o\'tish', 'ish elonlariga otish', 'ish sahifasini och', 'ishlar sahifasi', 'ishlarni och', 'vakansiyalarni ko\'rsat', 'ish sahifasi', 'vakansiya'],
      ja: ['求人', '仕事', 'ワーク', '求人検索', '仕事を探して', '求人情報', '求人一覧', '仕事一覧', '求人画面', '求人を開いて', '仕事画面', '求人ページ'],
      en: ['jobs', 'job listings', 'find jobs', 'vacancies', 'work', 'open jobs', 'jobs page', 'show jobs']
    },
    responses: {
      uz: "Xo'p, ish e'lonlari sahifasiga o'tkazaman!",
      ja: "はい、求人情報ページに移動いたします！",
      en: "Sure, opening job listings!"
    }
  },
  {
    command: 'NAVIGATE_TO_ACADEMY',
    patterns: {
      uz: ['maktab', 'avtomaktab', 'avto maktab', 'haydovchilik maktabi', 'kurslar', 'prava kurslari', 'prava', 'guvohnoma', 'academy', 'school', 'driving school', 'avtomaktabga o\'tish', 'avtomaktabga otish', 'avtomaktablar', 'avtomaktabni och', 'maktabni och', 'maktablar', 'avtomaktablar sahifasi', 'avtomaktab sahifasi', 'o\'quv markazi', 'oquv markazi', 'maktabga o\'tish'],
      ja: ['免許', '教習所', '学校', '自動車学校', 'アカデミー', 'ドライビングスクール', '教習所画面', '教習所を開いて', '自動車学校を開いて', '学ぶ', '教習所一覧', '学校一覧'],
      en: ['academy', 'driving school', 'license school', 'courses', 'open academy', 'school page', 'driving academy', 'show schools']
    },
    responses: {
      uz: "Xo'p, avtomaktablar sahifasiga o'tkazaman!",
      ja: "はい、自動車学校のページに移動いたします！",
      en: "Sure, opening driving schools page!"
    }
  },
  {
    command: 'NAVIGATE_TO_SERVICE',
    patterns: {
      uz: ['servis', 'xizmat', 'xizmatlar', 'servislar', 'coming soon', 'tez kunda', 'service', 'services', 'servis bo\'limiga o\'tish', 'servis bolimiga otish', 'xizmatlar bo\'limi', 'xizmatlarni och', 'servisni och', 'servislar sahifasi', 'xizmatlar sahifasi'],
      ja: ['サービス', 'その他', 'サービス画面', 'サービスを開いて', 'サービス一覧', 'サービスページ'],
      en: ['service', 'services', 'coming soon', 'open services', 'services page', 'show services']
    },
    responses: {
      uz: "Xo'p, xizmatlar bo'limiga o'tkazaman!",
      ja: "はい、サービスページに移動いたします！",
      en: "Sure, opening services page!"
    }
  },
  {
    command: 'NAVIGATE_TO_PROFILE',
    patterns: {
      uz: ['profilim', 'profilni och', 'mening sahifam', 'kabinetim', 'shaxsiy kabinet', 'kabinetga', 'profile', 'my page', 'profilimga o\'tish', 'profilimga otish', 'profil', 'profil sahifasi', 'profilni ko\'rsat', 'kabinet', 'mening kabinetim'],
      ja: ['マイページ', 'プロフィール', 'マイアカウント', 'マイページを開いて', 'マイページに移動', 'プロフィール画面', 'マイページ画面', 'プロフィールを開いて'],
      en: ['profile', 'my page', 'account', 'open profile', 'my profile', 'show profile', 'my account']
    },
    responses: {
      uz: "Xo'p, profil sahifasiga o'tkazaman!",
      ja: "はい、マイページに移動いたします！",
      en: "Sure, navigating to profile!"
    }
  },
  {
    command: 'GO_BACK',
    patterns: {
      uz: ['orqaga', 'orqaga qaytish', 'back', 'go back', 'yop', 'yopish'],
      ja: ['戻る', 'もどる', 'バック', '閉じる', '戻って', '戻れ', 'とじる', '戻り', '閉じて'],
      en: ['back', 'go back', 'return', 'close']
    },
    responses: {
      uz: "Xo'p, orqaga qaytaraman!",
      ja: "はい、前に戻ります！",
      en: "Sure, going back!"
    }
  },
  {
    command: 'SAY_HELLO',
    patterns: {
      uz: ['salom', 'assalomu alaykum', 'assalom alaykum', 'salom alaykum', 'privet', 'xayrli kun', 'xayrli tong', 'xayrli kech'],
      ja: ['こんにちは', 'おはよう', 'こんばんは', 'ハロー', 'どうも', 'おはよ', 'こんちは'],
      en: ['hello', 'hi', 'hey', 'good day', 'good morning', 'good afternoon', 'greetings']
    },
    responses: {
      uz: "Assalomu alaykum! Sizga qanday yordam bera olaman?",
      ja: "こんにちは！何かお手伝いできますか？",
      en: "Hello! How can I help you today?"
    }
  },
  // ==================== MUSIC CONTROLS ====================
  {
    command: 'MUSIC_PLAY',
    patterns: {
      uz: ['musiqa qo\'y', 'musiqa qoy', 'musiqani yoq', 'qo\'shiq qo\'y', 'qoshiq qoy', 'qo\'shiqni qo\'y', 'qoshiqni qoy', 'ijro et', 'ijro', 'chal', 'pusk', 'play', 'music on', 'turn on music', 'musiqani boshla'],
      ja: ['音楽', '曲', 'かけて', '流して', '再生', 'プレイ', 'スタート', 'ミュージック', '音楽をかけて', '曲をかけて', '音楽再生'],
      en: ['play', 'play music', 'resume music', 'turn on music']
    },
    responses: {
      uz: "Musiqa qo'yaman!",
      ja: "音楽を再生いたします！",
      en: "Playing music!"
    }
  },
  {
    command: 'MUSIC_PAUSE',
    patterns: {
      uz: ['to\'xtat', 'toxtat', 'pauza', 'jim', 'stop', 'pause', 'mute', 'turn off music', 'musiqani o\'chir', 'musiqani ochir', 'qo\'shiqni o\'chir', 'qoshiqni ochir', 'musiqani to\'xtat', 'musiqani toxtat'],
      ja: ['止めて', '停止', 'ストップ', '消して', 'オフ', '静かに', '一時停止', '曲を止めて', '音楽を止めて', '音楽停止', 'ミュート', '音楽オフ', 'とめろ', 'とめて'],
      en: ['pause', 'stop', 'mute', 'turn off music', 'quiet']
    },
    responses: {
      uz: "Musiqani to'xtataman!",
      ja: "音楽を停止いたします！",
      en: "Pausing music!"
    }
  },
  {
    command: 'MUSIC_NEXT',
    patterns: {
      uz: ['keyingi qo\'shiq', 'keyingi trek', 'keyingi trekka', 'oldinga qo\'shiq', 'boshqa qo\'shiq', 'next track', 'next song', 'keyingi qo\'shiqni qo\'y'],
      ja: ['次の曲', '次のトラック', 'スキップ', '曲を変えて', '次の曲を再生'],
      en: ['next song', 'next track', 'skip song', 'another song']
    },
    responses: {
      uz: "Keyingi qo'shiqni qo'yaman!",
      ja: "次の曲を再生いたします！",
      en: "Playing next track!"
    }
  },
  {
    command: 'MUSIC_PREV',
    patterns: {
      uz: ['oldingi', 'oldingisi', 'oldingi qo\'shiq', 'avvalgi', 'avvalgi qo\'shiq', 'orqaga qo\'shiq', 'previous'],
      ja: ['前の曲', '前へ', '前のトラック', '戻して', 'もどして'],
      en: ['previous', 'previous song', 'previous track', 'go back song']
    },
    responses: {
      uz: "Oldingi qo'shiqni qo'yaman!",
      ja: "前の曲を再生いたします！",
      en: "Playing previous track!"
    }
  },
  // ==================== THEME & LANGUAGE ====================
  {
    command: 'TOGGLE_THEME',
    patterns: {
      uz: ['tema', 'tungi rejim', 'mavzu', 'qorong\'i', 'yorug\'', 'tun', 'kun', 'switch theme', 'dark mode', 'light mode', 'temani almashtir'],
      ja: ['テーマ', 'ダークモード', 'ライトモード', '黒', '白', '明るく', '暗く', 'モード切り替え', 'カラーテーマ', 'テーマ切り替え'],
      en: ['theme', 'dark mode', 'light mode', 'change theme', 'colors']
    },
    responses: {
      uz: "Mavzuni o'zgartiraman!",
      ja: "テーマを切り替えます！",
      en: "Switching app theme!"
    }
  },
  // ==================== RESUME ====================
  {
    command: 'OPEN_RESUME',
    patterns: {
      uz: [
        'rezyume yozmoqchiman', 'rezyume yaratmoqchiman', 'rezyumeni to\'ldirmoqchiman',
        'rezyume yozish', 'rezyume to\'ldirish', 'rezyume tayyorlash', 'rezyume qilmoqchiman',
        'rezyume tayyorlamoqchiman', 'yaponcha rezyume', 'rezyume och', 'rezyumeni och',
        'rezyume formasini och', 'rezyume sahifasi', 'rezyume bo\'limi', 'rezyume bolimi',
        'rezyume yaratish', 'anketa to\'ldirish', 'anketa yozmoqchiman', 'anketa yaratmoqchiman',
        'rezyume', 'anketa', 'rezume', 'hujjat', 'cv', 'resume', 'curriculum vitae'
      ],
      ja: [
        '履歴書を書く', '履歴書を作りたい', '履歴書を作成したい', '履歴書を書きたい',
        '履歴書ページ', '履歴書画面', '履歴書ツール', '履歴書を作成', 'レジュメ作成',
        '履歴書', 'レジュメ', '履歴書作成', 'プロフィール作成'
      ],
      en: [
        'i want to write a resume', 'write resume', 'build resume', 'create resume',
        'make resume', 'open resume', 'fill resume', 'start resume',
        'resume', 'cv', 'resume builder', 'curriculum vitae'
      ]
    },
    responses: {
      uz: "Rezyume yaratish bo'limini ochaman!",
      ja: "履歴書作成画面を開きます！",
      en: "Opening resume builder!"
    }
  },
  {
    command: 'CLEAR_RESUME_FORM',
    patterns: {
      uz: ["rezyumeni o'chir", "formani o'chir", "tozala", "rezyumeni tozalash", "anketani o'chirish", "yozuvlarni o'chirish", "yozuvlarni tozalash", "rezyumeni tozalash"],
      ja: ["履歴書消去", "リセット", "入力内容を消去", "データを消去", "レジュメ消去", "履歴書を消す", "履歴書クリア", "消去", "クリア", "りせっと", "履歴書リセット", "レジュメリセット"],
      en: ["clear resume", "reset resume", "clear form", "delete inputs", "reset form"]
    },
    responses: {
      uz: "Rezyume ma'lumotlari butunlay tozalandi!",
      ja: "履歴書データをすべて消去いたしました！",
      en: "Resume form inputs have been cleared!"
    }
  },
  {
    command: 'CLEAR_APPLICATIONS',
    patterns: {
      uz: ["arizalarni o'chir", "arizalarni tozalash", "bajarilgan ishlarni o'chirish", "arizalarni o'chirish", "ishlarni o'chirish", "arizalar ro'yxatini tozalash"],
      ja: ["応募履歴消去", "応募をクリア", "実績を消去", "応募一覧を消去", "応募を消す", "履歴を消す", "履歴消去", "履歴クリア"],
      en: ["clear applications", "delete applications", "clear applied jobs", "clear history"]
    },
    responses: {
      uz: "Arizalar ro'yxati tozalandi!",
      ja: "応募履歴をすべて消去いたしました！",
      en: "Applied jobs list has been cleared!"
    }
  },
  // ==================== PROFILE SUB-PAGE NAVIGATION ====================
  {
    command: 'NAVIGATE_TO_NOTIFICATIONS',
    patterns: {
      uz: ['bildirishnomalar', 'bildirishnoma', 'xabarlar', 'xabarnomalar', 'notifications', 'bildirishnomalarni och', 'xabarlarni ko\'rsat'],
      ja: ['通知', 'お知らせ', '通知一覧', 'お知らせを見せて', '通知を開いて'],
      en: ['notifications', 'alerts', 'show notifications', 'open notifications']
    },
    responses: {
      uz: "Xo'p, bildirishnomalarni ochaman!",
      ja: "はい、通知一覧を開きます！",
      en: "Sure, opening notifications!"
    }
  },
  {
    command: 'NAVIGATE_TO_SETTINGS',
    patterns: {
      uz: ['sozlamalar', 'sozlash', 'settings', 'sozlamalarni och', 'sozlamalarni ko\'rsat'],
      ja: ['設定', '設定を開いて', '設定画面'],
      en: ['settings', 'open settings', 'preferences']
    },
    responses: {
      uz: "Xo'p, sozlamalarni ochaman!",
      ja: "はい、設定画面を開きます！",
      en: "Sure, opening settings!"
    }
  },
  {
    command: 'NAVIGATE_TO_APPLICATIONS',
    patterns: {
      uz: ['arizalarim', 'arizalar', 'yuborgan arizalar', 'mening arizalarim', 'ariza holati', 'my applications'],
      ja: ['応募一覧', '応募履歴', '応募状況', '私の応募', '応募を見せて'],
      en: ['my applications', 'applications', 'applied jobs', 'application status']
    },
    responses: {
      uz: "Xo'p, arizalaringizni ko'rsataman!",
      ja: "はい、応募一覧を開きます！",
      en: "Sure, showing your applications!"
    }
  },
  {
    command: 'NAVIGATE_TO_SAVED',
    patterns: {
      uz: ['saqlangan', 'saqlangan ishlar', 'sevimlilar', 'bookmarklar', 'saqlanganlar', 'saqlangan ishlarni ko\'rsat'],
      ja: ['保存した求人', 'お気に入り', 'ブックマーク', '保存一覧', 'お気に入りを見せて'],
      en: ['saved', 'saved jobs', 'bookmarks', 'favorites', 'show saved']
    },
    responses: {
      uz: "Xo'p, saqlangan ishlaringizni ko'rsataman!",
      ja: "はい、保存した求人を開きます！",
      en: "Sure, showing your saved items!"
    }
  },
  {
    command: 'NAVIGATE_TO_SHOUKAI',
    patterns: {
      uz: ['shoukai', 'tavsiya', 'tavsiyalar', 'do\'stlarga ulashish', 'do\'stlarga tavsiya', 'mening tavsiyalarim'],
      ja: ['紹介', '紹介ページ', '紹介一覧', '紹介を見せて', 'しょうかい'],
      en: ['shoukai', 'referrals', 'my referrals', 'referral page']
    },
    responses: {
      uz: "Xo'p, Shoukai sahifasini ochaman!",
      ja: "はい、紹介ページを開きます！",
      en: "Sure, opening your referrals page!"
    }
  },
  {
    command: 'NAVIGATE_TO_MY_ADS',
    patterns: {
      uz: ['e\'lonlarim', 'elanlarim', 'mening e\'lonlarim', 'joylagan ishlarim', 'ishlarimni ko\'rsat'],
      ja: ['求人広告', '掲載中の求人', '私の求人', '求人管理'],
      en: ['my ads', 'posted jobs', 'my job listings', 'manage ads']
    },
    responses: {
      uz: "Xo'p, e'lonlaringizni ko'rsataman!",
      ja: "はい、掲載中の求人を開きます！",
      en: "Sure, showing your posted ads!"
    }
  },
  {
    command: 'NAVIGATE_TO_EMPLOYEES',
    patterns: {
      uz: ['xodimlar', 'ishchilar', 'xodimlarni ko\'rsat', 'hr', 'kadrlar'],
      ja: ['従業員', '従業員一覧', 'スタッフ', '人事', '従業員を見せて'],
      en: ['employees', 'staff', 'hr', 'show employees', 'manage employees']
    },
    responses: {
      uz: "Xo'p, xodimlar ro'yxatini ochaman!",
      ja: "はい、従業員一覧を開きます！",
      en: "Sure, opening employee list!"
    }
  },
  {
    command: 'NAVIGATE_TO_PERSONAL_INFO',
    patterns: {
      uz: ['shaxsiy ma\'lumotlar', 'shaxsiy ma\'lumotlarim', 'mening ma\'lumotlarim', 'personal info'],
      ja: ['個人情報', '個人情報を開いて', '基本情報', '個人情報編集'],
      en: ['personal info', 'personal information', 'my info', 'basic info']
    },
    responses: {
      uz: "Xo'p, shaxsiy ma'lumotlaringizni ochaman!",
      ja: "はい、個人情報を開きます！",
      en: "Sure, opening your personal information!"
    }
  },
  {
    command: 'RESET_FILTERS',
    patterns: {
      uz: ['filterni tozalash', 'filtrlarni reset qil', 'filtrlarni tozalash', 'filterni yech', 'filterni reset qilish'],
      ja: ['フィルターリセット', '条件クリア', 'リセット', '条件解除', '絞り込み解除', 'フィルタークリア'],
      en: ['reset filters', 'clear filters', 'reset search']
    },
    responses: {
      uz: "Barcha filtrlar tozalandi!",
      ja: "すべての検索条件をリセットいたしました！",
      en: "All search filters have been reset!"
    }
  },
  {
    command: 'READ_NEWS',
    patterns: {
      uz: ['yangiliklar', 'yangilik', 'xabar', 'xabarlar', 'bugungi yangiliklar', 'so\'nggi yangiliklar', 'songgi yangiliklar', 'yangilik o\'qish', 'yangiliklar ko\'rsat'],
      ja: ['ニュース', '今日のニュース', 'ニュースを教えて', '最新ニュース', 'ニュースを聞かせて', 'ニュース一覧'],
      en: ['news', 'today news', 'read news', 'latest news', 'show news']
    },
    responses: {
      uz: "Bugungi Yaponiya yangiliklarini taqdim etaman.",
      ja: "本日の最新ニュースをお伝えいたします。",
      en: "Here is today's main news bulletin."
    }
  },
  {
    command: 'NEXT_NEWS',
    patterns: {
      uz: ['keyingi xabar', 'keyingi yangilik', 'keyingi yangiliklar', 'keyingi xabarlar', 'keyingisi', 'boshqa xabar', 'boshqa yangilik', 'keyingi article'],
      ja: ['次ニュース', '次のニュース', '次のニュースをお願い', 'つぎのニュース', '他のニュース', 'つぎニュース', '次へニュース'],
      en: ['next news', 'next article', 'another news', 'next bulletin', 'next story']
    },
    responses: {
      uz: "Keyingi yangilikni o'qib beraman.",
      ja: "次のニュースをお伝えいたします。",
      en: "Reading next news bulletin."
    }
  }
];

// Matches user input text against the lexicon patterns using direct matching & fuzzy similarity
export const matchLexiconCommand = async (text, userLang = 'uz') => {
  const cleanText = text.toLowerCase().trim();
  if (!cleanText) return null;

  const targetLang = userLang.startsWith('uz') ? 'uz' : userLang.startsWith('ja') ? 'ja' : 'en';

  // 0. HIGH PRIORITY: Time, Date & News Interceptions (0ms Local Real-time & Internet News)
  if (/(今何時|何時ですか|いまなんじ|時間を教えて|現在時刻|soat nech|vaqt nech|what time is it|current time)/i.test(cleanText)) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let timeResp = '';
    if (targetLang === 'ja') {
      const ampm = hours < 12 ? '午前' : '午後';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      timeResp = `ただいま${ampm}${displayHours}時${minutes}分でございます。`;
    } else if (targetLang === 'uz') {
      timeResp = `Hozir soat ${hours}:${minutes < 10 ? '0' + minutes : minutes}.`;
    } else {
      timeResp = `The current time is ${hours}:${minutes < 10 ? '0' + minutes : minutes}.`;
    }
    return { command: 'GET_TIME', response: timeResp, language: targetLang };
  }

  if (/(今日の日付|今日は何日|何曜日|bugungi sana|nechanchi sana|what date is it)/i.test(cleanText)) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    let dateResp = '';
    if (targetLang === 'ja') {
      dateResp = `本日は${year}年${month}月${date}日でございます。`;
    } else if (targetLang === 'uz') {
      dateResp = `Bugungi sana: ${year}-yil ${date}-${month}.`;
    } else {
      dateResp = `Today is ${now.toDateString()}.`;
    }
    return { command: 'GET_DATE', response: dateResp, language: targetLang };
  }

  // Pass news and general queries directly to Gemini Cloud AI

  // Special Language Switch Interceptions
  if (/(yaponchaga|日本語に|japanese)/i.test(cleanText)) {
    return { command: 'CHANGE_LANGUAGE', response: "日本語に変更します。", language: 'ja', targetLang: 'ja' };
  }
  if (/(o'zbekchaga|ウズベク|uzbek)/i.test(cleanText)) {
    return { command: 'CHANGE_LANGUAGE', response: "O'zbek tiliga o'zgartiraman.", language: 'uz', targetLang: 'uz' };
  }
  if (/(inglizchaga|英語に|english)/i.test(cleanText)) {
    return { command: 'CHANGE_LANGUAGE', response: "Switching to English.", language: 'en', targetLang: 'en' };
  }

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

  return null;
};

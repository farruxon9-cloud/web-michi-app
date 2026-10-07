/**
 * 🧾 Resume Voice Parsers — fully local (no network, no tokens).
 *
 * Turns raw speech-recognition text (7 UI languages) into clean 履歴書 field values:
 * names, katakana readings, dates, phone numbers, postal codes, e-mails, gender,
 * JLPT level, driver licences and yes/no + voice commands.
 */

/* ------------------------------------------------------------------ */
/* Normalisation helpers                                               */
/* ------------------------------------------------------------------ */

const APOSTROPHES = /[‘’ʻʼ`´]/g;

/** Lower-case, unify apostrophes, strip punctuation and extra spaces. */
export function normalizeUtterance(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFKC')
    .replace(APOSTROPHES, "'")
    .toLowerCase()
    .replace(/[.,!?;:"«»“”()[\]{}。、！？「」・…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const capitalizeFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const cleanTrailing = (s) => s.replace(/^[\s,.、。-]+|[\s,、-]+$/g, '').trim();

/* ------------------------------------------------------------------ */
/* Voice commands                                                      */
/* ------------------------------------------------------------------ */

export const COMMAND_PHRASES = {
  yes: [
    'ha', 'xa', 'haa', "xo'p", 'xop', "to'g'ri", 'togri', "tog'ri", 'yoz', 'yozing', 'yozavering', 'mayli', "bo'ladi", 'boladi', 'albatta', 'tasdiqlayman', 'ha yozing', 'ok', 'okey', 'okay',
    'yes', 'yeah', 'yep', 'yup', 'correct', 'right', "that's right", 'sure', 'write it', 'confirm',
    'да', 'верно', 'правильно', 'ага', 'хорошо', 'пиши', 'ок', 'окей', 'подтверждаю',
    'はい', 'ええ', 'うん', 'そうです', 'そう', '正しい', '正しいです', '大丈夫', '大丈夫です', 'お願いします', 'オッケー', 'ok です',
    '是', '对', '对的', '好', '好的', '没错', '是的', '可以',
    'có', 'đúng', 'đúng rồi', 'vâng', 'dạ', 'ừ', 'được', 'chính xác',
    'हो', 'हजुर', 'ठीक छ', 'सही', 'हुन्छ', 'हो सही'
  ],
  no: [
    "yo'q", 'yoq', "yo'g'", "noto'g'ri", 'notogri', 'xato', 'emas', 'qayta', 'boshqatdan', 'qaytadan',
    'no', 'nope', 'wrong', 'incorrect', 'again', 'not right',
    'нет', 'неверно', 'неправильно', 'заново', 'снова', 'не так',
    'いいえ', '違う', '違います', 'ちがう', 'ちがいます', 'いや', 'もう一回', 'やり直し',
    '不', '不是', '不对', '错', '错了', '重新',
    'không', 'sai', 'không đúng', 'sai rồi', 'làm lại',
    'होइन', 'गलत', 'फेरि'
  ],
  skip: [
    "o'tkazib yubor", "o'tkazib yuboring", "o'tkaz", 'otkaz', 'otkazib yubor', 'keyingi', 'keyingisi', 'kerak emas', 'bilmayman', 'tashla', 'tashlab ket',
    'skip', 'next', 'pass', "don't know", 'i don\'t know', 'skip it', 'next question',
    'пропусти', 'пропустить', 'дальше', 'следующий', 'не знаю', 'далее',
    'スキップ', '次', '次へ', '飛ばして', 'パス', 'わからない', 'わかりません',
    '跳过', '下一个', '不知道',
    'bỏ qua', 'tiếp', 'tiếp theo', 'không biết',
    'छोड्नुहोस्', 'अर्को', 'थाहा छैन'
  ],
  back: [
    'orqaga', 'oldingi', 'oldingisi', 'orqaga qayt',
    'back', 'previous', 'go back',
    'назад', 'предыдущий', 'вернись',
    '戻って', '前', '戻る', '前へ',
    '返回', '上一个',
    'quay lại', 'trước',
    'पछाडि', 'अघिल्लो'
  ],
  repeat: [
    'takrorla', 'takrorlang', 'qaytar', 'qaytaring', 'yana bir bor', 'tushunmadim', 'nima dedingiz',
    'repeat', 'say again', 'pardon', 'what', 'sorry', 'repeat please',
    'повтори', 'повторите', 'еще раз', 'ещё раз', 'не понял', 'что',
    'もう一度言って', '繰り返して', '何', 'なに', 'もう一度',
    '再说一遍', '重复', '什么',
    'nhắc lại', 'lặp lại', 'gì',
    'दोहोर्याउनुहोस्', 'के'
  ],
  stop: [
    "to'xta", "to'xtat", "to'xtating", 'toxta', 'pauza', 'bas', 'yetarli',
    'stop', 'pause', 'wait', 'enough',
    'стоп', 'пауза', 'хватит', 'подожди',
    '止めて', 'やめて', 'ストップ', '一時停止', '待って',
    '停', '暂停', '停止',
    'dừng', 'tạm dừng', 'dừng lại',
    'रोक्नुहोस्', 'रोक'
  ]
};

const NORMALIZED_COMMANDS = Object.fromEntries(
  Object.entries(COMMAND_PHRASES).map(([k, list]) => [k, list.map(normalizeUtterance)])
);

/**
 * Detects a voice command.
 * strict=true → the whole utterance must be a command phrase (used while answering free text,
 * so a name like "Hasan" never triggers "ha").
 * strict=false → the utterance may start with a command ("ha, to'g'ri yozing").
 */
export function detectCommand(text, { strict = false, order = ['stop', 'back', 'skip', 'repeat', 'no', 'yes'] } = {}) {
  const n = normalizeUtterance(text);
  if (!n) return null;
  for (const cmd of order) {
    for (const phrase of NORMALIZED_COMMANDS[cmd]) {
      if (!phrase) continue;
      if (n === phrase) return cmd;
      if (!strict) {
        const isCjk = /[\u3040-\u30ff\u4e00-\u9fff]/.test(phrase);
        if (isCjk ? n.startsWith(phrase) && n.length <= phrase.length + 8
          : (n.startsWith(`${phrase} `) && n.length <= phrase.length + 24)) {
          return cmd;
        }
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Digits                                                              */
/* ------------------------------------------------------------------ */

const DIGIT_WORDS = {
  0: ['nol', 'zero', 'oh', 'ноль', 'нуль', 'ゼロ', 'れい', 'ぜろ', '零', '〇', 'không', 'शून्य'],
  1: ['bir', 'one', 'один', 'раз', 'いち', '一', 'một', 'एक'],
  2: ['ikki', 'two', 'два', 'に', '二', 'hai', 'दुई'],
  3: ['uch', 'three', 'три', 'さん', '三', 'ba', 'तीन'],
  4: ["to'rt", 'tort', 'four', 'четыре', 'よん', 'し', '四', 'bốn', 'चार'],
  5: ['besh', 'five', 'пять', 'ご', '五', 'năm', 'पाँच'],
  6: ['olti', 'six', 'шесть', 'ろく', '六', 'sáu', 'छ'],
  7: ['yetti', 'seven', 'семь', 'なな', 'しち', '七', 'bảy', 'सात'],
  8: ['sakkiz', 'eight', 'восемь', 'はち', '八', 'tám', 'आठ'],
  9: ["to'qqiz", 'toqqiz', 'nine', 'девять', 'きゅう', 'く', '九', 'chín', 'नौ']
};
const WORD_TO_DIGIT = new Map();
Object.entries(DIGIT_WORDS).forEach(([d, words]) => words.forEach(w => WORD_TO_DIGIT.set(w, d)));
const DEVANAGARI_DIGITS = '०१२३४५६७८९';

/** Converts spoken digit words + any digit script into a pure ASCII digit string. */
export function extractDigits(text) {
  if (!text) return '';
  let s = String(text).normalize('NFKC').replace(APOSTROPHES, "'").toLowerCase();
  s = s.replace(/[०-९]/g, ch => String(DEVANAGARI_DIGITS.indexOf(ch)));
  // CJK digit characters can be glued together ("〇九〇") — split them first
  s = s.replace(/([〇零一二三四五六七八九])/g, ' $1 ');
  const tokens = s.split(/[\s,.\-–—/()]+/).filter(Boolean);
  let out = '';
  for (const tok of tokens) {
    if (/^\+?\d+$/.test(tok)) { out += tok.replace('+', ''); continue; }
    if (WORD_TO_DIGIT.has(tok)) { out += WORD_TO_DIGIT.get(tok); continue; }
    const digitsInside = tok.replace(/\D/g, '');
    if (digitsInside) out += digitsInside;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Phone / postal / e-mail                                             */
/* ------------------------------------------------------------------ */

export function parsePhone(text) {
  const hasPlus = /\+|plyus|plus|плюс/.test(String(text).toLowerCase());
  let d = extractDigits(text);
  if (!d) return null;
  if (d.startsWith('81') && d.length >= 11 && d.length <= 12) d = `0${d.slice(2)}`; // +81 → domestic
  if (d.startsWith('0') && d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.startsWith('0') && d.length === 10) {
    return d.startsWith('03') || d.startsWith('06')
      ? `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`
      : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (d.startsWith('998') && d.length === 12) return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  if (d.length >= 10 && d.length <= 13) return `${hasPlus || d.length > 11 ? '+' : ''}${d}`;
  return null;
}

export function parsePostalCode(text) {
  const d = extractDigits(text);
  if (d.length !== 7) return null;
  return `${d.slice(0, 3)}-${d.slice(3)}`;
}

const EMAIL_AT_WORDS = ['kuchukcha', 'sobachka', 'собака', 'собачка', 'at sign', 'at', 'эт', 'アットマーク', 'アット', '艾特', 'a còng', 'a móc', 'एट'];
const EMAIL_DOT_WORDS = ['nuqta', 'dot', 'точка', 'ドット', '点', 'chấm', 'डट'];
const EMAIL_TLDS = ['co.jp', 'ne.jp', 'or.jp', 'com', 'net', 'org', 'jp', 'ru', 'uz', 'info'];

export function parseEmail(text) {
  if (!text) return null;
  let s = ` ${String(text).normalize('NFKC').toLowerCase()} `;
  for (const w of EMAIL_AT_WORDS) s = s.split(` ${w} `).join('@');
  for (const w of EMAIL_DOT_WORDS) s = s.split(` ${w} `).join('.');
  s = s.replace(/\s*(underscore|pastki chiziq|подчеркивание|アンダーバー)\s*/g, '_');
  s = s.replace(/\s*(defis|tire|dash|hyphen|дефис|ハイフン)\s*/g, '-');
  s = s.replace(/\s+/g, '').replace(/[,。、]/g, '').replace(/\.+$/, '');
  const at = s.indexOf('@');
  if (at > 0 && !s.slice(at).includes('.')) {
    for (const tld of EMAIL_TLDS) {
      const bare = tld.replace('.', '');
      if (s.endsWith(bare) && s.length - bare.length > at + 1) {
        s = `${s.slice(0, s.length - bare.length)}.${tld}`;
        break;
      }
    }
  }
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(s) ? s : null;
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const MONTH_PATTERNS = [
  [1, ['yanvar', 'january', 'jan', 'январ', 'janvier']],
  [2, ['fevral', 'february', 'feb', 'феврал']],
  [3, ['mart', 'march', 'mar', 'март']],
  [4, ['aprel', 'april', 'apr', 'апрел']],
  [5, ['may', 'мая', 'май']],
  [6, ['iyun', 'june', 'jun', 'июн']],
  [7, ['iyul', 'july', 'jul', 'июл']],
  [8, ['avgust', 'august', 'aug', 'август']],
  [9, ['sentabr', 'sentyabr', 'september', 'sep', 'сентябр']],
  [10, ['oktabr', 'oktyabr', 'october', 'oct', 'октябр']],
  [11, ['noyabr', 'november', 'nov', 'ноябр']],
  [12, ['dekabr', 'december', 'dec', 'декабр']]
];

const CURRENT_YEAR = () => new Date().getFullYear();

const expandYear = (y) => {
  const n = parseInt(y, 10);
  if (Number.isNaN(n)) return null;
  if (y.length === 4) return n;
  if (y.length === 2) return n > CURRENT_YEAR() % 100 ? 1900 + n : 2000 + n;
  return null;
};

const validDate = (y, m, d) => {
  if (!y || !m || !d) return null;
  if (y < 1940 || y > CURRENT_YEAR()) return null;
  if (m < 1 || m > 12 || d < 1) return null;
  const dim = new Date(y, m, 0).getDate();
  if (d > dim) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

/** Parses a spoken birth date → 'YYYY-MM-DD' or null. */
export function parseSpokenDate(text) {
  if (!text) return null;
  const s = String(text).normalize('NFKC').toLowerCase().replace(APOSTROPHES, "'");

  // 1998年3月5日 / 1998 년...
  const cjk = s.match(/(\d{2,4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?/);
  if (cjk) return validDate(expandYear(cjk[1]), +cjk[2], +cjk[3]);

  // Vietnamese: ngày 5 tháng 3 năm 1998
  const vi = s.match(/ngày\s*(\d{1,2}).*?tháng\s*(\d{1,2}).*?năm\s*(\d{2,4})/);
  if (vi) return validDate(expandYear(vi[3]), +vi[2], +vi[1]);

  // Month by name
  let month = null;
  let rest = s;
  for (const [m, names] of MONTH_PATTERNS) {
    const hit = names.find(nm => new RegExp(`(^|[^a-zа-я])${nm}[a-zа-я]*`, 'i').test(s));
    if (hit) {
      month = m;
      rest = s.replace(new RegExp(`${hit}[a-zа-я]*`, 'i'), ' ');
      break;
    }
  }
  const nums = (rest.match(/\d+/g) || []);
  if (month) {
    const yTok = nums.find(n => n.length === 4) || nums.find(n => n.length === 2 && +n > 31);
    const dTok = nums.find(n => n !== yTok && n.length <= 2 && +n >= 1 && +n <= 31);
    const year = yTok ? expandYear(yTok) : (nums.length === 2 ? expandYear(nums.find(n => n !== dTok) || '') : null);
    return validDate(year, month, dTok ? +dTok : null);
  }

  if (nums.length >= 3) {
    const [a, b, c] = nums;
    if (a.length === 4) return validDate(+a, +b, +c);          // Y M D
    if (c.length === 4 || c.length === 2) return validDate(expandYear(c), +b, +a); // D M Y
  }
  if (nums.length === 1 && nums[0].length === 8) {             // 19980305
    const n = nums[0];
    return validDate(+n.slice(0, 4), +n.slice(4, 6), +n.slice(6));
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Choices                                                             */
/* ------------------------------------------------------------------ */

const NONE_WORDS = ["yo'q", 'yoq', 'none', 'no', 'nothing', 'нет', 'никакой', 'ない', 'なし', 'ありません', '没有', '无', 'không', 'không có', 'छैन'];

const isNoneAnswer = (n) => NONE_WORDS.some(w => n === w || n.startsWith(`${w} `) || n.endsWith(` ${w}`));

export function parseGender(text) {
  const n = normalizeUtterance(text);
  if (!n) return null;
  if (/(ayol|qiz|female|woman|girl|женск|женщин|девушк|女|nữ|महिला)/.test(n)) return 'female';
  if (/(erkak|o'g'il|ogil|male|man|boy|мужск|мужчин|парень|男|nam|पुरुष)/.test(n)) return 'male';
  return null;
}

const LEVEL_WORDS = {
  1: ['bir', 'birinchi', 'one', 'first', 'один', 'первый', 'первого', '一', 'いち', 'một', 'एक'],
  2: ['ikki', 'ikkinchi', 'two', 'second', 'два', 'второй', 'второго', '二', 'に', 'hai', 'दुई'],
  3: ['uch', 'uchinchi', 'three', 'third', 'три', 'третий', 'третьего', '三', 'さん', 'ba', 'तीन'],
  4: ["to'rt", "to'rtinchi", 'four', 'fourth', 'четыре', 'четвертый', 'четвёртый', '四', 'よん', 'bốn', 'चार'],
  5: ['besh', 'beshinchi', 'five', 'fifth', 'пять', 'пятый', '五', 'ご', 'năm', 'पाँच']
};

/** → 'N1'..'N5', 'none' or null */
export function parseJlpt(text) {
  const n = normalizeUtterance(text).replace(/[०-९]/g, ch => String(DEVANAGARI_DIGITS.indexOf(ch)));
  if (!n) return null;
  const direct = n.match(/(?:^|[^a-z])(?:n|эн|ен|エヌ|えぬ)\s*-?\s*([1-5])(?!\d)/);
  if (direct) return `N${direct[1]}`;
  const kyu = n.match(/([1-5一二三四五])\s*(級|级|kyu|daraja|darajasi|уровень|level|cấp)/);
  if (kyu) {
    const map = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5 };
    return `N${map[kyu[1]] || kyu[1]}`;
  }
  const tokens = n.split(' ');
  for (const [lvl, words] of Object.entries(LEVEL_WORDS)) {
    if (tokens.some(tk => words.includes(tk)) || words.some(w => /[\u3040-\u9fff]/.test(w) && n.includes(w) && /(級|级|n)/.test(n))) {
      return `N${lvl}`;
    }
  }
  const lone = n.match(/(?:^|\s)([1-5])(?:\s|$)/);
  if (lone) return `N${lone[1]}`;
  if (isNoneAnswer(n)) return 'none';
  return null;
}

const LICENSE_PATTERNS = [
  ['junchugata', /(準中型|junchu|jun chu|semi.?medium|yarim o'rta|o'rta.?kichik|полусредн|bán trung)/],
  ['oogata', /(大型|oogata|ogata|large|big truck|katta|og'ir|грузов|больш|категори[яи] c|xe tải lớn)/],
  ['chugata', /(中型|chugata|medium|o'rta|средн|trung)/],
  ['futsu', /(普通|futsu|futsuu|oddiy|yengil|regular|normal|standard|ordinary|car|обычн|легков|категори[яи] b|phổ thông|सामान्य)/]
];

/** → array of licence keys ([] = none) or null when not understood */
export function parseLicenses(text) {
  let n = normalizeUtterance(text);
  if (!n) return null;
  const found = [];
  for (const [key, re] of LICENSE_PATTERNS) {
    if (re.test(n)) {
      found.push(key);
      n = n.replace(re, ' ');
    }
  }
  if (found.length) return found;
  if (isNoneAnswer(normalizeUtterance(text))) return [];
  return null;
}

/** Yes/no answer for loop questions ("another school?") */
export function parseYesNo(text) {
  const cmd = detectCommand(text, { order: ['no', 'yes'] });
  if (cmd === 'yes') return true;
  if (cmd === 'no') return false;
  const n = normalizeUtterance(text);
  if (/^(bor|bor edi|есть|был|あります|有|có)/.test(n)) return true;
  if (/^(yo'q|нет|ない|ありません|没有|không)/.test(n)) return false;
  return null;
}

/* ------------------------------------------------------------------ */
/* Names & free text                                                   */
/* ------------------------------------------------------------------ */

const NAME_PREFIXES = [
  'mening ismim', 'ismim', 'ism familiyam', 'ismi sharifim', 'men',
  'my name is', "i'm", 'i am', 'name is',
  'меня зовут', 'моё имя', 'мое имя', 'я',
  '私の名前は', '名前は', 'わたしは', '私は',
  '我叫', '我的名字是',
  'tên tôi là', 'tôi tên là', 'tôi là',
  'मेरो नाम'
];
const NAME_SUFFIXES = ['bo\'ladi', 'boladi', 'man', 'です', 'と申します', 'といいます', 'है', 'हो'];

const CYR_TO_LAT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh',
  ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: "o'", қ: 'q', ғ: "g'", ҳ: 'h'
};

export function cyrillicToLatin(text) {
  return String(text).split('').map(ch => {
    const lower = ch.toLowerCase();
    if (!(lower in CYR_TO_LAT)) return ch;
    const lat = CYR_TO_LAT[lower];
    return ch === lower ? lat : lat.toUpperCase();
  }).join('');
}

/** Spoken name → resume name (Latin upper case, or Japanese script kept as is). */
export function parseName(text) {
  if (!text) return null;
  let s = String(text).normalize('NFKC').replace(APOSTROPHES, "'").trim();
  const lower = s.toLowerCase();
  for (const p of NAME_PREFIXES) {
    if (lower.startsWith(`${p} `) || (/[\u3040-\u9fff]/.test(p) && lower.startsWith(p))) {
      s = s.slice(p.length).trim();
      break;
    }
  }
  for (const suf of NAME_SUFFIXES) {
    if (s.toLowerCase().endsWith(` ${suf}`) || (/[\u3040-\u9fff]/.test(suf) && s.endsWith(suf))) {
      s = s.slice(0, s.length - suf.length).trim();
    }
  }
  s = cleanTrailing(s.replace(/[.,!?。、]/g, ' ').replace(/\s+/g, ' '));
  if (!s || s.length < 2 || /\d/.test(s)) return null;
  if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(s)) return s;
  if (/[а-яё]/i.test(s)) s = cyrillicToLatin(s);
  if (s.split(' ').length > 5) return null;
  return s.toUpperCase();
}

/** Short free text (school, company, address…) */
export function parseShortText(text) {
  if (!text) return null;
  const s = cleanTrailing(String(text).normalize('NFKC').replace(/\s+/g, ' ').replace(/[.。]+$/, ''));
  if (s.length < 2) return null;
  return capitalizeFirst(s);
}

/** Long free text (motivation / self-PR) */
export function parseLongText(text) {
  if (!text) return null;
  let s = String(text).normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (s.length < 4) return null;
  s = capitalizeFirst(s);
  if (!/[.!?。！？]$/.test(s)) s += /[\u3040-\u9fff]/.test(s) ? '。' : '.';
  return s;
}

/* ------------------------------------------------------------------ */
/* Latin / Cyrillic name → Katakana (furigana proposal)                */
/* ------------------------------------------------------------------ */

const KANA_ROWS = {
  '':  ['ア', 'イ', 'ウ', 'エ', 'オ'],
  k:  ['カ', 'キ', 'ク', 'ケ', 'コ'],
  g:  ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
  s:  ['サ', 'シ', 'ス', 'セ', 'ソ'],
  z:  ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
  t:  ['タ', 'ティ', 'トゥ', 'テ', 'ト'],
  d:  ['ダ', 'ディ', 'ドゥ', 'デ', 'ド'],
  n:  ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  h:  ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  x:  ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  f:  ['ファ', 'フィ', 'フ', 'フェ', 'フォ'],
  b:  ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
  v:  ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
  p:  ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
  m:  ['マ', 'ミ', 'ム', 'メ', 'モ'],
  y:  ['ヤ', 'イ', 'ユ', 'イェ', 'ヨ'],
  r:  ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  l:  ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  w:  ['ワ', 'ウィ', 'ウ', 'ウェ', 'ウォ'],
  j:  ['ジャ', 'ジ', 'ジュ', 'ジェ', 'ジョ'],
  S:  ['シャ', 'シ', 'シュ', 'シェ', 'ショ'], // sh
  C:  ['チャ', 'チ', 'チュ', 'チェ', 'チョ'], // ch
  T:  ['ツァ', 'ツィ', 'ツ', 'ツェ', 'ツォ'], // ts
  q:  ['カ', 'キ', 'ク', 'ケ', 'コ']
};
const KANA_CODA = { k: 'ク', g: 'グ', s: 'ス', z: 'ズ', t: 'ト', d: 'ド', n: 'ン', h: 'フ', x: 'フ', f: 'フ', b: 'ブ', v: 'フ', p: 'プ', m: 'ム', y: 'イ', r: 'ル', l: 'ル', w: 'ウ', j: 'ジ', S: 'シュ', C: 'チ', T: 'ツ', q: 'ク' };
const VOWEL_INDEX = { a: 0, i: 1, u: 2, e: 3, o: 4 };
const GEMINATE = new Set(['k', 't', 'p', 's', 'S', 'C', 'q']);

function wordToKatakana(word) {
  let w = word.toLowerCase()
    .replace(/o'/g, 'o').replace(/g'/g, 'g').replace(/'/g, '')
    .replace(/sh/g, 'S').replace(/ch/g, 'C').replace(/ts/g, 'T').replace(/zh/g, 'j')
    .replace(/kh/g, 'x').replace(/ph/g, 'f').replace(/th/g, 't').replace(/ck/g, 'k')
    .replace(/c/g, 'k').replace(/ı/g, 'i').replace(/[^a-zSCT]/g, '');
  let out = '';
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const next = w[i + 1];
    if (ch in VOWEL_INDEX) {
      const prev = out.slice(-1);
      if (ch === w[i - 1]) { out += 'ー'; continue; }
      out += KANA_ROWS[''][VOWEL_INDEX[ch]];
      if (!prev) continue;
      continue;
    }
    if (next && next === ch && w[i + 2] in VOWEL_INDEX) {
      if (GEMINATE.has(ch)) out += 'ッ';
      continue; // collapse doubled consonant
    }
    if (ch === 'n' && (!next || !(next in VOWEL_INDEX) && next !== 'y')) { out += 'ン'; continue; }
    if (next in VOWEL_INDEX) {
      const row = KANA_ROWS[ch];
      if (row) { out += row[VOWEL_INDEX[next]]; i++; continue; }
    }
    out += KANA_CODA[ch] || '';
  }
  return out;
}

/** "Alimov Anvar" → "アリモフ アンバル". Japanese input is returned unchanged. */
export function toKatakana(name) {
  if (!name) return '';
  const s = String(name).trim();
  if (/^[\u30a0-\u30ff\s・ー]+$/.test(s)) return s;
  const latin = /[а-яё]/i.test(s) ? cyrillicToLatin(s) : s;
  return latin.split(/\s+/).map(wordToKatakana).filter(Boolean).join(' ');
}

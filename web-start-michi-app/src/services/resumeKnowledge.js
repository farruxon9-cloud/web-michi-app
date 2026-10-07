/**
 * 📚 Resume Knowledge Pack — what the interviewer "knows". Static data only (no model, no network).
 * Loaded lazily together with the voice agent, so it never weighs on the normal app.
 *
 * Per field: a one-sentence explanation (ja + subtitles) and up to 3 tappable examples.
 * Example `value` is exactly what gets written (already in 履歴書 Japanese).
 */

const L = (ja, uz, en, ru, zh, vi, ne) => ({ ja, uz, en, ru, zh: zh || en, vi: vi || en, ne: ne || en });

export const FIELD_HELP = {
  fullName: {
    why: L('パスポートと同じ名前を、ゆっくり言ってください。カタカナで書きます。',
      "Pasportdagi ismingizni sekin ayting. Katakanada yozaman.",
      'Say the name in your passport slowly. I will write it in katakana.',
      'Медленно назовите имя как в паспорте. Я запишу его катаканой.'),
    examples: []
  },
  furigana: {
    why: L('フリガナは、名前の読み方です。カタカナで書きます。',
      "Furigana — ismingiz qanday o'qilishi. Katakanada yoziladi.",
      'Furigana is how your name is read, written in katakana.',
      'Фуригана — это чтение имени катаканой.'),
    examples: []
  },
  gender: {
    why: L('男性か女性か、どちらかを言ってください。', "Erkak yoki ayol ekaningizni ayting.", 'Say male or female.', 'Скажите: мужчина или женщина.'),
    examples: [
      { label: '男性', value: 'male', sub: L('男性', 'Erkak', 'Male', 'Мужчина', '男', 'Nam', 'पुरुष') },
      { label: '女性', value: 'female', sub: L('女性', 'Ayol', 'Female', 'Женщина', '女', 'Nữ', 'महिला') }
    ]
  },
  birthDate: {
    why: L('生まれた年、月、日を言ってください。例えば、1995年5月12日。',
      "Tug'ilgan yil, oy va kuningizni ayting. Masalan: 1995-yil 12-may.",
      'Say the year, month and day you were born, e.g. May 12, 1995.',
      'Назовите год, месяц и день рождения, например 12 мая 1995.'),
    examples: []
  },
  postalCode: {
    why: L('郵便番号は7つの数字です。わからなければ「スキップ」と言ってください。',
      "Pochta indeksi — 7 ta raqam. Bilmasangiz, «skip» deng.",
      'The postal code is 7 digits. If you do not know it, say skip.',
      'Почтовый индекс — 7 цифр. Если не знаете, скажите «пропустить».'),
    examples: []
  },
  address: {
    why: L('今住んでいる住所を、都道府県から言ってください。',
      "Hozir yashayotgan manzilingizni prefekturadan boshlab ayting.",
      'Say your current address, starting with the prefecture.',
      'Назовите текущий адрес, начиная с префектуры.'),
    examples: []
  },
  phone: {
    why: L('電話番号を、数字を一つずつ言ってください。',
      "Telefon raqamingizni raqamma-raqam ayting.",
      'Say your phone number digit by digit.',
      'Назовите номер телефона по одной цифре.'),
    examples: []
  },
  email: {
    why: L('メールアドレスを言ってください。「@」は「アット」、「.」は「ドット」です。',
      "Emailingizni ayting. «@» — «at», «.» — «dot».",
      'Say your email. Say “at” for @ and “dot” for the dot.',
      'Назовите почту. «@» — «эт», «.» — «дот».'),
    examples: []
  },
  eduSchool: {
    why: L('最後に卒業した学校の名前を言ってください。高校でも大学でも大丈夫です。',
      "Oxirgi tamomlagan o'quv yurtingiz nomini ayting. Maktab yoki universitet bo'lishi mumkin.",
      'Say the name of the last school you finished. High school or university is fine.',
      'Назовите последнее учебное заведение. Подойдёт школа или вуз.'),
    examples: [
      { label: '高等学校', value: '高等学校', sub: L('高等学校', 'Maktab / litsey', 'High school', 'Школа / лицей') },
      { label: '専門学校', value: '専門学校', sub: L('専門学校', 'Kollej', 'Vocational school', 'Колледж') },
      { label: '大学', value: '大学', sub: L('大学', 'Universitet', 'University', 'Университет') }
    ]
  },
  eduMajor: {
    why: L('学校で勉強したことを言ってください。', "Nimani o'qiganingizni ayting.", 'Say what you studied.', 'Скажите, что вы изучали.'),
    examples: [
      { label: '普通科', value: '普通科', sub: L('普通科', 'Umumiy ta\'lim', 'General studies', 'Общее образование') },
      { label: '機械工学', value: '機械工学', sub: L('機械工学', 'Mexanika', 'Mechanical engineering', 'Механика') },
      { label: '経済学', value: '経済学', sub: L('経済学', 'Iqtisodiyot', 'Economics', 'Экономика') }
    ]
  },
  workCompany: {
    why: L('前に働いた会社の名前を言ってください。仕事の経験がなければ「スキップ」です。',
      "Avval ishlagan kompaniyangiz nomini ayting. Tajriba bo'lmasa, «skip» deng.",
      'Say the company you worked for. If you have no experience, say skip.',
      'Назовите компанию, где работали. Если опыта нет — «пропустить».'),
    examples: []
  },
  workPosition: {
    why: L('その会社でどんな仕事をしましたか？', "U yerda qanday ish qilgansiz?", 'What was your job there?', 'Кем вы там работали?'),
    examples: [
      { label: 'ドライバー', value: 'ドライバー', sub: L('ドライバー', 'Haydovchi', 'Driver', 'Водитель') },
      { label: '配送スタッフ', value: '配送スタッフ', sub: L('配送スタッフ', 'Yetkazib beruvchi', 'Delivery staff', 'Курьер') },
      { label: '倉庫作業員', value: '倉庫作業員', sub: L('倉庫作業員', 'Ombor xodimi', 'Warehouse worker', 'Складской работник') }
    ]
  },
  licenses: {
    why: L('日本の運転免許の種類を言ってください。なければ「なし」です。',
      "Yaponiya haydovchilik guvohnomangiz turini ayting. Bo'lmasa — «nashi».",
      'Say your Japanese driving licence type. If none, say “nashi”.',
      'Назовите тип японских прав. Если нет — «наси».'),
    examples: [
      { label: '普通', value: ['futsu'], sub: L('普通', 'Oddiy (B)', 'Regular car', 'Обычные (B)') },
      { label: '中型', value: ['chugata'], sub: L('中型', "O'rta yuk mashinasi", 'Medium truck', 'Средний грузовик') },
      { label: '大型', value: ['oogata'], sub: L('大型', 'Katta yuk mashinasi', 'Large truck', 'Большой грузовик') }
    ]
  },
  jlpt: {
    why: L('日本語能力試験のレベルです。N5がやさしくて、N1が一番むずかしいです。',
      "JLPT darajasi. N5 eng oson, N1 eng qiyin.",
      'Your JLPT level. N5 is the easiest, N1 the hardest.',
      'Уровень JLPT. N5 — самый простой, N1 — самый сложный.'),
    examples: [
      { label: 'N3', value: 'N3', sub: L('N3', "N3 — kundalik suhbat", 'N3 — daily conversation', 'N3 — бытовой разговор') },
      { label: 'N4', value: 'N4', sub: L('N4', "N4 — oddiy suhbat", 'N4 — basic conversation', 'N4 — простой разговор') },
      { label: 'なし', value: 'none', sub: L('なし', "Yo'q", 'None', 'Нет') }
    ]
  },
  motReason: {
    why: L('日本で働きたい理由を、一つ選んでください。自分の言葉でも大丈夫です。',
      "Yaponiyada ishlash sababingizni tanlang yoki o'zingiz ayting.",
      'Pick your reason for working in Japan, or say it in your own words.',
      'Выберите причину работы в Японии или скажите своими словами.'),
    examples: [
      { label: '日本で長く働きたい', value: 'longTerm', sub: L('', "Yaponiyada uzoq ishlamoqchiman", 'I want to work in Japan long-term', 'Хочу долго работать в Японии') },
      { label: '運転の仕事が好き', value: 'loveDriving', sub: L('', "Haydovchilik ishini yaxshi ko'raman", 'I love driving work', 'Люблю работу водителем') },
      { label: '家族を支えたい', value: 'family', sub: L('', "Oilamni qo'llab-quvvatlamoqchiman", 'I want to support my family', 'Хочу поддержать семью') }
    ]
  },
  motStrength: {
    why: L('あなたのいいところを、一つ選んでください。', "Kuchli tomoningizni tanlang.", 'Pick one of your strengths.', 'Выберите вашу сильную сторону.'),
    examples: [
      { label: 'まじめ', value: 'serious', sub: L('', "Mas'uliyatli", 'Hard-working', 'Ответственный') },
      { label: '時間を守る', value: 'punctual', sub: L('', "Vaqtga rioya qilaman", 'Punctual', 'Пунктуальный') },
      { label: '安全運転', value: 'safety', sub: L('', 'Xavfsiz haydayman', 'Safe driver', 'Безопасное вождение') }
    ]
  },
  motYears: {
    why: L('運転の経験は何年ですか？なければ「なし」と言ってください。',
      "Necha yillik haydovchilik tajribangiz bor? Bo'lmasa — «nashi».",
      'How many years of driving experience? If none, say “nashi”.',
      'Сколько лет стажа вождения? Если нет — «наси».'),
    examples: [
      { label: '1年', value: 1, sub: L('', '1 yil', '1 year', '1 год') },
      { label: '3年', value: 3, sub: L('', '3 yil', '3 years', '3 года') },
      { label: 'なし', value: 0, sub: L('', "Yo'q", 'None', 'Нет') }
    ]
  }
};

/** Phrases used by the composer to build 志望動機 / 自己PR in polite resume Japanese. */
export const REASON_PHRASES = {
  longTerm: '日本で長く安定して働き、社会に貢献したい',
  loveDriving: '運転の仕事が好きで、プロのドライバーとして成長したい',
  family: '家族を支えるために、責任を持って長く働きたい'
};

export const STRENGTH_PHRASES = {
  serious: 'まじめで、任された仕事を最後まで責任を持ってやりとげる',
  punctual: '時間を守り、約束を大切にする',
  safety: '安全運転を第一に考え、交通ルールをしっかり守る'
};

/** 47 prefectures with kana readings — used to fix hiragana/katakana STT output in addresses. */
export const PREFECTURES = [
  ['北海道', 'ほっかいどう'], ['青森県', 'あおもりけん'], ['岩手県', 'いわてけん'], ['宮城県', 'みやぎけん'], ['秋田県', 'あきたけん'],
  ['山形県', 'やまがたけん'], ['福島県', 'ふくしまけん'], ['茨城県', 'いばらきけん'], ['栃木県', 'とちぎけん'], ['群馬県', 'ぐんまけん'],
  ['埼玉県', 'さいたまけん'], ['千葉県', 'ちばけん'], ['東京都', 'とうきょうと'], ['神奈川県', 'かながわけん'], ['新潟県', 'にいがたけん'],
  ['富山県', 'とやまけん'], ['石川県', 'いしかわけん'], ['福井県', 'ふくいけん'], ['山梨県', 'やまなしけん'], ['長野県', 'ながのけん'],
  ['岐阜県', 'ぎふけん'], ['静岡県', 'しずおかけん'], ['愛知県', 'あいちけん'], ['三重県', 'みえけん'], ['滋賀県', 'しがけん'],
  ['京都府', 'きょうとふ'], ['大阪府', 'おおさかふ'], ['兵庫県', 'ひょうごけん'], ['奈良県', 'ならけん'], ['和歌山県', 'わかやまけん'],
  ['鳥取県', 'とっとりけん'], ['島根県', 'しまねけん'], ['岡山県', 'おかやまけん'], ['広島県', 'ひろしまけん'], ['山口県', 'やまぐちけん'],
  ['徳島県', 'とくしまけん'], ['香川県', 'かがわけん'], ['愛媛県', 'えひめけん'], ['高知県', 'こうちけん'], ['福岡県', 'ふくおかけん'],
  ['佐賀県', 'さがけん'], ['長崎県', 'ながさきけん'], ['熊本県', 'くまもとけん'], ['大分県', 'おおいたけん'], ['宮崎県', 'みやざきけん'],
  ['鹿児島県', 'かごしまけん'], ['沖縄県', 'おきなわけん']
];

export function fieldHelp(stepId) {
  return FIELD_HELP[stepId] || null;
}

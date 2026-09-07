// ============================================================
// JAPAN LOCATION DATABASE — Prefectures, Cities, Wards, Train Lines & Stations
// Townwork-style location search data for MichiApp
// ============================================================

export const REGIONS = [
  { id: 'hokkaido', name: '北海道', nameUz: 'Hokkaido', prefectures: ['hokkaido'] },
  { id: 'tohoku', name: '東北', nameUz: 'Tohoku', prefectures: ['aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima'] },
  { id: 'kanto', name: '関東', nameUz: 'Kanto', prefectures: ['ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa'] },
  { id: 'chubu', name: '中部・北陸', nameUz: 'Chubu', prefectures: ['niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi'] },
  { id: 'kansai', name: '関西', nameUz: 'Kansai', prefectures: ['mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama'] },
  { id: 'chugoku', name: '中国', nameUz: 'Chugoku', prefectures: ['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi'] },
  { id: 'shikoku', name: '四国', nameUz: 'Shikoku', prefectures: ['tokushima', 'kagawa', 'ehime', 'kochi'] },
  { id: 'kyushu', name: '九州・沖縄', nameUz: 'Kyushu & Okinawa', prefectures: ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'] }
];

export const PREFECTURES = [
  // Hokkaido
  { id: 'hokkaido', name: '北海道', nameEn: 'Hokkaido', region: 'hokkaido' },
  // Tohoku
  { id: 'aomori', name: '青森県', nameEn: 'Aomori', region: 'tohoku' },
  { id: 'iwate', name: '岩手県', nameEn: 'Iwate', region: 'tohoku' },
  { id: 'miyagi', name: '宮城県', nameEn: 'Miyagi', region: 'tohoku' },
  { id: 'akita', name: '秋田県', nameEn: 'Akita', region: 'tohoku' },
  { id: 'yamagata', name: '山形県', nameEn: 'Yamagata', region: 'tohoku' },
  { id: 'fukushima', name: '福島県', nameEn: 'Fukushima', region: 'tohoku' },
  // Kanto
  { id: 'ibaraki', name: '茨城県', nameEn: 'Ibaraki', region: 'kanto' },
  { id: 'tochigi', name: '栃木県', nameEn: 'Tochigi', region: 'kanto' },
  { id: 'gunma', name: '群馬県', nameEn: 'Gunma', region: 'kanto' },
  { id: 'saitama', name: '埼玉県', nameEn: 'Saitama', region: 'kanto' },
  { id: 'chiba', name: '千葉県', nameEn: 'Chiba', region: 'kanto' },
  { id: 'tokyo', name: '東京都', nameEn: 'Tokyo', region: 'kanto' },
  { id: 'kanagawa', name: '神奈川県', nameEn: 'Kanagawa', region: 'kanto' },
  // Chubu
  { id: 'niigata', name: '新潟県', nameEn: 'Niigata', region: 'chubu' },
  { id: 'toyama', name: '富山県', nameEn: 'Toyama', region: 'chubu' },
  { id: 'ishikawa', name: '石川県', nameEn: 'Ishikawa', region: 'chubu' },
  { id: 'fukui', name: '福井県', nameEn: 'Fukui', region: 'chubu' },
  { id: 'yamanashi', name: '山梨県', nameEn: 'Yamanashi', region: 'chubu' },
  { id: 'nagano', name: '長野県', nameEn: 'Nagano', region: 'chubu' },
  { id: 'gifu', name: '岐阜県', nameEn: 'Gifu', region: 'chubu' },
  { id: 'shizuoka', name: '静岡県', nameEn: 'Shizuoka', region: 'chubu' },
  { id: 'aichi', name: '愛知県', nameEn: 'Aichi', region: 'chubu' },
  // Kansai
  { id: 'mie', name: '三重県', nameEn: 'Mie', region: 'kansai' },
  { id: 'shiga', name: '滋賀県', nameEn: 'Shiga', region: 'kansai' },
  { id: 'kyoto', name: '京都府', nameEn: 'Kyoto', region: 'kansai' },
  { id: 'osaka', name: '大阪府', nameEn: 'Osaka', region: 'kansai' },
  { id: 'hyogo', name: '兵庫県', nameEn: 'Hyogo', region: 'kansai' },
  { id: 'nara', name: '奈良県', nameEn: 'Nara', region: 'kansai' },
  { id: 'wakayama', name: '和歌山県', nameEn: 'Wakayama', region: 'kansai' },
  // Chugoku
  { id: 'tottori', name: '鳥取県', nameEn: 'Tottori', region: 'chugoku' },
  { id: 'shimane', name: '島根県', nameEn: 'Shimane', region: 'chugoku' },
  { id: 'okayama', name: '岡山県', nameEn: 'Okayama', region: 'chugoku' },
  { id: 'hiroshima', name: '広島県', nameEn: 'Hiroshima', region: 'chugoku' },
  { id: 'yamaguchi', name: '山口県', nameEn: 'Yamaguchi', region: 'chugoku' },
  // Shikoku
  { id: 'tokushima', name: '徳島県', nameEn: 'Tokushima', region: 'shikoku' },
  { id: 'kagawa', name: '香川県', nameEn: 'Kagawa', region: 'shikoku' },
  { id: 'ehime', name: '愛媛県', nameEn: 'Ehime', region: 'shikoku' },
  { id: 'kochi', name: '高知県', nameEn: 'Kochi', region: 'shikoku' },
  // Kyushu & Okinawa
  { id: 'fukuoka', name: '福岡県', nameEn: 'Fukuoka', region: 'kyushu' },
  { id: 'saga', name: '佐賀県', nameEn: 'Saga', region: 'kyushu' },
  { id: 'nagasaki', name: '長崎県', nameEn: 'Nagasaki', region: 'kyushu' },
  { id: 'kumamoto', name: '熊本県', nameEn: 'Kumamoto', region: 'kyushu' },
  { id: 'oita', name: '大分県', nameEn: 'Oita', region: 'kyushu' },
  { id: 'miyazaki', name: '宮崎県', nameEn: 'Miyazaki', region: 'kyushu' },
  { id: 'kagoshima', name: '鹿児島県', nameEn: 'Kagoshima', region: 'kyushu' },
  { id: 'okinawa', name: '沖縄県', nameEn: 'Okinawa', region: 'kyushu' }
];

export const CITIES_BY_PREFECTURE = {
  'tokyo': [
    {
      id: 'tokyo23',
      name: '東京23区',
      wards: [
        '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区',
        '墨田区', '江東区', '品川区', '目黒区', '大田区', '世田谷区',
        '渋谷区', '中野区', '杉並区', '豊島区', '北区', '荒川区',
        '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区'
      ]
    },
    { id: 'hachioji', name: '八王子市', wards: [] },
    { id: 'tachikawa', name: '立川市', wards: [] },
    { id: 'musashino', name: '武蔵野市', wards: [] },
    { id: 'mitaka', name: '三鷹市', wards: [] },
    { id: 'fuchu', name: '府中市', wards: [] },
    { id: 'chofu', name: '調布市', wards: [] },
    { id: 'machida', name: '町田市', wards: [] },
    { id: 'kodaira', name: '小平市', wards: [] },
    { id: 'hino', name: '日野市', wards: [] },
    { id: 'kokubunji', name: '国分寺市', wards: [] },
    { id: 'nishi_tokyo', name: '西東京市', wards: [] }
  ],
  'miyagi': [
    {
      id: 'sendai',
      name: '仙台市',
      wards: ['青葉区', '宮城野区', '若林区', '太白区', '泉区']
    },
    { id: 'ishinomaki', name: '石巻市', wards: [] },
    { id: 'shiogama', name: '塩竈市', wards: [] },
    { id: 'kesennuma', name: '気仙沼市', wards: [] },
    { id: 'shiroishi', name: '白石市', wards: [] },
    { id: 'natori', name: '名取市', wards: [] },
    { id: 'kakuda', name: '角田市', wards: [] },
    { id: 'tagajo', name: '多賀城市', wards: [] },
    { id: 'iwanuma', name: '岩沼市', wards: [] },
    { id: 'tome', name: '登米市', wards: [] },
    { id: 'kurihara', name: '栗原市', wards: [] },
    { id: 'higashimatsushima', name: '東松島市', wards: [] },
    { id: 'osaki', name: '大崎市', wards: [] },
    { id: 'tomiya', name: '富谷市', wards: [] }
  ],
  'kanagawa': [
    {
      id: 'yokohama',
      name: '横浜市',
      wards: [
        '鶴見区', '神奈川区', '西区', '中区', '南区', '保土ケ谷区',
        '磯子区', '金沢区', '港北区', '戸塚区', '港南区', '旭区',
        '緑区', '瀬谷区', '栄区', '泉区', '青葉区', '都筑区'
      ]
    },
    {
      id: 'kawasaki',
      name: '川崎市',
      wards: ['川崎区', '幸区', '中原区', '高津区', '多摩区', '宮前区', '麻生区']
    },
    {
      id: 'sagamihara',
      name: '相模原市',
      wards: ['緑区', '中央区', '南区']
    },
    { id: 'yokosuka', name: '横須賀市', wards: [] },
    { id: 'hiratsuka', name: '平塚市', wards: [] },
    { id: 'kamakura', name: '鎌倉市', wards: [] },
    { id: 'fujisawa', name: '藤沢市', wards: [] },
    { id: 'chigasaki', name: '茅ヶ崎市', wards: [] },
    { id: 'atsugi', name: '厚木市', wards: [] },
    { id: 'yamato', name: '大和市', wards: [] }
  ],
  'osaka': [
    {
      id: 'osakashi',
      name: '大阪市',
      wards: [
        '北区', '都島区', '福島区', '此花区', '中央区', '西区', '港区',
        '大正区', '天王寺区', '浪速区', '西淀川区', '淀川区', '東淀川区',
        '東成区', '生野区', '旭区', '城東区', '鶴見区', '阿倍野区',
        '住之江区', '住吉区', '東住吉区', '平野区', '西成区'
      ]
    },
    {
      id: 'sakai',
      name: '堺市',
      wards: ['堺区', '中区', '東区', '西区', '南区', '北区', '美原区']
    },
    { id: 'toyonaka', name: '豊中市', wards: [] },
    { id: 'suita', name: '吹田市', wards: [] },
    { id: 'takatsuki', name: '高槻市', wards: [] },
    { id: 'hirakata', name: '枚方市', wards: [] },
    { id: 'ibaraki', name: '茨木市', wards: [] },
    { id: 'yao', name: '八尾市', wards: [] },
    { id: 'higashiosaka', name: '東大阪市', wards: [] }
  ],
  'saitama': [
    {
      id: 'saitamashi',
      name: 'さいたま市',
      wards: ['西区', '北区', '大宮区', '見沼区', '中央区', '桜区', '浦和区', '南区', '緑区', '岩槻区']
    },
    { id: 'kawagoe', name: '川越市', wards: [] },
    { id: 'kawaguchi', name: '川口市', wards: [] },
    { id: 'tokorozawa', name: '所沢市', wards: [] },
    { id: 'koshigaya', name: '越谷市', wards: [] },
    { id: 'souka', name: '草加市', wards: [] },
    { id: 'kasukabe', name: '春日部市', wards: [] }
  ],
  'chiba': [
    {
      id: 'chibashi',
      name: '千葉市',
      wards: ['中央区', '花見川区', '稲毛区', '若葉区', '緑区', '美浜区']
    },
    { id: 'ichikawa', name: '市川市', wards: [] },
    { id: 'funabashi', name: '船橋市', wards: [] },
    { id: 'matsudo', name: '松戸市', wards: [] },
    { id: 'kashiwa', name: '柏市', wards: [] },
    { id: 'ichihara', name: '市原市', wards: [] }
  ],
  'aichi': [
    {
      id: 'nagoyashi',
      name: '名古屋市',
      wards: [
        '千種区', '東区', '北区', '西区', '中村区', '中区', '昭和区',
        '瑞穂区', '熱田区', '中川区', '港区', '南区', '守山区', '緑区',
        '名東区', '天白区'
      ]
    },
    { id: 'toyohashi', name: '豊橋市', wards: [] },
    { id: 'okazaki', name: '岡崎市', wards: [] },
    { id: 'ichinomiya', name: '一宮市', wards: [] },
    { id: 'toyota', name: '豊田市', wards: [] }
  ],
  'fukuoka': [
    {
      id: 'fukuokashi',
      name: '福岡市',
      wards: ['東区', '博多区', '中央区', '南区', '西区', '城南区', '早良区']
    },
    {
      id: 'kitakyushushi',
      name: '北九州市',
      wards: ['門司区', '若松区', '戸畑区', '小倉北区', '小倉南区', '八幡東区', '八幡西区']
    },
    { id: 'kurume', name: '久留米市', wards: [] },
    { id: 'iizuka', name: '飯塚市', wards: [] }
  ],
  'hokkaido': [
    {
      id: 'sapporoshi',
      name: '札幌市',
      wards: ['中央区', '北区', '東区', '白石区', '豊平区', '南区', '西区', '厚別区', '手稲区', '清田区']
    },
    { id: 'hakodate', name: '函館市', wards: [] },
    { id: 'asahikawa', name: '旭川市', wards: [] },
    { id: 'otaru', name: '小樽市', wards: [] }
  ],
  'kyoto': [
    {
      id: 'kyotoshi',
      name: '京都市',
      wards: ['北区', '上京区', '左京区', '中京区', '東山区', '山科区', '下京区', '南区', '右京区', '西京区', '伏見区']
    },
    { id: 'uji', name: '宇治市', wards: [] },
    { id: 'kameoka', name: '亀岡市', wards: [] }
  ],
  'hyogo': [
    {
      id: 'kobeshi',
      name: '神戸市',
      wards: ['東灘区', '灘区', '兵庫区', '長田区', '須磨区', '垂水区', '北区', '中央区', '西区']
    },
    { id: 'himeji', name: '姫路市', wards: [] },
    { id: 'amagasaki', name: '尼崎市', wards: [] },
    { id: 'nishinomiya', name: '西宮市', wards: [] }
  ]
};

export const TRAIN_LINES_BY_PREFECTURE = {
  'tokyo': [
    {
      id: 'yamanote',
      name: 'JR山手線',
      company: 'JR東日本',
      color: '#9ACD32',
      stations: [
        '東京駅', '神田駅', '秋葉原駅', '御徒町駅', '上野駅', '鶯谷駅', '日暮里駅',
        '西日暮里駅', '田端駅', '駒込駅', '巣鴨駅', '大塚駅', '池袋駅', '目白駅',
        '高田馬場駅', '新大久保駅', '新宿駅', '代々木駅', '原宿駅', '渋谷駅',
        '恵比寿駅', '目黒駅', '五反田駅', '大崎駅', '品川駅', '高輪ゲートウェイ駅',
        '田町駅', '浜松町駅', '新橋駅', '有楽町駅'
      ]
    },
    {
      id: 'chuo_sobu',
      name: 'JR中央・総武線',
      company: 'JR東日本',
      color: '#FFD700',
      stations: [
        '三鷹駅', '吉祥寺駅', '西荻窪駅', '荻窪駅', '阿佐ケ谷駅', '高円寺駅',
        '中野駅', '東中野駅', '大久保駅', '新宿駅', '代々木駅', '千駄ケ谷駅',
        '信濃町駅', '四ツ谷駅', '市ケ谷駅', '飯田橋駅', '水道橋駅', '御茶ノ水駅',
        '秋葉原駅', '浅草橋駅', '両国駅', '錦糸町駅', '亀戸駅', '平井駅',
        '新小岩駅', '小岩駅'
      ]
    },
    {
      id: 'metro_ginza',
      name: '東京メトロ銀座線',
      company: '東京メトロ',
      color: '#FF9500',
      stations: [
        '渋谷駅', '表参道駅', '外苑前駅', '青山一丁目駅', '赤坂見附駅', '溜池山王駅',
        '虎ノ門駅', '新橋駅', '銀座駅', '京橋駅', '日本橋駅', '三越前駅',
        '神田駅', '末広町駅', '上野広小路駅', '上野駅', '稲荷町駅', '田原町駅',
        '浅草駅'
      ]
    },
    {
      id: 'metro_marunouchi',
      name: '東京メトロ丸ノ内線',
      company: '東京メトロ',
      color: '#E60012',
      stations: [
        '荻窪駅', '南阿佐ケ谷駅', '新高円寺駅', '東高円寺駅', '新中野駅', '中野坂上駅',
        '西新宿駅', '新宿駅', '新宿三丁目駅', '新宿御苑前駅', '四谷三丁目駅', '四ツ谷駅',
        '赤坂見附駅', '国会議事堂前駅', '霞ケ関駅', '銀座駅', '東京駅', '大手町駅',
        '淡路町駅', '御茶ノ水駅', '本郷三丁目駅', '後楽園駅', '茗荷谷駅', '新大塚駅',
        '池袋駅'
      ]
    },
    {
      id: 'keio_main',
      name: '京王線',
      company: '京王電鉄',
      color: '#DD0077',
      stations: ['新宿駅', '笹塚駅', '明大前駅', '千歳烏山駅', '調布駅', '府中駅', '聖蹟桜ヶ丘駅', '高幡不動駅', '京王八王子駅']
    },
    {
      id: 'odakyu_line',
      name: '小田急小田原線',
      company: '小田急電鉄',
      color: '#00A0E9',
      stations: ['新宿駅', '代々木上原駅', '下北沢駅', '登戸駅', '新百合ヶ丘駅', '町田駅', '海老名駅', '本厚木駅']
    }
  ],
  'miyagi': [
    {
      id: 'line_tohoku',
      name: 'JR東北本線(黒磯〜利府・盛岡)',
      company: 'JR東日本',
      color: '#00B261',
      stations: [
        '黒磯駅', '高久駅', '黒田原駅', '豊原駅', '白坂駅', '新白河駅', '白河駅',
        '久田野駅', '泉崎駅', '矢吹駅', '鏡石駅', '須賀川駅', '安積永盛駅',
        '郡山駅', '日和田駅', '五百川駅', '本宮駅', '杉田駅', '二本松駅', '安達駅',
        '松川駅', '南福島駅', '福島駅', '東福島駅', '伊達駅', '桑折駅', '藤田駅',
        '貝田駅', '越河駅', '白石駅', '東白石駅', '北白川駅', '大河原駅',
        '船岡駅', '槻木駅', '岩沼駅', '館腰駅', '名取駅', '南仙台駅', '太子堂駅',
        '長町駅', '仙台駅'
      ]
    },
    {
      id: 'line_senzan',
      name: 'JR仙山線',
      company: 'JR東日本',
      color: '#006633',
      stations: [
        '仙台駅', '東照宮駅', '北仙台駅', '北山駅', '東北福祉大前駅', '国見駅',
        '葛岡駅', '陸前落合駅', '愛子駅', '陸前白沢駅', '熊ケ根駅', '作並駅',
        '奥新川駅', '面白山高原駅', '山寺駅', '高瀬駅', '楯山駅', '羽前千歳駅',
        '北山形駅', '山形駅'
      ]
    },
    {
      id: 'line_senseki',
      name: 'JR仙石線',
      company: 'JR東日本',
      color: '#009BBF',
      stations: [
        'あおば通駅', '仙台駅', '榴ケ岡駅', '宮城野原駅', '陸前原ノ町駅', '苦竹駅',
        '小鶴新田駅', '福田町駅', '陸前高砂駅', '中野栄駅', '多賀城駅', '下馬駅',
        '西塩釜駅', '本塩釜駅', '東塩釜駅', '松島海岸駅', '高城町駅', '野蒜駅',
        '矢本駅', '石巻駅'
      ]
    },
    {
      id: 'sendai_namboku',
      name: '仙台市営地下鉄南北線',
      company: '仙台市交通局',
      color: '#00A95F',
      stations: [
        '泉中央駅', '八乙女駅', '黒松駅', '旭ケ丘駅', '台原駅', '北仙台駅',
        '北四番丁駅', '勾当台公園駅', '広瀬通駅', '仙台駅', '五橋駅', '愛宕橋駅',
        '河原町駅', '長町一丁目駅', '長町駅', '長町南駅', '富沢駅'
      ]
    },
    {
      id: 'sendai_tozai',
      name: '仙台市営地下鉄東西線',
      company: '仙台市交通局',
      color: '#00BFFF',
      stations: [
        '八木山動物公園駅', '青葉山駅', '川内駅', '国際センター駅', '大町西公園駅',
        '青葉通一番町駅', '仙台駅', '宮城野通駅', '連坊駅', '薬師堂駅', '卸町駅',
        '六丁の目駅', '荒井駅'
      ]
    }
  ],
  'kanagawa': [
    {
      id: 'line_tokaido',
      name: 'JR東海道本線',
      company: 'JR東日本',
      color: '#F15A22',
      stations: ['川崎駅', '横浜駅', '戸塚駅', '大船駅', '藤沢駅', '辻堂駅', '茅ケ崎駅', '平塚駅', '大磯駅', '二宮駅', '小田原駅']
    },
    {
      id: 'line_yokohama',
      name: 'JR横浜線',
      company: 'JR東日本',
      color: '#80C269',
      stations: ['東神奈川駅', '新横浜駅', '中山駅', '町田駅', '相模原駅', '橋本駅', '八王子駅']
    },
    {
      id: 'tokyu_toyoko',
      name: '東急東横線',
      company: '東急電鉄',
      color: '#E60012',
      stations: ['渋谷駅', '中目黒駅', '自由が丘駅', '武蔵小杉駅', '日吉駅', '菊名駅', '横浜駅']
    }
  ],
  'osaka': [
    {
      id: 'line_loop',
      name: 'JR大阪環状線',
      company: 'JR西日本',
      color: '#E60012',
      stations: ['大阪駅', '福島駅', '西九条駅', '弁天町駅', '大正駅', '新今宮駅', '天王寺駅', '鶴橋駅', '京橋駅']
    },
    {
      id: 'osaka_midosuji',
      name: 'Osaka Metro 御堂筋線',
      company: 'Osaka Metro',
      color: '#E60012',
      stations: ['千里中央駅', '新大阪駅', '梅田駅', '淀屋橋駅', '本町駅', '心斎橋駅', '難波駅', '天王寺駅', 'なかもず駅']
    }
  ],
  'hokkaido': [
    {
      id: 'hakodate_line',
      name: 'JR函館本線',
      company: 'JR北海道',
      color: '#008000',
      stations: ['小樽駅', '手稲駅', '琴似駅', '札幌駅', '白石駅', '江別駅', '岩見沢駅']
    },
    {
      id: 'sapporo_namboku',
      name: '札幌市営地下鉄南北線',
      company: '札幌市交通局',
      color: '#00A95F',
      stations: ['麻生駅', '北24条駅', 'さっぽろ駅', '大通駅', 'すすきの駅', '中島公園駅', '真駒内駅']
    }
  ],
  'fukuoka': [
    {
      id: 'kagoshima_line',
      name: 'JR鹿児島本線',
      company: 'JR九州',
      color: '#FF0000',
      stations: ['門司港駅', '小倉駅', '戸畑駅', '折尾駅', '赤間駅', '香椎駅', '博多駅', '二日市駅', '久留米駅']
    },
    {
      id: 'fukuoka_kuko',
      name: '福岡市地下鉄空港線',
      company: '福岡市交通局',
      color: '#FF9900',
      stations: ['姪浜駅', '西新駅', '天神駅', '博多駅', '福岡空港駅']
    }
  ],
  'saitama': [
    {
      id: 'keihin_tohoku',
      name: 'JR京浜東北線',
      company: 'JR東日本',
      color: '#00B261',
      stations: ['川口駅', '西川口駅', '蕨駅', '南浦和駅', '浦和駅', '北浦和駅', '与野駅', 'さいたま新都心駅', '大宮駅']
    },
    {
      id: 'saikyo_line',
      name: 'JR埼京線',
      company: 'JR東日本',
      color: '#008000',
      stations: ['戸田公園駅', '戸田駅', '北戸田駅', '武蔵浦和駅', '中浦和駅', '南与野駅', '与野本町駅', '大宮駅']
    }
  ],
  'chiba': [
    {
      id: 'sobu_main',
      name: 'JR総武本線',
      company: 'JR東日本',
      color: '#FFD700',
      stations: ['市川駅', '本八幡駅', '船橋駅', '津田沼駅', '稲毛駅', '千葉駅']
    },
    {
      id: 'keiyo_line',
      name: 'JR京葉線',
      company: 'JR東日本',
      color: '#DD0077',
      stations: ['舞浜駅', '新浦安駅', '市川塩浜駅', '二俣新町駅', '南船橋駅', '新習志野駅', '海浜幕張駅', '蘇我駅']
    }
  ],
  'kyoto': [
    {
      id: 'sanin_main',
      name: 'JR山陰本線 (嵯峨野線)',
      company: 'JR西日本',
      color: '#9ACD32',
      stations: ['京都駅', '丹波口駅', '二条駅', '円町駅', '花園駅', '太秦駅', '嵯峨嵐山駅']
    },
    {
      id: 'hankyu_kyoto',
      name: '阪急京都本線',
      company: '阪急電鉄',
      color: '#800000',
      stations: ['桂駅', '西院駅', '大宮駅', '烏丸駅', '京都河原町駅']
    }
  ],
  'hyogo': [
    {
      id: 'kobe_line',
      name: 'JR神戸線',
      company: 'JR西日本',
      color: '#0000FF',
      stations: ['尼崎駅', '甲子園口駅', '西宮駅', '芦屋駅', '住吉駅', '六甲道駅', '三ノ宮駅', '元町駅', '神戸駅', '姫路駅']
    }
  ],
  'aichi': [
    {
      id: 'meitetsu_nagoya',
      name: '名鉄名古屋本線',
      company: '名古屋鉄道',
      color: '#E60012',
      stations: ['豊橋駅', '岡崎公園前駅', '新安城駅', '知立駅', '金山駅', '名鉄名古屋駅', '一宮駅']
    },
    {
      id: 'higashiyama_line',
      name: '名古屋市営地下鉄東山線',
      company: '名古屋市交通局',
      color: '#FFD700',
      stations: ['高畑駅', '八田駅', '名古屋駅', '伏見駅', '栄駅', '千種駅', '星ヶ丘駅', '藤が丘駅']
    }
  ]
};

// Helper: Get all train lines across all prefectures
export function getAllTrainLines() {
  const all = [];
  const seenIds = new Set();
  Object.values(TRAIN_LINES_BY_PREFECTURE).forEach(lines => {
    lines.forEach(line => {
      if (!seenIds.has(line.id)) {
        seenIds.add(line.id);
        all.push(line);
      }
    });
  });
  return all;
}

// Helper: Get all cities across all prefectures
export function getAllCities() {
  const all = [];
  const seenIds = new Set();
  Object.values(CITIES_BY_PREFECTURE).forEach(cities => {
    cities.forEach(city => {
      if (!seenIds.has(city.id)) {
        seenIds.add(city.id);
        all.push(city);
      }
    });
  });
  return all;
}

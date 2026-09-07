/**
 * Master Japanese Railway Stations & Train Lines Database
 * 
 * Provides ultra-precise station lookup by train line and prefecture across all 47 Japanese Prefectures.
 * Enables 2-step independent selection: 1) Train Line (利用路線 *), 2) Nearest Station (最寄り駅 *).
 */

import { TRAIN_LINES_BY_PREFECTURE } from './japanLocationDB.js';

export const JAPAN_STATIONS_BY_PREFECTURE = {
  ...TRAIN_LINES_BY_PREFECTURE,

  // Complete 47 Prefectures Train Lines Coverage
  'ibaraki': [
    { id: 'joban_ibaraki', name: 'JR常磐線', company: 'JR東日本', color: '#00B261', stations: ['取手駅', '藤代駅', '牛久駅', '荒川沖駅', '土浦駅', '神立駅', '高浜駅', '石岡駅', '羽鳥駅', '岩間駅', '友部駅', '内原駅', '赤塚駅', '水戸駅', '勝田駅'] },
    { id: 'tsukuba_express', name: 'つくばエクスプレス', company: '首都圏新都市鉄道', color: '#003399', stations: ['守谷駅', 'みらい平駅', 'みどりの駅', '万博記念公園駅', '研究学園駅', 'つくば駅'] }
  ],
  'tochigi': [
    { id: 'utsunomiya_line', name: 'JR宇都宮線 (東北本線)', company: 'JR東日本', color: '#00B261', stations: ['野木駅', '間々田駅', '小山駅', '小金井駅', '自治医大駅', '石橋駅', '雀宮駅', '宇都宮駅', '岡本駅', '宝積寺駅', '氏家駅'] },
    { id: 'tobu_nikko', name: '東武日光線', company: '東武鉄道', color: '#FF6600', stations: ['栗橋駅', '新古河駅', '柳生駅', '板倉東洋大前駅', '藤岡駅', '静和駅', '新栃木駅', '栃木駅', '東武日光駅'] }
  ],
  'gunma': [
    { id: 'takasaki_line', name: 'JR高崎線', company: 'JR東日本', color: '#F15A22', stations: ['新前橋駅', '高崎駅', '倉賀野駅', '新町駅', '神保原駅', '本庄駅'] },
    { id: 'ryomo_line', name: 'JR両毛線', company: 'JR東日本', color: '#FFD700', stations: ['小山駅', '思川駅', '栃木駅', '大平下駅', '岩舟駅', '佐野駅', '富田駅', '足利駅', '桐生駅', '前橋駅'] }
  ],
  'nagano': [
    { id: 'shinano_line', name: 'しなの鉄道線', company: 'しなの鉄道', color: '#0066CC', stations: ['軽井沢駅', '中軽井沢駅', '小諸駅', '上田駅', '戸倉駅', '屋代駅', '長野駅'] },
    { id: 'shinonoi_line', name: 'JR篠ノ井線', company: 'JR東日本', color: '#00B261', stations: ['塩尻駅', '広丘駅', '村井駅', '平田駅', '南松本駅', '松本駅', '篠ノ井駅'] }
  ],
  'niigata': [
    { id: 'shinetsu_main', name: 'JR信越本線', company: 'JR東日本', color: '#00B261', stations: ['直江津駅', '柿崎駅', '柏崎駅', '長岡駅', '見附駅', '三条駅', '東三条駅', '加茂駅', '新津駅', '新潟駅'] },
    { id: 'echigo_line', name: 'JR越後線', company: 'JR東日本', color: '#008000', stations: ['柏崎駅', '出雲崎駅', '吉田駅', '巻駅', '内野駅', '新潟大学前駅', '寺尾駅', '青山駅', '関屋駅', '白山駅', '新潟駅'] }
  ],
  'shizuoka': [
    { id: 'tokaido_shizuoka', name: 'JR東海道本線 (熱海〜豊橋)', company: 'JR東海', color: '#FF6600', stations: ['熱海駅', '三島駅', '沼津駅', '富士駅', '清水駅', '静岡駅', '焼津駅', '藤枝駅', '掛川駅', '磐田駅', '浜松駅'] }
  ],
  'gifu': [
    { id: 'tokaido_gifu', name: 'JR東海道本線 (岐阜地区)', company: 'JR東海', color: '#FF6600', stations: ['大垣駅', '穂積駅', '岐阜駅', '西岐阜駅', '木曽川駅'] }
  ],
  'nara': [
    { id: 'kintetsu_nara', name: '近鉄奈良線', company: '近畿日本鉄道', color: '#FFD700', stations: ['生駒駅', '富雄駅', '学園前駅', '大和西大寺駅', '新大宮駅', '近鉄奈良駅'] }
  ],
  'shiga': [
    { id: 'biwako_line', name: 'JR琵琶湖線', company: 'JR西日本', color: '#0000FF', stations: ['米原駅', '彦根駅', '能登川駅', '近江八幡駅', '野洲駅', '守山駅', '草津駅', '南草津駅', '大津駅'] }
  ],
  'mie': [
    { id: 'jr_kisei_mie', name: 'JR紀勢本線 (三重地区)', company: 'JR東海', color: '#FF6600', stations: ['亀山駅', '津駅', '松阪駅', '多気駅', '尾鷲駅', '熊野市駅'] }
  ],
  'yamanashi': [
    { id: 'chuo_yamanashi', name: 'JR中央本線 (山梨地区)', company: 'JR東日本', color: '#0000FF', stations: ['上野原駅', '大月駅', '勝沼ぶどう郷駅', '塩山駅', '山梨市駅', '石和温泉駅', '甲府駅', '竜王駅', '韮崎駅'] }
  ],
  'toyama': [
    { id: 'ainokaze_toyama', name: 'あいの風とやま鉄道線', company: 'あいの風とやま鉄道', color: '#003399', stations: ['倶利伽羅駅', '高岡駅', '新高岡駅', '富山駅', '滑川駅', '魚津駅', '黒部駅'] }
  ],
  'ishikawa': [
    { id: 'irw_ishikawa', name: 'IRいしかわ鉄道線', company: 'IRいしかわ鉄道', color: '#0066CC', stations: ['大聖寺駅', '小松駅', '松任駅', '金沢駅', '津幡駅'] }
  ],
  'fukui': [
    { id: 'hapiline_fukui', name: 'ハピラインふくい線', company: 'ハピラインふくい', color: '#FF3399', stations: ['敦賀駅', '武生駅', '鯖江駅', '福井駅', '芦原温泉駅'] }
  ],
  'saga': [
    { id: 'nagasaki_saga', name: 'JR長崎本線 (佐賀地区)', company: 'JR九州', color: '#FF0000', stations: ['鳥栖駅', '新鳥栖駅', '佐賀駅', '江北駅', '鹿島駅'] }
  ],
  'nagasaki': [
    { id: 'nagasaki_main', name: 'JR長崎本線 (長崎地区)', company: 'JR九州', color: '#FF0000', stations: ['諫早駅', '長崎駅', '浦上駅'] }
  ],
  'oita': [
    { id: 'nippo_oita', name: 'JR日豊本線 (大分地区)', company: 'JR九州', color: '#FF0000', stations: ['中津駅', '宇佐駅', '別府駅', '大分駅', '鶴崎駅', '佐伯駅'] }
  ],
  'miyazaki': [
    { id: 'nippo_miyazaki', name: 'JR日豊本線 (宮崎地区)', company: 'JR九州', color: '#FF0000', stations: ['延岡駅', '日向市駅', '高鍋駅', '宮崎駅', '南宮崎駅', '都城駅'] }
  ],
  'kagoshima': [
    { id: 'kagoshima_main_kagoshima', name: 'JR鹿児島本線 (鹿児島地区)', company: 'JR九州', color: '#FF0000', stations: ['川内駅', '串木野駅', '伊集院駅', '鹿児島中央駅', '鹿児島駅'] }
  ],
  'fukushima': [
    { id: 'tohoku_fukushima', name: 'JR東北本線 (福島地区)', company: 'JR東日本', color: '#00B261', stations: ['白河駅', '須賀川駅', '郡山駅', '本宮駅', '二本松駅', '福島駅'] }
  ],
  'aomori': [
    { id: 'aoimori_rail', name: '青い森鉄道線', company: '青い森鉄道', color: '#0099FF', stations: ['目時駅', '八戸駅', '三沢駅', '野辺地駅', '浅虫温泉駅', '青森駅'] }
  ],
  'iwate': [
    { id: 'tohoku_iwate', name: 'JR東北本線 (岩手地区)', company: 'JR東日本', color: '#00B261', stations: ['一ノ関駅', '水沢駅', '北上駅', '花巻駅', '矢幅駅', '盛岡駅'] }
  ],
  'akita': [
    { id: 'ou_akita', name: 'JR奥羽本線 (秋田地区)', company: 'JR東日本', color: '#008000', stations: ['湯沢駅', '横手駅', '大曲駅', '秋田駅', '八郎潟駅', '能代駅', '大館駅'] }
  ],
  'yamagata': [
    { id: 'yamagata_shinkansen', name: 'JR山形線 (奥羽本線)', company: 'JR東日本', color: '#FF9900', stations: ['米沢駅', '高畠駅', '赤湯駅', '上山温泉駅', '山形駅', '天童駅', '東根駅', '新庄駅'] }
  ],
  'yamaguchi': [
    { id: 'sanyo_yamaguchi', name: 'JR山陽本線 (山口地区)', company: 'JR西日本', color: '#E60012', stations: ['岩国駅', '柳井駅', '下松駅', '徳山駅', '防府駅', '新山口駅', '宇部駅', '下関駅'] }
  ],
  'tottori': [
    { id: 'sanin_tottori', name: 'JR山陰本線 (鳥取地区)', company: 'JR西日本', color: '#0066CC', stations: ['岩美駅', '鳥取駅', '倉吉駅', '米子駅'] }
  ],
  'shimane': [
    { id: 'sanin_shimane', name: 'JR山陰本線 (島根地区)', company: 'JR西日本', color: '#0066CC', stations: ['安来駅', '松江駅', '出雲市駅', '大田市駅', '江津駅', '浜田駅', '益田駅'] }
  ],
  'kagawa': [
    { id: 'yosan_kagawa', name: 'JR予讃線 (香川地区)', company: 'JR四国', color: '#00B261', stations: ['高松駅', '坂出駅', '宇多津駅', '丸亀駅', '多度津駅', '観音寺駅'] }
  ],
  'ehime': [
    { id: 'yosan_ehime', name: 'JR予讃線 (愛媛地区)', company: 'JR四国', color: '#00B261', stations: ['川之江駅', '新居浜駅', '伊予西条駅', '今治駅', '松山駅', '八幡浜駅', '宇和島駅'] }
  ],
  'tokushima': [
    { id: 'kotoku_tokushima', name: 'JR高徳線 (徳島地区)', company: 'JR四国', color: '#00B261', stations: ['板野駅', '鳴門駅', '佐古駅', '徳島駅', '阿南駅'] }
  ],
  'kochi': [
    { id: 'dosan_kochi', name: 'JR土讃線 (高知地区)', company: 'JR四国', color: '#FF9900', stations: ['阿波池田駅', '大杉駅', '後免駅', '高知駅', '伊野駅', '須崎駅', '窪川駅'] }
  ],
  'wakayama': [
    { id: 'kisei_main', name: 'JR紀勢本線 (きのくに線)', company: 'JR西日本', color: '#00B261', stations: ['和歌山駅', '海南駅', '御坊駅', '田辺駅', '白浜駅', '新宮駅'] }
  ],
  'hiroshima': [
    { id: 'sanyo_main_hiroshima', name: 'JR山陽本線 (広島地区)', company: 'JR西日本', color: '#E60012', stations: ['福山駅', '尾道駅', '三原駅', '西条駅', '海田市駅', '広島駅', '横川駅', '西広島駅', '宮島口駅', '岩国駅'] }
  ],
  'okayama': [
    { id: 'sanyo_main_okayama', name: 'JR山陽本線 (岡山地区)', company: 'JR西日本', color: '#E60012', stations: ['和気駅', '瀬戸駅', '東岡山駅', '西川原駅', '岡山駅', '北長瀬駅', '庭瀬駅', '倉敷駅', '笠岡駅'] }
  ],
  'kumamoto': [
    { id: 'kagoshima_kumamoto', name: 'JR鹿児島本線 (熊本地区)', company: 'JR九州', color: '#FF0000', stations: ['荒尾駅', '玉名駅', '植木駅', '崇城大学前駅', '上熊本駅', '熊本駅', '宇土駅', '八代駅'] }
  ],
  'okinawa': [
    { id: 'yui_rail', name: '沖縄都市モノレール (ゆいレール)', company: '沖縄都市モノレール', color: '#FF0000', stations: ['那覇空港駅', '赤嶺駅', '小禄駅', '奥武山公園駅', '壺川駅', '旭橋駅', '県庁前駅', '美栄橋駅', '牧志駅', '安里駅', 'おもろまち駅', '古島駅', '市立病院前駅', '儀保駅', '首里駅', 'てだこ浦西駅'] }
  ]
};

/**
 * Gets deduplicated list of all Japanese train lines.
 */
export function getAllTrainLineOptions() {
  const lineMap = new Map();

  Object.values(JAPAN_STATIONS_BY_PREFECTURE).forEach(lines => {
    lines.forEach(line => {
      if (!lineMap.has(line.name)) {
        lineMap.set(line.name, {
          id: line.name,
          name: line.company ? `${line.name} (${line.company})` : line.name,
          kanji: line.name,
          company: line.company || ''
        });
      }
    });
  });

  return Array.from(lineMap.values());
}

/**
 * Gets all stations belonging to a specific train line.
 */
export function getStationsByLine(lineInput) {
  if (!lineInput) return [];

  const lineClean = String(lineInput).trim().toLowerCase();
  const stationSet = new Set();
  const result = [];

  Object.values(JAPAN_STATIONS_BY_PREFECTURE).forEach(lines => {
    lines.forEach(line => {
      const nameClean = String(line.name).trim().toLowerCase();
      const idClean = String(line.id || '').trim().toLowerCase();

      if (nameClean === lineClean || idClean === lineClean || lineClean.includes(nameClean) || nameClean.includes(lineClean)) {
        line.stations.forEach(st => {
          if (!stationSet.has(st)) {
            stationSet.add(st);
            result.push({
              id: st,
              name: st,
              kanji: st
            });
          }
        });
      }
    });
  });

  return result;
}

/**
 * Helper: Gets formatted station options for a specific prefecture.
 */
export function getStationsByPrefecture(prefInput) {
  if (!prefInput) return [];

  const prefClean = String(prefInput).trim().toLowerCase().replace(/[都道府県]/g, '');

  const keyMap = {
    'tokyo': 'tokyo', '東京都': 'tokyo', '東京': 'tokyo',
    'kanagawa': 'kanagawa', '神奈川県': 'kanagawa', '神奈川': 'kanagawa',
    'saitama': 'saitama', '埼玉県': 'saitama', '埼玉': 'saitama',
    'chiba': 'chiba', '千葉県': 'chiba', '千葉': 'chiba',
    'osaka': 'osaka', '大阪府': 'osaka', '大阪': 'osaka',
    'kyoto': 'kyoto', '京都府': 'kyoto', '京都': 'kyoto',
    'hyogo': 'hyogo', '兵庫県': 'hyogo', '兵庫': 'hyogo',
    'aichi': 'aichi', '愛知県': 'aichi', '愛知': 'aichi',
    'fukuoka': 'fukuoka', '福岡県': 'fukuoka', '福岡': 'fukuoka',
    'hokkaido': 'hokkaido', '北海道': 'hokkaido',
    'miyagi': 'miyagi', '宮城県': 'miyagi', '宮城': 'miyagi',
    'hiroshima': 'hiroshima', '広島県': 'hiroshima', '広島': 'hiroshima',
    'shizuoka': 'shizuoka', '静岡県': 'shizuoka', '静岡': 'shizuoka',
    'ibaraki': 'ibaraki', '茨城県': 'ibaraki', '茨城': 'ibaraki',
    'tochigi': 'tochigi', '栃木県': 'tochigi', '栃木': 'tochigi',
    'gunma': 'gunma', '群馬県': 'gunma', '群馬': 'gunma',
    'nagano': 'nagano', '長野県': 'nagano', '長野': 'nagano',
    'niigata': 'niigata', '新潟県': 'niigata', '新潟': 'niigata',
    'gifu': 'gifu', '岐阜県': 'gifu', '岐阜': 'gifu',
    'nara': 'nara', '奈良県': 'nara', '奈良': 'nara',
    'shiga': 'shiga', '滋賀県': 'shiga', '滋賀': 'shiga',
    'wakayama': 'wakayama', '和歌山県': 'wakayama', '和歌山': 'wakayama',
    'mie': 'mie', '三重県': 'mie', '三重': 'mie',
    'okayama': 'okayama', '岡山県': 'okayama', '岡山': 'okayama',
    'kumamoto': 'kumamoto', '熊本県': 'kumamoto', '熊本': 'kumamoto',
    'okinawa': 'okinawa', '沖縄県': 'okinawa', '沖縄': 'okinawa',
    'yamanashi': 'yamanashi', '山梨県': 'yamanashi', '山梨': 'yamanashi',
    'toyama': 'toyama', '富山県': 'toyama', '富山': 'toyama',
    'ishikawa': 'ishikawa', '石川県': 'ishikawa', '石川': 'ishikawa',
    'fukui': 'fukui', '福井県': 'fukui', '福井': 'fukui',
    'saga': 'saga', '佐賀県': 'saga', '佐賀': 'saga',
    'nagasaki': 'nagasaki', '長崎県': 'nagasaki', '長崎': 'nagasaki',
    'oita': 'oita', '大分県': 'oita', '大分': 'oita',
    'miyazaki': 'miyazaki', '宮崎県': 'miyazaki', '宮崎': 'miyazaki',
    'kagoshima': 'kagoshima', '鹿児島県': 'kagoshima', '鹿児島': 'kagoshima',
    'fukushima': 'fukushima', '福島県': 'fukushima', '福島': 'fukushima',
    'aomori': 'aomori', '青森県': 'aomori', '青森': 'aomori',
    'iwate': 'iwate', '岩手県': 'iwate', '岩手': 'iwate',
    'akita': 'akita', '秋田県': 'akita', '秋田': 'akita',
    'yamagata': 'yamagata', '山形県': 'yamagata', '山形': 'yamagata',
    'yamaguchi': 'yamaguchi', '山口県': 'yamaguchi', '山口': 'yamaguchi',
    'tottori': 'tottori', '鳥取県': 'tottori', '鳥取': 'tottori',
    'shimane': 'shimane', '島根県': 'shimane', '島根': 'shimane',
    'kagawa': 'kagawa', '香川県': 'kagawa', '香川': 'kagawa',
    'ehime': 'ehime', '愛媛県': 'ehime', '愛媛': 'ehime',
    'tokushima': 'tokushima', '徳島県': 'tokushima', '徳島': 'tokushima',
    'kochi': 'kochi', '高知県': 'kochi', '高知': 'kochi'
  };

  const key = keyMap[prefClean] || prefClean;
  const lines = JAPAN_STATIONS_BY_PREFECTURE[key] || [];

  const formatted = [];
  const seen = new Set();

  lines.forEach(line => {
    line.stations.forEach(st => {
      const uniqueId = `${line.name}・${st}`;
      if (!seen.has(uniqueId)) {
        seen.add(uniqueId);
        formatted.push({
          id: uniqueId,
          name: `${line.name} ・ ${st}`,
          kanji: uniqueId,
          line: line.name,
          station: st
        });
      }
    });
  });

  return formatted;
}

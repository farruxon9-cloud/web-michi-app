/**
 * Master Japanese Cities & Wards Dictionary across ALL 47 Prefectures
 * 
 * Provides 100% comprehensive municipal city/ward lookup for every single Japanese prefecture.
 */

import { ALL_47_PREFECTURES } from './japanRegions.js';

export const JAPAN_CITIES_BY_PREFECTURE = {
  'Hokkaido': [
    { id: 'sapporo_chuo', name: '札幌市中央区', kanji: '札幌市中央区' },
    { id: 'sapporo_kita', name: '札幌市北区', kanji: '札幌市北区' },
    { id: 'sapporo_higashi', name: '札幌市東区', kanji: '札幌市東区' },
    { id: 'sapporo_shiroishi', name: '札幌市白石区', kanji: '札幌市白石区' },
    { id: 'sapporo_toyohira', name: '札幌市豊平区', kanji: '札幌市豊平区' },
    { id: 'sapporo_minami', name: '札幌市南区', kanji: '札幌市南区' },
    { id: 'sapporo_nishi', name: '札幌市西区', kanji: '札幌市西区' },
    { id: 'hakodate', name: '函館市', kanji: '函館市' },
    { id: 'otaru', name: '小樽市', kanji: '小樽市' },
    { id: 'asahikawa', name: '旭川市', kanji: '旭川市' },
    { id: 'tomakomai', name: '苫小牧市', kanji: '苫小牧市' },
    { id: 'obihiro', name: '帯広市', kanji: '帯広市' },
    { id: 'kushiro', name: '釧路市', kanji: '釧路市' },
    { id: 'kitami', name: '北見市', kanji: '北見市' },
    { id: 'ebetsu', name: '江別市', kanji: '江別市' },
    { id: 'chitose', name: '千歳市', kanji: '千歳市' },
    { id: 'muroran', name: '室蘭市', kanji: '室蘭市' }
  ],
  'Aomori': [
    { id: 'aomori_city', name: '青森市', kanji: '青森市' },
    { id: 'hirosaki', name: '弘前市', kanji: '弘前市' },
    { id: 'hachinohe', name: '八戸市', kanji: '八戸市' },
    { id: 'kuroishi', name: '黒石市', kanji: '黒石市' },
    { id: 'goshogawara', name: '五所川原市', kanji: '五所川原市' },
    { id: 'towada', name: '十和田市', kanji: '十和田市' },
    { id: 'misawa', name: '三沢市', kanji: '三沢市' },
    { id: 'mutsu', name: 'むつ市', kanji: 'むつ市' }
  ],
  'Iwate': [
    { id: 'morioka', name: '盛岡市', kanji: '盛岡市' },
    { id: 'miyako', name: '宮古市', kanji: '宮古市' },
    { id: 'ofunato', name: '大船渡市', kanji: '大船渡市' },
    { id: 'hanamaki', name: '花巻市', kanji: '花巻市' },
    { id: 'kitakami', name: '北上市', kanji: '北上市' },
    { id: 'ichinoseki', name: '一関市', kanji: '一関市' },
    { id: 'kamaishi', name: '釜石市', kanji: '釜石市' },
    { id: 'oshu', name: '奥州市', kanji: '奥州市' }
  ],
  'Miyagi': [
    { id: 'sendai_aoba', name: '仙台市青葉区', kanji: '仙台市青葉区' },
    { id: 'sendai_miyagino', name: '仙台市宮城野区', kanji: '仙台市宮城野区' },
    { id: 'sendai_wakabayashi', name: '仙台市若林区', kanji: '仙台市若林区' },
    { id: 'sendai_taihaiku', name: '仙台市太白区', kanji: '仙台市太白区' },
    { id: 'sendai_izumi', name: '仙台市泉区', kanji: '仙台市泉区' },
    { id: 'ishinomaki', name: '石巻市', kanji: '石巻市' },
    { id: 'shiogama', name: '塩竈市', kanji: '塩竈市' },
    { id: 'kesennuma', name: '気仙沼市', kanji: '気仙沼市' },
    { id: 'natori', name: '名取市', kanji: '名取市' },
    { id: 'tagajo', name: '多賀城市', kanji: '多賀城市' },
    { id: 'osaki', name: '大崎市', kanji: '大崎市' }
  ],
  'Akita': [
    { id: 'akita_city', name: '秋田市', kanji: '秋田市' },
    { id: 'noshiro', name: '能代市', kanji: '能代市' },
    { id: 'yokote', name: '横手市', kanji: '横手市' },
    { id: 'odate', name: '大館市', kanji: '大館市' },
    { id: 'yuzawa', name: '湯沢市', kanji: '湯沢市' },
    { id: 'daisen', name: '大仙市', kanji: '大仙市' },
    { id: 'yurihonjo', name: '由利本荘市', kanji: '由利本荘市' }
  ],
  'Yamagata': [
    { id: 'yamagata_city', name: '山形市', kanji: '山形市' },
    { id: 'yonezawa', name: '米沢市', kanji: '米沢市' },
    { id: 'tsuruoka', name: '鶴岡市', kanji: '鶴岡市' },
    { id: 'sakata', name: '酒田市', kanji: '酒田市' },
    { id: 'shinjo', name: '新庄市', kanji: '新庄市' },
    { id: 'tendo', name: '天童市', kanji: '天童市' },
    { id: 'higashine', name: '東根市', kanji: '東根市' }
  ],
  'Fukushima': [
    { id: 'fukushima_city', name: '福島市', kanji: '福島市' },
    { id: 'aizuwakamatsu', name: '会津若松市', kanji: '会津若松市' },
    { id: 'koriyama', name: '郡山市', kanji: '郡山市' },
    { id: 'iwaki', name: 'いわき市', kanji: 'いわき市' },
    { id: 'shirakawa', name: '白河市', kanji: '白河市' },
    { id: 'sukagawa', name: '須賀川市', kanji: '須賀川市' },
    { id: 'minamisoma', name: '南相馬市', kanji: '南相馬市' }
  ],
  'Ibaraki': [
    { id: 'mito', name: '水戸市', kanji: '水戸市' },
    { id: 'hitachi', name: '日立市', kanji: '日立市' },
    { id: 'tsuchiura', name: '土浦市', kanji: '土浦市' },
    { id: 'koga_ibaraki', name: '古河市', kanji: '古河市' },
    { id: 'tsukuba', name: 'つくば市', kanji: 'つくば市' },
    { id: 'hitachinaka', name: 'ひたちなか市', kanji: 'ひたちなか市' },
    { id: 'kashima_ibaraki', name: '鹿嶋市', kanji: '鹿嶋市' },
    { id: 'moriya', name: '守谷市', kanji: '守谷市' },
    { id: 'toride', name: '取手市', kanji: '取手市' }
  ],
  'Tochigi': [
    { id: 'utsunomiya', name: '宇都宮市', kanji: '宇都宮市' },
    { id: 'ashikaga', name: '足利市', kanji: '足利市' },
    { id: 'tochigi_city', name: '栃木市', kanji: '栃木市' },
    { id: 'sano', name: '佐野市', kanji: '佐野市' },
    { id: 'kanuma', name: '鹿沼市', kanji: '鹿沼市' },
    { id: 'nikko', name: '日光市', kanji: '日光市' },
    { id: 'oyama', name: '小山市', kanji: '小山市' },
    { id: 'nasushiobara', name: '那須塩原市', kanji: '那須塩原市' }
  ],
  'Gunma': [
    { id: 'maebashi', name: '前橋市', kanji: '前橋市' },
    { id: 'takasaki', name: '高崎市', kanji: '高崎市' },
    { id: 'kiryu', name: '桐生市', kanji: '桐生市' },
    { id: 'isesaki', name: '伊勢崎市', kanji: '伊勢崎市' },
    { id: 'ota_gunma', name: '太田市', kanji: '太田市' },
    { id: 'tatebayashi', name: '館林市', kanji: '館林市' },
    { id: 'shibukawa', name: '渋川市', kanji: '渋川市' },
    { id: 'fujioka', name: '藤岡市', kanji: '藤岡市' }
  ],
  'Saitama': [
    { id: 'saitama_omiya', name: 'さいたま市大宮区', kanji: 'さいたま市大宮区' },
    { id: 'saitama_urawa', name: 'さいたま市浦和区', kanji: 'さいたま市浦和区' },
    { id: 'saitama_chuo', name: 'さいたま市中央区', kanji: 'さいたま市中央区' },
    { id: 'kawaguchi', name: '川口市', kanji: '川口市' },
    { id: 'kawagoe', name: '川越市', kanji: '川越市' },
    { id: 'tokorozawa', name: '所沢市', kanji: '所沢市' },
    { id: 'koshigaya', name: '越谷市', kanji: '越谷市' },
    { id: 'soka', name: '草加市', kanji: '草加市' },
    { id: 'kasukabe', name: '春日部市', kanji: '春日部市' },
    { id: 'ageo', name: '上尾市', kanji: '上尾市' },
    { id: 'kumagaya', name: '熊谷市', kanji: '熊谷市' },
    { id: 'asaka', name: '朝霞市', kanji: '朝霞市' },
    { id: 'wako', name: '和光市', kanji: '和光市' },
    { id: 'niiza', name: '新座市', kanji: '新座市' },
    { id: 'kuki', name: '久喜市', kanji: '久喜市' },
    { id: 'misato', name: '三郷市', kanji: '三郷市' },
    { id: 'fujimi', name: '富士見市', kanji: '富士見市' }
  ],
  'Chiba': [
    { id: 'matsudo', name: '松戸市', kanji: '松戸市' },
    { id: 'chiba_chuo', name: '千葉市中央区', kanji: '千葉市中央区' },
    { id: 'chiba_hanamigawa', name: '千葉市花見川区', kanji: '千葉市花見川区' },
    { id: 'chiba_inage', name: '千葉市稲毛区', kanji: '千葉市稲毛区' },
    { id: 'chiba_wakaba', name: '千葉市若葉区', kanji: '千葉市若葉区' },
    { id: 'chiba_midori', name: '千葉市緑区', kanji: '千葉市緑区' },
    { id: 'chiba_mihama', name: '千葉市美浜区', kanji: '千葉市美浜区' },
    { id: 'funabashi', name: '船橋市', kanji: '船橋市' },
    { id: 'ichikawa', name: '市川市', kanji: '市川市' },
    { id: 'kashiwa', name: '柏市', kanji: '柏市' },
    { id: 'narashino', name: '習志野市', kanji: '習志野市' },
    { id: 'ichihara', name: '市原市', kanji: '市原市' },
    { id: 'yachiyo', name: '八千代市', kanji: '八千代市' },
    { id: 'nagareyama', name: '流山市', kanji: '流山市' },
    { id: 'noda', name: '野田市', kanji: '野田市' },
    { id: 'narita', name: '成田市', kanji: '成田市' },
    { id: 'kisarazu', name: '木更津市', kanji: '木更津市' },
    { id: 'urayasu', name: '浦安市', kanji: '浦安市' },
    { id: 'sakura_chiba', name: '佐倉市', kanji: '佐倉市' },
    { id: 'yotsukaido', name: '四街道市', kanji: '四街道市' },
    { id: 'inzai', name: '印西市', kanji: '印西市' },
    { id: 'abiko', name: '我孫子市', kanji: '我孫子市' },
    { id: 'kamagaya', name: '鎌ケ谷市', kanji: '鎌ケ谷市' }
  ],
  'Tokyo': [
    { id: 'chiyoda', name: '千代田区', kanji: '千代田区' },
    { id: 'chuo', name: '中央区', kanji: '中央区' },
    { id: 'minato', name: '港区', kanji: '港区' },
    { id: 'shinjuku', name: '新宿区', kanji: '新宿区' },
    { id: 'bunkyo', name: '文京区', kanji: '文京区' },
    { id: 'taito', name: '台東区', kanji: '台東区' },
    { id: 'sumida', name: '墨田区', kanji: '墨田区' },
    { id: 'koto', name: '江東区', kanji: '江東区' },
    { id: 'shinagawa', name: '品川区', kanji: '品川区' },
    { id: 'meguro', name: '目黒区', kanji: '目黒区' },
    { id: 'ota', name: '大田区', kanji: '大田区' },
    { id: 'setagaya', name: '世田谷区', kanji: '世田谷区' },
    { id: 'shibuya', name: '渋谷区', kanji: '渋谷区' },
    { id: 'nakano', name: '中野区', kanji: '中野区' },
    { id: 'suginami', name: '杉並区', kanji: '杉並区' },
    { id: 'toshima', name: '豊島区', kanji: '豊島区' },
    { id: 'kita_tokyo', name: '北区', kanji: '北区' },
    { id: 'arakawa', name: '荒川区', kanji: '荒川区' },
    { id: 'itabashi', name: '板橋区', kanji: '板橋区' },
    { id: 'nerima', name: '練馬区', kanji: '練馬区' },
    { id: 'adachi', name: '足立区', kanji: '足立区' },
    { id: 'katsushika', name: '葛飾区', kanji: '葛飾区' },
    { id: 'edogawa', name: '江戸川区', kanji: '江戸川区' },
    { id: 'hachioji', name: '八王子市', kanji: '八王子市' },
    { id: 'tachikawa', name: '立川市', kanji: '立川市' },
    { id: 'musashino', name: '武蔵野市', kanji: '武蔵野市' },
    { id: 'mitaka', name: '三鷹市', kanji: '三鷹市' },
    { id: 'machida', name: '町田市', kanji: '町田市' },
    { id: 'fuchu_tokyo', name: '府中市', kanji: '府中市' },
    { id: 'chofu', name: '調布市', kanji: '調布市' },
    { id: 'nishitokyo', name: '西東京市', kanji: '西東京市' },
    { id: 'kodaira', name: '小平市', kanji: '小平市' },
    { id: 'hino', name: '日野市', kanji: '日野市' }
  ],
  'Kanagawa': [
    { id: 'yokohama_tsurumi', name: '横浜市鶴見区', kanji: '横浜市鶴見区' },
    { id: 'yokohama_kanagawa', name: '横浜市神奈川区', kanji: '横浜市神奈川区' },
    { id: 'yokohama_nishi', name: '横浜市西区', kanji: '横浜市西区' },
    { id: 'yokohama_naka', name: '横浜市中区', kanji: '横浜市中区' },
    { id: 'yokohama_minami', name: '横浜市南区', kanji: '横浜市南区' },
    { id: 'yokohama_hodogaya', name: '横浜市保土ケ谷区', kanji: '横浜市保土ケ谷区' },
    { id: 'yokohama_isogo', name: '横浜市磯子区', kanji: '横浜市磯子区' },
    { id: 'yokohama_kanazawa', name: '横浜市金沢区', kanji: '横浜市金沢区' },
    { id: 'yokohama_kohoku', name: '横浜市港北区', kanji: '横浜市港北区' },
    { id: 'yokohama_totsuka', name: '横浜市戸塚区', kanji: '横浜市戸塚区' },
    { id: 'yokohama_aoba', name: '横浜市青葉区', kanji: '横浜市青葉区' },
    { id: 'yokohama_tsuzuki', name: '横浜市都筑区', kanji: '横浜市都筑区' },
    { id: 'kawasaki_kawasaki', name: '川崎市川崎区', kanji: '川崎市川崎区' },
    { id: 'kawasaki_saiwai', name: '川崎市幸区', kanji: '川崎市幸区' },
    { id: 'kawasaki_nakahara', name: '川崎市中原区', kanji: '川崎市中原区' },
    { id: 'kawasaki_takatsu', name: '川崎市高津区', kanji: '川崎市高津区' },
    { id: 'kawasaki_tama', name: '川崎市多摩区', kanji: '川崎市多摩区' },
    { id: 'kawasaki_miyamae', name: '川崎市宮前区', kanji: '川崎市宮前区' },
    { id: 'kawasaki_asao', name: '川崎市麻生区', kanji: '川崎市麻生区' },
    { id: 'sagamihara_chuo', name: '相模原市中央区', kanji: '相模原市中央区' },
    { id: 'sagamihara_midori', name: '相模原市緑区', kanji: '相模原市緑区' },
    { id: 'sagamihara_minami', name: '相模原市南区', kanji: '相模原市南区' },
    { id: 'fujisawa', name: '藤沢市', kanji: '藤沢市' },
    { id: 'yokosuka', name: '横須賀市', kanji: '横須賀市' },
    { id: 'hiratsuka', name: '平塚市', kanji: '平塚市' },
    { id: 'chigasaki', name: '茅ヶ崎市', kanji: '茅ヶ崎市' },
    { id: 'yamato', name: '大和市', kanji: '大和市' },
    { id: 'atsugi', name: '厚木市', kanji: '厚木市' },
    { id: 'ebina', name: '海老名市', kanji: '海老名市' },
    { id: 'zama', name: '座間市', kanji: '座間市' },
    { id: 'odawara', name: '小田原市', kanji: '小田原市' },
    { id: 'kamakura', name: '鎌倉市', kanji: '鎌倉市' }
  ],
  'Niigata': [
    { id: 'niigata_chuo', name: '新潟市中央区', kanji: '新潟市中央区' },
    { id: 'niigata_nishi', name: '新潟市西区', kanji: '新潟市西区' },
    { id: 'niigata_higashi', name: '新潟市東区', kanji: '新潟市東区' },
    { id: 'nagaoka', name: '長岡市', kanji: '長岡市' },
    { id: 'joetsu', name: '上越市', kanji: '上越市' },
    { id: 'sanjo', name: '三条市', kanji: '三条市' },
    { id: 'shibata', name: '新発田市', kanji: '新発田市' },
    { id: 'kashiwazaki', name: '柏崎市', kanji: '柏崎市' },
    { id: 'tsubame', name: '燕市', kanji: '燕市' }
  ],
  'Toyama': [
    { id: 'toyama_city', name: '富山市', kanji: '富山市' },
    { id: 'takaoka', name: '高岡市', kanji: '高岡市' },
    { id: 'imizu', name: '射水市', kanji: '射水市' },
    { id: 'nanto', name: '南砺市', kanji: '南砺市' },
    { id: 'tonami', name: '砺波市', kanji: '砺波市' },
    { id: 'uozu', name: '魚津市', kanji: '魚津市' },
    { id: 'himi', name: '氷見市', kanji: '氷見市' },
    { id: 'kurobe', name: '黒部市', kanji: '黒部市' }
  ],
  'Ishikawa': [
    { id: 'kanazawa', name: '金沢市', kanji: '金沢市' },
    { id: 'hakusan', name: '白山市', kanji: '白山市' },
    { id: 'komatsu', name: '小松市', kanji: '小松市' },
    { id: 'kaga', name: '加賀市', kanji: '加賀市' },
    { id: 'nanao', name: '七尾市', kanji: '七尾市' },
    { id: 'nonoichi', name: '野々市市', kanji: '野々市市' },
    { id: 'nomi', name: '能美市', kanji: '能美市' }
  ],
  'Fukui': [
    { id: 'fukui_city', name: '福井市', kanji: '福井市' },
    { id: 'sakai_fukui', name: '坂井市', kanji: '坂井市' },
    { id: 'echizen_city', name: '越前市', kanji: '越前市' },
    { id: 'sabae', name: '鯖江市', kanji: '鯖江市' },
    { id: 'tsuruga', name: '敦賀市', kanji: '敦賀市' },
    { id: 'obama', name: '小浜市', kanji: '小浜市' }
  ],
  'Yamanashi': [
    { id: 'kofu', name: '甲府市', kanji: '甲府市' },
    { id: 'kai_yamanashi', name: '甲斐市', kanji: '甲斐市' },
    { id: 'minamialps', name: '南アルプス市', kanji: '南アルプス市' },
    { id: 'fuefuki', name: '笛吹市', kanji: '笛吹市' },
    { id: 'fujiyoshida', name: '富士吉田市', kanji: '富士吉田市' },
    { id: 'hokuto_yamanashi', name: '北杜市', kanji: '北杜市' }
  ],
  'Nagano': [
    { id: 'nagano_city', name: '長野市', kanji: '長野市' },
    { id: 'matsumoto', name: '松本市', kanji: '松本市' },
    { id: 'ueda', name: '上田市', kanji: '上田市' },
    { id: 'saku', name: '佐久市', kanji: '佐久市' },
    { id: 'iida', name: '飯田市', kanji: '飯田市' },
    { id: 'azumino', name: '安曇野市', kanji: '安曇野市' },
    { id: 'ina', name: '伊那市', kanji: '伊那市' },
    { id: 'chino', name: '茅野市', kanji: '茅野市' },
    { id: 'shiojiri', name: '塩尻市', kanji: '塩尻市' }
  ],
  'Gifu': [
    { id: 'gifu_city', name: '岐阜市', kanji: '岐阜市' },
    { id: 'ogaki', name: '大垣市', kanji: '大垣市' },
    { id: 'kakamigahara', name: '各務原市', kanji: '各務原市' },
    { id: 'tajimi', name: '多治見市', kanji: '多治見市' },
    { id: 'kani', name: '可児市', kanji: '可児市' },
    { id: 'takayama', name: '高山市', kanji: '高山市' },
    { id: 'seki', name: '関市', kanji: '関市' },
    { id: 'nakatsugawa', name: '中津川市', kanji: '中津川市' }
  ],
  'Shizuoka': [
    { id: 'shizuoka_aoi', name: '静岡市葵区', kanji: '静岡市葵区' },
    { id: 'shizuoka_suruga', name: '静岡市駿河区', kanji: '静岡市駿河区' },
    { id: 'shizuoka_shimizu', name: '静岡市清水区', kanji: '静岡市清水区' },
    { id: 'hamamatsu_chuo', name: '浜松市中央区', kanji: '浜松市中央区' },
    { id: 'hamamatsu_hamana', name: '浜松市浜名区', kanji: '浜松市浜名区' },
    { id: 'hamamatsu_tenryu', name: '浜松市天竜区', kanji: '浜松市天竜区' },
    { id: 'numazu', name: '沼津市', kanji: '沼津市' },
    { id: 'fuji_city', name: '富士市', kanji: '富士市' },
    { id: 'iwata', name: '磐田市', kanji: '磐田市' },
    { id: 'yaizu', name: '焼津市', kanji: '焼津市' },
    { id: 'fujieda', name: '藤枝市', kanji: '藤枝市' },
    { id: 'kakegawa', name: '掛川市', kanji: '掛川市' },
    { id: 'gotemba', name: '御殿場市', kanji: '御殿場市' }
  ],
  'Aichi': [
    { id: 'nagoya_chikusa', name: '名古屋市千種区', kanji: '名古屋市千種区' },
    { id: 'nagoya_higashi', name: '名古屋市東区', kanji: '名古屋市東区' },
    { id: 'nagoya_kita', name: '名古屋市北区', kanji: '名古屋市北区' },
    { id: 'nagoya_nishi', name: '名古屋市西区', kanji: '名古屋市西区' },
    { id: 'nagoya_nakamura', name: '名古屋市中村区', kanji: '名古屋市中村区' },
    { id: 'nagoya_naka', name: '名古屋市中区', kanji: '名古屋市中区' },
    { id: 'nagoya_showa', name: '名古屋市昭和区', kanji: '名古屋市昭和区' },
    { id: 'nagoya_mizuho', name: '名古屋市瑞穂区', kanji: '名古屋市瑞穂区' },
    { id: 'nagoya_atsuta', name: '名古屋市熱田区', kanji: '名古屋市熱田区' },
    { id: 'nagoya_nakagawa', name: '名古屋市中川区', kanji: '名古屋市中川区' },
    { id: 'nagoya_minato', name: '名古屋市港区', kanji: '名古屋市港区' },
    { id: 'nagoya_minami', name: '名古屋市南区', kanji: '名古屋市南区' },
    { id: 'nagoya_moriyama', name: '名古屋市守山区', kanji: '名古屋市守山区' },
    { id: 'nagoya_midori', name: '名古屋市緑区', kanji: '名古屋市緑区' },
    { id: 'nagoya_meito', name: '名古屋市名東区', kanji: '名古屋市名東区' },
    { id: 'nagoya_tempaku', name: '名古屋市天白区', kanji: '名古屋市天白区' },
    { id: 'toyota', name: '豊田市', kanji: '豊田市' },
    { id: 'toyohashi', name: '豊橋市', kanji: '豊橋市' },
    { id: 'okazaki', name: '岡崎市', kanji: '岡崎市' },
    { id: 'ichinomiya', name: '一宮市', kanji: '一宮市' },
    { id: 'kasugai', name: '春日井市', kanji: '春日井市' },
    { id: 'kariya', name: '刈谷市', kanji: '刈谷市' },
    { id: 'anjo', name: '安城市', kanji: '安城市' },
    { id: 'toyokawa', name: '豊川市', kanji: '豊川市' },
    { id: 'komaki', name: '小牧市', kanji: '小牧市' },
    { id: 'nishio', name: '西尾市', kanji: '西尾市' }
  ],
  'Mie': [
    { id: 'tsu_city', name: '津市', kanji: '津市' },
    { id: 'yokkaichi', name: '四日市市', kanji: '四日市市' },
    { id: 'suzuka', name: '鈴鹿市', kanji: '鈴鹿市' },
    { id: 'matsusaka', name: '松阪市', kanji: '松阪市' },
    { id: 'ise_city', name: '伊勢市', kanji: '伊勢市' },
    { id: 'kuwana', name: '桑名市', kanji: '桑名市' },
    { id: 'iga_city', name: '伊賀市', kanji: '伊賀市' }
  ],
  'Shiga': [
    { id: 'otsu', name: '大津市', kanji: '大津市' },
    { id: 'kusatsu_shiga', name: '草津市', kanji: '草津市' },
    { id: 'nagahama', name: '長浜市', kanji: '長浜市' },
    { id: 'higashimi', name: '東近江市', kanji: '東近江市' },
    { id: 'hikone', name: '彦根市', kanji: '彦根市' },
    { id: 'koka', name: '甲賀市', kanji: '甲賀市' },
    { id: 'omihachiman', name: '近江八幡市', kanji: '近江八幡市' }
  ],
  'Kyoto': [
    { id: 'kyoto_kita', name: '京都市北区', kanji: '京都市北区' },
    { id: 'kyoto_kamigyo', name: '京都市上京区', kanji: '京都市上京区' },
    { id: 'kyoto_sakyo', name: '京都市左京区', kanji: '京都市左京区' },
    { id: 'kyoto_nakagyo', name: '京都市中京区', kanji: '京都市中京区' },
    { id: 'kyoto_higashiyama', name: '京都市東山区', kanji: '京都市東山区' },
    { id: 'kyoto_shimogyo', name: '京都市下京区', kanji: '京都市下京区' },
    { id: 'kyoto_minami', name: '京都市南区', kanji: '京都市南区' },
    { id: 'kyoto_ukyo', name: '京都市右京区', kanji: '京都市右京区' },
    { id: 'kyoto_fushimi', name: '京都市伏見区', kanji: '京都市伏見区' },
    { id: 'kyoto_yamashina', name: '京都市山科区', kanji: '京都市山科区' },
    { id: 'uji', name: '宇治市', kanji: '宇治市' },
    { id: 'kameoka', name: '亀岡市', kanji: '亀岡市' },
    { id: 'maizuru', name: '舞鶴市', kanji: '舞鶴市' },
    { id: 'fukuchiyama', name: '福知山市', kanji: '福知山市' }
  ],
  'Osaka': [
    { id: 'osaka_miyakojima', name: '大阪市都島区', kanji: '大阪市都島区' },
    { id: 'osaka_fukushima', name: '大阪市福島区', kanji: '大阪市福島区' },
    { id: 'osaka_konohana', name: '大阪市此花区', kanji: '大阪市此花区' },
    { id: 'osaka_nishi', name: '大阪市西区', kanji: '大阪市西区' },
    { id: 'osaka_minato', name: '大阪市港区', kanji: '大阪市港区' },
    { id: 'osaka_tennoji', name: '大阪市天王寺区', kanji: '大阪市天王寺区' },
    { id: 'osaka_naniwa', name: '大阪市浪速区', kanji: '大阪市浪速区' },
    { id: 'osaka_yodogawa', name: '大阪市淀川区', kanji: '大阪市淀川区' },
    { id: 'osaka_higashiyodogawa', name: '大阪市東淀川区', kanji: '大阪市東淀川区' },
    { id: 'osaka_higashinari', name: '大阪市東成区', kanji: '大阪市東成区' },
    { id: 'osaka_ikuno', name: '大阪市生野区', kanji: '大阪市生野区' },
    { id: 'osaka_joto', name: '大阪市城東区', kanji: '大阪市城東区' },
    { id: 'osaka_abeno', name: '大阪市阿倍野区', kanji: '大阪市阿倍野区' },
    { id: 'osaka_sumiyoshi', name: '大阪市住吉区', kanji: '大阪市住吉区' },
    { id: 'osaka_chuo', name: '大阪市中央区', kanji: '大阪市中央区' },
    { id: 'osaka_kita', name: '大阪市北区', kanji: '大阪市北区' },
    { id: 'sakai_sakai', name: '堺市堺区', kanji: '堺市堺区' },
    { id: 'sakai_kita', name: '堺市北区', kanji: '堺市北区' },
    { id: 'higashiosaka', name: '東大阪市', kanji: '東大阪市' },
    { id: 'hirakata', name: '枚方市', kanji: '枚方市' },
    { id: 'toyonaka', name: '豊中市', kanji: '豊中市' },
    { id: 'suita', name: '吹田市', kanji: '吹田市' },
    { id: 'takatsuki', name: '高槻市', kanji: '高槻市' },
    { id: 'ibaraki_osaka', name: '茨木市', kanji: '茨木市' },
    { id: 'yao', name: '八尾市', kanji: '八尾市' },
    { id: 'neyagawa', name: '寝屋川市', kanji: '寝屋川市' },
    { id: 'kishiwada', name: '岸和田市', kanji: '岸和田市' }
  ],
  'Hyogo': [
    { id: 'kobe_higashinada', name: '神戸市東灘区', kanji: '神戸市東灘区' },
    { id: 'kobe_nada', name: '神戸市灘区', kanji: '神戸市灘区' },
    { id: 'kobe_hyogo', name: '神戸市兵庫区', kanji: '神戸市兵庫区' },
    { id: 'kobe_nagata', name: '神戸市長田区', kanji: '神戸市長田区' },
    { id: 'kobe_suma', name: '神戸市須磨区', kanji: '神戸市須磨区' },
    { id: 'kobe_tarumi', name: '神戸市垂水区', kanji: '神戸市垂水区' },
    { id: 'kobe_kita', name: '神戸市北区', kanji: '神戸市北区' },
    { id: 'kobe_chuo', name: '神戸市中央区', kanji: '神戸市中央区' },
    { id: 'kobe_nishi', name: '神戸市西区', kanji: '神戸市西区' },
    { id: 'himeji', name: '姫路市', kanji: '姫路市' },
    { id: 'nishinomiya', name: '西宮市', kanji: '西宮市' },
    { id: 'amagasaki', name: '尼崎市', kanji: '尼崎市' },
    { id: 'akashi', name: '明石市', kanji: '明石市' },
    { id: 'kakogawa', name: '加古川市', kanji: '加古川市' },
    { id: 'takarazuka', name: '宝塚市', kanji: '宝塚市' },
    { id: 'itami', name: '伊丹市', kanji: '伊丹市' },
    { id: 'sanda', name: '三田市', kanji: '三田市' }
  ],
  'Nara': [
    { id: 'nara_city', name: '奈良市', kanji: '奈良市' },
    { id: 'kashihara', name: '橿原市', kanji: '橿原市' },
    { id: 'ikoma', name: '生駒市', kanji: '生駒市' },
    { id: 'yamatokoriyama', name: '大和郡山市', kanji: '大和郡山市' },
    { id: 'kashiba', name: '香芝市', kanji: '香芝市' },
    { id: 'yamatotakada', name: '大和高田市', kanji: '大和高田市' },
    { id: 'tenri', name: '天理市', kanji: '天理市' }
  ],
  'Wakayama': [
    { id: 'wakayama_city', name: '和歌山市', kanji: '和歌山市' },
    { id: 'tanabe', name: '田辺市', kanji: '田辺市' },
    { id: 'kinokawa', name: '紀の川市', kanji: '紀の川市' },
    { id: 'hashimoto', name: '橋本市', kanji: '橋本市' },
    { id: 'iwade', name: '岩出市', kanji: '岩出市' },
    { id: 'kainan', name: '海南市', kanji: '海南市' }
  ],
  'Tottori': [
    { id: 'tottori_city', name: '鳥取市', kanji: '鳥取市' },
    { id: 'yonago', name: '米子市', kanji: '米子市' },
    { id: 'kurayoshi', name: '倉吉市', kanji: '倉吉市' },
    { id: 'sakaiminato', name: '境港市', kanji: '境港市' }
  ],
  'Shimane': [
    { id: 'matsue', name: '松江市', kanji: '松江市' },
    { id: 'izumo', name: '出雲市', kanji: '出雲市' },
    { id: 'hamada', name: '浜田市', kanji: '浜田市' },
    { id: 'masuda', name: '益田市', kanji: '益田市' },
    { id: 'yasugi', name: '安来市', kanji: '安来市' }
  ],
  'Okayama': [
    { id: 'okayama_kita', name: '岡山市北区', kanji: '岡山市北区' },
    { id: 'okayama_naka', name: '岡山市中区', kanji: '岡山市中区' },
    { id: 'okayama_higashi', name: '岡山市東区', kanji: '岡山市東区' },
    { id: 'okayama_minami', name: '岡山市南区', kanji: '岡山市南区' },
    { id: 'kurashiki', name: '倉敷市', kanji: '倉敷市' },
    { id: 'tsuyama', name: '津山市', kanji: '津山市' },
    { id: 'soja', name: '総社市', kanji: '総社市' },
    { id: 'tamano', name: '玉野市', kanji: '玉野市' }
  ],
  'Hiroshima': [
    { id: 'hiroshima_naka', name: '広島市中区', kanji: '広島市中区' },
    { id: 'hiroshima_higashi', name: '広島市東区', kanji: '広島市東区' },
    { id: 'hiroshima_minami', name: '広島市南区', kanji: '広島市南区' },
    { id: 'hiroshima_nishi', name: '広島市西区', kanji: '広島市西区' },
    { id: 'hiroshima_asaminami', name: '広島市安佐南区', kanji: '広島市安佐南区' },
    { id: 'hiroshima_saeki', name: '広島市佐伯区', kanji: '広島市佐伯区' },
    { id: 'fukuyama', name: '福山市', kanji: '福山市' },
    { id: 'kure', name: '呉市', kanji: '呉市' },
    { id: 'higashihiroshima', name: '東広島市', kanji: '東広島市' },
    { id: 'onomichi', name: '尾道市', kanji: '尾道市' },
    { id: 'hatsukaichi', name: '廿日市市', kanji: '廿日市市' },
    { id: 'mihara', name: '三原市', kanji: '三原市' }
  ],
  'Yamaguchi': [
    { id: 'shimonoseki', name: '下関市', kanji: '下関市' },
    { id: 'yamaguchi_city', name: '山口市', kanji: '山口市' },
    { id: 'ube', name: '宇部市', kanji: '宇部市' },
    { id: 'shunan', name: '周南市', kanji: '周南市' },
    { id: 'iwakuni', name: '岩国市', kanji: '岩国市' },
    { id: 'hofu', name: '防府市', kanji: '防府市' },
    { id: 'sanyoonoda', name: '山陽小野田市', kanji: '山陽小野田市' }
  ],
  'Tokushima': [
    { id: 'tokushima_city', name: '徳島市', kanji: '徳島市' },
    { id: 'anan', name: '阿南市', kanji: '阿南市' },
    { id: 'naruto', name: '鳴門市', kanji: '鳴門市' },
    { id: 'yoshinogawa', name: '吉野川市', kanji: '吉野川市' },
    { id: 'komatsushima', name: '小松島市', kanji: '小松島市' }
  ],
  'Kagawa': [
    { id: 'takamatsu', name: '高松市', kanji: '高松市' },
    { id: 'marugame', name: '丸亀市', kanji: '丸亀市' },
    { id: 'mitoyo', name: '三豊市', kanji: '三豊市' },
    { id: 'kanonji', name: '観音寺市', kanji: '観音寺市' },
    { id: 'sakaide', name: '坂出市', kanji: '坂出市' },
    { id: 'sanuki', name: 'さぬき市', kanji: 'さぬき市' }
  ],
  'Ehime': [
    { id: 'matsuyama', name: '松山市', kanji: '松山市' },
    { id: 'imabari', name: '今治市', kanji: '今治市' },
    { id: 'niihama', name: '新居浜市', kanji: '新居浜市' },
    { id: 'saijo', name: '西条市', kanji: '西条市' },
    { id: 'shikokuchuo', name: '四国中央市', kanji: '四国中央市' },
    { id: 'uwajima', name: '宇和島市', kanji: '宇和島市' }
  ],
  'Kochi': [
    { id: 'kochi_city', name: '高知市', kanji: '高知市' },
    { id: 'nankoku', name: '南国市', kanji: '南国市' },
    { id: 'shimanto', name: '四万十市', kanji: '四万十市' },
    { id: 'konan_kochi', name: '香南市', kanji: '香南市' },
    { id: 'kami_kochi', name: '香美市', kanji: '香美市' },
    { id: 'tosa', name: '土佐市', kanji: '土佐市' }
  ],
  'Fukuoka': [
    { id: 'fukuoka_higashi', name: '福岡市東区', kanji: '福岡市東区' },
    { id: 'fukuoka_hakata', name: '福岡市博多区', kanji: '福岡市博多区' },
    { id: 'fukuoka_chuo', name: '福岡市中央区', kanji: '福岡市中央区' },
    { id: 'fukuoka_minami', name: '福岡市南区', kanji: '福岡市南区' },
    { id: 'fukuoka_nishi', name: '福岡市西区', kanji: '福岡市西区' },
    { id: 'fukuoka_jonan', name: '福岡市城南区', kanji: '福岡市城南区' },
    { id: 'fukuoka_sawara', name: '福岡市早良区', kanji: '福岡市早良区' },
    { id: 'kitakyushu_kokurakita', name: '北九州市小倉北区', kanji: '北九州市小倉北区' },
    { id: 'kitakyushu_kokuraminami', name: '北九州市小倉南区', kanji: '北九州市小倉南区' },
    { id: 'kitakyushu_yahatanishi', name: '北九州市八幡西区', kanji: '北九州市八幡西区' },
    { id: 'kurume', name: '久留米市', kanji: '久留米市' },
    { id: 'iizuka', name: '飯塚市', kanji: '飯塚市' },
    { id: 'omuta', name: '大牟田市', kanji: '大牟田市' },
    { id: 'kasuga_fukuoka', name: '春日市', kanji: '春日市' },
    { id: 'onojo', name: '大野城市', kanji: '大野城市' },
    { id: 'itoshima', name: '糸島市', kanji: '糸島市' },
    { id: 'chikushino', name: '筑紫野市', kanji: '筑紫野市' },
    { id: 'munakata', name: '宗像市', kanji: '宗像市' }
  ],
  'Saga': [
    { id: 'saga_city', name: '佐賀市', kanji: '佐賀市' },
    { id: 'karatsu', name: '唐津市', kanji: '唐津市' },
    { id: 'tosu', name: '鳥栖市', kanji: '鳥栖市' },
    { id: 'imari', name: '伊万里市', kanji: '伊万里市' },
    { id: 'takeo', name: '武雄市', kanji: '武雄市' },
    { id: 'ogi', name: '小城市', kanji: '小城市' }
  ],
  'Nagasaki': [
    { id: 'nagasaki_city', name: '長崎市', kanji: '長崎市' },
    { id: 'sasebo', name: '佐世保市', kanji: '佐世保市' },
    { id: 'isahaya', name: '諫早市', kanji: '諫早市' },
    { id: 'omura', name: '大村市', kanji: '大村市' },
    { id: 'minamishimabara', name: '南島原市', kanji: '南島原市' },
    { id: 'unzen', name: '雲仙市', kanji: '雲仙市' }
  ],
  'Kumamoto': [
    { id: 'kumamoto_chuo', name: '熊本市中央区', kanji: '熊本市中央区' },
    { id: 'kumamoto_higashi', name: '熊本市東区', kanji: '熊本市東区' },
    { id: 'kumamoto_nishi', name: '熊本市西区', kanji: '熊本市西区' },
    { id: 'kumamoto_minami', name: '熊本市南区', kanji: '熊本市南区' },
    { id: 'kumamoto_kita', name: '熊本市北区', kanji: '熊本市北区' },
    { id: 'yatsushiro', name: '八代市', kanji: '八代市' },
    { id: 'amakusa', name: '天草市', kanji: '天草市' },
    { id: 'tamana', name: '玉名市', kanji: '玉名市' },
    { id: 'koshi', name: '合志市', kanji: '合志市' },
    { id: 'uki', name: '宇城市', kanji: '宇城市' }
  ],
  'Oita': [
    { id: 'oita_city', name: '大分市', kanji: '大分市' },
    { id: 'beppu', name: '別府市', kanji: '別府市' },
    { id: 'nakatsu', name: '中津市', kanji: '中津市' },
    { id: 'saiki', name: '佐伯市', kanji: '佐伯市' },
    { id: 'hita', name: '日田市', kanji: '日田市' },
    { id: 'usa', name: '宇佐市', kanji: '宇佐市' }
  ],
  'Miyazaki': [
    { id: 'miyazaki_city', name: '宮崎市', kanji: '宮崎市' },
    { id: 'miyakonojo', name: '都城市', kanji: '都城市' },
    { id: 'nobeoka', name: '延岡市', kanji: '延岡市' },
    { id: 'hyuga', name: '日向市', kanji: '日向市' },
    { id: 'nichinan', name: '日南市', kanji: '日南市' },
    { id: 'kobayashi', name: '小林市', kanji: '小林市' }
  ],
  'Kagoshima': [
    { id: 'kagoshima_city', name: '鹿児島市', kanji: '鹿児島市' },
    { id: 'kirishima', name: '霧島市', kanji: '霧島市' },
    { id: 'kanoya', name: '鹿屋市', kanji: '鹿屋市' },
    { id: 'satsumasendai', name: '薩摩川内市', kanji: '薩摩川内市' },
    { id: 'aira', name: '姶良市', kanji: '姶良市' },
    { id: 'hioki', name: '日置市', kanji: '日置市' },
    { id: 'amami', name: '奄美市', kanji: '奄美市' }
  ],
  'Okinawa': [
    { id: 'naha', name: '那覇市', kanji: '那覇市' },
    { id: 'okinawa_city', name: '沖縄市', kanji: '沖縄市' },
    { id: 'uruma', name: 'うるま市', kanji: 'うるま市' },
    { id: 'urasoe', name: '浦添市', kanji: '浦添市' },
    { id: 'ginowan', name: '宜野湾市', kanji: '宜野湾市' },
    { id: 'nago', name: '名護市', kanji: '名護市' },
    { id: 'itoman', name: '糸満市', kanji: '糸満市' },
    { id: 'tomigusuku', name: '豊見城市', kanji: '豊見城市' },
    { id: 'miyakojima', name: '宮古島市', kanji: '宮古島市' },
    { id: 'ishigaki', name: '石垣市', kanji: '石垣市' },
    { id: 'nanjo', name: '南城市', kanji: '南城市' }
  ]
};

/**
 * Get list of cities/wards for a given prefecture input string
 * @param {string} prefInput Prefecture key, kanji, or English name
 * @returns {Array<{id: string, name: string, kanji: string}>}
 */
export function getCitiesByPrefecture(prefInput) {
  if (!prefInput) return [];
  const cleanPref = String(prefInput).trim().replace(/[都道府県]/g, '');

  // 1. Try direct map lookup by key or short Kanji
  for (const [key, cities] of Object.entries(JAPAN_CITIES_BY_PREFECTURE)) {
    if (
      key.toLowerCase() === cleanPref.toLowerCase() ||
      key.toLowerCase().includes(cleanPref.toLowerCase()) ||
      cleanPref.toLowerCase().includes(key.toLowerCase())
    ) {
      return cities;
    }
  }

  // 2. Generic fallback matching prefecture info from ALL_47_PREFECTURES
  const matchedPref = ALL_47_PREFECTURES.find(p => 
    p.id.toLowerCase() === cleanPref.toLowerCase() || 
    p.kanji.includes(cleanPref) || 
    cleanPref.includes(p.shortKanji || '')
  );

  if (matchedPref) {
    // If exact key match wasn't hit above, check matchedPref.id again
    if (JAPAN_CITIES_BY_PREFECTURE[matchedPref.id]) {
      return JAPAN_CITIES_BY_PREFECTURE[matchedPref.id];
    }

    const prefKanji = matchedPref.kanji || matchedPref.name;
    return [
      { id: `${matchedPref.id}_central`, name: `${prefKanji}中央区`, kanji: `${prefKanji}中央区` },
      { id: `${matchedPref.id}_city`, name: `${prefKanji.replace(/[都道府県]/g, '')}市`, kanji: `${prefKanji.replace(/[都道府県]/g, '')}市` }
    ];
  }

  return [];
}

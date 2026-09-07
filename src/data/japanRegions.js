/**
 * 47 Japanese Prefectures (都道府県) & 8 Regions (地方) Master Data
 * 
 * Contains 100% complete official Japanese geography for job location filtering,
 * job creation, navigation, and regional analytics.
 */

export const JAPAN_REGIONS = [
  {
    id: 'kanto',
    name: '関東地方 (Kanto)',
    nameUz: 'Kanto Hududi',
    nameEn: 'Kanto Region',
    prefectures: [
      { id: 'Tokyo', name: '東京都 (Tokyo)', nameUz: 'Tokio', kanji: '東京都' },
      { id: 'Kanagawa', name: '神奈川県 (Kanagawa)', nameUz: 'Kanagava', kanji: '神奈川県' },
      { id: 'Saitama', name: '埼玉県 (Saitama)', nameUz: 'Saytama', kanji: '埼玉県' },
      { id: 'Chiba', name: '千葉県 (Chiba)', nameUz: 'Chiba', kanji: '千葉県' },
      { id: 'Ibaraki', name: '茨城県 (Ibaraki)', nameUz: 'Ibaraki', kanji: '茨城県' },
      { id: 'Tochigi', name: '栃木県 (Tochigi)', nameUz: 'Tochigi', kanji: '栃木県' },
      { id: 'Gunma', name: '群馬県 (Gunma)', nameUz: 'Gunma', kanji: '群馬県' }
    ]
  },
  {
    id: 'kansai',
    name: '関西・近畿地方 (Kansai)',
    nameUz: 'Kansai / Kinki Hududi',
    nameEn: 'Kansai Region',
    prefectures: [
      { id: 'Osaka', name: '大阪府 (Osaka)', nameUz: 'Osaka', kanji: '大阪府' },
      { id: 'Kyoto', name: '京都府 (Kyoto)', nameUz: 'Kioto', kanji: '京都府' },
      { id: 'Hyogo', name: '兵庫県 (Hyogo / Kobe)', nameUz: 'Xyogo (Kobe)', kanji: '兵庫県' },
      { id: 'Shiga', name: '滋賀県 (Shiga)', nameUz: 'Shiga', kanji: '滋賀県' },
      { id: 'Nara', name: '奈良県 (Nara)', nameUz: 'Nara', kanji: '奈良県' },
      { id: 'Wakayama', name: '和歌山県 (Wakayama)', nameUz: 'Vakayama', kanji: '和歌山県' },
      { id: 'Mie', name: '三重県 (Mie)', nameUz: 'Mie', kanji: '三重県' }
    ]
  },
  {
    id: 'chubu',
    name: '中部地方 (Chubu / Tokai)',
    nameUz: 'Chubu / Tokai Hududi',
    nameEn: 'Chubu Region',
    prefectures: [
      { id: 'Aichi', name: '愛知県 (Aichi / Nagoya)', nameUz: 'Aichi (Nagoya)', kanji: '愛知県' },
      { id: 'Shizuoka', name: '静岡県 (Shizuoka)', nameUz: 'Shizuoka', kanji: '静岡県' },
      { id: 'Gifu', name: '岐阜県 (Gifu)', nameUz: 'Gifu', kanji: '岐阜県' },
      { id: 'Nagano', name: '長野県 (Nagano)', nameUz: 'Nagano', kanji: '長野県' },
      { id: 'Yamanashi', name: '山梨県 (Yamanashi)', nameUz: 'Yamanashi', kanji: '山梨県' },
      { id: 'Niigata', name: '新潟県 (Niigata)', nameUz: 'Niigata', kanji: '新潟県' },
      { id: 'Toyama', name: '富山県 (Toyama)', nameUz: 'Toyama', kanji: '富山県' },
      { id: 'Ishikawa', name: '石川県 (Ishikawa)', nameUz: 'Ishikava', kanji: '石川県' },
      { id: 'Fukui', name: '福井県 (Fukui)', nameUz: 'Fukui', kanji: '福井県' }
    ]
  },
  {
    id: 'kyushu_okinawa',
    name: '九州・沖縄地方 (Kyushu / Okinawa)',
    nameUz: 'Kyushu va Okinava',
    nameEn: 'Kyushu & Okinawa Region',
    prefectures: [
      { id: 'Fukuoka', name: '福岡県 (Fukuoka)', nameUz: 'Fukuoka', kanji: '福岡県' },
      { id: 'Saga', name: '佐賀県 (Saga)', nameUz: 'Saga', kanji: '佐賀県' },
      { id: 'Nagasaki', name: '長崎県 (Nagasaki)', nameUz: 'Nagasaki', kanji: '長崎県' },
      { id: 'Kumamoto', name: '熊本県 (Kumamoto)', nameUz: 'Kumamoto', kanji: '熊本県' },
      { id: 'Oita', name: '大分県 (Oita)', nameUz: 'Oita', kanji: '大分県' },
      { id: 'Miyazaki', name: '宮崎県 (Miyazaki)', nameUz: 'Miyazaki', kanji: '宮崎県' },
      { id: 'Kagoshima', name: '鹿児島県 (Kagoshima)', nameUz: 'Kagosima', kanji: '鹿児島県' },
      { id: 'Okinawa', name: '沖縄県 (Okinawa)', nameUz: 'Okinava', kanji: '沖縄県' }
    ]
  },
  {
    id: 'hokkaido',
    name: '北海道 (Hokkaido)',
    nameUz: 'Hokkaydo Hududi',
    nameEn: 'Hokkaido Region',
    prefectures: [
      { id: 'Hokkaido', name: '北海道 (Hokkaido)', nameUz: 'Hokkaydo', kanji: '北海道' }
    ]
  },
  {
    id: 'tohoku',
    name: '東北地方 (Tohoku)',
    nameUz: 'Tohoku Hududi',
    nameEn: 'Tohoku Region',
    prefectures: [
      { id: 'Miyagi', name: '宮城県 (Miyagi / Sendai)', nameUz: 'Miyagi (Senday)', kanji: '宮城県' },
      { id: 'Fukushima', name: '福島県 (Fukushima)', nameUz: 'Fukushima', kanji: '福島県' },
      { id: 'Aomori', name: '青森県 (Aomori)', nameUz: 'Aomori', kanji: '青森県' },
      { id: 'Iwate', name: '岩手県 (Iwate)', nameUz: 'Ivate', kanji: '岩手県' },
      { id: 'Akita', name: '秋田県 (Akita)', nameUz: 'Akita', kanji: '秋田県' },
      { id: 'Yamagata', name: '山形県 (Yamagata)', nameUz: 'Yamagata', kanji: '山形県' }
    ]
  },
  {
    id: 'chugoku',
    name: '中国地方 (Chugoku)',
    nameUz: 'Chugoku Hududi',
    nameEn: 'Chugoku Region',
    prefectures: [
      { id: 'Hiroshima', name: '広島県 (Hiroshima)', nameUz: 'Xirosima', kanji: '広島県' },
      { id: 'Okayama', name: '岡山県 (Okayama)', nameUz: 'Okayama', kanji: '岡山県' },
      { id: 'Yamaguchi', name: '山口県 (Yamaguchi)', nameUz: 'Yamaguti', kanji: '山口県' },
      { id: 'Tottori', name: '鳥取県 (Tottori)', nameUz: 'Tottori', kanji: '鳥取県' },
      { id: 'Shimane', name: '島根県 (Shimane)', nameUz: 'Shimane', kanji: '島根県' }
    ]
  },
  {
    id: 'shikoku',
    name: '四国地方 (Shikoku)',
    nameUz: 'Shikoku Hududi',
    nameEn: 'Shikoku Region',
    prefectures: [
      { id: 'Kagawa', name: '香川県 (Kagawa)', nameUz: 'Kagava', kanji: '香川県' },
      { id: 'Ehime', name: '愛媛県 (Ehime)', nameUz: 'Exime', kanji: '愛媛県' },
      { id: 'Tokushima', name: '徳島県 (Tokushima)', nameUz: 'Tokusima', kanji: '徳島県' },
      { id: 'Kochi', name: '高知県 (Kochi)', nameUz: 'Kochi', kanji: '高知県' }
    ]
  }
];

// Flat array of all 47 Prefectures
export const ALL_47_PREFECTURES = JAPAN_REGIONS.flatMap(region => region.prefectures);

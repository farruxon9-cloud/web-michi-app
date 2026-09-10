/**
 * 🇯🇵 Michi AI — Extended Global Japanese Resources Library
 * 
 * Master data repository compiled from additional world-authoritative Japanese learning series:
 * 1. GENKI: An Integrated Course in Elementary Japanese (げんき - Japan Times)
 * 2. TOBIRA: Gateway to Advanced Japanese (とびら - Kuroshio Publishers)
 * 3. MARUGOTO: Japanese Language and Culture (まるごと - Japan Foundation / CEFR)
 * 4. SHADOWING: Let's Speak Japanese (シャドーイング - Kuroshio Publishers)
 * 5. KIKUTAN Series (キクタン日本語 - ALC Press)
 * 6. NIHONGO CHALLENGE (日本語チャレンジ - ASK Publishing)
 */

export const JAPANESE_EXTENDED_RESOURCES_LIBRARY = {
  // 1. GENKI SERIES (Japan Times)
  genkiSeries: {
    publisher: 'The Japan Times',
    descriptionUz: 'AQSh va Yevropa universitetlarida eng mashhur boshlang\'ich yapon tili darsligi.',
    lessons: [
      { lesson: 1, title: '新しい友達 (Yangi do\'stlar)', grammar: 'X は Y です', uz: 'Tanishtiruv va asosiy gap tuzilishi.' },
      { lesson: 3, title: '日常の行動 (Kunlik harakatlar)', grammar: '〜を〜ます / 〜で〜ます', uz: 'Harakatlar va joylarni aytish.' },
      { lesson: 9, title: '過去の思い出 (O\'tmish xotiralari)', grammar: '〜 past tense adjectives', uz: 'O\'tgan zamondagi tasvirlar.' },
      { lesson: 15, title: '長文と理由 (Uzun gaplar va sabab)', grammar: '〜てから / 〜ために', uz: 'Ketma-ketlik va maqsad.' }
    ]
  },

  // 2. TOBIRA SERIES (Kuroshio Publishers)
  tobiraSeries: {
    publisher: 'Kuroshio Publishers (くろしお出版)',
    descriptionUz: 'N3 dan N2/N1 darajasiga o\'tishdagi eng nufuzli akademik va madaniy darslik.',
    modules: [
      { module: '地理と歴史 (Geografiya va Tarix)', focus: '日本の地域文化 (Yaponiya hududiy madaniyati)', level: 'N3-N2' },
      { module: '伝統芸能 (An\'anaviy San\'at)', focus: '歌舞伎・落語・茶道 (Kabuki, Rakugo, Chado)', level: 'N2-N1' },
      { module: '現代社会 (Zamonaviy Jamiyat)', focus: '少子高齢化・環境問題 (Aholi qarishi va ekologiya)', level: 'N1' }
    ]
  },

  // 3. MARUGOTO SERIES (Japan Foundation / CEFR Alignment)
  marugotoSeries: {
    publisher: 'Japan Foundation (国際交流基金)',
    descriptionUz: 'Xalqaro CEFR standartiga mos keluvchi kommunikativ yapon tili va madaniyati darsligi.',
    levels: {
      A1: { title: 'Starter (入門)', focus: 'Katsudoo (Muloqot topshiriqlari)' },
      A2: { title: 'Elementary (初級)', focus: 'Rikai (Tilni tushunish)' },
      B1: { title: 'Intermediate (中級)', focus: 'Muloqot va madaniy munosabat' }
    }
  },

  // 4. SHADOWING: LET'S SPEAK JAPANESE (Kuroshio Publishers)
  shadowingSeries: {
    publisher: 'Kuroshio Publishers',
    descriptionUz: 'Tabiiy yaponcha nutq ritmi, pitch accent va tezkor eshitish reaksiyasini rivojlantiruvchi #1 metodik darslik.',
    techniques: [
      { level: 'Beginner to Intermediate', speed: '1.0x Normal Native Speed', focus: 'Intonatsiya va Aizuchi (相槌) ritmi' },
      { level: 'Intermediate to Advanced', speed: '1.2x Rapid Business Speed', focus: 'N1 Keigo va spontan muloqot reaksiyasi' }
    ]
  },

  // 5. KIKUTAN SERIES (ALC Press)
  kikutanSeries: {
    publisher: 'ALC Press (アルク)',
    descriptionUz: 'Ritmli audio mashqlar orqali har kuni 16 ta eng ko\'p ishlatiladigan so\'zlarni yodlash seriyasi.',
    levelsCount: { N5: 600, N4: 800, N3: 1200, N2: 1400, N1: 1800 }
  },

  // 6. NIHONGO CHALLENGE (ASK Publishing)
  nihongoChallenge: {
    publisher: 'ASK Publishing',
    descriptionUz: 'N5 va N4 darajasidagi boshlang\'ich kanji va grammatikani rasmlar bilan o\'rgatuvchi darslik.',
    targetLevels: ['N5', 'N4']
  }
};

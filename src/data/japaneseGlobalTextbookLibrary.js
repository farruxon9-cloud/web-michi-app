/**
 * 🇯🇵 Michi AI — Global Japanese Textbook Master Dataset & Sequential Syllabus
 * 
 * Master data repository compiled from world-famous Japanese textbook series:
 * 1. Minna no Nihongo (みんなの日本語 初級I, II & 中級I, II - 3A Corporation)
 * 2. Kanji Master (漢字マスター N5-N1 - Bonjinsha / Z-KAI)
 * 3. Shin Kanzen Master (新完全マスター N3-N1 - 3A Network)
 * 4. Hajimete no Nihongo Tango ("Buddy Tango" 1000-3000 - ASK Publishing)
 * 5. Try! JLPT Grammar (TRY! 日本語能力試験 - ASK Publishing)
 */

export const JAPANESE_GLOBAL_TEXTBOOK_LIBRARY = {
  // 1. SEQUENTIAL TOPIC SYLLABUS (N5 → N4 → N3 → N2 → N1)
  sequentialTopicSyllabus: {
    N5: [
      { order: 1, topic: '自己紹介 (O\'zini tanishtirish)', textbook: 'Minna no Nihongo L1', grammar: '〜は〜です / 〜ではありません', uz: 'Ism, millat va kasbni tanishtirish.' },
      { order: 2, topic: '指示代名詞 (Narsalar va egalik)', textbook: 'Minna no Nihongo L2', grammar: 'これ・それ・あれ・この・その・あの', uz: 'Buyumlarni ko\'rsatish va kimnikiligini aytish.' },
      { order: 3, topic: '場所・方向 (Joylar va yo\'nalishlar)', textbook: 'Minna no Nihongo L3', grammar: 'ここ・そこ・あそこ・どこ・どちら', uz: 'Joy va yo\'nalishlarni so\'rash.' },
      { order: 4, topic: '時間・時刻 (Vaqt va kun tartibi)', textbook: 'Minna no Nihongo L4', grammar: '〜時〜分・〜から〜まで・〜ます', uz: 'Soat, ish vaqti va kun tartibi.' },
      { order: 5, topic: '移動・交通手段 (Harakat va transport)', textbook: 'Minna no Nihongo L5', grammar: '〜へ行きます/来ます/帰ります・〜で', uz: 'Yo\'nalish va yuk/yo\'lovchi transporti.' },
      { order: 6, topic: '目的語・動作 (Obyekt va harakat joyi)', textbook: 'Minna no Nihongo L6', grammar: '〜を〜ます・〜で〜ます', uz: 'Harakat obyektini va joyini aytish.' },
      { order: 7, topic: '授受・手段 (Vosita va sovg\'alar)', textbook: 'Minna no Nihongo L7', grammar: '〜で〜をあげます/もらいます', uz: 'Qurol, til va sovg\'a berish.' },
      { order: 8, topic: '形容詞 (Sifatlar va tasvirlar)', textbook: 'Minna no Nihongo L8', grammar: 'イ形容詞・ナ形容詞・〜な/〜い', uz: 'Narsalar va joylar xususiyatini tasvirlash.' },
      { pattern: '〜が好き/嫌い', order: 9, topic: '嗜好・能力・原因 (Qiziqish va sabab)', textbook: 'Minna no Nihongo L9', grammar: '〜が好き/上手/下手・〜から', uz: 'Qiziqishlar va sababni tushuntirish.' },
      { order: 10, topic: '存在・位置 (Borlik va joylashuv)', textbook: 'Minna no Nihongo L10', grammar: '〜に〜があります/います・上/下/前', uz: 'Narsa va insonlar joylashuvini aytish.' },
      { order: 11, topic: '助数詞 (Sanoq so\'zlar va miqdor)', textbook: 'Minna no Nihongo L11', grammar: '〜個/人/台/本/枚/回/時間', uz: 'Sanoq so\'zlar va vaqt miqdori.' },
      { order: 12, topic: '比較・過去 (Taqqoslash va o\'tgan zamon)', textbook: 'Minna no Nihongo L12', grammar: '〜より〜のほうが・一番', uz: 'Sifatlar o\'tgan zamoni va taqqoslash.' },
      { order: 13, topic: '欲望・目的 (Xohish va maqsad)', textbook: 'Minna no Nihongo L13', grammar: '〜が欲しい・〜たいです・〜に行く', uz: 'Istak va biror ishni bajarish maqsadi.' },
      { order: 14, topic: 'て形・依頼 (Te-shakl va iltimoslar)', textbook: 'Minna no Nihongo L14', grammar: '〜てください・〜ましょうか', uz: 'Iltimos qilish va taklif berish.' },
      { order: 15, topic: '許可・禁止 (Ruxsat va taqiqlar)', textbook: 'Minna no Nihongo L15', grammar: '〜てもいいです・〜てはいけません', uz: 'Ruxsat so\'rash va taqiqlarni aytish.' },
      { order: 16, topic: '動作の順序 (Ketma-ket harakatlar)', textbook: 'Minna no Nihongo L16', grammar: '〜て、〜て・〜てから', uz: 'Harakatlar ketma-ketligi.' },
      { order: 17, topic: 'ない形・義務 (Inkor va majburiyat)', textbook: 'Minna no Nihongo L17', grammar: '〜ないでください・〜なければならない', uz: 'Inkor iltimos va majburiyat.' },
      { order: 18, topic: '辞書形・可能 (Lug\'at shakli va qobiliyat)', textbook: 'Minna no Nihongo L18', grammar: '〜ことができます・趣味は〜ことです', uz: 'Bajara olish va sevimli mashg\'ulot.' },
      { order: 19, topic: 'た形・経験 (Ta-shakl va tajriba)', textbook: 'Minna no Nihongo L19', grammar: '〜たことがあります・〜たり〜たり', uz: 'O\'tmish tajribasi va harakatlar sanovi.' },
      { order: 20, topic: '普通形 (Oddiy so\'zlashuv uslubi)', textbook: 'Minna no Nihongo L20', grammar: '普通形（カジュアル会話）', uz: 'Oila va do\'stlar davrasidagi muloqot.' },
      { order: 21, topic: '意見・引用 (Fikr va iqtibos)', textbook: 'Minna no Nihongo L21', grammar: '〜と思います・〜と言いました', uz: 'O\'z fikrini aytish va iqtibos keltirish.' },
      { order: 22, topic: '名詞修飾 (Sifatlovchi ergashtiruvchi gaplar)', textbook: 'Minna no Nihongo L22', grammar: '連体修飾（V＋N）', uz: 'Otni fe\'l birikmasi bilan sifatlash.' },
      { order: 23, topic: '時間・条件 (Vaqt va shart)', textbook: 'Minna no Nihongo L23', grammar: '〜とき・〜と、〜', uz: 'Vaqt nuqtasi va tabiiy natija.' },
      { order: 24, topic: '授受表現 (Yordam va sovg\'a berish)', textbook: 'Minna no Nihongo L24', grammar: '〜てくれます/あげます/もらいます', uz: 'Bir-biriga yordam ko\'rsatish.' },
      { order: 25, topic: '仮定条件 (Gipoteza va shart)', textbook: 'Minna no Nihongo L25', grammar: '〜たら・〜ても', uz: 'Shartli taxminlar va zidlik.' }
    ],

    N4: [
      { order: 26, topic: '強調・説明 (Tushuntirish va sabab)', textbook: 'Minna no Nihongo L26', grammar: '〜んです・〜んですが', uz: 'Vaziyatni batafsil tushuntirish.' },
      { order: 27, topic: '可能動詞 (Imkoniyat fe\'llari)', textbook: 'Minna no Nihongo L27', grammar: '可能形・〜が見えます/聞こえます', uz: 'Qobiliyat va ko\'rinish/eshitilish.' },
      { order: 28, topic: '同時・理由 (Bir vaqtda 2 harakat)', textbook: 'Minna no Nihongo L28', grammar: '〜ながら・〜し、〜し', uz: 'Bir vaqtda bajarish va sabablarni sanash.' },
      { order: 29, topic: '自動詞・完了 (O\'z-o\'zidan sodir bo\'lish)', textbook: 'Minna no Nihongo L29', grammar: '自動詞・〜ています・〜てしまいました', uz: 'Holat va afsus bilan tugallash.' },
      { order: 30, topic: '他動詞・準備 (Maqsadli tayyorgarlik)', textbook: 'Minna no Nihongo L30', grammar: '他動詞・〜てあります・〜ておきます', uz: 'Oldindan tayyorgarlik ko\'rish.' },
      { order: 31, topic: '意向形・計画 (Niyat va reja)', textbook: 'Minna no Nihongo L31', grammar: '意向形・〜つもりです・〜予定です', uz: 'Kelajak rejalari va niyat.' },
      { order: 32, topic: '助言・推測 (Maslahat va taxmin)', textbook: 'Minna no Nihongo L32', grammar: '〜ほうがいいです・〜でしょう・〜かも', uz: 'Maslahat berish va taxmin qilish.' },
      { order: 33, topic: '命令・禁止 (Buyruq va man etish)', textbook: 'Minna no Nihongo L33', grammar: '命令形・禁止形・〜という意味です', uz: 'Buyruq, taqiq va ma\'noni tushuntirish.' },
      { order: 34, topic: '順序・模倣 (Ketma-ketlik va namuna)', textbook: 'Minna no Nihongo L34', grammar: '〜とおりに・〜あとで・〜ないで', uz: 'Ko\'rsatmaga binoan bajarish.' },
      { order: 35, topic: '条件形 (Shart shakli)', textbook: 'Minna no Nihongo L35', grammar: '条件形（〜ば、〜）', uz: 'Faraziy shart va natija.' },
      { order: 36, topic: '目的・変化 (Maqsad va o\'zgarish)', textbook: 'Minna no Nihongo L36', grammar: '〜ように、〜・〜ようになりました', uz: 'Harakat maqsadi va ko\'nikma o\'zgarishi.' },
      { order: 37, topic: '受動形 (Majhul nisbat)', textbook: 'Minna no Nihongo L37', grammar: '受動形（〜られます）', uz: 'Majhul nisbat va noqulaylik.' },
      { order: 38, topic: '名詞化 (Otlashtirish)', textbook: 'Minna no Nihongo L38', grammar: '〜のは・〜のが・〜のを', uz: 'Fe\'l harakatini otga aylantirish.' },
      { order: 39, topic: '原因・理由 (Sabab va natija)', textbook: 'Minna no Nihongo L39', grammar: '〜て、〜・〜ので、〜', uz: 'Sabab-oqibat bog\'lanishi.' },
      { order: 40, topic: '疑問句 (Savol ichidagi savol)', textbook: 'Minna no Nihongo L40', grammar: '〜かどうか・〜てみます', uz: 'Sinab ko\'rish va noaniq savol.' },
      { order: 41, topic: '敬語授受 (Hurmat ko\'rsatish sovg\'alari)', textbook: 'Minna no Nihongo L41', grammar: '〜ていただきます/くださいます/やります', uz: 'Kattalarga va kichiklarga yordam.' },
      { order: 42, topic: '目的・用途 (Maqsad va vosita)', textbook: 'Minna no Nihongo L42', grammar: '〜ために・〜のに使います', uz: 'Maqsad va asbob-uskuna vazifasi.' },
      { order: 43, topic: '様態・直前 (Ko\'rinish va harakat arafasi)', textbook: 'Minna no Nihongo L43', grammar: '〜そうです・〜てきます', uz: 'Tashqi ko\'rinish va sodir bo\'layotgan harakat.' },
      { order: 44, topic: '過剰・難易 (Ortqiqcha bajarish va qulaylik)', textbook: 'Minna no Nihongo L44', grammar: '〜すぎます・〜やすい/にくい', uz: 'Me\'yoridan oshish va qulay/noqulaylik.' },
      { order: 45, topic: '場合・逆接 (Holat va agar)', textbook: 'Minna no Nihongo L45', grammar: '〜場合に・〜のに', uz: 'Kutilmagan holat va zidlik.' },
      { order: 46, topic: '局面・確信 (Vaqt nuqtasi va taxmin)', textbook: 'Minna no Nihongo L46', grammar: '〜ところです・〜はずです', uz: 'Harakat pallasida bo\'lish va aniq taxmin.' },
      { order: 47, topic: '伝聞・推量 (Eshitilgan xabar va belgi)', textbook: 'Minna no Nihongo L47', grammar: '〜そうです（伝聞）・〜ようです', uz: 'Eshitilgan mish-mish va alomat.' },
      { order: 48, topic: '使役形 (Majbur qilish nisbati)', textbook: 'Minna no Nihongo L48', grammar: '使役形（〜させます）', uz: 'Bajarishga majbur qilish va ruxsat berish.' },
      { order: 49, topic: '尊敬語 (Sonkeigo izzat uslubi)', textbook: 'Minna no Nihongo L49', grammar: '尊敬語（お〜になります・いらっしゃる）', uz: 'Kattalar va mijozlarga izzat berish.' },
      { order: 50, topic: '謙譲語 (Kenjougo kamtarin uslub)', textbook: 'Minna no Nihongo L50', grammar: '謙譲語（お〜します・申す・参る）', uz: 'O\'zini kamtar tutib xizmat qilish.' }
    ],

    N3: [
      { order: 51, topic: '関連・対象 (Mavzu va obyektga munosabat)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜に関して・〜について・〜に対して・〜をめぐって', uz: 'Mavzular bo\'yicha munosabat bildirish.' },
      { order: 52, topic: '原因・理由 (Sabab va oqibatlar)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜によって・〜により・〜おかげで・〜せいで', uz: 'Sabab-oqibat munosabatlarini ajratish.' },
      { order: 53, topic: '例示・範囲 (Misollar va qamrov)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜をはじめ・〜を中心に・〜を通じて・〜にわたって', uz: 'Misol keltirish va davomiylik.' },
      { order: 54, topic: '確信・否定 (Aniq ishonch va inkor)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜に違いない・〜わけがない・〜はずがない', uz: 'Ishonch bilan aytish va qat\'iy inkor.' },
      { order: 55, topic: '時間・経過 (Vaqt pallasidagi hodisalar)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜最中に・〜たとたん・〜ついでに・〜たびに', uz: 'Harakat sodir bo\'layotgan vaqt bo\'lagi.' },
      { order: 56, topic: '対比・逆接 (Ziddiyat va kutilmagan oqibat)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜反面・〜にもかかわらず・〜くせに・〜わりに', uz: 'Zid holatlar va ajablanish.' },
      { order: 57, topic: '条件・基準 (Shart va qoidalar)', textbook: 'Shin Kanzen N3 / Try! N3', grammar: '〜さえ〜ば・〜としたら・〜としても・〜に沿って', uz: 'Faraziy shartlar va standartlar.' }
    ],

    N2: [
      { order: 58, topic: '公式行事・準備 (Rasmiy marosim va tayyorgarlik)', textbook: 'Shin Kanzen N2 / Try! N2', grammar: '〜に際して・〜にあたって・〜に先立ち', uz: 'Rasmiy voqealar oldidan qo\'llash.' },
      { order: 59, topic: '根拠・考慮 (Tahlil va inobatga olish)', textbook: 'Shin Kanzen N2 / Try! N2', grammar: '〜を踏まえて・〜に基づいて・〜に応じた', uz: 'Faktlarni inobatga olgan holda karor berish.' },
      { order: 60, topic: '限定・非限定 (Cheklov va istisnolar)', textbook: 'Shin Kanzen N2 / Try! N2', grammar: '〜にとどまらず・〜に限らず・〜を問わず・〜にかかわらず', uz: 'Cheklovlarsiz va istisnolarsiz aytish.' },
      { order: 61, topic: '不可避・義務 (Chora yo\'qligi va majburiyat)', textbook: 'Shin Kanzen N2 / Try! N2', grammar: '〜ざるを得ない・〜わけにはいかない・〜かねる', uz: 'Ilojsizlikdan majbur bo\'lish.' },
      { order: 62, topic: '懸念・結果 (Xavf va salbiy oqibat)', textbook: 'Shin Kanzen N2 / Try! N2', grammar: '〜かねない・〜おそれがある・〜にほかならない', uz: 'Xavfli oqibatlardan ogohlantirish.' },
      { order: 63, topic: '絶対否定・推量 (Imkonsizlik va rad etish)', textbook: 'Shin Kanzen N2 / Try! N2', grammar: '〜っこない・〜にすぎない・〜まい', uz: 'Mutlaqo imkonsizligini ta\'kidlash.' }
    ],

    N1: [
      { order: 64, topic: '最高級局面・環境 (Yuqori rasmiy vaziyat)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜にあって・〜のもとで・〜の至り', uz: 'Oliy darajadagi rasmiy vaziyatlar.' },
      { order: 65, topic: '発端・締めくくり (Boshlanish va yakun)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜を皮切りに・〜を封切りに・〜をもって', uz: 'Tadbirni boshlash va yopish.' },
      { order: 66, topic: '痛切感情・極限 (Chuqur hissiyot va cheksizlik)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜にたえない・〜極まりない・〜極まる', uz: 'Hissiyot va quvonchni samimiy izhor etish.' },
      { order: 67, topic: '唯一無二・特権 (Yagona va tengsizlik)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜をおいてほかにない・〜ならではの', uz: 'Boshqa muqobili yo\'qligini ko\'rsatish.' },
      { order: 68, topic: '社会的立場・倫理 (Ijtimoiy burch va mavqe)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜たるもの・〜まじき・〜あるまじき', uz: 'Mavqega munosib mas\'uliyat.' },
      { order: 69, topic: '前提・不可欠 (Munosabat va zaruriy shart)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜あっての・〜なしには・〜なくしては', uz: 'Mavjudlikning asosiy sababi.' },
      { order: 70, topic: '即時・連続 (Zudlik bilan va ketma-ketlik)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜がてら・〜かたがた・〜そばから・〜や否や', uz: 'Zudlik bilan ketma-ket sodir bo\'lish.' },
      { order: 71, topic: '強制・究極義務 (Qat\'iy majburiyat)', textbook: 'Shin Kanzen N1 / Try! N1', grammar: '〜ずにはおかない・〜ずにはいられない・〜を余儀なくされる', uz: 'Muqarrar majburiyat.' }
    ]
  },

  // 2. MINNA NO NIHONGO LESSONS (みんなの日本語 1〜50課・中級)
  minnaNoNihongo: {
    lesson1: { lesson: 1, title: '自己紹介 (O\'zini tanishtirish)', pattern: 'N1 は N2 です', example: 'わたしはマヒるです。', uz: 'Men Mahirman.' },
    lesson13: { lesson: 13, title: '欲望・希望 (Xohish va istaklar)', pattern: 'N が ほしいです / V-たいです', example: '車がほしいです。', uz: 'Mashina xohlayman.' },
    lesson28: { lesson: 28, title: '同時進行 (Bir vaqtda 2 ta harakat)', pattern: 'V1(stem) ながら V2', example: '音楽を聞きながら運転します。', uz: 'Musiqa eshitib borib haydayman.' },
    lesson38: { lesson: 38, title: '名詞化 (Fe\'l ko\'rinishini otga o\'tkazish)', pattern: 'V(dict) のは Adj です', example: '日本語を勉強するのは楽しいです。', uz: 'Yapon tilini o\'rganish maroqli.' },
    lesson50: { lesson: 50, title: '謙譲語 (Kamtarin Kenjougo uslubi)', pattern: 'お V(stem) します / いたします', example: '重い荷物をお持ちします。', uz: 'Og\'ir yukingizni ko\'tarib beraman.' }
  },

  // 3. KANJI MASTER N5 - N1 (漢字マスター N5〜N1)
  kanjiMaster: {
    N5: [
      { kanji: '日', onyomi: 'ニチ・ジツ', kunyomi: 'ひ・か', meaning: 'Sun / Day', uz: 'Quyosh / Kun', example: '日本 (Nihon)' },
      { kanji: '本', onyomi: 'ホン', kunyomi: 'モト', meaning: 'Book / Origin', uz: 'Kitob / Asos', example: '日本語 (Nihongo)' },
      { kanji: '車', onyomi: 'シャ', kunyomi: 'くるま', meaning: 'Car / Vehicle', uz: 'Avtomobil / G\'ildirak', example: '自動車 (Jidōsha)' },
      { kanji: '人', onyomi: 'ジン・ニン', kunyomi: 'ひと', meaning: 'Person / Human', uz: 'Odam / Inson', example: '外国人 (Gaikokujin)' }
    ],
    N4: [
      { kanji: '電', onyomi: 'デン', kunyomi: '', meaning: 'Electricity', uz: 'Elektr', example: '電車 (Densha), 電気 (Denki)' },
      { kanji: '語', onyomi: 'ゴ', kunyomi: 'かた・る', meaning: 'Language / Word', uz: 'Til / So\'z', example: '単語 (Tango), 英語 (Eigo)' },
      { kanji: '働', onyomi: 'ドウ', kunyomi: 'はたら・く', meaning: 'Work / Labor', uz: 'Ishlamoq / Mehnat', example: '労働 (Rōdō)' }
    ],
    N3: [
      { kanji: '業', onyomi: 'ギョウ・ゴウ', kunyomi: 'わざ', meaning: 'Industry / Business', uz: 'Sanoat / Ish', example: '残業 (Zangyō), 授業 (Jugyō)' },
      { kanji: '運', onyomi: 'ウン', kunyomi: 'はこ・ぶ', meaning: 'Transport / Luck', uz: 'Tashimoq / Omad', example: '運転 (Unten), 運送 (Unsō)' },
      { kanji: '転', onyomi: 'テン', kunyomi: 'ころ・がる', meaning: 'Revolve / Turn', uz: 'Aylanmoq / O\'girilmoq', example: '転職 (Tenshoku)' }
    ],
    N2: [
      { kanji: '際', onyomi: 'サイ', kunyomi: 'きわ', meaning: 'Occasion / Border', uz: 'Fursat / Chegara', example: '国際 (Kokusai), 際して (Saishite)' },
      { kanji: '踏', onyomi: 'トウ', kunyomi: 'ふ・む', meaning: 'Step on / Tread', uz: 'Bosmoq / E\'tiborga olmoq', example: '踏まえて (Fumaete)' }
    ],
    N1: [
      { kanji: '皮', onyomi: 'ヒ', kunyomi: 'かわ', meaning: 'Skin / Leather', uz: 'Teri / Po\'st', example: '皮切りに (Kawakirini)' },
      { kanji: '尽', onyomi: 'ジン', kunyomi: 'つく・す', meaning: 'Exhaust / Serve', uz: 'Asta-sekin tugamoq / Bag\'ishlamoq', example: '尽力 (Jinryoku)' }
    ]
  },

  // 4. HAJIMETE NO NIHONGO TANGO ("BUDDY TANGO" 1000 - 3000)
  buddyTango: {
    N5: [
      { word: '私', hiragana: 'わたし', rōmaji: 'watashi', uz: 'Men', en: 'I / Me' },
      { word: '仕事', hiragana: 'しごと', rōmaji: 'shigoto', uz: 'Ish / Kasb', en: 'Work / Job' },
      { word: '友達', hiragana: 'ともだち', rōmaji: 'tomodachi', uz: 'Do\'st', en: 'Friend' }
    ],
    N4: [
      { word: '応募', hiragana: 'おうぼ', rōmaji: 'ōbo', uz: 'Ariza topshirish', en: 'Application' },
      { word: '面接', hiragana: 'めんせつ', rōmaji: 'mensetsu', uz: 'Suhbat / Interview', en: 'Interview' },
      { word: '給与', hiragana: 'きゅうよ', rōmaji: 'kyūyo', uz: 'Oylik maosh / Ish haqi', en: 'Salary / Wage' }
    ],
    N3: [
      { word: '条件', hiragana: 'じょうけん', rōmaji: 'jōken', uz: 'Shart / Talab', en: 'Condition / Requirement' },
      { word: '経験', hiragana: 'けいけん', rōmaji: 'keiken', uz: 'Tajriba', en: 'Experience' },
      { word: '資格', hiragana: 'しかく', rōmaji: 'shikaku', uz: 'Kvalifikatsiya / Guvohnoma', en: 'Qualification / License' }
    ],
    N2: [
      { word: '採用', hiragana: 'さいよう', rōmaji: 'saiyō', uz: 'Ishga qabul qilish', en: 'Recruitment / Hiring' },
      { word: '研修', hiragana: 'けんしゅう', rōmaji: 'kenshū', uz: 'Malaka oshirish / Amaliyot', en: 'Training' },
      { word: '手当', hiragana: 'てあて', rōmaji: 'teate', uz: 'Ustama haq / Qo\'shimcha to\'lov', en: 'Allowance' }
    ],
    N1: [
      { word: '尽力', hiragana: 'じんりょく', rōmaji: 'jinryoku', uz: 'Qo\'ldan kelgancha hissa qo\'shish / Harakat qilmoq', en: 'Best efforts / Dedication' },
      { word: '精査', hiragana: 'せいさ', rōmaji: 'seisa', uz: 'Sinchkovlik bilan ko\'rib chiqish / Tahlil qilish', en: 'Scrutiny / Careful examination' },
      { word: '推進', hiragana: 'すいしん', rōmaji: 'suishin', uz: 'Rivojlantirish / Olg\'a surish', en: 'Promotion / Drive forward' }
    ]
  },

  // 5. SHIN KANZEN MASTER & TRY! GRAMMAR FRAMEWORKS
  textbookFrameworks: {
    shinKanzenMaster: {
      publisher: '3A Network',
      descriptionUz: 'JLPT N3-N1 darajalari uchun eng akademik va chuqur grammatik darslik seriyasi.',
      focusAreas: ['文法 (Grammar)', '読解 (Reading)', '聴解 (Listening)', '語彙 (Vocabulary)']
    },
    tryJLPT: {
      publisher: 'ASK Publishing',
      descriptionUz: 'Amaliy muloqot va real vaziyatlarga asoslangan JLPT darslik seriyasi.',
      focusAreas: ['会話表現 (Conversational Expressions)', '実践文法 (Practical Grammar)']
    }
  }
};

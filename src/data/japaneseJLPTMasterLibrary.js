/**
 * 🇯🇵 Michi AI — Japanese JLPT Master Library: Choukai, Dokkai, Bunpou & Cultural Values
 * 
 * Master repository containing:
 * 1. Choukai (聴解 - Listening scenarios, Aizuchi 相槌, Pitch & Audio timing)
 * 2. Dokkai (読解 - Reading passages, logical analysis, implicit inference)
 * 3. Bunpou (文法 - Comparative nuance matrices for similar grammar patterns)
 * 4. Cultural Values & Etiquette (報連相 Horenso, おもてなし Omotenashi, 空気を読む Kuuki wo yomu)
 */

export const JAPANESE_JLPT_MASTER_LIBRARY = {
  // 1. CHOUKAI (聴解 - Listening Comprehension & Audio Nuances)
  choukaiScenarios: [
    {
      id: 'choukai_interview_01',
      title: '面接での自己紹介と経験の問いかけ (Suhbatda o\'zini tanishtirish va tajriba)',
      level: 'N3',
      audioScript: '「本日はお時間をいただき、誠にありがとうございます。大型トラックの運転経験は5年ございます。」',
      aizuchiUsed: ['ええ', 'なるほど', 'おっしゃる通りです'],
      tone: 'respectful_formal',
      uzExplanation: 'Suhbat jarayonida muomala odobi: Minnatdorchilik bildirish va tajribani aniq taqdim etish.',
      keyQuestion: '応募者の経験年数は何年ですか？',
      correctAnswer: '5年'
    },
    {
      id: 'choukai_safety_02',
      title: '点検と出発前の確認指示 (Jo\'nab ketishdan oldingi xavfsizlik ko\'rsatmasi)',
      level: 'N2',
      audioScript: '「本日の配送に際しまして、タイヤの空気圧および荷崩れ防止の確認を徹底してください。」',
      aizuchiUsed: ['かしこまりました', '承知いたしました'],
      tone: 'instructional_authoritative',
      uzExplanation: 'Yuk yetkazishdan oldin g\'ildirak bosimi va yuk mustahkamligini tekshirish buyrug\'i.',
      keyQuestion: '出発前に何を確認しなければなりませんか？',
      correctAnswer: 'タイヤの空気圧と荷崩れ防止'
    },
    {
      id: 'choukai_delay_notice_03',
      title: '悪天候による遅延の報連相 (Yomon ob-havo sababli kechikish haqida Horenso)',
      level: 'N1',
      audioScript: '「大雨に伴う通行止めを余儀なくされ、納品時間に30分ほど遅れが生じる見込みでございます。謹んでご報告申し上げます。」',
      aizuchiUsed: ['大変でございますね', 'ご苦労様です'],
      tone: 'apologetic_polite',
      uzExplanation: 'Ob-havo sababli yo\'l yopilganda vaqtida xabar berish (Horenso odobi).',
      keyQuestion: '遅延の理由は何ですか？',
      correctAnswer: '大雨による通行止め'
    }
  ],

  // 2. DOKKAI (読解 - Reading Comprehension & Passages)
  dokkaiPassages: [
    {
      id: 'dokkai_tokutei_01',
      title: '特定技能ドライバー採用条件と資格 (Tokutei Ginou haydovchisi talablari)',
      level: 'N3',
      passage: `我が社では、特定技能1号の資格を有する外国人ドライバーを積極的に募集しております。
応募にあたっては、日本の普通自動車免許取得から1年以上が経過していることが条件となります。
また、業務においては日常会話レベル（N3相当）の日本語力が求められます。`,
      uzTranslation: `Kompaniyamiz Tokutei Ginou 1-bosqich vizasiga ega chet ellik haydovchilarni faol ishga olmoqda. Topshirish uchun Yaponiyaning oddiy haydovchilik guvohnomasini olganiga 1 yildan oshgan bo'lishi shart. Shuningdek, kundalik yapon tili (N3 darajasi) talab qilinadi.`,
      logicalAnalysis: {
        targetAudience: '特定技能1号の外国人ドライバー',
        licenseRequirement: '日本の普通免許取得後1年以上',
        japaneseLevel: 'N3相当（日常会話レベル）'
      }
    },
    {
      id: 'dokkai_labor_regulation_02',
      title: '物流2024年問題とドライバーの労働時間 (Logistika 2024-yil ishlash soatlari tartibi)',
      level: 'N1',
      passage: `2024年4月より、トラックドライバーの時間外労働に年間960時間の上限が科されることとなりました。
この法改正は、ドライバーの健康確保と事故防止を目的とする反面、運送企業の収益確保や人手不足の深刻化を招くおそれがあります。
業界全体として、中継物流の導入や作業効率化を進めることが急務となっております。`,
      uzTranslation: `2024-yil aprel oyidan yuk mashinasi haydovchilarining qo'shimcha ish soatlariga yillik 960 soatlik cheklov o'rnatildi. Bu qonun haydovchilar salomatligi va avariyalarning oldini olishga qaratilgan bo'lsa-da, kadrlar yetishmovchiligini oshirishi mumkin. Shuning sababli samaradorlikni oshirish dolzarb masaladir.`,
      logicalAnalysis: {
        regulationChange: '時間外労働年間960時間上限',
        purpose: '健康確保および事故防止',
        challenge: '人手不足と収益確保の課題'
      }
    }
  ],

  // 3. BUNPOU NUANCE COMPARISON MATRIX (文法ニュアンス比較)
  bunpouNuanceMatrix: {
    'に伴って_vs_につれて': {
      patternA: '〜に伴って (ni tomonatte)',
      patternB: '〜につれて (ni tsurete)',
      differenceUz: '〜に伴って rasmiy/yozma uslubda sabab-oqibatni ko\'rsatadi. 〜につれて esa vaqt o\'tishi bilan tabiiy, bosqichma-bosqich o\'zgarishni ko\'rsatadi.',
      differenceJa: '「〜に伴って」は公式・文章語で因果関係を表す。「〜につれて」は時間の経過に伴う段階的な変化を表す。',
      exampleA: '事業拡大に伴ってドライバーを増員します。',
      exampleB: '日本語が上達するにつれて仕事が楽しくなります。'
    },
    'に際して_vs_にあたって': {
      patternA: '〜に際して (ni saishite)',
      patternB: '〜にあたって (ni atatte)',
      differenceUz: '〜に際して muhim rasmiy voqea/hodisa oldidan qo\'llaniladi. 〜にあたって esa kelajakdagi ijobiy maqsad yoki tayyorgarlik uchun ishlatiladi.',
      differenceJa: '「〜に際して」は特別な行事・手続きの直前に使う。「〜にあたって」は積極的な目的や準備の段階で使う。',
      exampleA: 'ご応募に際しての注意事項をご確認ください。',
      exampleB: '新事業を開始するにあたって準備を進めます。'
    },
    'に関して_vs_について': {
      patternA: '〜に関して (ni kan shite)',
      patternB: '〜について (ni tsuite)',
      differenceUz: '〜に関して rasmiy va keng qamrovli mavzular uchun ishlatiladi. 〜について esa kundalik yoki muayyan bitta mavzu haqida gapirilganda ishlatiladi.',
      differenceJa: '「〜に関して」は関連する広い範囲を含む公式表現。「〜について」は特定の対象を指す一般的な表現。',
      exampleA: '労働条件に関してご説明申し上げます。',
      exampleB: '今日の仕事について話します。'
    }
  },

  // 4. JAPANESE CULTURAL VALUES & BUSINESS ETIQUETTE (日本文化・価値観・報連相)
  culturalValues: {
    horenso: {
      name: '報連相 (Hō-Ren-Sō)',
      definitionUz: 'Yaponiyada ish joyidagi uchta oltin qoida: Hōkoku (Hisaob berish), Renraku (Xabar berish), Sōdan (Maslahatlashish).',
      definitionJa: '報告（Houkoku）・連絡（Renraku）・相談（Sousan）の略。仕事の基本マナー。',
      principles: [
        { key: '報告', uz: 'Natija va muammolar haqida rahbar hamda jamoaga darhol hisobot berish.' },
        { key: '連絡', uz: 'O\'zgarishlar va rejalarni oldindan barcha manfaatdor shaxslarga yetkazish.' },
        { key: '相談', uz: 'Qiyin yoki uncertain vaziyatlarda o\'zboshimchalik qilmay maslahat so\'rash.' }
      ]
    },
    omotenashi: {
      name: 'おもてなし (Omotenashi)',
      definitionUz: 'Mijoz va suhbatdoshning ehtiyojlarini ular so\'ramasdan oldin sezib, samimiy va olijanob xizmat ko\'rsatish.',
      definitionJa: '見返りを求めず、相手の立場に立った心からのおもてなし。'
    },
    kuuki: {
      name: '空気を読む (Kūki wo yomu)',
      definitionUz: 'Suhbatdoshning kayfiyati, mimikasi va ovoz ohangidan aytilmagan niyatni ilg\'ab olish (Empatiya).',
      definitionJa: '場の雰囲気や相手の感情を察して、適切に行動すること。'
    },
    aizuchi: {
      name: '相槌 (Aizuchi)',
      definitionUz: 'Suhbatdoshni tinglayotganda tasdiq va diqqat signallarini berish («ええ», «なるほど», «おっしゃる通りです»).',
      definitionJa: '相手の話を聞いていることを示す適切な返答・うなずき。'
    }
  }
};

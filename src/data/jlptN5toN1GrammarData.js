/**
 * 🇯🇵 JLPT N5 to N1 Complete Grammar & Honorific Etiquette Dataset
 * 
 * Comprehensive dataset of Japanese proficiency levels (N5-N1), formal grammar patterns,
 * particle rules, sentence construction formulas, Sonkeigo (尊敬語), Kenjougo (謙譲語),
 * and polite conversation structures.
 */

export const JLPT_N5_TO_N1_DATA = {
  // 1. JLPT LEVEL GRAMMAR PATTERNS (N5 → N1)
  grammarLevels: {
    N5: [
      { pattern: '〜です', meaning: 'Is / Am / Are (polite copula)', formula: 'N + です', example: 'これはトラックです。', uz: 'Bu yuk mashinasi.' },
      { pattern: '〜ます', meaning: 'Polite verb present/future', formula: 'V(stem) + ます', example: '求人を探します。', uz: 'Ish e\'lonlarini qidiraman.' },
      { pattern: '〜てください', meaning: 'Polite request', formula: 'V(te) + ください', example: '求人を見せてください。', uz: 'Iltimos, ish e\'lonlarini ko\'rsating.' },
      { pattern: '〜たいです', meaning: 'Desire / Want to do', formula: 'V(stem) + たいです', example: '東京で働きたいです。', uz: 'Tokyoda ishlashni xohlayman.' },
      { pattern: '〜に行く / 〜に来る', meaning: 'Go/Come to do', formula: 'V(stem) + に行く/に来る', example: '面接に行きます。', uz: 'Suhbatga boraman.' },
      { pattern: '〜がある / 〜がいる', meaning: 'Exist (inanimate / animate)', formula: 'N + がある/がいる', example: '大型求人があります。', uz: 'Katta yuk haydovchisi vakansiyasi bor.' },
      { pattern: '〜から〜まで', meaning: 'From ... to ...', formula: 'N1 + から + N2 + まで', example: '9時から18時まで働きます。', uz: 'Soat 9 dan 18 gacha ishlayman.' },
      { pattern: '〜てもいいですか', meaning: 'May I ...? (Permission)', formula: 'V(te) + もいいですか', example: '質問してもいいですか。', uz: 'Savol bersam bo\'ladimi?' },
      { pattern: '〜ないでください', meaning: 'Please do not ...', formula: 'V(nai) + でください', example: '遅刻しないでください。', uz: 'Iltimos, kechikmang.' },
      { pattern: '〜すぎます', meaning: 'Too much / Excessively', formula: 'V(stem)/Adj + すぎます', example: '荷物が重すぎます。', uz: 'Yuk juda og\'ir.' },
      { pattern: '〜前 / 〜後', meaning: 'Before / After', formula: 'V(dict) + 前 / V(ta) + 後', example: '出発する前に点検します。', uz: 'Yo\'lga chiqishdan oldin tekshiraman.' },
      { pattern: '〜より〜のほうが', meaning: 'A is more ... than B', formula: 'A + より + B + のほうが', example: '東京より神奈川のほうが近いです。', uz: 'Tokyodan ko\'ra Kanagawa yaqinroq.' },
      { pattern: '〜でしょう', meaning: 'Probably / Right?', formula: 'Plain form + でしょう', example: '明日は雨でしょう。', uz: 'Ertaga yog\'ingarchilik bo\'lsa kerak.' },
      { pattern: '〜ながら', meaning: 'While doing ...', formula: 'V(stem) + ながら', example: '確認しながら運転します。', uz: 'Tekshirib borib haydayman.' },
      { pattern: '〜つもりです', meaning: 'Plan / Intend to', formula: 'V(dict) + つもりです', example: '大型免許を取るつもりです。', uz: 'Katta yuk guvohnomasini olmoqchiman.' }
    ],
    N4: [
      { pattern: '〜てもいいです', meaning: 'Permission / Allowed to', formula: 'V(te) + もいいです', example: '外国人の方も応募してもいいです。', uz: 'Chet elliklar ham topshirsa bo\'ladi.' },
      { pattern: '〜なければならない', meaning: 'Obligation / Must do', formula: 'V(nai stem) + なければならない', example: '大型免許を取得しなければなりません。', uz: 'Katta yuk guvohnomasini olishim shart.' },
      { pattern: '〜ことができます', meaning: 'Capability / Can do', formula: 'V(dict) + ことができます', example: '安全に運転することができます。', uz: 'Xavfsiz hayday olaman.' },
      { pattern: '〜たら', meaning: 'If / When (conditional)', formula: 'V(ta) + ら', example: '仕事が終わったら連絡します。', uz: 'Ish tugasa aloqaga chiqaman.' },
      { pattern: '〜ば', meaning: 'If (hypothetical condition)', formula: 'V(ba form)', example: '経験があれば優遇されます。', uz: 'Tajriba bo\'lsa ustunlik beriladi.' },
      { pattern: '〜なら', meaning: 'If it is the case that ...', formula: 'N/Plain + なら', example: '夜勤なら給与が高くなります。', uz: 'Tungi smena bo\'lsa oylik yuqori bo\'ladi.' },
      { pattern: '〜し、〜し', meaning: 'Listing reasons / Moreover', formula: 'Plain + し', example: '寮もあるし、給与も高いです。', uz: 'Yataqxona ham bor, oylik ham yuqori.' },
      { pattern: '〜そうです（様態）', meaning: 'Looks like / Appears to be', formula: 'V(stem)/Adj + そうです', example: '忙しそうです。', uz: 'Bandga o\'xshaydi.' },
      { pattern: '〜そうです（伝聞）', meaning: 'I heard that ...', formula: 'Plain form + そうです', example: '来月から時給が上がるそうです。', uz: 'Kelasi oydan soatbay ish haqida oshadi deb eshitdim.' },
      { pattern: '〜たことがある', meaning: 'Have experience of ...', formula: 'V(ta) + ことがある', example: '4tトラックを運転したことがあります。', uz: '4 tonnalik yuk mashinasini haydaganman.' },
      { pattern: '〜ほうがいいです', meaning: 'Had better do ... (Advice)', formula: 'V(ta) + ほうがいいです', example: '早めに応募したほうがいいです。', uz: 'Vaqtliroq topshirgan ma\'qul.' },
      { pattern: '〜はずです', meaning: 'Should be / Expected to be', formula: 'Plain form + はずです', example: '書類は届いたはずです。', uz: 'Hujjatlar yetib borgan bo\'lishi kerak.' },
      { pattern: '〜てしまう', meaning: 'Do completely / Regrettably', formula: 'V(te) + しまう', example: '道を間違えてしまいました。', uz: 'Yo\'ldan adashib qo\'ydim.' },
      { pattern: '〜やすい / 〜にくい', meaning: 'Easy to / Difficult to', formula: 'V(stem) + やすい/にくい', example: 'このトラックは運転しやすいです。', uz: 'Bu yuk mashinasini boshqarish oson.' },
      { pattern: '〜ようにする', meaning: 'Try to / Make an effort to', formula: 'V(dict/nai) + ようにする', example: '安全第一で運転するようにします。', uz: 'Birinchi navbatda xavfsizlikka amal qilishga harakat qilaman.' }
    ],
    N3: [
      { pattern: '〜に関して / 〜に関する', meaning: 'Regarding / About topic', formula: 'N + に関して', example: '労働条件に関してご案内いたします。', uz: 'Mehnat sharoitlari bo\'yicha ma\'lumot beraman.' },
      { pattern: '〜によって / 〜による', meaning: 'Depending on / According to', formula: 'N + によって', example: '経験によって給与が異なります。', uz: 'Tajribaga qarab oylik farq qiladi.' },
      { pattern: '〜をはじめ（として）', meaning: 'Starting with / Including', formula: 'N + をはじめとする', example: '東京をはじめとする関東エリアの求人です。', uz: 'Tokyoni o\'z ichiga olgan Kanto hududi vakansiyalari.' },
      { pattern: '〜を中心に', meaning: 'Focusing on / Centered around', formula: 'N + を中心に', example: '物流センターを中心に配送します。', uz: 'Logistika markazi atrofida yetkazib beriladi.' },
      { pattern: '〜を通じて / 〜を通して', meaning: 'Through / Via medium', formula: 'N + を通じて', example: 'Michi AIを通じて応募可能です。', uz: 'Michi AI orqali ariza topshirish mumkin.' },
      { pattern: '〜にわたって', meaning: 'Across / Throughout period or range', formula: 'N + にわたって', example: '3年間にわたって運転経験があります。', uz: '3 yil davomida haydovchilik tajribam bor.' },
      { pattern: '〜おそれがある', meaning: 'There is a risk of ...', formula: 'V(dict)/Nの + おそれがある', example: '大雨で遅延するおそれがあります。', uz: 'Katta yomg\'ir sababli kechikish xavfi bor.' },
      { pattern: '〜に違いない', meaning: 'Must be / No doubt that ...', formula: 'Plain form + に違いない', example: '良い職場に違いないです。', uz: 'Shubhasiz yaxshi ish joyi.' },
      { pattern: '〜わけがない', meaning: 'There is no way that ...', formula: 'Plain form + わけがない', example: '無事故のドライバーが断られるわけがない。', uz: 'Avariyasiz haydovchining rad etilishi mumkin emas.' },
      { pattern: '〜反面', meaning: 'On the other hand ...', formula: 'Plain form + 反面', example: '高給である反面、夜勤が多いです。', uz: 'Yuqori oylik bo\'lishiga qaramay, tungi smena ko\'p.' },
      { pattern: '〜ついでに', meaning: 'While doing X, incidentally do Y', formula: 'V(dict/ta)/Nの + ついでに', example: '荷降ろしのついでに点検します。', uz: 'Yuk tushirish jarayonida bir yo\'la tekshirib olaman.' },
      { pattern: '〜たとたん（に）', meaning: 'Just as / The moment X happened', formula: 'V(ta) + とたん', example: 'エンジンをかけた途端に音がしました。', uz: 'Dvigatelni o\'t olgan zahoti ovoz chiqdi.' },
      { pattern: '〜最中に', meaning: 'In the middle of doing ...', formula: 'V(te-iru)/Nの + 最中に', example: '運転の最中に電話をしてはいけません。', uz: 'Haydash jarayonida telefonda gaplashish mumkin emas.' },
      { pattern: '〜に伴って', meaning: 'Along with / As X changes, Y changes', formula: 'N/V(dict) + に伴って', example: '事業拡大に伴ってドライバーを増員します。', uz: 'Biznes kengayishi munosabati bilan haydovchilar soni oshiriladi.' },
      { pattern: '〜結果', meaning: 'As a result of ...', formula: 'V(ta)/Nの + 結果', example: '面接の結果、採用が決まりました。', uz: 'Suhbat natijasida ishga qabul qilindim.' }
    ],
    N2: [
      { pattern: '〜に際して / 〜に際し', meaning: 'On the occasion of / Prior to', formula: 'N/V(dict) + に際して', example: 'ご応募に際してのご注意事項です。', uz: 'Ariza topshirish oldidan muhim eslatmalar.' },
      { pattern: '〜を踏まえて', meaning: 'Taking into consideration / Based on', formula: 'N + を踏まえて', example: 'ご希望条件を踏まえて最適な求人をご提案いたします。', uz: 'Talablaringizni inobatga olgan holda mos ish taklif etamiz.' },
      { pattern: '〜かねます', meaning: 'Polite refusal / Unable to do', formula: 'V(stem) + かねます', example: 'ご条件に合わない場合はお繋ぎいたしかねます。', uz: 'Talablarga mos kelmasa, bog\'lab bera olmaymiz.' },
      { pattern: '〜を契機に / 〜をきっかけに', meaning: 'Triggered by / Opportunity of', formula: 'N + を契機に', example: '特定技能取得を契機に日本へ来ました。', uz: 'Tokutei Ginou olish munosabati bilan Yaponiyaga keldim.' },
      { pattern: '〜にとどまらず', meaning: 'Not limited to ..., but also', formula: 'N/V(dict) + にとどまらず', example: '東京にとどまらず、全国で配送を担当します。', uz: 'Faqat Tokyo bilan cheklanib qolmay, butun Yaponiya bo\'ylab yetkaziladi.' },
      { pattern: '〜のもとで / 〜のもとに', meaning: 'Under the guidance/supervision of', formula: 'N + のもとで', example: 'ベテランドライバーの指導のもとで研修を行います。', uz: 'Tajribali haydovchi rahbarligida amaliyot o\'taladi.' },
      { pattern: '〜にほかならない', meaning: 'Nothing other than / Purely', formula: 'N/Plain + にほかならない', example: 'この成功は安全第一の努力にほかなりません。', uz: 'Bu muvaffaqiyat xavfsizlikka berilgan e\'tibor mevasidir.' },
      { pattern: '〜わけにはいかない', meaning: 'Cannot afford to / Cannot do due to social obligation', formula: 'V(dict) + わけにはいかない', example: '配送時間を遅れるわけにはいきません。', uz: 'Yetkazish vaqtini kechiktirishga haqqimiz yo\'q.' },
      { pattern: '〜かねない', meaning: 'Might lead to negative result', formula: 'V(stem) + かねない', example: 'スピード違反は事故を起こしかねません。', uz: 'Tezlikni oshirish avariyaga olib kelishi mumkin.' },
      { pattern: '〜ざるを得ない', meaning: 'Cannot help but / Forced to', formula: 'V(nai stem) + ざるを得ない', example: '台風のため配送を見合わせざるを得ません。', uz: 'Tayfun sababli yetkazishni to\'xtatishga majburmiz.' },
      { pattern: '〜っこない', meaning: 'No chance of / Absolutely impossible', formula: 'V(stem) + っこない', example: '1時間で大阪に着きっこないです。', uz: '1 soatda Osakaga yetib borishning umuman iloji yo\'q.' },
      { pattern: '〜にすぎない', meaning: 'Merely / Nothing more than', formula: 'N/Plain + にすぎない', example: 'これは基本点検にすぎません。', uz: 'Bu shunchaki oddiy tekshiruv.' },
      { pattern: '〜を問わず', meaning: 'Regardless of / Irrespective of', formula: 'N + を問わず', example: '年齢・国籍を問わず幅広く募集しています。', uz: 'Yosh va fuqaroligidan qat\'i nazar barcha taklif etiladi.' },
      { pattern: '〜を余儀なくされる', meaning: 'Forced to undergo / Be obliged to', formula: 'N + を余儀なくされる', example: '道路通行止めのため迂回を余儀なくされました。', uz: 'Yo\'l yopilgani sababli aylanma yo\'ldan yurishga majbur bo\'lindi.' },
      { pattern: '〜次第', meaning: 'As soon as X is done', formula: 'V(stem)/N + 次第', example: '荷物が到着次第、ご連絡差し上げます。', uz: 'Yuk yetib kelishi bilanoq sizga xabar beramiz.' }
    ],
    N1: [
      { pattern: '〜にあって', meaning: 'In the situation of / Under circumstances of', formula: 'N + にあって', example: '物流業界の変化にあって、最新の求人情報をお届けします。', uz: 'Logistika sohasi o\'zgarishlari davrida eng so\'nggi vakansiyalarni taqdim etamiz.' },
      { pattern: '〜を皮切りに', meaning: 'Starting off with / Launching with', formula: 'N + を皮切りに', example: '東京での採用を皮切りに、全国展開を進めております。', uz: 'Tokyodagi qabuldan boshlab butun mamlakat bo\'ylab kengaymoqdamiz.' },
      { pattern: '〜にたえない', meaning: 'Cannot suppress / Deeply feel', formula: 'N/V(dict) + にたえない', example: '皆様の安全運転へのご尽力には感謝にたえません。', uz: 'Sizlarning xavfsiz haydashga qo\'shgan hissangizdan chuqur minnatdormiz.' },
      { pattern: '〜極まりない', meaning: 'Extremely / Boundless', formula: 'Adj/N + 極まりない', example: 'ドライバーの皆様のご活躍は頼もしいこと極まりないです。', uz: 'Haydovchilarimizning faolligi cheksiz quvonchli.' },
      { pattern: '〜をおいてほかにない', meaning: 'There is no other than X', formula: 'N + をおいてほかにない', example: 'この重要な配送を任せられるのは、あなたをおいてほかにありません。', uz: 'Bu muhim topshiriqni sizdan boshqaga topshirib bo\'lmaydi.' },
      { pattern: '〜たるもの', meaning: 'As expected of someone in position X', formula: 'N + たるもの', example: 'プロドライバーたるもの、安全点検を怠ってはならない。', uz: 'Professional haydovchi bo\'lgan inson xavfsizlikni susaytirmasligi kerak.' },
      { pattern: '〜あっての', meaning: 'Existing only because of X', formula: 'N1 + あっての + N2', example: 'お客様の信頼あっての我が社でございます。', uz: 'Kompaniyamiz faoliyati faqat mijozlar ishonchi tufaylidir.' },
      { pattern: '〜がてら', meaning: 'While doing X, also do Y for secondary purpose', formula: 'V(stem)/N + がてら', example: '納品がてら、現場の様子を確認いたします。', uz: 'Yuk topshirish jarayonida bir yo\'la obyekt holatini ham ko\'zdan kechiraman.' },
      { pattern: '〜なりに / 〜なりの', meaning: 'In one\'s own way / Befitting', formula: 'N/Plain + なりに', example: '新人ドライバーなりに精一杯努力いたします。', uz: 'Yangi haydovchi sifatida qo\'limdan kelgancha harakat qilaman.' },
      { pattern: '〜ずにはおかない', meaning: 'Will certainly / Cannot fail to cause X', formula: 'V(nai stem) + ずにはおかない', example: '丁寧な対応はお客様を感動させずにはおきません。', uz: 'Xushmuomala xizmat mijozni befarq qoldirmasligi aniq.' },
      { pattern: '〜そばから', meaning: 'As soon as X is done, Y happens again', formula: 'V(dict/ta) + そばから', example: '点検したそばから問い合わせが入ります。', uz: 'Tekshiruvni tugatishim bilanoq yangi murojaat tushmoqda.' },
      { pattern: '〜まじき', meaning: 'Must not / Unforgivable for role X', formula: 'V(dict) + まじき + N', example: 'ドライバーとしてあるまじき行為です。', uz: 'Haydovchi uchun mutlaqo joiz bo\'lmagan xatti-harakat.' },
      { pattern: '〜にもほどがある', meaning: 'There is a limit to how much X can be', formula: 'N/V(dict) + ににもほどがある', example: '安全確認の怠慢にもほどがあります。', uz: 'Xavfsizlikni e\'tiborsiz qoldirishning ham me\'yori bor.' },
      { pattern: '〜をもって', meaning: 'By means of / At the time of', formula: 'N + をもって', example: '本日をもって募集を締め切らせていただきます。', uz: 'Bugungi kun bilan qabulni yopiq deb e\'lon qilamiz.' }
    ]
  },

  // 2. JAPANESE PARTICLE MATRIX & RULES
  particleRules: {
    'は': { role: 'Topic Marker', uz: 'Mavzu ko\'rsatkichi (haqda)', example: '私はドライバーです。' },
    'が': { role: 'Subject Marker / Identifier', uz: 'Ega ko\'rsatkichi', example: '求人が見つかりました。' },
    'を': { role: 'Direct Object Marker', uz: 'Tushum kelishigi (ni)', example: 'トラックを運転します。' },
    'に': { role: 'Target / Time / Direction', uz: 'Yo\'nalish, vaqt, maqsad (ga)', example: '東京に行きます。9時に着きます。' },
    'で': { role: 'Location of Action / Means', uz: 'O\'rin-joy harakat, qurol (da/orqali)', example: 'トラックで配送します。' },
    'へ': { role: 'Directional Goal', uz: 'Yo\'nalish tomon (ga)', example: '関西方面へ向かいます。' },
    'と': { role: 'Partner / Quotation / Together', uz: 'Bilan / deb', example: '同僚と話します。' },
    'から': { role: 'Origin / Source / Reason', uz: 'Chiqish kelishigi (dan / chunki)', example: '倉庫から出発します。' },
    'まで': { role: 'Limit / Destination', uz: 'Gacha ko\'rsatkichi', example: '終点まで運搬します。' },
    'より': { role: 'Comparison Baseline', uz: 'Nisbatan (ko\'ra)', example: '昨日より忙しいです。' },
    'だけ': { role: 'Exclusivity (Only)', uz: 'Faqatgina (flesh/cheklangan)', example: '大型免許だけ必要です。' },
    'しか': { role: 'Restriction (Only with negative)', uz: 'Faqat ... xolos (inkor bilan)', example: '1台しかありません。' }
  },

  // 3. HONORIFIC ETIQUETTE MATRIX (尊敬語 vs 謙譲語 vs 丁寧語)
  keigoMatrix: {
    行く_来る: {
      casual: '行く・来る',
      sonkeigo: 'いらっしゃる・お越しになる',
      kenjougo: '参る・伺う',
      teineigo: '行きます・来ます'
    },
    言う: {
      casual: '言う',
      sonkeigo: 'おっしゃる',
      kenjougo: '申す・申し上げる',
      teineigo: '言います'
    },
    見る: {
      casual: '見る',
      sonkeigo: 'ご覧になる',
      kenjougo: '拝見する',
      teineigo: '見ます'
    },
    聞く: {
      casual: '聞く',
      sonkeigo: 'お聞きになる',
      kenjougo: '伺う・拝聴する',
      teineigo: '聞きます'
    },
    知る: {
      casual: '知っている',
      sonkeigo: 'ご存じだ',
      kenjougo: '存じ上げる・承知する',
      teineigo: '知っています'
    },
    する: {
      casual: 'する',
      sonkeigo: 'なさる・おやりになる',
      kenjougo: 'いたす',
      teineigo: 'します'
    },
    食べる_飲む: {
      casual: '食べる・飲む',
      sonkeigo: '召し上がる',
      kenjougo: 'いただく・頂戴する',
      teineigo: '食べます・飲みます'
    }
  },

  // 4. N1 MASTER DIALOGUE TEMPLATES
  n1DialogueTemplates: {
    welcome: '本日もお仕事お疲れ様でございます。Michi AIのアシスタントでございます。いかがお過ごしでしょうか。',
    searchResult: 'お探しの条件を精査いたしました。ご希望に沿う求人が見つかりましたので、謹んでご案内申し上げます。',
    confirmation: '承知いたしました。ご指示いただきました内容を速やかに実行いたします。少々お待ちくださいませ。',
    farewell: '本日も安全運転でお出かけくださいませ。ご武運と安全を心よりお祈り申し上げます。'
  }
};

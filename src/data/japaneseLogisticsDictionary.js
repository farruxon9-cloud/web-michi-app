/**
 * 🇯🇵 Master Japanese Logistics & Truck Driver Domain Dictionary
 * 
 * Comprehensive dictionary of professional Japanese truck driving jargon,
 * logistics terminology, license types, work conditions, visa categories, and Keigo (敬語).
 */

export const JAPANESE_LOGISTICS_DICTIONARY = {
  // 1. VEHICLE & LICENSE TYPES (車両・免許種別)
  licenses: {
    普通: { kanji: '普通自動車免許', hiragana: 'ふつうめんきょ', rōmaji: 'futsuu', uz: 'Oddiy avtomobil litsenziyasi', en: 'Ordinary driver license' },
    準中型: { kanji: '準中型自動車免許', hiragana: 'じゅんちゅうがためんきょ', rōmaji: 'junchuugata', uz: 'Kichik yuk mashinasi litsenziyasi (7.5t)', en: 'Semi-medium truck license' },
    中型: { kanji: '中型自動車免許', hiragana: 'ちゅうがためんきょ', rōmaji: 'chuugata', uz: "O'rta yuk mashinasi litsenziyasi (11t)", en: 'Medium truck license' },
    大型: { kanji: '大型自動車免許', hiragana: 'おおがためんきょ', rōmaji: 'oogata', uz: 'Katta yuk mashinasi litsenziyasi (11t+)', en: 'Heavy truck license' },
    牽引: { kanji: '牽引自動車免許', hiragana: 'けんいんめんきょ', rōmaji: 'keiin', uz: 'Tirkama/Treyler litsenziyasi', en: 'Towing/Trailer license' },
    フォークリフト: { kanji: 'フォークリフト技能講習', hiragana: 'ふぉーくりふと', rōmaji: 'foakurifuto', uz: 'Forklift yuklagich sertifikati', en: 'Forklift operator certificate' }
  },

  // 2. TRUCK BODY TYPES (トラック形状・車体)
  truckTypes: {
    ウイング車: { kanji: 'ウイング車', hiragana: 'ういんぐしゃ', uz: 'Qanotli yopilgan yuk mashinasi (Wing body)', en: 'Wing body truck' },
    平ボディ: { kanji: '平ボディ', hiragana: 'ひらぼでぃ', uz: 'Ochiq bortli yuk mashinasi (Flatbed)', en: 'Flatbed truck' },
    冷凍冷蔵車: { kanji: '冷凍冷蔵車', hiragana: 'れいとうれいぞうしゃ', uz: 'Sovutgichli/Muzlatgichli yuk mashinasi', en: 'Refrigerated/Freezer truck' },
    ダンプカー: { kanji: 'ダンプカー', hiragana: 'だんぷかー', uz: 'Samosval (Dump truck)', en: 'Dump truck' },
    タンクローリー: { kanji: 'タンクローリー', hiragana: 'たんくろーりー', uz: 'Suyuqlik tasuvchi sisterna', en: 'Tanker truck' },
    ユニック車: { kanji: 'ユニック車（クレーン付き）', hiragana: 'ゆにっくしゃ', uz: 'Kranli yuk mashinasi (Unic crane)', en: 'Crane truck' }
  },

  // 3. WORK SHIFT & LOGISTICS TERMS (勤務・物流専門用語)
  workTerms: {
    地場配送: { kanji: '地場配送', hiragana: 'じばはいそう', uz: 'Mahalliy qisqa masofaga yetkazish (50km ichida)', en: 'Local delivery' },
    中距離配送: { kanji: '中距離配送', hiragana: 'ちゅうきょりはいそう', uz: "O'rta masofaga yetkazish (100-300km)", en: 'Medium-distance delivery' },
    長距離配送: { kanji: '長距離配送', hiragana: 'ちょうきょりはいそう', uz: 'Uzoq masofaga yetkazish (300km+)', en: 'Long-distance haul' },
    ルート配送: { kanji: 'ルート配送', hiragana: 'るーとはいそう', uz: 'Aniq belgilangan yo’nalishli yetkazib berish', en: 'Fixed route delivery' },
    夜間配送: { kanji: '夜間配送', hiragana: 'やかんはいそう', uz: 'Tungi vaqtdagi yetkazib berish', en: 'Night delivery' },
    手積み手降ろし: { kanji: '手積み手降ろし（バラ積み）', hiragana: 'てづみておろし', uz: 'Yukni qo’lda ortish va tushirish', en: 'Manual hand loading/unloading' },
    パレット積み: { kanji: 'パレット積み', hiragana: 'ぱれっとづみ', uz: 'Paletka bilan ortish (Forkliftda)', en: 'Pallet loading' },
    点呼: { kanji: '乗務前点呼・アルコールチェック', hiragana: 'てんこ', uz: 'Reys oldidan mastlik va sog’lik tekshiruvi (Tenko)', en: 'Pre-shift driver roll call & sobriety test' }
  },

  // 4. SALARY & BENEFITS TERMS (給与・福利厚生)
  salaryTerms: {
    月給: { kanji: '月給', hiragana: 'げっきゅう', uz: 'Oylik maosh', en: 'Monthly salary' },
    手取り: { kanji: '手取り額', hiragana: 'てどり', uz: "Qo'lga tegadigan sof maosh (soliqlardan so'ng)", en: 'Net take-home pay' },
    歩合制: { kanji: '歩合制（インセンティブ）', hiragana: 'ぶあいせい', uz: 'Bajarilgan ish hajmidan bonus/foiz', en: 'Commission / Incentive pay' },
    賞与: { kanji: '賞与（ボーナス年2回）', hiragana: 'しょうよ', uz: 'Yillik mukofot bonusi (Bonus)', en: 'Bi-annual bonus' },
    寮完備: { kanji: '寮・社宅完備', hiragana: 'りょうかんび', uz: 'Kompaniya yotoqxonasi bilan ta’minlangan', en: 'Company dormitory provided' },
    交通費支給: { kanji: '交通費全額支給', hiragana: 'こうつうひしきゅう', uz: 'Yo’l xarajati kompaniya tomonidan to’lanadi', en: 'Full commuting allowance' }
  },

  // 5. VISA & STATUS (在留資格)
  visaTerms: {
    特定技能1号: { kanji: '特定技能1号（自動車運送業）', hiragana: 'とくていぎのういちごう', uz: 'Tokutei Ginou 1-bosqich (Transport sohasi)', en: 'Specified Skilled Worker 1 (Logistics)' },
    特定技能2号: { kanji: '特定技能2号', hiragana: 'とくていぎのにごう', uz: 'Tokutei Ginou 2-bosqich (Oila ko’chirish huquqi bilan)', en: 'Specified Skilled Worker 2' },
    永住者: { kanji: '永住者', hiragana: 'えいじゅうしゃ', uz: 'Doimiy yashash vizasi (Permanent Resident)', en: 'Permanent Resident' },
    外国人歓迎: { kanji: '外国人ドライバー歓迎', hiragana: 'がいこくじんかんげい', uz: 'Chet ellik haydovchilar qabul qilinadi', en: 'Foreign drivers welcome' }
  },

  // 6. PROFESSIONAL POLITE KEIGO (敬語・応対)
  keigoResponses: {
    greeting: 'お疲れ様です！本日も安全運転でお願いいたします。',
    confirm: 'かしこまりました。ご指定の条件で検索・実行いたします。',
    wait: '少々お待ちください。該当する最新情報を取得中でおわします。',
    safetyNotice: 'ドライバーの皆様、本日もアルコールチェックと点呼をお忘れなく！'
  }
};

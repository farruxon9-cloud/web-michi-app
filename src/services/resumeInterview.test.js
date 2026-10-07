import { describe, it, expect } from 'vitest';
import {
  detectCommand, extractDigits, parsePhone, parsePostalCode, parseEmail, parseSpokenDate,
  parseGender, parseJlpt, parseLicenses, parseName, toKatakana, parseYesNo, parseLongText,
  parseOrdinal, correctAddress, hiraganaToKatakana, isKanaOnly
} from './resumeParsers';
import { ResumeInterview, buildPlan, normalizeAlternatives } from './resumeInterviewEngine';
import { composeMotivation, composeSelfPR, parseYears } from './resumeComposer';
import { PREFECTURES, FIELD_HELP } from './resumeKnowledge';
import { getScript } from './resumeInterviewScript';
import { chunkText } from './resumeVoiceIO';

describe('resumeParsers', () => {
  it('detects commands in many languages', () => {
    expect(detectCommand('ha')).toBe('yes');
    expect(detectCommand("Ha, to'g'ri")).toBe('yes');
    expect(detectCommand('はい')).toBe('yes');
    expect(detectCommand('да')).toBe('yes');
    expect(detectCommand("yo'q")).toBe('no');
    expect(detectCommand('いいえ')).toBe('no');
    expect(detectCommand("o'tkazib yubor")).toBe('skip');
    expect(detectCommand('пропусти')).toBe('skip');
    expect(detectCommand('takrorla')).toBe('repeat');
    expect(detectCommand("to'xta")).toBe('stop');
    expect(detectCommand('orqaga')).toBe('back');
    expect(detectCommand('わからない', { order: ['help'] })).toBe('help');
    expect(detectCommand('bilmayman', { order: ['help'] })).toBe('help');
    expect(detectCommand('ちがう', { order: ['undo'] })).toBe('undo');
    expect(detectCommand('間違い', { order: ['undo'] })).toBe('undo');
  });

  it('strict mode never mistakes a name for a command', () => {
    expect(detectCommand('Hasan Aliyev', { strict: true })).toBeNull();
    expect(detectCommand('ha', { strict: true, order: ['skip'] })).toBeNull();
  });

  it('extracts digits from words and scripts', () => {
    expect(extractDigits("nol to'qqiz nol bir ikki uch")).toBe('090123');
    expect(extractDigits('〇九〇')).toBe('090');
    expect(extractDigits('zero eight zero')).toBe('080');
    expect(extractDigits('ゼロキューゼロ')).toBe('090');
  });

  it('formats phones and postal codes', () => {
    expect(parsePhone('09012345678')).toBe('090-1234-5678');
    expect(parsePhone('+81 90 1234 5678')).toBe('090-1234-5678');
    expect(parsePhone('0312345678')).toBe('03-1234-5678');
    expect(parsePhone('998901234567')).toBe('+998 90 123 45 67');
    expect(parsePhone('123')).toBeNull();
    expect(parsePostalCode('1 6 0 0 0 2 3')).toBe('160-0023');
    expect(parsePostalCode('12345')).toBeNull();
  });

  it('parses spoken e-mails (incl. glued Japanese)', () => {
    expect(parseEmail('ali at gmail nuqta com')).toBe('ali@gmail.com');
    expect(parseEmail('ali собака mail точка ru')).toBe('ali@mail.ru');
    expect(parseEmail('farrux dot k at gmail dot com')).toBe('farrux.k@gmail.com');
    expect(parseEmail('ali at gmail com')).toBe('ali@gmail.com');
    expect(parseEmail('aliアットマークジーメールドットコム')).toBe('ali@gmail.com');
    expect(parseEmail('salom')).toBeNull();
  });

  it('parses spoken dates (incl. Japanese era / kanji)', () => {
    expect(parseSpokenDate('1995-yil 12-may')).toBe('1995-05-12');
    expect(parseSpokenDate('12 мая 1995 года')).toBe('1995-05-12');
    expect(parseSpokenDate('May 12, 1995')).toBe('1995-05-12');
    expect(parseSpokenDate('1995年5月12日')).toBe('1995-05-12');
    expect(parseSpokenDate('平成7年5月12日')).toBe('1995-05-12');
    expect(parseSpokenDate('千九百九十五年五月十二日')).toBe('1995-05-12');
    expect(parseSpokenDate('ngày 12 tháng 5 năm 1995')).toBe('1995-05-12');
    expect(parseSpokenDate('12.05.1995')).toBe('1995-05-12');
    expect(parseSpokenDate('5 mart 98')).toBe('1998-03-05');
    expect(parseSpokenDate('31 fevral 1995')).toBeNull();
    expect(parseSpokenDate('salom')).toBeNull();
  });

  it('parses gender, JLPT and licences', () => {
    expect(parseGender('erkak')).toBe('male');
    expect(parseGender('ayolman')).toBe('female');
    expect(parseGender('女性です')).toBe('female');
    expect(parseGender('おとこ')).toBe('male');
    expect(parseJlpt('N3')).toBe('N3');
    expect(parseJlpt('en 2')).toBe('N2');
    expect(parseJlpt('エヌさん')).toBe('N3');
    expect(parseJlpt('uchinchi daraja')).toBe('N3');
    expect(parseJlpt('三級')).toBe('N3');
    expect(parseJlpt("yo'q")).toBe('none');
    expect(parseJlpt('持っていません')).toBe('none');
    expect(parseLicenses('oddiy')).toEqual(['futsu']);
    expect(parseLicenses('普通と中型')).toEqual(['chugata', 'futsu']);
    expect(parseLicenses('yarim o\'rta')).toEqual(['junchugata']);
    expect(parseLicenses("yo'q")).toEqual([]);
    expect(parseLicenses('salom')).toBeNull();
  });

  it('cleans names and builds katakana', () => {
    expect(parseName('Mening ismim Alimov Anvar')).toBe('ALIMOV ANVAR');
    expect(parseName('Меня зовут Фаррух Каноатов')).toBe('FARRUX KANOATOV');
    expect(parseName('田中太郎です')).toBe('田中太郎');
    expect(parseName('アリモフ アンバルです')).toBe('アリモフ アンバル');
    expect(parseName('12')).toBeNull();
    expect(toKatakana('ALIMOV ANVAR')).toBe('アリモフ アンバル');
    expect(toKatakana('Farrux')).toBe('ファルフ');
    expect(toKatakana('アリ')).toBe('アリ');
    expect(toKatakana('ありもふ')).toBe('アリモフ');
    expect(hiraganaToKatakana('たなか')).toBe('タナカ');
    expect(isKanaOnly('アリ ベク')).toBe(true);
    expect(isKanaOnly('田中')).toBe(false);
  });

  it('ordinals pick examples, long answers never do', () => {
    expect(parseOrdinal('1番')).toBe(0);
    expect(parseOrdinal('いちばん')).toBe(0);
    expect(parseOrdinal('二番です')).toBe(1);
    expect(parseOrdinal('3つ目')).toBe(2);
    expect(parseOrdinal('birinchi')).toBe(0);
    expect(parseOrdinal('second')).toBe(1);
    expect(parseOrdinal('2')).toBe(1);
    expect(parseOrdinal('4番')).toBeNull();
    expect(parseOrdinal('東京都新宿区西新宿1番地')).toBeNull();
  });

  it('fixes kana prefectures in addresses', () => {
    expect(correctAddress('とうきょうと新宿区', PREFECTURES)).toBe('東京都新宿区');
    expect(correctAddress('おおさか 市北区', PREFECTURES)).toBe('大阪府市北区');
    expect(correctAddress('愛知県名古屋市', PREFECTURES)).toBe('愛知県名古屋市');
    expect(correctAddress('Tashkent, Chilonzor', PREFECTURES)).toBe('Tashkent, Chilonzor');
  });

  it('yes/no and long text', () => {
    expect(parseYesNo('ha bor')).toBe(true);
    expect(parseYesNo("yo'q")).toBe(false);
    expect(parseYesNo('はい')).toBe(true);
    expect(parseYesNo('nimadir')).toBeNull();
    expect(parseLongText('men mehnatkashman')).toBe('Men mehnatkashman.');
  });
});

describe('resumeComposer', () => {
  it('builds polite Japanese from keys', () => {
    const m = composeMotivation({ reason: 'family', years: 3 });
    expect(m).toContain('家族');
    expect(m).toContain('3年間');
    expect(m).toMatch(/貴社/);
    const pr = composeSelfPR({ strength: 'punctual', years: 0 });
    expect(pr).toContain('時間を守り');
    expect(pr).not.toContain('0年');
  });

  it('accepts free Japanese text and unknown experience', () => {
    const m = composeMotivation({ reason: '日本の技術を学びたいです。', years: null });
    expect(m).toContain('日本の技術を学びたいという思いから');
    expect(m).toContain('何事にも前向きに');
  });

  it('parses years', () => {
    expect(parseYears('3年')).toBe(3);
    expect(parseYears('三年')).toBe(3);
    expect(parseYears('十二年')).toBe(12);
    expect(parseYears('なし')).toBe(0);
    expect(parseYears('未経験です')).toBe(0);
    expect(parseYears('hmm')).toBeNull();
  });
});

describe('ResumeInterview engine 2.0', () => {
  const labels = { male: 'Erkak', female: 'Ayol', none: "Yo'q", lic_futsu: 'Oddiy' };
  const filled = {
    fullName: 'X', furigana: 'エックス', birthDate: '1990-01-01', postalCode: '1', address: 'a', phone: '1', email: 'e',
    educationHistory: [{ school: 's' }], workHistory: [{ company: 'c' }], driverLicenses: ['futsu'], jlptStatus: { level: 'N3' },
    motivation: 'm', selfPR: 's'
  };

  it('plans only empty fields and composes motivation / self-PR', () => {
    const plan = buildPlan({ fullName: 'ALI', furigana: 'アリ', gender: 'male', email: 'a@b.co' });
    const ids = plan.map(s => s.id);
    expect(ids).not.toContain('fullName');
    expect(ids).not.toContain('email');
    expect(ids).toContain('birthDate');
    expect(ids).toContain('eduSchool');
    expect(ids.slice(-3)).toEqual(['motReason', 'motStrength', 'motYears']);
    expect(buildPlan(filled)).toEqual([]);
  });

  it('speaks Japanese and shows a UI-language subtitle', () => {
    const eng = new ResumeInterview({ formData: {}, lang: 'uz', labels });
    const start = eng.start({ greet: false });
    expect(start.say).toBe(getScript('ja').q.fullName);
    expect(start.sub).toContain('Pasport');
    const jaEng = new ResumeInterview({ formData: {}, lang: 'ja', labels });
    expect(jaEng.start({ greet: false }).sub).toBe('');
  });

  it('writes a clear answer immediately (implicit confirmation)', () => {
    const eng = new ResumeInterview({ formData: { ...filled, birthDate: '' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('birthDate');
    const w = eng.handleAnswer([{ text: '1995年5月12日', confidence: 0.92 }]);
    expect(w.type).toBe('write');
    expect(w.effect).toEqual({ type: 'birthDate', value: '1995-05-12' });
    expect(w.next.say).toContain('1995年5月12日、書きました');
    expect(w.next.type).toBe('done');
  });

  it('asks 「はい」 only when recognition is unsure', () => {
    const eng = new ResumeInterview({ formData: { ...filled, phone: '' }, lang: 'en', labels });
    eng.start({ greet: false });
    const c = eng.handleAnswer([{ text: '09012345678', confidence: 0.4 }]);
    expect(c.type).toBe('confirm');
    expect(c.say).toContain('でいいですか');
    expect(eng.handleAnswer('はい').effect).toEqual({ type: 'text', field: 'phone', value: '090-1234-5678' });
  });

  it('ambiguous alternatives for numbers ask first', () => {
    const eng = new ResumeInterview({ formData: { ...filled, postalCode: '' }, lang: 'en', labels });
    eng.start({ greet: false });
    const c = eng.handleAnswer(['1600023', '1600028']);
    expect(c.type).toBe('confirm');
    expect(c.pending.value).toBe('160-0023');
    // 「ちがう」 while confirming re-asks
    expect(eng.handleAnswer('ちがう').type).toBe('ask');
  });

  it('「ちがう」 after a write undoes it and re-asks the same question', () => {
    const eng = new ResumeInterview({ formData: { ...filled, address: '', phone: '' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('address');
    const w = eng.handleAnswer('とうきょうと新宿区');
    expect(w.type).toBe('write');
    expect(w.effect.value).toBe('東京都新宿区');
    expect(eng.current.id).toBe('phone');
    const u = eng.handleAnswer('ちがう');
    expect(u.type).toBe('undo');
    expect(u.next.say).toContain('消しました');
    expect(eng.current.id).toBe('address');
    expect(eng.canUndo).toBe(false);
  });

  it('a katakana name fills フリガナ too and skips that question', () => {
    const eng = new ResumeInterview({ formData: {}, lang: 'ja', labels });
    eng.start({ greet: false });
    const w = eng.handleAnswer('アリモフ アンバルです');
    expect(w.type).toBe('write');
    expect(w.effect).toEqual({
      type: 'multi',
      effects: [{ type: 'text', field: 'fullName', value: 'アリモフ アンバル' }, { type: 'text', field: 'furigana', value: 'アリモフ アンバル' }]
    });
    expect(eng.current.id).toBe('gender');
    // undo restores the furigana step as well
    eng.undoResult();
    expect(eng.steps.some(s => s.id === 'furigana')).toBe(true);
  });

  it('a Latin name gets a furigana proposal with one 「はい」', () => {
    const eng = new ResumeInterview({ formData: {}, lang: 'uz', labels });
    eng.start({ greet: false });
    const w = eng.handleAnswer('Alimov Anvar');
    expect(w.effect).toEqual({ type: 'text', field: 'fullName', value: 'ALIMOV ANVAR' });
    expect(w.next.type).toBe('confirm');
    expect(eng.pending.value).toBe('アリモフ アンバル');
    expect(eng.handleAnswer('はい').effect).toEqual({ type: 'text', field: 'furigana', value: 'アリモフ アンバル' });
  });

  it('help gives examples, and "1番" / tapping picks one', () => {
    const eng = new ResumeInterview({ formData: { ...filled, jlptStatus: null }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('jlpt');
    const h = eng.handleAnswer('わからない');
    expect(h.type).toBe('help');
    expect(h.examples.map(e => e.label)).toEqual(FIELD_HELP.jlpt.examples.map(e => e.label));
    expect(h.say).toContain('1番');
    const w = eng.handleAnswer('1番');
    expect(w.effect).toEqual({ type: 'jlpt', value: 'N3' });
  });

  it('first silence on a field with examples opens help', () => {
    const eng = new ResumeInterview({ formData: { ...filled, driverLicenses: [] }, lang: 'en', labels });
    eng.start({ greet: false });
    expect(eng.onSilence().type).toBe('help');
    expect(eng.onSilence().type).toBe('ask');
    expect(eng.pickExample(0).effect).toEqual({ type: 'licenses', value: ['futsu'] });
  });

  it('composer: 3 short answers → 志望動機 + 自己PR', () => {
    const eng = new ResumeInterview({ formData: { ...filled, motivation: '', selfPR: '' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('motReason');
    const r1 = eng.handleAnswer('家族を支えたいです');
    expect(r1.type).toBe('write');
    expect(r1.effect).toBeNull();
    expect(eng.current.id).toBe('motStrength');
    eng.handleAnswer('2番');
    expect(eng.current.id).toBe('motYears');
    const w = eng.handleAnswer('3年');
    expect(w.effect.type).toBe('multi');
    const [mot, pr] = w.effect.effects;
    expect(mot.field).toBe('motivation');
    expect(mot.value).toContain('家族');
    expect(mot.value).toContain('3年間');
    expect(pr.field).toBe('selfPR');
    expect(pr.value).toContain('時間を守り');
    expect(w.next.say).toContain('志望動機と自己PRを書きました');
    expect(eng.isDone).toBe(true);
  });

  it('composer: only the empty text is written, skipping years still writes', () => {
    const eng = new ResumeInterview({ formData: { ...filled, selfPR: '' }, lang: 'en', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('motStrength');
    eng.handleAnswer('まじめです');
    const w = eng.handleAnswer('スキップ');
    expect(w.type).toBe('write');
    expect(w.effect).toMatchObject({ type: 'text', field: 'selfPR' });
    expect(w.effect.value).toContain('まじめ');
  });

  it('skip, back, repeat and stop commands', () => {
    const eng = new ResumeInterview({ formData: { fullName: 'X', furigana: 'X' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('birthDate');
    const sk = eng.handleAnswer('スキップ');
    expect(sk.type).toBe('ask');
    expect(eng.current.id).toBe('postalCode');
    expect(eng.getSkipped()).toContain('birthDate');
    expect(eng.handleAnswer('もう一度').say).toContain('郵便番号');
    expect(eng.handleAnswer('戻って').say).toContain('生年月日');
    expect(eng.handleAnswer('ストップ').type).toBe('pause');
  });

  it('education loop adds entries and skipping drops the whole entry', () => {
    const eng = new ResumeInterview({ formData: { ...filled, educationHistory: [], workHistory: [] }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('eduSchool');
    const w1 = eng.handleAnswer('東京大学');
    expect(w1.effect).toEqual({ type: 'list', list: 'educationHistory', index: 0, key: 'school', value: '東京大学' });
    eng.handleAnswer('経済学');
    expect(eng.current.id).toBe('eduMore');
    eng.handleAnswer('はい');
    expect(eng.current).toMatchObject({ id: 'eduSchool', index: 1 });
    eng.handleAnswer('スキップ');
    expect(eng.current.id).toBe('workCompany');
    eng.handleAnswer('スキップ');
    expect(eng.isDone).toBe(true);
  });

  it('licences and JLPT produce structured effects', () => {
    const eng = new ResumeInterview({ formData: { ...filled, driverLicenses: [], jlptStatus: null }, lang: 'ja', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('licenses');
    expect(eng.handleAnswer('普通').effect).toEqual({ type: 'licenses', value: ['futsu'] });
    const w = eng.handleAnswer('なし');
    expect(w.effect).toEqual({ type: 'jlpt', value: null });
    expect(eng.isDone).toBe(true);
  });

  it('normalises alternatives and never crashes on empty input', () => {
    expect(normalizeAlternatives(['a', { text: 'b', confidence: 0.3 }, ''])).toEqual([
      { text: 'a', confidence: null }, { text: 'b', confidence: 0.3 }
    ]);
    const eng = new ResumeInterview({ formData: {}, lang: 'xx', labels });
    expect(eng.handleAnswer('')).toBeNull();
    expect(eng.handleAnswer([])).toBeNull();
    expect(eng.start().say.length).toBeGreaterThan(5);
  });
});

describe('resumeVoiceIO helpers', () => {
  it('chunks long text into sentences', () => {
    const parts = chunkText('Birinchi gap. Ikkinchi gap! ' + 'a '.repeat(200));
    expect(parts[0]).toBe('Birinchi gap.');
    expect(parts.every(p => p.length <= 170)).toBe(true);
  });
});

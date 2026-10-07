import { describe, it, expect } from 'vitest';
import {
  detectCommand, extractDigits, parsePhone, parsePostalCode, parseEmail, parseSpokenDate,
  parseGender, parseJlpt, parseLicenses, parseName, toKatakana, parseYesNo, parseLongText
} from './resumeParsers';
import { ResumeInterview, buildPlan } from './resumeInterviewEngine';
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
  });

  it('strict mode never mistakes a name for a command', () => {
    expect(detectCommand('Hasan Aliyev', { strict: true })).toBeNull();
    expect(detectCommand('ha', { strict: true, order: ['skip'] })).toBeNull();
  });

  it('extracts digits from words and scripts', () => {
    expect(extractDigits("nol to'qqiz nol bir ikki uch")).toBe('090123');
    expect(extractDigits('〇九〇')).toBe('090');
    expect(extractDigits('zero eight zero')).toBe('080');
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

  it('parses spoken e-mails', () => {
    expect(parseEmail('ali at gmail nuqta com')).toBe('ali@gmail.com');
    expect(parseEmail('ali собака mail точка ru')).toBe('ali@mail.ru');
    expect(parseEmail('farrux dot k at gmail dot com')).toBe('farrux.k@gmail.com');
    expect(parseEmail('ali at gmail com')).toBe('ali@gmail.com');
    expect(parseEmail('salom')).toBeNull();
  });

  it('parses spoken dates', () => {
    expect(parseSpokenDate('1995-yil 12-may')).toBe('1995-05-12');
    expect(parseSpokenDate('12 мая 1995 года')).toBe('1995-05-12');
    expect(parseSpokenDate('May 12, 1995')).toBe('1995-05-12');
    expect(parseSpokenDate('1995年5月12日')).toBe('1995-05-12');
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
    expect(parseJlpt('N3')).toBe('N3');
    expect(parseJlpt('en 2')).toBe('N2');
    expect(parseJlpt('uchinchi daraja')).toBe('N3');
    expect(parseJlpt('三級')).toBe('N3');
    expect(parseJlpt("yo'q")).toBe('none');
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
    expect(parseName('12')).toBeNull();
    expect(toKatakana('ALIMOV ANVAR')).toBe('アリモフ アンバル');
    expect(toKatakana('Farrux')).toBe('ファルフ');
    expect(toKatakana('アリ')).toBe('アリ');
  });

  it('yes/no and long text', () => {
    expect(parseYesNo('ha bor')).toBe(true);
    expect(parseYesNo("yo'q")).toBe(false);
    expect(parseYesNo('nimadir')).toBeNull();
    expect(parseLongText('men mehnatkashman')).toBe('Men mehnatkashman.');
  });
});

describe('ResumeInterview engine', () => {
  const labels = { male: 'Erkak', female: 'Ayol', none: "Yo'q", lic_futsu: '普通' };

  it('plans only empty fields', () => {
    const plan = buildPlan({ fullName: 'ALI', furigana: 'アリ', gender: 'male', email: 'a@b.co' });
    const ids = plan.map(s => s.id);
    expect(ids).not.toContain('fullName');
    expect(ids).not.toContain('gender');
    expect(ids).not.toContain('email');
    expect(ids).toContain('birthDate');
    expect(ids).toContain('eduSchool');
  });

  it('runs ask → confirm → write → next', () => {
    const eng = new ResumeInterview({ formData: {}, lang: 'uz', labels });
    const start = eng.start({ greet: true });
    expect(start.say).toContain('Ism va familiyangizni');

    const c = eng.handleAnswer('Mening ismim Alimov Anvar');
    expect(c.type).toBe('confirm');
    expect(c.pending.value).toBe('ALIMOV ANVAR');

    const w = eng.confirm();
    expect(w.type).toBe('write');
    expect(w.effect).toEqual({ type: 'text', field: 'fullName', value: 'ALIMOV ANVAR' });
    // Furigana is proposed automatically from the confirmed name
    expect(w.next.type).toBe('confirm');
    expect(eng.pending.value).toBe('アリモフ アンバル');
  });

  it('voice "ha" confirms, "yo\'q" re-asks, a new answer corrects', () => {
    const eng = new ResumeInterview({ formData: { fullName: 'X', furigana: 'エックス' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('birthDate');
    expect(eng.handleAnswer('salom').type).toBe('retry');
    expect(eng.handleAnswer('1995-yil 12-may').type).toBe('confirm');
    expect(eng.handleAnswer("yo'q").type).toBe('ask');
    expect(eng.handleAnswer('1996-yil 1-iyun').pending.value).toBe('1996-06-01');
    const corrected = eng.handleAnswer('1997-yil 2-iyul');
    expect(corrected.pending.value).toBe('1997-07-02');
    const w = eng.handleAnswer('ha');
    expect(w.type).toBe('write');
    expect(w.effect).toEqual({ type: 'birthDate', value: '1997-07-02' });
  });

  it('uses recognition alternatives when the best one does not parse', () => {
    const eng = new ResumeInterview({ formData: { fullName: 'X', furigana: 'X', birthDate: '1990-01-01' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('postalCode');
    const r = eng.handleAnswer(['bir olti nol nol', '1600023']);
    expect(r.pending.value).toBe('160-0023');
  });

  it('skip, back, repeat and stop commands', () => {
    const eng = new ResumeInterview({ formData: { fullName: 'X', furigana: 'X' }, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('birthDate');
    const sk = eng.handleAnswer("o'tkazib yubor");
    expect(sk.type).toBe('ask');
    expect(eng.current.id).toBe('postalCode');
    expect(eng.getSkipped()).toContain('birthDate');
    expect(eng.handleAnswer('takrorla').say).toContain('Pochta');
    expect(eng.handleAnswer('orqaga').say).toContain("Tug'ilgan");
    expect(eng.handleAnswer("to'xta").type).toBe('pause');
  });

  it('education loop adds entries and skipping drops the whole entry', () => {
    const full = {
      fullName: 'X', furigana: 'X', birthDate: '1990-01-01', postalCode: '1', address: 'a', phone: '1', email: 'e',
      driverLicenses: ['futsu'], jlptStatus: { level: 'N3' }, motivation: 'm', selfPR: 's'
    };
    const eng = new ResumeInterview({ formData: full, lang: 'uz', labels });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('eduSchool');
    eng.handleAnswer('Toshkent davlat universiteti');
    const w1 = eng.confirm();
    expect(w1.effect).toEqual({ type: 'list', list: 'educationHistory', index: 0, key: 'school', value: 'Toshkent davlat universiteti' });
    eng.handleAnswer('Iqtisodiyot');
    eng.confirm();
    expect(eng.current.id).toBe('eduMore');
    eng.handleAnswer('ha');
    expect(eng.current).toMatchObject({ id: 'eduSchool', index: 1 });
    eng.handleAnswer("o'tkazib yubor");
    expect(eng.current.id).toBe('workCompany');
    eng.handleAnswer("o'tkazib yubor");
    expect(eng.isDone).toBe(true);
  });

  it('licences and JLPT produce structured effects', () => {
    const eng = new ResumeInterview({
      formData: { fullName: 'X', furigana: 'X', birthDate: '1990-01-01', postalCode: '1', address: 'a', phone: '1', email: 'e', educationHistory: [{ school: 's' }], workHistory: [{ company: 'c' }], motivation: 'm', selfPR: 's' },
      lang: 'ja',
      labels
    });
    eng.start({ greet: false });
    expect(eng.current.id).toBe('licenses');
    eng.handleAnswer('普通');
    expect(eng.confirm().effect).toEqual({ type: 'licenses', value: ['futsu'] });
    eng.handleAnswer('なし');
    expect(eng.confirm().effect).toEqual({ type: 'jlpt', value: null });
    expect(eng.isDone).toBe(true);
  });

  it('long answers are marked translatable outside Japanese', () => {
    const eng = new ResumeInterview({
      formData: { fullName: 'X', furigana: 'X', birthDate: '1990-01-01', postalCode: '1', address: 'a', phone: '1', email: 'e', educationHistory: [{ school: 's' }], workHistory: [{ company: 'c' }], driverLicenses: ['futsu'], jlptStatus: { level: 'N3' }, selfPR: 's' },
      lang: 'uz',
      labels
    });
    eng.start({ greet: false });
    const c = eng.handleAnswer('Men haydovchi bo\'lib ishlashni yaxshi ko\'raman');
    expect(c.pending.translatable).toBe(true);
    eng.setPendingWriteValue('運転の仕事が好きです。');
    expect(eng.confirm().effect.value).toBe('運転の仕事が好きです。');
  });

  it('never crashes on empty input and finishes cleanly', () => {
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

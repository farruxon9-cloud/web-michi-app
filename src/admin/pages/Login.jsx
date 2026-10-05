import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { auth, saveSession } from '../api';
import { useT, LANGS } from '../i18n';
import { ErrorBox, useToast } from '../components/ui';

/**
 * Steps: login → (enroll → recovery) | verify → onDone(admin)
 *        forgot: email → code + new password → login
 */
export default function Login({ onDone }) {
  const { t, lang, setLang } = useT();
  const toast = useToast();
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [challenge, setChallenge] = useState('');
  const [enroll, setEnroll] = useState(null); // { secret, otpauthUrl, qr }
  const [code, setCode] = useState('');
  const [useRec, setUseRec] = useState(false);
  const [recovery, setRecovery] = useState(null);
  const [pending, setPending] = useState(null); // session data waiting for "I saved codes"
  const [resetCode, setResetCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState('');

  const go = (s) => { setErr(null); setInfo(''); setCode(''); setStep(s); };
  const wrap = (fn) => async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try { await fn(); } catch (ex) {
      setErr(ex);
      if (ex.code === 'CHALLENGE_EXPIRED') go('login');
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (step !== 'enroll' || enroll) return;
    let alive = true;
    auth.enrollStart(challenge).then(async (d) => {
      const qr = await QRCode.toDataURL(d.otpauthUrl, { margin: 0, width: 184, errorCorrectionLevel: 'M' });
      if (alive) setEnroll({ ...d, qr });
    }).catch((ex) => { if (alive) { setErr(ex); if (ex.code === 'CHALLENGE_EXPIRED') go('login'); } });
    return () => { alive = false; };
  }, [step, enroll, challenge]);

  const doLogin = wrap(async () => {
    const r = await auth.login(email.trim(), password);
    setPassword('');
    setChallenge(r.challenge);
    setEnroll(null);
    go(r.next === 'enroll' ? 'enroll' : 'verify');
  });
  const doEnroll = wrap(async () => {
    const r = await auth.enrollConfirm(challenge, code);
    setRecovery(r.recoveryCodes);
    setPending(r);
    go('recovery');
  });
  const doVerify = wrap(async () => {
    const r = await auth.verify(challenge, useRec ? { recoveryCode: code } : { code });
    saveSession(r);
    onDone(r.admin);
  });
  const finishRecovery = () => { saveSession(pending); onDone(pending.admin); };
  const doSendCode = wrap(async () => {
    await auth.sendResetCode(email.trim());
    setCodeSent(true);
    setInfo(t('codeSent'));
  });
  const doReset = wrap(async () => {
    await auth.resetPassword(email.trim(), resetCode, newPass);
    setNewPass('');
    setResetCode('');
    setCodeSent(false);
    go('login');
    setInfo(t('passwordSet'));
  });

  const codeInput = (
    <input
      id="totp-code"
      className="input code-input"
      inputMode={useRec ? 'text' : 'numeric'}
      autoComplete="one-time-code"
      maxLength={useRec ? 12 : 6}
      value={code}
      onChange={(e) => setCode(useRec ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, ''))}
      aria-label={useRec ? t('recoveryCode') : t('totpPrompt')}
      placeholder={useRec ? 'XXXX-XXXX' : '000000'}
      autoFocus
    />
  );

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="adm-logo" aria-hidden="true">道</div>

        {step === 'login' && (
          <form onSubmit={doLogin}>
            <h1>{t('loginTitle')}</h1>
            <p className="sub">{t('loginSub')}</p>
            {info && <div className="alert alert-ok">{info}</div>}
            <div className="field"><label htmlFor="login-email">{t('email')}</label>
              <input id="login-email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></div>
            <div className="field"><label htmlFor="login-password">{t('password')}</label>
              <input id="login-password" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {err && <ErrorBox error={err} />}
            <button id="login-submit" type="submit" className="btn btn-primary btn-block" disabled={busy || !email || !password}>{busy ? <span className="spinner" /> : t('signIn')}</button>
            <div className="login-links"><button type="button" className="link-btn" onClick={() => go('forgot')}>{t('forgot')}</button></div>
          </form>
        )}

        {step === 'forgot' && (
          <form onSubmit={codeSent ? doReset : doSendCode}>
            <h1>{t('forgot')}</h1>
            <p className="sub">{t('loginSub')}</p>
            {info && <div className="alert alert-ok">{info}</div>}
            <div className="field"><label htmlFor="reset-email">{t('email')}</label>
              <input id="reset-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={codeSent} /></div>
            {codeSent && (
              <>
                <div className="field"><label htmlFor="reset-code">{t('emailCode')}</label>
                  <input id="reset-code" className="input code-input" inputMode="numeric" maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))} required /></div>
                <div className="field"><label htmlFor="reset-pass">{t('newPassword')}</label>
                  <input id="reset-pass" className="input" type="password" autoComplete="new-password" minLength={10} value={newPass} onChange={(e) => setNewPass(e.target.value)} required /></div>
              </>
            )}
            {err && <ErrorBox error={err} />}
            <button type="submit" className="btn btn-primary btn-block" disabled={busy || !email || (codeSent && (resetCode.length !== 6 || newPass.length < 10))}>
              {busy ? <span className="spinner" /> : codeSent ? t('setPassword') : t('sendCode')}
            </button>
            <div className="login-links"><button type="button" className="link-btn" onClick={() => { setCodeSent(false); go('login'); }}>{t('backToLogin')}</button></div>
          </form>
        )}

        {step === 'enroll' && (
          <form onSubmit={doEnroll}>
            <h1>{t('enrollTitle')}</h1>
            <p className="sub">1. {t('enrollStep1')}</p>
            {enroll ? (
              <>
                <div className="qr-box"><img src={enroll.qr} width="184" height="184" alt="TOTP QR" /></div>
                <p className="small muted" style={{ textAlign: 'center', margin: '0 0 6px' }}>{t('enrollManual')}</p>
                <div className="secret" data-testid="totp-secret">{enroll.secret.replace(/(.{4})/g, '$1 ').trim()}</div>
              </>
            ) : <div className="center"><span className="spinner" /></div>}
            <p className="sub mt">2. {t('enrollStep2')}</p>
            {codeInput}
            {err && <div className="mt"><ErrorBox error={err} /></div>}
            <button type="submit" className="btn btn-primary btn-block mt" disabled={busy || code.length !== 6}>{busy ? <span className="spinner" /> : t('verifyBtn')}</button>
          </form>
        )}

        {step === 'recovery' && recovery && (
          <div>
            <h1>{t('recoveryTitle')}</h1>
            <p className="sub">{t('recoverySub')}</p>
            <div className="codes" data-testid="recovery-codes">{recovery.map((c) => <code key={c}>{c}</code>)}</div>
            <div className="row">
              <button type="button" className="btn" onClick={() => { navigator.clipboard?.writeText(recovery.join('\n')); toast(t('copied')); }}>{t('copy')}</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={finishRecovery}>{t('savedContinue')}</button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={doVerify}>
            <h1>{t('verifyTitle')}</h1>
            <p className="sub">{useRec ? t('recoveryCode') : t('totpPrompt')}</p>
            {codeInput}
            {err && <div className="mt"><ErrorBox error={err} /></div>}
            <button type="submit" className="btn btn-primary btn-block mt" disabled={busy || (useRec ? code.replace(/[^A-Z0-9]/g, '').length < 8 : code.length !== 6)}>{busy ? <span className="spinner" /> : t('verifyBtn')}</button>
            <div className="login-links">
              <button type="button" className="link-btn" onClick={() => { setUseRec((v) => !v); setCode(''); }}>{useRec ? t('useTotp') : t('useRecovery')}</button>
              <button type="button" className="link-btn" onClick={() => go('login')}>{t('backToLogin')}</button>
            </div>
          </form>
        )}

        <div className="lang-switch">
          {LANGS.map(([k, l]) => <button key={k} type="button" className={`btn btn-sm ${lang === k ? '' : 'btn-ghost'}`} onClick={() => setLang(k)}>{l}</button>)}
        </div>
      </div>
    </main>
  );
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) }
}));

const writeFile = vi.fn(async () => ({ uri: 'file:///cache/Rirekisho_test.pdf' }));
const share = vi.fn(async () => ({}));
vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile: (...a) => writeFile(...a) },
  Directory: { Cache: 'CACHE' }
}));
vi.mock('@capacitor/share', () => ({ Share: { share: (...a) => share(...a) } }));

import { Capacitor } from '@capacitor/core';
import { safeResumeFilename, saveResumeBlob, isIOSDevice, isMobileDevice } from './resumeDownload';

const setUA = (ua, extra = {}) => {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
  Object.defineProperty(window.navigator, 'platform', { value: extra.platform || 'Win32', configurable: true });
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: extra.maxTouchPoints || 0, configurable: true });
};

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130';
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1';

describe('safeResumeFilename', () => {
  it('keeps latin, kana and kanji, collapses unsafe chars', () => {
    expect(safeResumeFilename('Alimov Anvar')).toBe('Rirekisho_Alimov_Anvar.pdf');
    expect(safeResumeFilename('山田 太郎')).toBe('Rirekisho_山田_太郎.pdf');
    expect(safeResumeFilename('アリモフ')).toBe('Rirekisho_アリモフ.pdf');
  });

  it('strips path traversal and reserved characters', () => {
    const name = safeResumeFilename('../../etc/pa:ss?wd*<>|"');
    expect(name).not.toMatch(/[/\\:?*<>|"]/);
    expect(name.startsWith('Rirekisho_')).toBe(true);
    expect(name.endsWith('.pdf')).toBe(true);
  });

  it('falls back when name is empty/undefined (previous crash)', () => {
    expect(safeResumeFilename(undefined)).toBe('Rirekisho_resume.pdf');
    expect(safeResumeFilename('')).toBe('Rirekisho_resume.pdf');
    expect(safeResumeFilename('***')).toBe('Rirekisho_resume.pdf');
  });

  it('limits length', () => {
    expect(safeResumeFilename('a'.repeat(200)).length).toBeLessThanOrEqual('Rirekisho_.pdf'.length + 60);
  });
});

describe('device detection', () => {
  it('detects iPhone and iPadOS desktop-mode', () => {
    expect(isIOSDevice({ userAgent: IPHONE_UA })).toBe(true);
    expect(isIOSDevice({ userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
    expect(isIOSDevice({ userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
    expect(isMobileDevice({ userAgent: 'Linux; Android 14' })).toBe(true);
  });
});

describe('saveResumeBlob', () => {
  let createURL; let revokeURL; let clickSpy;
  const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.useFakeTimers();
    createURL = vi.fn(() => 'blob:mock');
    revokeURL = vi.fn();
    globalThis.URL.createObjectURL = createURL;
    globalThis.URL.revokeObjectURL = revokeURL;
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    Capacitor.isNativePlatform.mockReturnValue(false);
    delete window.navigator.canShare;
    delete window.navigator.share;
    writeFile.mockClear(); share.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    clickSpy.mockRestore();
  });

  it('rejects non-blob input', async () => {
    await expect(saveResumeBlob(null, 'x.pdf')).rejects.toThrow(TypeError);
  });

  it('desktop: downloads via anchor and revokes the URL later', async () => {
    setUA(DESKTOP_UA);
    const res = await saveResumeBlob(blob, 'Rirekisho_A.pdf');
    expect(res).toBe('download');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull(); // anchor removed
    expect(revokeURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(revokeURL).toHaveBeenCalledWith('blob:mock');
  });

  it('mobile: uses Web Share with a File when supported', async () => {
    setUA(IPHONE_UA);
    window.navigator.canShare = vi.fn(() => true);
    window.navigator.share = vi.fn(async () => {});
    const res = await saveResumeBlob(blob, 'Rirekisho_A.pdf');
    expect(res).toBe('share');
    const arg = window.navigator.share.mock.calls[0][0];
    expect(arg.files[0].name).toBe('Rirekisho_A.pdf');
    expect(arg.files[0].type).toBe('application/pdf');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('mobile: user cancelling the share sheet is not an error and does not download', async () => {
    setUA(IPHONE_UA);
    window.navigator.canShare = vi.fn(() => true);
    window.navigator.share = vi.fn(async () => { const e = new Error('x'); e.name = 'AbortError'; throw e; });
    expect(await saveResumeBlob(blob, 'a.pdf')).toBe('cancelled');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('mobile: falls back to download when share is not allowed (expired gesture)', async () => {
    setUA(IPHONE_UA);
    window.navigator.canShare = vi.fn(() => true);
    window.navigator.share = vi.fn(async () => { const e = new Error('x'); e.name = 'NotAllowedError'; throw e; });
    expect(await saveResumeBlob(blob, 'a.pdf')).toBe('download');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('native app: writes to cache and opens the native share sheet', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    vi.useRealTimers(); // FileReader is async
    const res = await saveResumeBlob(blob, 'Rirekisho_A.pdf');
    expect(res).toBe('native');
    expect(writeFile).toHaveBeenCalledWith(expect.objectContaining({ path: 'Rirekisho_A.pdf', directory: 'CACHE' }));
    expect(typeof writeFile.mock.calls[0][0].data).toBe('string');
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///cache/Rirekisho_test.pdf' }));
    expect(clickSpy).not.toHaveBeenCalled();
  });
});

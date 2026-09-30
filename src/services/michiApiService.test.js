import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  sendMichiChatMessage, 
  sanitizeMichiResponse, 
  MICHI_API_CHAT_ENDPOINT 
} from './michiApiService';

describe('michiApiService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sanitizeMichiResponse', () => {
    it('removes <think> tags and JSON reasoning artifacts', () => {
      const raw = '<think>Internal reasoning step</think>こんにちは！何かお手伝いできますか？';
      expect(sanitizeMichiResponse(raw)).toBe('こんにちは！何かお手伝いできますか？');
    });

    it('returns empty string for null or non-string input', () => {
      expect(sanitizeMichiResponse(null)).toBe('');
      expect(sanitizeMichiResponse(undefined)).toBe('');
    });
  });

  describe('sendMichiChatMessage', () => {
    it('sends correct POST request to gateway and parses reply payload', async () => {
      const mockReply = '東京の今日の天気は晴れです。';
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ reply: mockReply })
      });

      const onChunk = vi.fn();
      const result = await sendMichiChatMessage('東京の天気は？', onChunk);

      expect(globalThis.fetch).toHaveBeenCalledWith(MICHI_API_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: '東京の天気は？' })
      });

      expect(result).toBe(mockReply);
      expect(onChunk).toHaveBeenCalledWith(mockReply);
    });

    it('handles HTTP 429 Rate Limit Exceeded with user-friendly Japanese error', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(sendMichiChatMessage('テストメッセージ')).rejects.toThrow(
        'リクエスト制限を超えました。1分後に再度お試しください。'
      );
    });

    it('handles HTTP 500 Server Error gracefully', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(sendMichiChatMessage('テストメッセージ')).rejects.toThrow(
        'サーバーでエラーが発生しました。しばらく時間をおいて再度お試しください。'
      );
    });

    it('handles network failure (TypeError fetch failure) gracefully', async () => {
      const networkError = new TypeError('Failed to fetch');
      globalThis.fetch.mockRejectedValueOnce(networkError);

      await expect(sendMichiChatMessage('テストメッセージ')).rejects.toThrow(
        'ネットワーク接続エラーが発生しました。インターネット接続をご確認ください。'
      );
    });

    it('throws validation error when message is empty or whitespace', async () => {
      await expect(sendMichiChatMessage('')).rejects.toThrow('メッセージを入力してください。');
      await expect(sendMichiChatMessage('   ')).rejects.toThrow('メッセージを入力してください。');
    });
  });
});

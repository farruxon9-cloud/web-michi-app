/**
 * 🤖 Michi AI — Custom Gateway API Integration Service
 * 
 * Endpoint: https://api.michi.jp.net/api/chat
 * Method: POST
 * Headers: { "Content-Type": "application/json" }
 * Request Body: { "message": userMessageText }
 * Response Body: { "reply": "AI response text" }
 */

export const MICHI_API_CHAT_ENDPOINT = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/api/chat'
  : 'https://api.michi.jp.net/api/chat';

/**
 * Universal Response Sanitizer
 * Removes JSON reasoning remnants, thought tags, and markdown metadata fluff
 */
export function sanitizeMichiResponse(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text;

  // 1. JSON reasoning / role leaks
  if (clean.includes('"reasoning":') || clean.includes('role":"assistant"')) {
    const contentMatch = clean.match(/"content"\s*:\s*"([^"]+)"/);
    if (contentMatch && contentMatch[1]) {
      clean = contentMatch[1];
    } else {
      clean = clean.replace(/role":"assistant"[\s\S]*?"reasoning":\s*"[\s\S]*?"/gi, '');
      clean = clean.replace(/\{?[\s\S]*?"reasoning":[\s\S]*?\}/gi, '');
    }
  }

  // 2. Remove <think> tags (both closed and open)
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');
  clean = clean.replace(/<think>[\s\S]*$/gi, '');

  // 3. Remove metadata / search footnotes
  clean = clean.replace(/---\s*\n\s*\*\*【確認済み参照ソース】[\s\S]*$/gi, '');
  clean = clean.replace(/\*\*【確認済み参照ソース】[\s\S]*$/gi, '');

  // 4. Clean residual leading/trailing JSON chars
  clean = clean.replace(/^[,":\s{}]+/, '').replace(/[,":\s{}]+$/, '').trim();
  return clean;
}

/**
 * Sends a chat message to custom Gateway API (https://api.michi.jp.net/api/chat)
 * 
 * @param {string} userMessageText User query text
 * @param {Function} [onChunkUpdate] Optional callback for live UI state update
 * @returns {Promise<string>} AI reply text
 */
export async function sendMichiChatMessage(userMessageText, onChunkUpdate = null) {
  if (!userMessageText || typeof userMessageText !== 'string' || !userMessageText.trim()) {
    throw new Error('メッセージを入力してください。');
  }

  const cleanInput = userMessageText.trim();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response;
    try {
      response = await fetch(MICHI_API_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: cleanInput }),
        signal: controller.signal
      });
      clearTimeout(timer);
    } catch (fetchErr) {
      clearTimeout(timer);
      if (fetchErr.name === 'AbortError') {
        throw new Error('応答時間がタイムアウトしました (15秒)。ネットワーク接続をご確認ください。');
      }
      throw fetchErr;
    }

    // Handle HTTP 429: Rate Limit Exceeded
    if (response.status === 429) {
      throw new Error('リクエスト制限を超えました。1分後に再度お試しください。');
    }

    // Handle HTTP 500 or other non-200 responses
    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error('サーバーでエラーが発生しました。しばらく時間をおいて再度お試しください。');
      }
      const errorPayload = await response.json().catch(() => null);
      const errorMessage = errorPayload?.error || errorPayload?.message || response.statusText;
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const rawReply = data?.reply || data?.response || data?.message || data?.text || '';

    if (!rawReply) {
      throw new Error('サーバーからの応答メッセージが空です。');
    }

    const cleanReply = sanitizeMichiResponse(rawReply);

    if (typeof onChunkUpdate === 'function') {
      onChunkUpdate(cleanReply);
    }

    return cleanReply;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('ネットワーク接続エラーが発生しました。インターネット接続をご確認ください。');
    }
    throw error;
  }
}

/**
 * Legacy alias for backwards compatibility across existing components
 */
export async function askMichiCore(userMessageText, onChunkUpdate = null) {
  return sendMichiChatMessage(userMessageText, onChunkUpdate);
}

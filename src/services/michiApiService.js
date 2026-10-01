/**
 * 🤖 Michi AI — Custom Gateway API Integration Service
 * 
 * Endpoint: https://api.michi.jp.net/api/chat
 * Method: POST
 * Headers: { "Content-Type": "application/json" }
 * Request Body: { "message": userMessageText }
 * Response Body: { "reply": "AI response text" }
 */

export const MICHI_API_CHAT_ENDPOINT = 'https://api.michi.jp.net/api/chat';

/**
 * Universal Response Sanitizer
 * Removes JSON reasoning remnants, thought tags, and markdown metadata fluff
 */
export function sanitizeMichiResponse(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text;

  // 1. JSON reasoning / role leaks (Xavfsiz JSON parse orqali qirqib tashlamasdan olish)
  if (clean.includes('"reasoning":') || clean.includes('role":"assistant"')) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed.content) clean = parsed.content;
      else if (parsed.reply) clean = parsed.reply;
    } catch {
      // Regex faqat JSON parsing o'xshamaganda ishlaydi (qo'shtirnoqlarni saqlab qoladi)
      clean = clean.replace(/role"\s*:\s*"assistant"[\s\S]*?"reasoning"\s*:\s*"[\s\S]*?"/gi, '');
      clean = clean.replace(/\{?\s*"reasoning"\s*:[\s\S]*?\}/gi, '');
    }
  }

  // 2. Remove <think> tags (both closed and open streaming tags)
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');
  clean = clean.replace(/<think>[\s\S]*$/gi, '');

  // 3. Remove metadata / search footnotes
  clean = clean.replace(/---\s*\n\s*\*\*【確認済み参照ソース】[\s\S]*$/gi, '');
  clean = clean.replace(/\*\*【確認済み参照ソース】[\s\S]*$/gi, '');
  clean = clean.replace(/【確認済み参照ソース】[\s\S]*$/gi, '');

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
  let cleanInput = '';
  let chunkCallback = onChunkUpdate;

  if (userMessageText && typeof userMessageText === 'object') {
    cleanInput = (userMessageText.message || userMessageText.text || userMessageText.query || '').trim();
    if (typeof userMessageText.onChunkUpdate === 'function') {
      chunkCallback = userMessageText.onChunkUpdate;
    }
  } else if (typeof userMessageText === 'string') {
    cleanInput = userMessageText.trim();
  }

  if (!cleanInput) {
    throw new Error('メッセージを入力してください。');
  }

  const controller = new AbortController();
  // 72B model va Search oqimlari hisobga olinib, timeout 25s ga kengaytirildi
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
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
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        throw new Error('応答時間がタイムアウトしました (25秒)。ネットワーク接続をご確認ください。');
      }
      throw fetchErr;
    }

    // Handle HTTP 429: Rate Limit Exceeded (Server limit: 20 req/min per IP)
    if (response.status === 429) {
      const userLang = (typeof localStorage !== 'undefined' && (localStorage.getItem('michi_speech_lang') || localStorage.getItem('i18nextLng'))) || 'ja';
      const isUz = userLang.toLowerCase().startsWith('uz');
      const rateLimitMsg = isUz
        ? "So'rovlar chegarasi oshib ketdi. Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring."
        : "リクエスト制限を超えました。1分後に再度お試しください。";
      throw new Error(rateLimitMsg);
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

    if (typeof chunkCallback === 'function') {
      chunkCallback(cleanReply);
    }

    return cleanReply;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('ネットワーク接続エラーが発生しました。インターネット接続をご確認ください。');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Legacy alias for backwards compatibility across existing components
 */
export async function askMichiCore(userMessageText, onChunkUpdate = null) {
  return sendMichiChatMessage(userMessageText, onChunkUpdate);
}

/**
 * Service object export for components importing { michiApiService }
 */
export const michiApiService = {
  sendChatMessage: sendMichiChatMessage,
  askCore: askMichiCore,
  sanitize: sanitizeMichiResponse
};

export default michiApiService;


/**
 * 🤖 Michi AI — Multi-Provider Cascading AI Mesh Engine
 *
 * Tier 0: Mahalliy kesh (0ms hit)
 * Tier 1: Asosiy VPS AI Gateway (api.michi.jp.net/api/chat)
 *
 * Privacy: the browser never sends the user's text to third-party AI/proxy services
 * (the former Pollinations and allorigins fallbacks were removed). Web search and all
 * provider fallbacks run on the gateway, behind PII masking and rate limits.
 */

import { michiCacheEngine } from './michiCacheEngine.js';

class MultiAiMeshEngine {
  constructor() {
    // VPS API Shlyuz manzili (Cloudflare Pages env o'zgaruvchisidan yoki standart)
    this.apiGatewayUrl = import.meta.env.VITE_API_URL || 'https://api.michi.jp.net';
  }

  /**
   * Kaskadli AI so'rovlarini qayta ishlash
   * @param {string} prompt 
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ text: string, provider: string }>}
   */
  async processCascadingQuery(prompt, lang = 'ja', signal = null) {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    console.log(`[MultiAiMesh] ⚡ So'rov yuborilmoqda: "${prompt}" [${cleanLang}]`);

    // Tier 0: Mahalliy kesh (0ms)
    const cachedHit = michiCacheEngine.get(prompt, cleanLang);
    if (cachedHit) {
      return cachedHit;
    }

    // Tier 1: Asosiy VPS Gateway orqali so'rov (Xavfsiz va to'liq AI javoblari)
    try {
      console.log(`[MultiAiMesh] 🚀 Tier 1: VPS Shlyuzga ulanilmoqda (${this.apiGatewayUrl})...`);
      const gatewayRes = await this.fetchBackendGateway(prompt, cleanLang, signal);
      if (gatewayRes) {
        console.log('[MultiAiMesh] ✅ Tier 1 (VPS Gateway) muvaffaqiyatli javob berdi!');
        michiCacheEngine.set(prompt, gatewayRes, cleanLang);
        return { text: gatewayRes, provider: 'Michi AI Cloud' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 1 VPS Gateway xatosi:', e.message);
    }

    // Yakuniy holat: Aloqa uzilganligi haqida xabar
    const errorMessages = {
      ja: "サーバーとの通信が一時的に途絶えました。もう一度お試しください。",
      uz: "Server bilan aloqa vaqtincha uzildi. Iltimos, qaytadan urinib ko'ring.",
      en: "Connection to server was temporarily interrupted. Please try again."
    };

    return { 
      text: errorMessages[cleanLang] || errorMessages.ja, 
      provider: 'Michi Local Engine' 
    };
  }

  /**
   * VPS Gateway (/api/chat) orqali so'rov yuborish
   */
  async fetchBackendGateway(prompt, lang, customSignal) {
    const endpoint = `${this.apiGatewayUrl.replace(/\/+$/, '')}/api/chat`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const activeSignal = customSignal 
      ? (AbortSignal.any ? AbortSignal.any([customSignal, controller.signal]) : controller.signal)
      : controller.signal;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          prompt: prompt,
          lang: lang
        }),
        signal: activeSignal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP xatosi: ${res.status}`);
      }

      const data = await res.json();
      // Backend qaytarishi mumkin bo'lgan har xil maydon formatlarini tekshiramiz
      const reply = data.reply || data.text || data.response || data.choices?.[0]?.message?.content;
      return reply ? reply.trim() : null;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}

export const multiAiMeshEngine = new MultiAiMeshEngine();

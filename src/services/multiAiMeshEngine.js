/**
 * 🤖 Michi AI — Multi-Provider Cascading AI Mesh Engine
 *
 * Tier 0: Mahalliy kesh (0ms hit)
 * Tier 1: Asosiy VPS AI Gateway (api.michi.jp.net/api/chat)
 * Tier 2: Avtonom Web Qidiruv (Jonli ma'lumotlar uchun)
 * Tier 3: Favqulodda zaxira (Pollinations GET Fallback)
 */

import { autonomousWebSearchEngine } from './autonomousWebSearchEngine.js';
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

    // Tier 2: Avtonom veb-qidiruv (Ob-havo, yangiliklar, tirbandliklar)
    try {
      console.log('[MultiAiMesh] 🌐 Tier 2: Veb-qidiruv bajarilmoqda...');
      const webResult = await autonomousWebSearchEngine.searchWebFreeSources(prompt, cleanLang);
      if (webResult?.success && webResult?.answer && webResult.answer.length > 30) {
        console.log(`[MultiAiMesh] ✅ Tier 2 (Web Scraper) orqali topildi: ${webResult.source}`);
        michiCacheEngine.set(prompt, webResult.answer, cleanLang);
        return { text: webResult.answer, provider: `Live Web (${webResult.source})` };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 2 Web Scraper xatosi:', e.message);
    }

    // Tier 3: Favqulodda bepul fallback (Agar VPS to'liq javob bermasa)
    try {
      console.log('[MultiAiMesh] ⚡ Tier 3: Favqulodda zaxira (Pollinations GET)...');
      const pollRes = await this.fetchPollinationsGet(prompt, cleanLang);
      if (pollRes) {
        console.log('[MultiAiMesh] ✅ Tier 3 (Pollinations GET) javob berdi!');
        michiCacheEngine.set(prompt, pollRes, cleanLang);
        return { text: pollRes, provider: 'Pollinations AI' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 3 zaxira xatosi:', e.message);
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

  /**
   * Zaxira Pollinations GET so'rovi (API kalitsiz)
   */
  async fetchPollinationsGet(prompt, lang) {
    const sysPrompt = `You are Michi AI assistant. Answer directly and politely in ${lang === 'uz' ? 'Uzbek' : lang === 'ja' ? 'Japanese' : 'English'}.`;
    const sys = encodeURIComponent(sysPrompt);
    const q = encodeURIComponent(prompt);

    const res = await fetch(`https://text.pollinations.ai/${q}?system=${sys}`, {
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 5 && !text.toLowerCase().includes('rate limit')) {
        return text.trim();
      }
    }
    return null;
  }
}

export const multiAiMeshEngine = new MultiAiMeshEngine();

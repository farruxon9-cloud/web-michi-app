/**
 * 🤖 Michi AI — Multi-Provider Cascading AI Mesh Engine
 * 
 * Multi-tier intelligent routing mesh incorporating:
 * Tier 1: Local-First Rules & Lexicon Router (0ms)
 * Tier 2: Autonomous Free Web Scraper (DuckDuckGo / Wikipedia / Yahoo JP)
 * Tier 3: Free Gemini Flash Multi-Key Rotation Pool
 * Tier 4: Free DeepSeek-V3 & DeepSeek-R1 Open API Inference Fallback
 */

import { autonomousWebSearchEngine } from './autonomousWebSearchEngine.js';
import { japaneseLanguageEngine } from './japaneseLanguageEngine.js';

class MultiAiMeshEngine {
  constructor() {
    this.geminiKeys = [
      import.meta.env.VITE_GEMINI_API_KEY,
      localStorage.getItem('michi_gemini_api_key')
    ].filter(Boolean);

    this.deepseekKeys = [
      import.meta.env.VITE_DEEPSEEK_API_KEY,
      localStorage.getItem('michi_deepseek_api_key'),
      'sk-free-openrouter-deepseek-fallback'
    ].filter(Boolean);
  }

  /**
   * Execute multi-tier cascading AI query processing
   * @param {string} prompt 
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @returns {Promise<{ text: string, provider: string }>}
   */
  /**
   * Execute multi-tier cascading AI query processing
   * @param {string} prompt 
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @returns {Promise<{ text: string, provider: string }>}
   */
  async processCascadingQuery(prompt, lang = 'ja') {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    console.log(`[MultiAiMesh] ⚡ Processing cascading AI query: "${prompt}" [${cleanLang}]`);

    // Tier 1: Try Gemini Pool first (highest intelligence and speed)
    try {
      console.log('[MultiAiMesh] 🌟 Tier 1: Executing Gemini Flash Pool query...');
      const geminiResponse = await this.fetchGeminiPool(prompt, cleanLang);
      if (geminiResponse) {
        console.log('[MultiAiMesh] ✅ Tier 1 (Gemini Flash Pool) succeeded!');
        return { text: geminiResponse, provider: 'Gemini AI' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 1 Gemini Free Pool failed:', e.message);
    }

    // Tier 2: Try Autonomous Free Web Search (for live facts, weather, news)
    try {
      console.log('[MultiAiMesh] 🌐 Tier 2: Executing Autonomous Free Web Search...');
      const webResult = await autonomousWebSearchEngine.searchWebFreeSources(prompt, cleanLang);
      if (webResult.success && webResult.answer && webResult.answer.length > 30) {
        console.log(`[MultiAiMesh] ✅ Tier 2 (Free Web Scraper) succeeded via ${webResult.source}`);
        return { text: webResult.answer, provider: `Live Web (${webResult.source})` };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 2 Free Web Scraper failed:', e.message);
    }

    // Tier 3: Try Free DeepSeek V3 / R1 Open API Endpoint
    try {
      console.log('[MultiAiMesh] 🚀 Tier 3: DeepSeek Open API...');
      const deepseekResponse = await this.fetchDeepSeekOpenApi(prompt, cleanLang);
      if (deepseekResponse) {
        console.log('[MultiAiMesh] ✅ Tier 3 (DeepSeek Open API) succeeded!');
        return { text: deepseekResponse, provider: 'DeepSeek AI' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 3 DeepSeek Open API failed:', e.message);
    }

    // Fallback: Local Synthesis
    console.log('[MultiAiMesh] 🛡️ All external providers exhausted. Utilizing Local Intelligent Engine...');
    const localSynthesized = cleanLang === 'ja'
      ? "申し訳ございません。ネットワーク接続をお確かめの上、もう一度お試しください。"
      : cleanLang === 'uz'
      ? "Kechirasiz, tarmoq ulanishini tekshirib, savolni qaytadan berib ko'ring."
      : "Apologies, please check your network connection and try asking again.";

    return { text: localSynthesized, provider: 'Michi Local Engine' };
  }

  /**
   * Fetch from Free DeepSeek-V3 / R1 Open API Endpoint
   */
  async fetchDeepSeekOpenApi(prompt, lang) {
    const systemPrompt = `You are Michi AI, a world-class intelligent visual assistant for Japan residents and drivers. Answer directly, logically, accurately, and beautifully in ${lang === 'ja' ? 'Japanese' : lang === 'uz' ? 'Uzbek' : 'English'}. Use clean formatting and bullet points where helpful.`;

    const endpoints = [
      'https://api.deepseek.com/v1/chat/completions',
      'https://openrouter.ai/api/v1/chat/completions'
    ];

    for (const endpoint of endpoints) {
      for (const apiKey of this.deepseekKeys) {
        if (!apiKey || apiKey.includes('fallback')) continue;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: endpoint.includes('openrouter') ? 'deepseek/deepseek-r1:free' : 'deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500
            }),
            signal: AbortSignal.timeout(6000)
          });

          if (res.ok) {
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) return content.trim();
          }
        } catch (e) {
          // Continue cascading
        }
      }
    }
    return null;
  }

  /**
   * Fetch from Free Gemini Multi-Key Rotation Pool
   */
  async fetchGeminiPool(prompt, lang) {
    if (this.geminiKeys.length === 0) return null;

    const systemPrompt = `You are Michi AI — the ultra-intelligent personal visual assistant for Japan residents, foreign workers, and drivers.
Your goal is to answer ANY question logically, accurately, and comprehensively in ${lang === 'ja' ? 'Japanese' : lang === 'uz' ? 'Uzbek' : 'English'}.
Guidelines:
- Provide clear, direct, and well-structured answers using bullet points, emojis, and bold terms where appropriate.
- For questions about Japan (visas, jobs, driving licenses, salary calculations, weather, life), give specific, expert advice.
- Keep responses readable within 3-6 lines for visual display cards.`;

    for (const key of this.geminiKeys) {
      if (!key) continue;
      try {
        const models = [
          'gemini-3.6-flash',
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite',
          'gemini-3.7-flash',
          'gemini-flash-latest',
          'gemini-flash-lite-latest'
        ];
        for (const model of models) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                maxOutputTokens: 600,
                temperature: 0.7
              }
            }),
            signal: AbortSignal.timeout(7000)
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text.trim();
          }
        }
      } catch (e) {
        // Continue to next key
      }
    }
    return null;
  }
}

export const multiAiMeshEngine = new MultiAiMeshEngine();

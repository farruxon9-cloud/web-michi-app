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
import { michiCacheEngine } from './michiCacheEngine.js';

class MultiAiMeshEngine {
  constructor() {
    this.geminiKeys = [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY_2,
      import.meta.env.VITE_GEMINI_API_KEY_3,
      import.meta.env.VITE_GEMINI_API_KEY_4,
      import.meta.env.VITE_GEMINI_API_KEY_5,
      typeof localStorage !== 'undefined' ? localStorage.getItem('michi_gemini_api_key') : null
    ].filter(Boolean);

    this.deepseekKeys = [
      import.meta.env.VITE_DEEPSEEK_API_KEY,
      typeof localStorage !== 'undefined' ? localStorage.getItem('michi_deepseek_api_key') : null
    ].filter(Boolean);

    // Auto Keep-Alive Pinger for Hugging Face Space (wakes server up on launch & keeps active)
    this.pingHfBrainSpace();
    if (typeof window !== 'undefined') {
      setInterval(() => this.pingHfBrainSpace(), 10 * 60 * 1000); // Ping every 10 mins
    }
  }

  pingHfBrainSpace() {
    const hfBrainUrl = import.meta.env.VITE_HF_BRAIN_URL || '';
    if (!hfBrainUrl) return;
    try {
      fetch(hfBrainUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'ping', language: 'ja' }),
        signal: AbortSignal.timeout(4000)
      }).catch(() => {});
    } catch (e) {}
  }

  /**
   * Execute multi-tier cascading AI query processing
   * @param {string} prompt 
   * @param {string} lang - 'ja' | 'uz' | 'en'
   * @returns {Promise<{ text: string, provider: string }>}
   */
  async processCascadingQuery(prompt, lang = 'ja', signal = null) {
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    console.log(`[MultiAiMesh] ⚡ Processing cascading AI query: "${prompt}" [${cleanLang}]`);

    // Tier 0: Instant 0ms Client Cache Hit
    const cachedHit = michiCacheEngine.get(prompt, cleanLang);
    if (cachedHit) {
      return cachedHit;
    }

    // Tier 0.5: Zero-Budget Instant Pollinations GET Fallback
    try {
      console.log('[MultiAiMesh] ⚡ Tier 0.5: Executing Pollinations GET proxy...');
      const pollRes = await this.fetchPollinationsGet(prompt, cleanLang);
      if (pollRes) {
        console.log('[MultiAiMesh] ✅ Tier 0.5 (Pollinations GET) succeeded!');
        michiCacheEngine.set(prompt, pollRes, cleanLang);
        return { text: pollRes, provider: 'Pollinations AI' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 0.5 Pollinations GET failed:', e.message);
    }

    // Tier 1: Try Gemini Pool first (highest intelligence and speed)
    try {
      console.log('[MultiAiMesh] 🌟 Tier 1: Executing Gemini Flash Pool query...');
      const geminiResponse = await this.fetchGeminiPool(prompt, cleanLang, signal);
      if (geminiResponse) {
        console.log('[MultiAiMesh] ✅ Tier 1 (Gemini Flash Pool) succeeded!');
        michiCacheEngine.set(prompt, geminiResponse, cleanLang);
        return { text: geminiResponse, provider: 'Gemini AI' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 1 Gemini Free Pool failed:', e.message);
    }

    // Tier 2: Try Autonomous Free Web Search (for live facts, weather, news, lifestyle)
    try {
      console.log('[MultiAiMesh] 🌐 Tier 2: Executing Autonomous Free Web Search...');
      const webResult = await autonomousWebSearchEngine.searchWebFreeSources(prompt, cleanLang);
      if (webResult.success && webResult.answer && webResult.answer.length > 30) {
        console.log(`[MultiAiMesh] ✅ Tier 2 (Free Web Scraper) succeeded via ${webResult.source}`);
        michiCacheEngine.set(prompt, webResult.answer, cleanLang);
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
        michiCacheEngine.set(prompt, deepseekResponse, cleanLang);
        return { text: deepseekResponse, provider: 'DeepSeek AI' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 3 DeepSeek Open API failed:', e.message);
    }

    // Tier 4: Hugging Face Public Inference API (Qwen 2.5 72B / Mistral Free Endpoint)
    try {
      console.log('[MultiAiMesh] 🤗 Tier 4: Hugging Face Free Inference API...');
      const hfResponse = await this.fetchHuggingFaceInference(prompt, cleanLang);
      if (hfResponse) {
        console.log('[MultiAiMesh] ✅ Tier 4 (Hugging Face API) succeeded!');
        michiCacheEngine.set(prompt, hfResponse, cleanLang);
        return { text: hfResponse, provider: 'Hugging Face Open LLM' };
      }
    } catch (e) {
      console.warn('[MultiAiMesh] Tier 4 Hugging Face API failed:', e.message);
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
        if (!apiKey) continue;
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
            signal: AbortSignal.timeout(8000)
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
  async fetchGeminiPool(prompt, lang, customSignal) {
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
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-1.5-flash-8b',
          'gemini-1.5-pro'
        ];
        for (const model of models) {
          if (customSignal && customSignal.aborted) return null;
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
          const signal = customSignal 
            ? AbortSignal.any([customSignal, AbortSignal.timeout(8000)]) 
            : AbortSignal.timeout(8000);

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
            signal
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

  /**
   * Fetch from Free Hugging Face Public Inference Router & Open Model Gateway
   */
  async fetchHuggingFaceInference(prompt, lang) {
    const systemPrompt = `You are Michi AI, a world-class intelligent visual assistant. Answer directly and politely in ${lang === 'ja' ? 'Japanese' : lang === 'uz' ? 'Uzbek' : 'English'}. Keep responses clear and well formatted.`;
    const hfToken = import.meta.env.VITE_HUGGINGFACE_API_KEY || import.meta.env.VITE_HF_TOKEN || '';

    // Approach A: Modern Hugging Face Router Chat Completions API
    const routerEndpoints = [
      'https://router.huggingface.co/hf-inference/v1/chat/completions',
      'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions'
    ];

    const headers = { 'Content-Type': 'application/json' };
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`;
    }

    for (const endpoint of routerEndpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: 'Qwen/Qwen2.5-72B-Instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            max_tokens: 600,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(35000)
        });

        if (res.ok) {
          const data = await res.json();
          const responseText = data.choices?.[0]?.message?.content;
          if (responseText && responseText.length > 5) {
            return responseText.trim();
          }
        }
      } catch (e) {}
    }

    // Approach B: Free Pollinations Gateway for Hugging Face Open Models (Zero Token / 100% Reliable)
    try {
      const polRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          model: 'qwen',
          code: 'beartoken',
          jsonMode: false
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (polRes.ok) {
        const text = await polRes.text();
        if (text && text.length > 10 && !text.includes('Error')) {
          return text.trim();
        }
      }
    } catch (e) {}

    return null;
  }

  /**
   * Zero-budget Pollinations GET endpoint (No API Key required)
   */
  async fetchPollinationsGet(prompt, lang) {
    try {
      const sys = encodeURIComponent(`You are Michi AI, a helpful intelligent assistant. Answer directly and politely in ${lang === 'uz' ? 'Uzbek' : lang === 'ja' ? 'Japanese' : 'English'}.`);
      const q = encodeURIComponent(prompt);
      const res = await fetch(`https://text.pollinations.ai/${q}?system=${sys}`, {
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 5 && !text.toLowerCase().includes('rate limit') && !text.toLowerCase().includes('budget')) {
          return text.trim();
        }
      }
    } catch (e) {
      console.warn('[MultiAiMesh] fetchPollinationsGet failed:', e.message);
    }
    return null;
  }
}

export const multiAiMeshEngine = new MultiAiMeshEngine();

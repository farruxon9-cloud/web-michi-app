import { Client } from "@gradio/client";

// Javobni axlatlardan (JSON reasoning, xitoycha linklar, think teglari) tozalovchi universal filtr
export function sanitizeMichiResponse(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text;

  // 1. JSON reasoning yoki role sizib chiqqan bo'lsa
  if (clean.includes('"reasoning":') || clean.includes('role":"assistant"')) {
    const contentMatch = clean.match(/"content"\s*:\s*"([^"]+)"/);
    if (contentMatch && contentMatch[1]) {
      clean = contentMatch[1];
    } else {
      clean = clean.replace(/role":"assistant"[\s\S]*?"reasoning":\s*"[\s\S]*?"/gi, '');
      clean = clean.replace(/\{?[\s\S]*?"reasoning":[\s\S]*?\}/gi, '');
    }
  }

  // 2. <think> teglarini tozalash (yopilgan va ochiq qolgan teglarni ham)
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');
  clean = clean.replace(/<think>[\s\S]*$/gi, '');

  // 3. Ortiqcha xitoycha havolalar va qidiruv izohlarini kesish
  clean = clean.replace(/---\s*\n\s*\*\*【確認済み参照ソース】[\s\S]*$/gi, '');
  clean = clean.replace(/\*\*【確認済み参照ソース】[\s\S]*$/gi, '');

  // 4. Qoldiq simvollarni tozalash
  clean = clean.replace(/^[,":\s{}]+/, '').replace(/[,":\s{}]+$/, '').trim();
  return clean;
}

// Single attempt fetch helper with explicit 45s timeout
async function executeMichiAttempt(userMessage, onChunkUpdate = null) {
  const TIMEOUT_MS = 45000; // Qwen-2.5-72B tahliliy javoblari va qidiruv uchun 45 soniya qat'iy taymaut

  const fetchPromise = (async () => {
    let client;
    let finalResultText = '';
    try {
      client = await Client.connect("https://farruxkanoatov-michiai.hf.space");
    } catch (connErr) {
      console.warn("[Michi Core] Direct URL connect failed, falling back to Space name:", connErr);
      client = await Client.connect("FarruxKanoatov/michiai");
    }

    // 1-ustuvorlik: Gradio named endpoint /stream_michi_core (FarruxKanoatov/michiai rasmiy aksiyasi)
    try {
      const app = await client.submit("/stream_michi_core", { message: userMessage });
      for await (const msg of app) {
        if (msg && msg.data) {
          const chunkText = Array.isArray(msg.data) ? msg.data[0] : msg.data;
          const cleanChunk = sanitizeMichiResponse(chunkText);
          if (cleanChunk) {
            finalResultText = cleanChunk;
            if (typeof onChunkUpdate === 'function') {
              onChunkUpdate(cleanChunk);
            }
          }
        }
      }
      const cleanResult = sanitizeMichiResponse(finalResultText);
      if (cleanResult) return cleanResult;
    } catch (stErr) {
      console.warn("[Michi Core] /stream_michi_core submit failed, trying positional array fallback:", stErr?.message || stErr);
    }

    // 2-ustuvorlik: Gradio /stream_michi_core positional array fallback [message, history]
    try {
      const app = await client.submit("/stream_michi_core", [userMessage, []]);
      for await (const msg of app) {
        if (msg && msg.data) {
          const chunkText = Array.isArray(msg.data) ? msg.data[0] : msg.data;
          const cleanChunk = sanitizeMichiResponse(chunkText);
          if (cleanChunk) {
            finalResultText = cleanChunk;
            if (typeof onChunkUpdate === 'function') {
              onChunkUpdate(cleanChunk);
            }
          }
        }
      }
      const cleanResult = sanitizeMichiResponse(finalResultText);
      if (cleanResult) return cleanResult;
    } catch (posErr) {
      console.warn("[Michi Core] Positional submit failed, trying index 0 fallback:", posErr?.message || posErr);
    }

    // 3-ustuvorlik: Gradio index 0 submit (positional array: [prompt, language])
    try {
      const app = await client.submit(0, [userMessage, "ja"]);
      for await (const msg of app) {
        if (msg && msg.data) {
          const chunkText = Array.isArray(msg.data) ? msg.data[0] : msg.data;
          const cleanChunk = sanitizeMichiResponse(chunkText);
          if (cleanChunk) {
            finalResultText = cleanChunk;
            if (typeof onChunkUpdate === 'function') {
              onChunkUpdate(cleanChunk);
            }
          }
        }
      }
      const cleanResult = sanitizeMichiResponse(finalResultText);
      if (cleanResult) return cleanResult;
    } catch (sErr) {
      console.warn("[Michi Core] Index 0 submit failed:", sErr?.message || sErr);
    }

    throw new Error("Bo'sh javob qaytdi");
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error("Request timeout (45s)"));
    }, TIMEOUT_MS)
  );

  return Promise.race([fetchPromise, timeoutPromise]);
}

// Hugging Face Space bilan to'g'ridan-to'g'ri va real vaqtda striming aloqa funksiyasi (1 marta avtomatik retry bilan)
export async function askMichiCore(userMessage, onChunkUpdate = null) {
  console.log("[Michi Core Request]:", userMessage);
  const maxAttempts = 2; // Initial attempt + 1 retry (Cold start uyg'otish uchun)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        console.warn(`[Michi Core] Server uyg'onmoqda (Cold start). 2-marta qayta urinish (Attempt ${attempt}/${maxAttempts})...`);
      }
      const result = await executeMichiAttempt(userMessage, onChunkUpdate);
      return result;
    } catch (err) {
      console.warn(`[Michi Core Attempt ${attempt} Failed]:`, err?.message || err);
      if (attempt === maxAttempts) {
        console.error("[Michi Core All Retries Exhausted]:", err);
        throw new Error("サーバーとの通信が一時的に途絶えました。もう一度お試しください。");
      }
      // Retry oldidan 1.5s kutish (Server cold start bergan bo'lsa uyg'onishi uchun)
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
}


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

  // 2. <think> teglarini tozalash
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // 3. Ortiqcha xitoycha havolalar va qidiruv izohlarini kesish
  clean = clean.replace(/---\s*\n\s*\*\*【確認済み参照ソース】[\s\S]*$/gi, '');
  clean = clean.replace(/\*\*【確認済み参照ソース】[\s\S]*$/gi, '');

  // 4. Qoldiq simvollarni tozalash
  clean = clean.replace(/^[,":\s{}]+/, '').replace(/[,":\s{}]+$/, '').trim();
  return clean;
}

// Hugging Face Space bilan to'g'ridan-to'g'ri va real vaqtda striming aloqa funksiyasi
export async function askMichiCore(userMessage, onChunkUpdate = null) {
  const TIMEOUT_MS = 45000; // Qwen-2.5-72B tahliliy javoblari uchun 45 soniya qat'iy vaqt

  console.log("[Michi Core Request]:", userMessage);

  const fetchPromise = (async () => {
    try {
      let client;
      try {
        client = await Client.connect("https://farruxkanoatov-michiai.hf.space");
      } catch (connErr) {
        console.warn("[Michi Core] Direct URL connect failed, falling back to Space name:", connErr);
        client = await Client.connect("FarruxKanoatov/michiai");
      }
      const app = await client.submit("/stream_michi_core", {
        message: userMessage,
      });

      let finalResultText = "";

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
      if (!cleanResult) {
        throw new Error("Bo'sh javob qaytdi");
      }
      return cleanResult;
    } catch (err) {
      console.error("[Michi Core Error]:", err);
      throw new Error("サーバーとの通信が一時的に途絶えました。もう一度お試しください。");
    }
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => {
      const err = new Error("サーバーとの通信が一時的に途絶えました。もう一度お試しください。");
      console.error("[Michi Core Timeout]:", err);
      reject(err);
    }, TIMEOUT_MS)
  );

  return Promise.race([fetchPromise, timeoutPromise]);
}


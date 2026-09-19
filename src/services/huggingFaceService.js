import { Client } from "@gradio/client";

// Javobni axlatlardan (JSON reasoning, xitoycha linklar, think teglari) tozalovchi universal filtr
function sanitizeMichiResponse(text) {
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

// Hugging Face Space bilan to'g'ridan-to'g'ri aloqa funksiyasi
export async function askMichiCore(userMessage) {
  const TIMEOUT_MS = 45000; // Qwen-2.5-72B tahliliy javoblari uchun 45 soniya qat'iy vaqt

  console.log("[Michi Core Request]:", userMessage);

  const fetchPromise = (async () => {
    try {
      const client = await Client.connect("FarruxKanoatov/michiai");
      const result = await client.predict("/stream_michi_core", {
        message: userMessage,
      });

      let rawData = "";
      if (result && result.data) {
        rawData = Array.isArray(result.data) ? result.data[0] : result.data;
      } else {
        rawData = String(result || "");
      }

      const cleanResult = sanitizeMichiResponse(rawData);
      if (!cleanResult) {
        throw new Error("Bo'sh javob qaytdi");
      }
      return cleanResult;
    } catch (err) {
      console.error("[Michi Core Error]:", err);
      throw err;
    }
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => {
      const err = new Error("Hugging Face javob berish taymauti (45s) tugadi");
      console.error("[Michi Core Error]:", err);
      reject(err);
    }, TIMEOUT_MS)
  );

  return Promise.race([fetchPromise, timeoutPromise]);
}

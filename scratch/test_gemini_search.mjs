import fs from 'node:fs';

let apiKey = '';
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
  if (match) apiKey = match[1].trim();
} catch (e) {
  console.error('Could not read .env file:', e.message);
}

async function testSimple() {
  const model = 'gemini-flash-lite-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  console.log(`Testing simple call with model ${model}...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: '昨日の日本の1番注目されたニュースについて要約してください。' }] }]
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    if (res.status === 200) {
      console.log('Generated Answer:\n', data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log('Error:', data);
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testSimple();

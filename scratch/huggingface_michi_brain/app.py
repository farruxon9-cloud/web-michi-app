import os
import re
import urllib.parse
import xml.etree.ElementTree as ET
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Michi AI Central Brain API",
    description="Universal Knowledge & Real-time Web Grounding Orchestrator Server for Michi AI",
    version="1.0.0"
)

# Enable CORS for cross-origin requests from web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", os.environ.get("VITE_GEMINI_API_KEY", ""))

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User question or voice transcription text")
    language: str = Field(default="ja", description="Target language code: ja, uz, en")
    user_id: str = Field(default="anonymous", description="User ID for session tracking")

class ChatResponse(BaseModel):
    status: str
    response: str
    sources_used: list[str] = []
    intent_detected: str = "general"

def clean_query_keywords(text: str) -> str:
    """Removes noise words from natural language queries to extract pure search keywords."""
    clean = re.sub(r'(おねがいします|お願いします|教えてください|くだされば|ください|です|ます|ですか|でしょうか| tell me| please|haqida|haqida ma\'lumot ber)', '', text, flags=re.IGNORECASE)
    clean = clean.strip()
    return clean if clean else text

def fetch_live_news_rss(lang: str = "ja") -> list[dict]:
    """Fetches top 5 live headlines from Google News RSS & Yahoo JP RSS."""
    headlines = []
    rss_urls = []
    
    if lang == "ja":
        rss_urls = [
            "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja",
            "https://news.yahoo.co.jp/rss/topics/top-picks.xml"
        ]
    elif lang == "uz":
        rss_urls = ["https://news.google.com/rss?hl=uz"]
    else:
        rss_urls = ["https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"]

    for url in rss_urls:
        try:
            res = requests.get(url, timeout=4)
            if res.status_code == 200:
                root = ET.fromstring(res.text)
                for item in root.findall(".//item"):
                    title_elem = item.find("title")
                    desc_elem = item.find("description")
                    if title_elem is not None and title_elem.text:
                        t = title_elem.text.strip()
                        # Clean CDATA or source suffixes
                        t = re.sub(r' - [^-]+$', '', t)
                        if t and not any(h['title'] == t for h in headlines):
                            headlines.append({
                                "title": t,
                                "snippet": desc_elem.text if desc_elem is not None and desc_elem.text else ""
                            })
                    if len(headlines) >= 5:
                        break
        except Exception as e:
            print(f"RSS fetch error for {url}: {e}")
            
    return headlines[:5]

def fetch_weather_data(city: str = "Tokyo") -> str:
    """Fetches live weather from Open-Meteo API."""
    city_coords = {
        "tokyo": (35.6762, 139.6503),
        "osaka": (34.6937, 135.5023),
        "kyoto": (35.0116, 135.7681),
        "fukuoka": (33.5904, 130.4017),
        "nagoya": (35.1815, 136.9066),
        "sapporo": (43.0618, 141.3545),
        "tashkent": (41.2995, 69.2401)
    }
    coords = city_coords.get(city.lower(), (35.6762, 139.6503))
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords[0]}&longitude={coords[1]}&current_weather=true"
        res = requests.get(url, timeout=3)
        if res.status_code == 200:
            data = res.json()
            curr = data.get("current_weather", {})
            return f"Current temperature: {curr.get('temperature')}°C, Windspeed: {curr.get('windspeed')} km/h"
    except Exception as e:
        print(f"Weather error: {e}")
    return "Weather data unavailable"

def call_gemini_api(prompt: str, context: str, lang: str) -> str:
    """Calls Gemini API (gemini-3.6-flash or gemini-flash-lite-latest) with real-time grounding context."""
    if not GEMINI_API_KEY:
        return "Gemini API key is not configured on HF Space server."

    system_instruction = (
        "You are Michi AI (ミチAI), a universal 100% pure conversational AI knowledge engine.\n"
        "Your sole task is to answer user questions clearly, accurately, and politely.\n"
        "LANGUAGE INSTRUCTIONS:\n"
        "- If user speaks Japanese: Use proper, humble Keigo (です/ます, かしこまりました, お疲れ様でございます).\n"
        "- If user speaks Uzbek: Use polite, respectful Uzbek (Tushundim, Xush kelibsiz, Hurmat bilan).\n"
        "- If user speaks English: Use polite, helpful English.\n"
        "CRITICAL RULES:\n"
        "1. NEVER output JSON formatting, raw code blocks, or system brackets. Return pure human-readable text.\n"
        "2. NEVER repeat the user prompt verbatim.\n"
        "3. If LIVE CONTEXT / NEWS / WEATHER is provided below, incorporate it directly into your answer.\n"
        "4. Never mention system commands, UI controls, or internal tools.\n\n"
        f"LIVE GROUNDING CONTEXT:\n{context}\n"
    )

    models = ["gemini-3.6-flash", "gemini-flash-lite-latest", "gemini-3.5-flash-lite"]
    
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"System Context:\n{system_instruction}\n\nUser Question:\n{prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 800
            }
        }
        try:
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                answer = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if answer:
                    # Strip any raw JSON syntax if present
                    answer = re.sub(r'```json[\s\S]*?```', '', answer).strip()
                    answer = re.sub(r'^\{\s*"response"\s*:\s*"(.*)"\s*\}$', r'\1', answer).strip()
                    return answer
        except Exception as e:
            print(f"Model {model} failed: {e}")
            
    return "申し訳ございません。現在AIエンジンを呼び出すことができませんでした。しばらく経ってから再度お試しください。"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "name": "Michi AI Central Brain Orchestrator",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "michi-ai-brain"}

@app.post("/api/v1/chat", response_model=ChatResponse)
def handle_chat(req: ChatRequest):
    prompt_lower = req.prompt.lower()
    intent = "general"
    context_items = []
    sources = []

    # Detect Intent
    if any(k in prompt_lower for k in ["ニュース", "news", "yangilik", "kecha", "bugun", "昨日", "今日"]):
        intent = "news"
        news = fetch_live_news_rss(req.language)
        if news:
            news_text = "\n".join([f"- {item['title']}" for item in news])
            context_items.append(f"REAL-TIME LIVE NEWS HEADLINES:\n{news_text}")
            sources.append("Google News RSS / Yahoo JP News")

    elif any(k in prompt_lower for k in ["天気", "weather", "ob-havo", "気温", "雨"]):
        intent = "weather"
        weather_str = fetch_weather_data("Tokyo")
        context_items.append(f"LIVE WEATHER DATA:\n{weather_str}")
        sources.append("Open-Meteo Weather API")

    grounding_context = "\n\n".join(context_items) if context_items else "No real-time web context needed."
    
    # Call Gemini Synthesis Engine
    answer = call_gemini_api(req.prompt, grounding_context, req.language)

    return ChatResponse(
        status="success",
        response=answer,
        sources_used=sources,
        intent_detected=intent
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

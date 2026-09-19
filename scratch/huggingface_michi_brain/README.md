---
title: Michi AI Central Brain API
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

# Michi AI Central Brain Orchestrator (FastAPI)

This Hugging Face Space hosts the central AI brain API for the Michi AI assistant.
It orchestrates tool calls (Google News RSS, Yahoo JP News RSS, Open-Meteo Weather), grounding context, and Gemini 3.6 Flash LLM synthesis.

## Endpoints

- `GET /health` — Service health check
- `POST /api/v1/chat` — Universal question answering & real-time grounding

### Example Request

```json
{
  "prompt": "昨日の1番良いニュースはおねがいします",
  "language": "ja"
}
```

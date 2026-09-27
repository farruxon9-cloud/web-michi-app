# Multi-AI Mesh Engine Specification

## System Architecture & Routing
- **Primary Node**: Gemini 1.5/2.0 API endpoint.
- **Secondary Node**: HuggingFace Inference API (`askMichiCore`).
- **Offline Node**: Rule-based regex parser (`matchLexiconCommand`).

## Error Handling & Retry Policies
- **Timeout**: 8,000ms max request timeout.
- **Retry Count**: Max 2 retry attempts with exponential backoff (`Math.pow(2, attempt) * 1000ms`).

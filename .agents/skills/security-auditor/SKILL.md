---
name: security-auditor
description: Guidelines for ensuring credential isolation, preventing secret leaks, and managing environment configuration files.
---

# Security Auditor Skill

This skill enforces best-practice security constraints in codebase modifications.

## 1. Do Not Commit API Keys
- Never write hardcoded API keys (e.g. Google Gemini API keys, Stripe tokens, Database credentials) in source code files.
- Always load keys from environment variables: `import.meta.env.VITE_GEMINI_API_KEY` (in Vite) or `process.env` (in Node).

## 2. Environment Configurations
- Store all development configurations in local `.env` files.
- Ensure `.env` is listed inside `.gitignore` so it is never pushed to public repositories.

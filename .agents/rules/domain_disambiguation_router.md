# 🧭 Rule: Domain Disambiguation & Hybrid Local-First Database Routing

1. **Domain Disambiguation Invariant**:
   - Disambiguate overlapping domain categories strictly. For instance:
     - **Driving Schools (自動車教習所 / Avtomaktab)**: Map ONLY to explicit driving license terms (`教習所`, `自動車学校`, `avtomaktab`, `driving school`).
     - **Language Academies (日本語学校)**: Exclude from driving school triggers and route to LLM or dedicated language school handlers.
   - NEVER use generic broad words (`学校`, `maktab`, `school`) as triggers for specialized sub-domains.

2. **Hybrid Local-First Database Routing**:
   - Check local application state/databases (`jobs`, `schools`) first:
     - If query parameters match existing local records (e.g. active prefecture "Matsudo" or valid job category), execute local UI filters (`FILTER_JOBS` / `FILTER_ACADEMIES`).
     - If requested information is absent from local databases or requires general reasoning (visas, salaries, general advice), delegate directly to Gemini Cloud AI.

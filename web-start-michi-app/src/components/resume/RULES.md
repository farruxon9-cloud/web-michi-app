# Japanese Resume Builder (履歴書 - Rirekisho) Architecture & Layout Rules

## Core Layout & Dimension Norms
- **Page Container (`.resume-builder-page`)**: Standard mobile-first container, `max-width: 800px` (desktop centered preview), `padding: 16px`.
- **Japanese Standard Form Grid**:
  - Paper Size Ratio: Japanese JIS Standard A4 (210mm x 297mm) / B4 (257mm x 364mm).
  - Photo Box: `30mm x 40mm` (Ratio 3:4), `border: 1px dashed var(--dash-card-border)`.
  - Date / Era Display: Japanese Wareki (令和 / 平成 / 昭和) + Seireki (Western Year).
- **Clearance Spacer**: `<div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />` at container bottom for navigation clearance.

## Per-Component Spec Index (`rules/`)
1. [`resume_builder_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/resume/rules/resume_builder_spec.md) - Master state manager, Wareki converter, and step navigator.
2. [`resume_personal_info_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/resume/rules/resume_personal_info_spec.md) - Kanji/Furigana name inputs, address, phone number, and photo upload validator.
3. [`resume_history_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/resume/rules/resume_history_spec.md) - Chronological Gakureki (Education) and Shokureki (Work History) entries.
4. [`resume_licenses_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/resume/rules/resume_licenses_spec.md) - Japanese driver's licenses (Tokutei Ginou, Menten) and JLPT certification pickers.
5. [`resume_self_pr_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/resume/rules/resume_self_pr_spec.md) - Jiyuu Kinyuuran (Motivation, commute time, family dependents count).
6. [`resume_pdf_preview_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/resume/rules/resume_pdf_preview_spec.md) - PDF canvas renderer & export downloader.

## Bug Prevention & Learned Fixes
- **Japanese Era (Wareki) Calculation Rule**:
  - Year >= 2019: Reiwa (`令和${y - 2019 + 1}年`) (Year 2019 is `令和元年`).
  - Year 1989..2018: Heisei (`平成${y - 1989 + 1}年`).
  - Year 1926..1988: Showa (`昭和${y - 1926 + 1}年`).
- **Furigana Reading Auto-Conversion**: Katakana fields must validate against non-Katakana characters before pdf generation.
- **PDF Generation Memory Limits**: Always clean up Blob URLs after download triggers (`URL.revokeObjectURL(blobUrl)`).

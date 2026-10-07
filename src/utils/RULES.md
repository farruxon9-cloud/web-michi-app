# Utility Functions & Calculators Suite Architecture & Rules

## Core Utility Categories
1. **Japanese Data & Formats (`japaneseEra.js`, `japaneseZipcodeLookup.js`, `resumeGenerator.js`)**:
   - Wareki calculation (Reiwa, Heisei, Showa).
   - 7-digit Japanese zipcode lookup engine (7-digit postal code -> Prefecture/City).
   - Standard JIS A4 PDF Rirekisho renderer.
2. **Navigation Physics & Overpass Geo (`turnRadiusPhysics.js`, `overpassRestrictions.js`, `deadReckoning.js`)**:
   - Turning radius physics calculations based on vehicle length (Kei to Trailer).
   - Overpass API bridge height/weight restriction data parser.
3. **Voice Lexicon & Haptics (`voiceLexicon.js`, `haptics.js`)**:
   - Multilingual Uzbek/Japanese voice command matching lexicon.

## Per-Utility Spec Index (`rules/`)
1. [`resume_generator_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/utils/rules/resume_generator_spec.md) - jsPDF canvas binary PDF builder.
2. [`japanese_era_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/utils/rules/japanese_era_spec.md) - Wareki conversion rules.
3. [`turn_radius_physics_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/utils/rules/turn_radius_physics_spec.md) - Ackermann steering physics models.
4. [`overpass_restrictions_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/utils/rules/overpass_restrictions_spec.md) - Overpass bridge height & weight restriction parser.
5. [`japanese_zipcode_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/utils/rules/japanese_zipcode_spec.md) - Postal code lookup engine.
6. [`voice_lexicon_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/utils/rules/voice_lexicon_spec.md) - Uzbek/Japanese voice command dictionary.

## Bug Prevention & Learned Fixes
- **Zipcode Format Sanitization**: Strip non-digit hyphen characters (`zip.replace(/-/g, '')`) before lookup to guarantee exact 7-digit index match.

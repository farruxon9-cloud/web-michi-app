---
name: michi-accent-furigana-phonetic-master
description: Phonetic reading disambiguation, Kanji Furigana text normalization, and pitch-accent pronunciation skill for Japanese TTS synthesis.
---

# Michi AI — Phonetic Furigana & Pitch Accent Skill

This skill ensures 100% accurate Japanese pronunciation by resolving Kanji homographs (same Kanji, multiple readings) into unambiguous Hiragana before sending text to the TTS engine.

---

## 🔊 Phonetic Disambiguation Rules

1. **Kanji Homograph Disambiguation**:
   - `角`: Contextually mapped to `かど` (corner/street) vs `つの` (horn).
   - `行`: Mapped to `いく` (to go) vs `ぎょう` (line/row) vs `こう` (action).
   - `生`: Mapped to `なま` (raw/fresh) vs `せい` (life/student) vs `いきる` (to live).
   - `一`: Mapped to `ひとつ` (one item) vs `いち` (number 1).

2. **Numerals & Counters Formatting**:
   - Currency: `350000円` → `さんじゅうごまんえん` (35万円).
   - Dates & Times: `1日` → `ついたち` (1st day of month) vs `いちにち` (one day).
   - Vehicles/Count: `1台` → `いちだい`, `2本` → `にほん`.

3. **Pitch Accent & Intonation Smoothness**:
   - Applies flat (Heiban - 平板) and rising/falling pitch accents for natural Tokyo dialect standard speech.

# Rule: User Visual Design Fidelity Protocol ("Oldingidek Emas" Directive)

## Trigger Phrase / Scenario
Whenever the user states "oldingidek emas" ("it's not like before"), "oldingidek ko'rinish" ("previous look"), or points out a visual mismatch with reference images or `web` branch versions:

## Mandatory Execution Protocol
1. **Immediate Reference Audit**:
   - Always inspect `git show web:...` or original screenshot artifacts to extract exact pixel dimensions, fonts, icon badges, colors, and layout structure.
   - Do NOT rely on memory or approximations.

2. **Full Design Fidelity Invariants**:
   - **Header Layout**: Back arrow (`←`), AI Logo badge with gradient + `Sparkles` icon, Title (`Michi AI Hub`), and Status (`準備完了` with green dot) MUST be aligned in a single horizontal flex row.
   - **Header Actions**: Action buttons (Power, Trash, Close) MUST use rounded square containers (`36px × 36px`, `border-radius: 12px`, soft background fill) in a right-aligned horizontal row.
   - **Chips Grid**: Quick action chips MUST use 3-column equal grid (`repeat(3, 1fr)`) with distinct icon badge gradients (Orange truck for `免許切替`, Blue compass for `ビザ情報`, Green sun for `天気・生活`).
   - **Container Boundaries**: Desktop overlays MUST take `position: fixed` with a centered `max-width: 820px; margin: 0 auto` panel over clean `#FFFFFF` background, creating clean side margins on desktop without clipping inside card wrappers.

3. **Language Invariants**:
   - Default user author label MUST be `あなた` (Japanese) when `speechLang === 'ja'`.
   - Default input placeholder MUST be `Michi AI に質問を入力...`.
   - Default ready status MUST be `準備完了`.

4. **Defensive Stability**:
   - Maintain React Portals (`createPortal(..., document.body)`) to prevent container overflow clipping.
   - Always destructure optional props with default parameters (e.g. `speechLang = 'ja'`) to prevent `ReferenceError` crashes.

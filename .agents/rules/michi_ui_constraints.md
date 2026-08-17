# Michi UI & Feature Scoping Rules

1. **Strict Change Scoping**: Never modify, redesign, or add interactive banners to placeholder screens (e.g., coming-soon screens) unless explicitly instructed by the user. If the user asks to move a feature (e.g. AI showcase), modify ONLY the specified target page and keep all other untouched pages in their exact original state.
2. **AI Showcase Exclusivity**: The AI Assist Vision card and full showcase view must exist EXCLUSIVELY inside Profile -> "Platforma haqida" (`activePage === 'about'`). Do not duplicate AI cards on the Home Dashboard or inside the Servis tab.
3. **Japanese Navigation Terms**: When Japanese (`ja`) locale is active, bottom navigation tab labels must strictly use standard Japanese app conventions:
   - Home -> `ホーム`
   - Jobs -> `求人`
   - Service -> `サービス`
   - Academy -> `教習所`
   - Profile -> `マイページ`
4. **Mobile Flex Viewport Overflow Invariant**: Every text container inside a flex item on mobile layouts MUST include `min-width: 0;` and `overflow-wrap: anywhere; word-break: break-word;` to strictly prevent any horizontal overflow past the mobile device frame.
5. **No Raw Text Emojis**: Replace raw text emojis (`🗣️`, `🤖`) with Lucide vector icons wrapped in stylized 3D glassmorphic containers.

# Global App Context & State Suite Architecture & Rules

## Core Context Specifications
- **Global App Context (`AppContext.jsx`)**:
  - Manages global user authentication state, selected role (`driver` / `company`), language locale, dark mode toggle, and active navigation tab.
  - State Persistence: Synchronizes changes to `localStorage` (`michi_user_role`, `michi_language`, `michi_theme`).

## Per-Context Spec Index (`rules/`)
1. [`app_context_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/context/rules/app_context_spec.md) - React context provider, state synchronization hooks.

## Bug Prevention & Learned Fixes
- **Unnecessary Re-render Prevention**: Memoize context value object using `useMemo` to prevent deep component tree re-renders on minor state updates.

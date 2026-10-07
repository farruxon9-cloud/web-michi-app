# Custom React Hooks Suite Architecture & Rules

## Core Custom Hooks
1. **Debounce Hook (`useDebounce.js`)**:
   - Delays execution of search queries by 300ms to reduce unnecessary API requests during typing.
2. **Media Query Hook (`useMediaQuery.js`)**:
   - Detects screen width breakpoints (`mobile`: < 768px, `tablet`: 768px - 1024px, `desktop`: > 1024px).

## Per-Hook Spec Index (`rules/`)
1. [`custom_hooks_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/hooks/rules/custom_hooks_spec.md) - Specifications for `useDebounce` and `useMediaQuery`.

## Bug Prevention & Learned Fixes
- **EventListener Memory Leaks**: `useMediaQuery` must cleanup matchMedia listeners (`mql.removeEventListener('change', handler)`) inside `useEffect` cleanup.

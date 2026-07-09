---
name: react-performance-tuning
description: Best practices for React rendering optimization, avoiding redundant re-renders, and using useMemo/useCallback appropriately.
---

# React Performance Tuning Skill

This skill governs optimization rules to ensure that components render quickly and efficiently.

## 1. Render Minimization
- Wrap pure presentational components in `React.memo` if they receive primitive props or memoized reference props.
- Keep state local to the components that need it, avoiding global state updates for micro-interactions (e.g. hover states).

## 2. Callback and Computation Caching
- Cache heavy calculations with `useMemo` (e.g. sorting or filtering large jobs/schools array).
- Cache handlers passed down as callback functions to memoized components using `useCallback`.
- Enforce unique, stable React `key` props (never use random numbers or dynamic array indexes unless the array is static).

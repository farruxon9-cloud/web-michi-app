---
name: react-best-practices
description: Best practices for React component design, avoiding state mutations, using hooks safely, and code-splitting.
---

# React Best Practices Skill

This skill guides the implementation of clean, reliable, and high-performance React components.

## 1. Avoid Direct State Mutations
- Never mutate state variables directly (e.g., `state.push(item)` is forbidden).
- Always use setter functions with spread syntax or functional updates: `setState(prev => [...prev, item])`.

## 2. Safe Hook Usage
- Keep `useEffect` blocks clean. Separate unrelated logic into different `useEffect` hooks.
- Memoize expensive callback functions passed down to children using `useCallback` to prevent unnecessary component re-renders.

## 3. Dynamic Imports
- For large pages or sub-components (like Admin Dashboards), use dynamic lazy loading: `const Component = React.lazy(() => import('./Component'))`.

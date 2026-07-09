---
name: eslint-linter
description: Guidelines for running ESLint checks, resolving syntax errors, fixing unused variables, and verifying imports before compilation.
---

# ESLint Linter Skill

This skill enforces syntactical cleanliness and prevents common coding errors in React/Node.js projects.

## 1. Linter Verification Rule
- Whenever the agent edits React, JSX, JS, or CSS files, it must run `npm run build` or `npm run lint` (if configured) to verify syntax correctness.
- Resolving unused variables: Never leave unused imports or variable declarations in code.
- Resolving React Hook dependency arrays: Always verify that dependencies for `useEffect`, `useCallback`, and `useMemo` are complete and do not trigger infinite render loops.

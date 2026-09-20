# Incremental Learning & Branch Safety Protocol

1. **Strict Working Branch Isolation**:
   - All development, refactoring, bug fixes, and feature additions MUST take place strictly on the isolated working branch (`start-1.0a1`).
   - NEVER merge or synchronize changes to `main`, `start-1.0a`, or `start-1.0` automatically. Merges occur ONLY after the user thoroughly tests the working branch and gives explicit merge commands.

2. **Continuous Learning Protocol (Audit & Learn)**:
   - After completing each module, feature, or bug fix, immediately document the learnings, resolved errors, and safety invariants into `.agents/rules/past_mistakes.md`.
   - Update architecture specs in `codebase_map.md` whenever components or modular files are modified or added.

3. **Empirical Build & Test Verification**:
   - Always verify code with `npx vite build` and runtime checks before committing.

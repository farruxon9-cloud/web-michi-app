---
name: code-splitting-lazy-loading
description: Guidelines for utilizing React.lazy, dynamic imports, and on-demand script/dependency loading to keep bundle size small.
---

# Code Splitting & Lazy Loading Skill

This skill enforces bundle size limits and dynamic dependency imports.

## 1. Route and View Splitting
- Split major pages or overlays (like AdminDashboard, CompanyHome) using `React.lazy` and `Suspense`:
  ```javascript
  const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
  ```
- Always wrap lazy-loaded components in a `<Suspense fallback={<LoadingSpinner />}>` wrapper.

## 2. On-Demand Library Loading
- Do not import heavy libraries (like `pdfmake`) statically at the top of helper files.
- Use dynamic imports: `const module = await import('library-name')` within action handlers so they are loaded only when the action is executed.

# Michi Server API, Schema & Validation Learning Rules

## 1. Data Normalization & Type Safety Rules
- **Safe Address and Location Parsing**: When receiving location fields in `jobPostingNormalizer.js`, `location` or `fullAddress` can be passed as a string OR as a location object (`{ prefecture, city, lat, lng }`). ALWAYS check `typeof location === 'string'` before invoking string methods such as `.includes()`, `.trim()`, or `.toLowerCase()`.
- **Flexible Salary Parsing**: Salary input can be a raw number (`350000`), a formatted JPY string (`¥350,000 / oyiga`), or a range object (`{ min: 350000, max: 450000 }`). `formatSalaryJPY` and normalizers must handle all three formats seamlessly without throwing exceptions.

## 2. API Service & Hook Architecture Rules
- **Explicit Function Imports**: Always import named validation functions (`import { validateJobSchema, validateSchoolSchema } from '../services/schemaValidationService'`) rather than relying on default object property access to prevent `undefined` runtime errors.
- **Offline & 404 Resilience**: All API service calls (`fetchJobs`, `fetchSchools`) and custom React hooks (`useMichiJobs`, `useMichiSchools`) must handle HTTP 404, 500, or network timeouts gracefully. On failure, they must log a clear warning and serve cached entries from `michiLocalStorageEngine`.

## 3. Strict Code Audit & Verification Directives
- **Empirical Runtime Testing**: Never declare an audit complete based solely on file inspection. Always run automated unit test suites (`npm test -- --run`) and verify 100% test pass rates across all files.
- **Strict Branch & UI Guardrails**: Keep all development strictly on the active branch (`web-1`). NEVER execute git merge operations unless explicitly commanded by the user with "merge qilib ber". Preserve 100% of existing UI glassmorphic styles and layouts.

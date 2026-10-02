# Michi Server API, Schema, CORS Proxy & Application Learning Rules

## 1. Central API Configuration & Auth Headers
- **Central Gateway**: All HTTP/HTTPS requests must route through `API_ENDPOINTS` imported from `src/config/api.js`. Base URL is driven by `VITE_API_BASE_URL` with default fallback to `https://api.michi.jp.net`.
- **Auth Headers**: Authentication requests use `getAuthHeaders()` to attach `Authorization: Bearer <token>` dynamically from `localStorage.getItem('michi_jwt_token')`.

## 2. CORS & Mixed-Content Proxying (Email OTP)
- **HTTPS Proxy Requirement**: Direct HTTP calls (e.g., `http://138.197.28.114:5678/...`) cause browser Mixed-Content / CORS blocks on production HTTPS deployments.
- **OTP Gateway**: Always use `sendEmailOtpViaN8n(email, otpCode)` via `POST /api/auth/send-otp` (`API_ENDPOINTS.SEND_OTP`) with JSON headers `{ 'Content-Type': 'application/json', 'Accept': 'application/json' }`.

## 3. Data Normalization & Type Safety Rules
- **Safe Location Parsing**: In `jobPostingNormalizer.js`, `location` or `fullAddress` can be passed as a string OR as a location object (`{ prefecture, city, lat, lng }`). ALWAYS check `typeof location === 'string'` before invoking string methods like `.includes()`, `.trim()`, or `.toLowerCase()`.
- **Flexible Salary Parsing**: Salary input can be a raw number (`350000`), a formatted JPY string (`¥350,000 / oyiga`), or a range object (`{ min: 350000, max: 450000 }`). `formatSalaryJPY` and normalizers must handle all three formats without throwing runtime exceptions.

## 4. Job & Driving School Server Integration (POST /api/jobs, GET/POST /api/schools)
- **Jobs Submission (`POST /api/jobs`)**: `submitJobToBackend` normalizes numeric salaries (`Number(minSalary) || 0`) and sends `getAuthHeaders()`.
- **Schools Retrieval & Creation (`GET/POST /api/schools`)**: `fetchSchoolsFromBackend` returns empty array on network failure. `createSchoolInBackend` converts `lat` and `lng` to `Number()` with Tokyo fallbacks (`35.6686, 139.4776`).

## 5. Applications Submission & Referral Tracking (POST /api/applications)
- **Referral Tracking**: Capture `?ref=...` URL parameter in `App.jsx` `useEffect` and persist to `sessionStorage.setItem('michi_referrer_id', refCode)`.
- **Application Payload**: `submitApplication(jobId, applicantInfo)` formats payload as:
  ```json
  {
    "type": "job",
    "targetId": jobId,
    "applicantData": {
      "name": applicantInfo.name,
      "phone": applicantInfo.phone,
      "email": applicantInfo.email,
      "license": applicantInfo.license || ""
    },
    "referrerId": referrerId
  }
  ```
- **Error Handling**: On `!response.ok`, throw `new Error(result.error || 'Arizani topshirishda xatolik yuz berdi')`.

## 6. Strict Audit & Verification Directives
- **Empirical Runtime Testing**: Always verify code correctness using `npm test -- --run` to ensure 100% test pass rate across all 32+ test files.
- **Strict Branch Guardrails**: Remain strictly on branch `web-1`. Never merge automatically.

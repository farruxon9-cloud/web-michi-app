# Michi Auth & Session Management Rules (FAZA 1–5 Learnings)

## 1. Zero Plaintext Credentials in Client Storage
- **Never Store Passwords**: Never write passwords (plaintext or hashed) or `michi_registered_users` arrays containing passwords to `localStorage` or `sessionStorage`.
- **Sanitize Cached Profiles**: Any cached user object in `localStorage` (`michi_auth_user` or `michi_user_session`) must strip the `password` field before stringifying (`delete safeUser.password`).
- **No Insecure Fallbacks**: Never fall back to checking local storage passwords when backend authentication returns an error. Show explicit API error messages to the user instead.

## 2. Single Source of Truth for Auth State (`AuthContext`)
- **App-Level Provider**: `<App />` must be wrapped with `<AuthProvider>` in `src/main.jsx`.
- **Use `useAuth()` Hook**: All components (`App.jsx`, `RoleSelect.jsx`, `Profile.jsx`, `AdminDashboard.jsx`) must rely on `useAuth()` for `user`, `userRole`, `setUserRole`, `login`, `register`, and `logout`.
- **Eliminate Local State Duplication**: Do not create parallel `userRole` or session fetch `useEffect` states inside `App.jsx`.

## 3. Central HTTP Client & Automatic Token Renewal (`apiClient.js`)
- **HTTP Wrapper**: Use `apiFetch` / `apiClient` (`src/services/apiClient.js`) for all backend API calls.
- **Authorization Header Injection**: Automatically attach `Authorization: Bearer <token>` from `getStoredToken()`.
- **Automatic 401 Interceptor**: Upon receiving a `401 Unauthorized` response (excluding auth login/refresh endpoints):
  - Automatically attempt `refreshAccessToken()`.
  - Queue concurrent 401 requests while refresh is in-flight.
  - On refresh success, retry the original request with the new access token.
  - On refresh failure, invoke `logoutUser()` and throw/return error.

## 4. Strict Server-Side OTP & Rate Limiting
- **No Dev-Mode OTP Bypass**: Never bypass OTP validation or return hardcoded `success: true` in production proxy code (`verifyEmailOtpCodeViaN8n`).
- **Strict Server Verification**: OTP verification must call `POST /api/auth/verify-otp`.
- **Rate-Limiting Guard**: Enforce max 3 failed attempts before locking out OTP requests for 15 minutes using `authSecurityService` (`recordFailedAttempt`, `checkLockout`).

## 5. Single Sign-Out & Server Token Invalidation
- **Logout Endpoint**: On `logoutUser()`, send a `POST /api/auth/logout` request with `{ refreshToken }` to invalidate the refresh token on the backend server before clearing local storage tokens.

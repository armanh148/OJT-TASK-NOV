# SECURITY CHECKLIST — MONTHLY BUDGET TRACKER (FULL-STACK WEB)

## 1. AUTHENTICATION & ACCESS CONTROL
- [x] **Password Hashing:** Passwords hashed with bcrypt (`bcryptjs`) with $\ge 10$ rounds.
- [x] **Zero Plaintext Storage:** Plaintext passwords are never stored, logged, or exposed in errors.
- [x] **Secure Browser Session Persistence:** JWT stored in secure `HttpOnly`, `SameSite=Lax` cookies with strict 7-day expiration. Prevents XSS token exfiltration.
- [x] **Authorization Header Fallback:** Backend `authMiddleware` seamlessly accepts both `req.cookies.token` and `Authorization: Bearer <token>` headers.
- [x] **Ownership Authorization:** Every financial read, write, update, and delete checks `WHERE user_id = :auth_user_id`. Client cannot spoof user IDs.
- [x] **Safe Logout:** `POST /api/auth/logout` clears HttpOnly session cookies from the client browser.

## 2. API & NETWORK SECURITY
- [x] **CORS Enforcement:** Strictly allows frontend origin with `credentials: true`.
- [x] **Helmet Security Headers:** Configured with `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Strict-Transport-Security`.
- [x] **Rate Limiting:** IP-based brute-force throttling on `/api/auth/*` endpoints (max 20 requests / 15 minutes).
- [x] **Input Validation:** Zod schemas validate types, formats, lengths, and numerical limits on all endpoints before database calls.
- [x] **Payload Size Limits:** Express body-parser configured with strict size limit (`100kb`) to mitigate Denial-of-Service attacks.

## 3. DATABASE SECURITY & INTEGRITY
- [x] **SQL Injection Prevention:** Parameterized database queries via Prisma ORM. No raw string interpolation in SQL.
- [x] **Safe Financial Types:** `NUMERIC(14, 2)` used in PostgreSQL to eliminate floating-point representation vulnerabilities.
- [x] **Unique Constraints:** `UNIQUE(user_id, month, year)` prevents duplicate income records for the same month.
- [x] **Foreign Key Constraints:** Cascading rules properly enforced. Orphaned records prevented.
- [x] **Environment Variable Hygiene:** No secrets, passwords, or production database connection strings committed to Git. `.env.example` contains sanitized placeholders.

## 4. ERROR HANDLING & LOGGING
- [x] **Sanitized Error Responses:** Generic 500 error messages returned to clients in production. No stack traces or database error messages leaked.
- [x] **Structured Logging:** Server logs capture method, route, status code, and latency without logging sensitive user credentials or authorization headers.

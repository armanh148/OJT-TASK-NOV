# ENTERPRISE PROJECT RULES — MONTHLY BUDGET TRACKER (OJT)

## 1. PURPOSE & APPLICABILITY
These rules are permanent and non-negotiable for all engineering tasks on the Monthly Budget Tracker application. All contributors, agents, and reviewers must strictly comply.

## 2. CORE ARCHITECTURAL PRINCIPLES

### 2.1 Financial Integrity (Highest Priority)
1. **Authoritative Calculation:** All financial balances (`totalIncome`, `totalExpense`, `remainingBalance`) MUST be computed authoritatively on the backend from database records.
2. **No Stored Balance:** Never store `remaining_balance` as a persisted field in the database. Derived exclusively via:
   $$\text{Remaining Balance} = \text{Total Income} - \sum \text{Expenses}$$
3. **Safe Decimal Math:** NEVER use JavaScript native floating-point math for financial operations. All calculations MUST use arbitrary-precision decimal arithmetic (`decimal.js` or PostgreSQL `NUMERIC(14, 2)`).
4. **Validation Rules:**
   - Financial amounts must be positive numbers ($> 0$).
   - Reject `NaN`, `Infinity`, negative values, and non-numeric inputs.
   - Precision: Maximum 14 digits, 2 decimal places.
5. **Overspending Handling:** Allow expenses exceeding remaining balance, but immediately flag `isOverspent = true`, calculate negative balance, and display prominent UI warnings.

### 2.2 Security & Authentication
1. **Password Security:** Use `bcryptjs` with a work factor of $\ge 10$ rounds. Never store or log plain text passwords. Never expose password hashes in API responses.
2. **Token Security:** Issue signed JWT tokens with strict expiration. Store tokens on mobile strictly in `Expo SecureStore` (NEVER in plain `AsyncStorage`).
3. **Data Isolation & Ownership:** Every financial mutation and read query must enforce `WHERE user_id = :authenticated_user_id`. Never trust user-supplied IDs from request bodies or parameters for ownership.
4. **Environment Protection:** No secrets or database URLs committed to version control. Always provide `.env.example` with sanitized placeholders.
5. **Parameterized Queries:** Use Prisma ORM with parameterized queries to prevent SQL injection.

### 2.3 Mobile & UI/UX Standards
1. **Design System Adherence:** Colors, typography, spacing, and elevation must follow the verified UI UX Pro Max design tokens.
2. **React Bits Reference:** Use `references/react-bits` for conceptual design patterns (cards, micro-interactions, animated text), but implement them with native React Native primitives (`react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`).
3. **No Fake Elements:** Zero placeholder buttons, zero mock data in production flows, and zero unfinished screens presented as complete.
4. **States Handling:** Every data screen must handle:
   - Initial Loading (skeleton loaders)
   - Empty State (actionable guidance)
   - Error State (retry action with user-friendly message)
   - Success/Data State
5. **Accessibility:** Touch targets $\ge 48\times 48\text{ dp}$, text contrast ratio $\ge 4.5:1$, and support for screen readers and reduced motion.

### 2.4 Code Quality & Testing Gates
1. **TypeScript Strict Mode:** `strict: true` across both backend and mobile. Zero unresolved compilation errors.
2. **Mandatory Test Suites:**
   - Financial calculation unit tests (all 10 canonical scenarios + edge cases).
   - Backend API integration tests (auth, income, expenses, validation, isolation).
   - Mobile component & utility tests.
3. **No Silencing Errors:** Never suppress linter warnings or TypeScript errors with `any` or `@ts-ignore` without rigorous architectural justification.
4. **Traceable Commits & Documentation:** All changes must be reflected in `QA_REPORT.md` and `ARCHITECTURE.md`.

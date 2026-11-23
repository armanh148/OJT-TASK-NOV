# ENTERPRISE PROJECT AUDIT — MONTHLY BUDGET TRACKER (OJT)

## 1. WORKSPACE AUDIT & BASELINE INVENTORY
- **Evaluation Target:** Monthly Budget Tracker (Enterprise Full-Stack Website)
- **Role & Scope:** Full-Stack Web Architecture, Next.js App Router Frontend, Node.js/Express Backend, Neon Serverless PostgreSQL.
- **Frontend Architecture:** Next.js 14 App Router, TypeScript (strict mode), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend Architecture:** Node.js, Express.js 4.21, TypeScript 5.7 (strict mode), Prisma ORM 5.22, Decimal.js.
- **Database Layer:** Neon Serverless PostgreSQL with strict referential integrity and indexes.
- **Security Protocols:** JWT authentication, bcrypt password hashing (10 rounds), secure HttpOnly cookie persistence with fallback to Bearer headers, Helmet security headers, Express rate limiting.

---

## 2. INVENTORY OF ARTIFACTS & SUBSYSTEMS

### 2.1 Backend Subsystem (`backend/`)
- `src/config/`: Environment validation via Zod, Prisma database connection singleton.
- `src/controllers/`: `authController.ts`, `incomeController.ts`, `expenseController.ts`, `summaryController.ts`.
- `src/middleware/`: `authMiddleware.ts` (supporting HttpOnly cookies & Bearer tokens), `validateMiddleware.ts`, `rateLimitMiddleware.ts`, `errorMiddleware.ts`.
- `src/routes/`: `authRoutes.ts`, `incomeRoutes.ts`, `expenseRoutes.ts`, `summaryRoutes.ts`.
- `src/services/`:
  - `calculationEngine.ts`: Authoritative calculation engine (pure, arbitrary-precision decimal mathematics via `decimal.js`).
  - `authService.ts`: Registration, bcrypt hashing, login verification, token generation.
  - `incomeService.ts`: Atomic upsert on `(user_id, month, year)`, preventing duplicate entries.
  - `expenseService.ts`: Expense CRUD, ownership verification, CSV data export, and authoritative balance recalculation.
  - `summaryService.ts`: Full monthly breakdown, category distribution, 80% budget threshold alerts, and month-over-month comparison.
- `prisma/schema.prisma`: Complete data models (`users`, `incomes`, `expenses`) with unique constraints and foreign keys.
- `tests/`: 27 passing tests (16 financial unit tests, 7 API integration tests, 4 end-to-end 12-step scenario tests).

### 2.2 Frontend Subsystem (`frontend/`)
- `src/app/`: Next.js App Router structure:
  - `(auth)/login/page.tsx`: Premium fintech login experience with demo autofill.
  - `(auth)/register/page.tsx`: Registration page with live password strength meter.
  - `(dashboard)/dashboard/page.tsx`: Primary financial command center with 3 prominent cards, progress bar, overspending alert, category chart, recent transactions.
  - `(dashboard)/expenses/page.tsx`: Full expense management table with search, category filtering, sorting, pagination, and modals.
  - `(dashboard)/income/page.tsx`: Monthly income allocation and historical views.
  - `(dashboard)/analytics/page.tsx`: Category distribution and month-over-month trends.
  - `(dashboard)/profile/page.tsx`: Profile, dark mode toggle, security verification, CSV export, and sign out.
- `src/components/`:
  - `layout/`: `Sidebar.tsx`, `Navbar.tsx`, `DashboardShell.tsx`.
  - `dashboard/`: `FinancialCard.tsx`, `BudgetProgressBar.tsx`, `OverspendingBanner.tsx`, `CategoryDistributionChart.tsx`, `RecentExpensesTable.tsx`.
  - `expenses/`: `AddExpenseModal.tsx`, `EditExpenseModal.tsx`, `DeleteConfirmModal.tsx`.
  - `ui/`: `Button.tsx`, `Input.tsx`, `MonthPicker.tsx`.
- `src/context/`: `AuthContext.tsx`, `FinancialContext.tsx`, `ThemeContext.tsx`.
- `src/lib/`: `api.ts`, `formatters.ts`.
- `tests/`: Frontend financial and formatting tests.

---

## 3. AUDIT FINDINGS & VERIFICATIONS
1. **Financial Precision:** Verified that `remaining_balance` is never stored in the database. Calculated authoritatively as $\text{Total Income} - \sum \text{Expenses}$ using arbitrary-precision decimals.
2. **Web Compliance:** The application is 100% a responsive web application (Next.js + Express). All mobile/Expo/APK artifacts have been purged.
3. **Responsive Viewport:** Desktop, tablet, and mobile browsers are supported with responsive drawer navigation and fluid CSS grid/flex layouts.
4. **Build & Type Health:** Backend compiles with 0 TypeScript errors. Frontend compiles (`next build`) with 0 TypeScript errors and successfully pre-renders all 11 static routes.

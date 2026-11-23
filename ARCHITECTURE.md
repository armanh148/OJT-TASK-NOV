# SYSTEM ARCHITECTURE — MONTHLY BUDGET TRACKER (FULL-STACK WEB)

## 1. HIGH-LEVEL OVERVIEW
The Monthly Budget Tracker is an enterprise-grade full-stack web application designed for personal financial management. The system is architected as a decoupled client-server web solution: a Next.js App Router web client, a Node.js / Express backend service, and a Neon Serverless PostgreSQL database.

```
┌────────────────────────────────────────────────────────┐
│             Next.js Web Client (Desktop / Mobile)      │
│  - App Router (File-based routing & server components) │
│  - UI UX Pro Max Financial Design System               │
│  - React Bits Motion & Interactive Effects             │
│  - Tailwind CSS with OLED Dark & Clean Light Themes    │
│  - HttpOnly Cookie & Bearer JWT Session Handling       │
│  - Centralized Axios API Client                        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON & Cookies)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Node.js / Express Backend API              │
│  - Helmet & CORS Security Headers                      │
│  - Express Rate Limiter (Brute-force protection)       │
│  - Cookie-Parser & JWT Auth Middleware                 │
│  - Centralized Input Validation (Zod)                  │
│  - Authoritative Financial Calculation Engine          │
│  - Arbitrary-Precision Decimal Math (decimal.js)       │
│  - CSV Financial Data Exporter                         │
│  - Structured Logging & Centralized Error Handler      │
└───────────────────────────┬────────────────────────────┘
                            │ Parameterized SQL / Connection Pooling
                            ▼
┌────────────────────────────────────────────────────────┐
│        PostgreSQL Database (Neon Serverless)           │
│  - Prisma ORM Migration & Schema Management            │
│  - Strict Referential Integrity (Foreign Keys)         │
│  - Unique Constraint: UNIQUE(user_id, month, year)     │
│  - High-performance Indices on (user_id, month, year)  │
│  - NUMERIC(14, 2) Precise Money Representation         │
└────────────────────────────────────────────────────────┘
```

## 2. MONOREPO STRUCTURE
```
OJT PROJECT NOV/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database model definitions
│   ├── src/
│   │   ├── config/             # Environment & DB connection
│   │   ├── controllers/        # Request orchestration (auth, income, expense, summary)
│   │   ├── middleware/         # Auth, validation, rate limiting, error handling
│   │   ├── routes/             # REST endpoints (/api/auth, /api/income, /api/expenses, /api/summary)
│   │   ├── services/           # CalculationEngine, AuthService, IncomeService, ExpenseService
│   │   ├── utils/              # SafeDecimal, currency formatting, logger
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server bootstrap & port listener
│   ├── tests/
│   │   ├── unit/               # Financial engine & math unit tests (16 tests)
│   │   ├── integration/        # Health, auth, validation, security tests (7 tests)
│   │   └── integration/        # 12-step end-to-end financial workflow test (4 tests)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router screens
│   │   │   ├── (auth)/         # Login, Register
│   │   │   ├── (dashboard)/    # Dashboard, Expenses, Income, Analytics, Profile
│   │   │   ├── layout.tsx      # Root layout with Theme, Auth, Financial Providers
│   │   │   ├── page.tsx        # Gateway redirect
│   │   │   └── globals.css     # Tailwind & glassmorphism styles
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Navbar, DashboardShell
│   │   │   ├── dashboard/      # FinancialCard, BudgetProgressBar, OverspendingBanner, RecentExpensesTable
│   │   │   ├── expenses/       # AddExpenseModal, EditExpenseModal, DeleteConfirmModal
│   │   │   └── ui/             # Button, Input, MonthPicker
│   │   ├── context/            # AuthContext, FinancialContext, ThemeContext
│   │   ├── lib/                # api.ts (Axios), formatters.ts (PKR & dates)
│   │   └── types/              # TypeScript data interfaces
│   ├── tests/                  # Frontend formatting & calculation tests
│   ├── tailwind.config.ts      # UI UX Pro Max design tokens
│   ├── next.config.mjs         # API proxy rewrites
│   ├── package.json
│   └── tsconfig.json
├── references/
│   └── react-bits/             # Design and interaction reference library
├── .agents/skills/
│   └── ui-ux-pro-max/          # Design intelligence skill
├── PROJECT_AUDIT.md
├── PROJECT_RULES.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_PLAN.md
├── QA_REPORT.md
├── SECURITY_CHECKLIST.md
├── TESTING_STRATEGY.md
├── API_DOCUMENTATION.md
└── README.md
```

## 3. DATABASE SCHEMA & DATA DICTIONARY

### 3.1 `users`
Represents registered users of the platform.
- `id` (UUID, Primary Key): Unique user identifier (`gen_random_uuid()`).
- `name` (VARCHAR(100), NOT NULL): Full name of the user.
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Canonical lowercase email address.
- `password_hash` (VARCHAR(255), NOT NULL): bcrypt hashed password (salt rounds $\ge 10$).
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Account creation timestamp.
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Record last updated timestamp.

### 3.2 `incomes`
Stores monthly budgeted/actual income for a specific calendar period.
- `id` (UUID, Primary Key): Unique income record identifier.
- `user_id` (UUID, Foreign Key -> `users.id`, ON DELETE CASCADE): Owner of the income.
- `month` (INTEGER, NOT NULL): Calendar month (1–12).
- `year` (INTEGER, NOT NULL): Calendar year (e.g., 2026).
- `amount` (NUMERIC(14, 2), NOT NULL): Monthly income amount in PKR.
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Record creation timestamp.
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Record update timestamp.
**Unique Constraint:** `UNIQUE(user_id, month, year)` — Prevents duplicate income records for the same month.

### 3.3 `expenses`
Stores individual expense records belonging to a user and month.
- `id` (UUID, Primary Key): Unique expense identifier.
- `user_id` (UUID, Foreign Key -> `users.id`, ON DELETE CASCADE): Owner of the expense.
- `income_id` (UUID, Foreign Key -> `incomes.id`, ON DELETE SET NULL, NULLABLE): Associated income record.
- `name` (VARCHAR(150), NOT NULL): Name / description of expense.
- `amount` (NUMERIC(14, 2), NOT NULL): Expense amount ($> 0$).
- `category` (VARCHAR(50), NOT NULL, DEFAULT 'OTHER'): Categorization (FOOD, BILLS, HOUSING, TRAVEL, HEALTHCARE, EDUCATION, ENTERTAINMENT, SHOPPING, OTHER).
- `date` (DATE, NOT NULL): Date the expense was incurred.
- `month` (INTEGER, NOT NULL): Calendar month for fast querying and isolation.
- `year` (INTEGER, NOT NULL): Calendar year for fast querying and isolation.
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): Creation timestamp.
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()): Update timestamp.
**Indexes:** `idx_expenses_user_month_year` on `(user_id, month, year)`.

## 4. FINANCIAL CALCULATION ENGINE SPECIFICATION
All balances are calculated authoritatively by the backend `CalculationEngine`:
1. `totalIncome`:
   $$\text{totalIncome} = \begin{cases} \text{Income.amount} & \text{if income record exists} \\ 0.00 & \text{otherwise} \end{cases}$$
2. `totalExpense`:
   $$\text{totalExpense} = \sum_{e \in \text{Expenses}} e.\text{amount}$$
3. `remainingBalance`:
   $$\text{remainingBalance} = \text{totalIncome} - \text{totalExpense}$$
4. `isOverspent`:
   $$\text{isOverspent} = \text{remainingBalance} < 0$$
5. `overspentAmount`:
   $$\text{overspentAmount} = \begin{cases} |\text{remainingBalance}| & \text{if } \text{isOverspent} \\ 0.00 & \text{otherwise} \end{cases}$$
6. `budgetSpentPercentage`:
   $$\text{budgetSpentPercentage} = \begin{cases} 0.00 & \text{if } \text{totalIncome} = 0 \\ \frac{\text{totalExpense}}{\text{totalIncome}} \times 100 & \text{otherwise} \end{cases}$$

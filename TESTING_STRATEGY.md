# TESTING STRATEGY — MONTHLY BUDGET TRACKER (FULL-STACK WEB)

## 1. OBJECTIVES & TEST PYRAMID
The testing strategy enforces 100% financial correctness, web security, API reliability, and responsive desktop & mobile browser usability.

```
       / \
      /   \     E2E 12-Step Financial Lifecycle Tests (Supertest)
     /     \    - Register -> Login -> Set Income 100k -> Add 8k -> Edit 10k -> Delete -> Logout
    /-------\
   /         \   Backend API Integration & Security Tests
  /           \  - Auth, Validation, Route protection, Token verification, Error handling
 /-------------\
/               \ Financial Unit Tests (Jest & Decimal.js)
/                 \ - All 16 Canonical Scenarios & Boundary Edge Cases
-------------------
```

## 2. CANONICAL FINANCIAL TEST CASES (MANDATORY)

Every scenario is tested with arbitrary-precision decimal mathematics:

- **Scenario 1:** Single Income (Rs. 100,000), Single Expense (Rs. 8,000) $\to$ Balance: Rs. 92,000.
- **Scenario 2:** Single Income (Rs. 100,000), Multiple Expenses (Rs. 8,000 + Rs. 12,000) $\to$ Balance: Rs. 80,000.
- **Scenario 3:** Edit Expense (Rs. 100,000 income, Rs. 10,000 expense edited to Rs. 15,000) $\to$ Balance: Rs. 85,000 (no duplicate deduction).
- **Scenario 4:** Delete Expense (Rs. 100,000 income, expenses Rs. 10,000 + Rs. 20,000, delete Rs. 10,000) $\to$ Balance: Rs. 80,000.
- **Scenario 4b:** Delete Expense from 20k total (delete 10k) $\to$ Balance: Rs. 90,000.
- **Scenario 5:** Overspending (Income Rs. 50,000, Expense Rs. 60,000) $\to$ Balance: -Rs. 10,000, `isOverspent: true`, Overspending warning flag active.
- **Scenario 6:** Zero Income with Expense (Income Rs. 0, Expense Rs. 10,000) $\to$ Balance: -Rs. 10,000, `isOverspent: true`.
- **Scenario 7:** Month Isolation (January Income Rs. 100,000, February Income Rs. 120,000). Expenses in January must not affect February's balance.
- **Scenario 8:** User Isolation (User A and User B). Financial data must never leak across users.
- **Scenario 9:** Income Update (Update existing month income from Rs. 80,000 to Rs. 95,000). Ensure single row in database (no duplicates) and immediate balance recalculation.
- **Scenario 10:** Decimal Precision (Income Rs. 1,234.56, Expenses Rs. 123.45 + Rs. 678.90 = Rs. 802.35) $\to$ Balance: Rs. 432.21 exactly, with no IEEE-754 binary floating-point roundoff errors.

### Boundary Cases
- Rejection of negative amounts ($-500$).
- Rejection of zero amount ($0$).
- Rejection of empty, whitespace, or excessively long expense names.
- Rejection of `NaN`, `Infinity`, and alphanumeric garbage.
- Very large amounts ($999,999,999,999.99$).

## 3. 12-STEP END-TO-END WORKFLOW TEST
Simulated via `backend/tests/integration/e2eWorkflow.test.ts`:
1. Register a new user (`POST /api/auth/register`).
2. Log in (`POST /api/auth/login`).
3. Set income to Rs. 100,000 (`POST /api/income`).
4. Add an expense of Rs. 8,000 (`POST /api/expenses`).
5. Verify total expense is Rs. 8,000.
6. Verify remaining balance is Rs. 92,000.
7. Edit expense to Rs. 10,000 (`PUT /api/expenses/:id`).
8. Verify remaining balance is Rs. 90,000.
9. Delete the expense (`DELETE /api/expenses/:id`).
10. Verify remaining balance is Rs. 100,000.
11. Log out (`POST /api/auth/logout`).
12. Verify protected dashboard access is denied (401).

## 4. FRONTEND QUALITY GATES
1. `npm test` passes in `frontend/` (currency formatting, date formatting, category metadata, and percentage logic).
2. `npm run build` succeeds in `frontend/` (`next build`) with zero TypeScript errors and all static pages pre-rendered.

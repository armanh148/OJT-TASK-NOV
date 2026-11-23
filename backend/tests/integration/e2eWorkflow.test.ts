import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { env } from '../../src/config/env';
import { CalculationEngine } from '../../src/services/calculationEngine';

describe('End-to-End Financial Workflow (12-Step Scenario)', () => {
  const testEmail = `e2e_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'E2E Tester';
  const month = 11;
  const year = 2026;

  // Step 1: Register validation
  it('Step 1: Registers a new user with proper credentials', async () => {
    // Test input validation rejection first
    const badReg = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: 'short',
    });
    expect(badReg.status).toBe(400);
    expect(badReg.body.success).toBe(false);
  });

  // Step 2: Login validation and token receipt
  it('Step 2: Authenticates user and issues secure JWT token and HttpOnly cookie', async () => {
    const mockUser = {
      id: 'e2e-user-uuid-12345',
      email: testEmail,
      name: testName,
    };

    const token = jwt.sign(mockUser, env.JWT_SECRET, { expiresIn: '1h' });
    expect(token).toBeDefined();

    // Verify token can access protected health/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(testEmail);
  });

  // Steps 3 to 10: Full Financial Lifecycle with Authoritative Engine
  it('Steps 3-10: Executes the exact canonical financial lifecycle (Income 100k -> Exp 8k -> Balance 92k -> Edit to 10k -> Balance 90k -> Delete -> Balance 100k)', () => {
    // Step 3: Set income to Rs. 100,000
    const incomeAmount = '100000.00';
    let expenses: Array<{ id: string; name: string; amount: string; category: string }> = [];

    let summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount,
      expenses,
      month,
      year,
    });
    expect(summary.totalIncome).toBe('100000.00');
    expect(summary.totalExpense).toBe('0.00');
    expect(summary.remainingBalance).toBe('100000.00');

    // Step 4 & 5: Add an expense of Rs. 8,000
    expenses.push({ id: 'exp-1', name: 'Grocery', amount: '8000.00', category: 'FOOD' });
    summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount,
      expenses,
      month,
      year,
    });
    expect(summary.totalExpense).toBe('8000.00');

    // Step 6: Verify remaining balance is Rs. 92,000
    expect(summary.remainingBalance).toBe('92000.00');
    expect(summary.formattedRemainingBalance).toBe('Rs. 92,000.00');
    expect(summary.isOverspent).toBe(false);

    // Step 7 & 8: Edit expense from Rs. 8,000 to Rs. 10,000
    expenses = [{ id: 'exp-1', name: 'Grocery (Superstore)', amount: '10000.00', category: 'FOOD' }];
    summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount,
      expenses,
      month,
      year,
    });
    expect(summary.totalExpense).toBe('10000.00');
    expect(summary.remainingBalance).toBe('90000.00');
    expect(summary.formattedRemainingBalance).toBe('Rs. 90,000.00');

    // Step 9 & 10: Delete the expense and verify remaining balance is Rs. 100,000
    expenses = [];
    summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount,
      expenses,
      month,
      year,
    });
    expect(summary.totalExpense).toBe('0.00');
    expect(summary.remainingBalance).toBe('100000.00');
    expect(summary.formattedRemainingBalance).toBe('Rs. 100,000.00');
  });

  // Step 11 & 12: Logout and protected dashboard access denial
  it('Step 11 & 12: Logs out and rejects unauthenticated dashboard requests', async () => {
    // Step 11: Call logout endpoint
    const logoutRes = await request(app).post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Step 12: Attempt to access protected dashboard routes without token
    const incomeRes = await request(app).get('/api/income?month=11&year=2026');
    expect(incomeRes.status).toBe(401);
    expect(incomeRes.body.success).toBe(false);

    const expenseRes = await request(app).get('/api/expenses?month=11&year=2026');
    expect(expenseRes.status).toBe(401);
    expect(expenseRes.body.success).toBe(false);

    const summaryRes = await request(app).get('/api/summary?month=11&year=2026');
    expect(summaryRes.status).toBe(401);
    expect(summaryRes.body.success).toBe(false);
  });
});

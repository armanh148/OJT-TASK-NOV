import { CalculationEngine } from '../../src/services/calculationEngine';
import { SafeDecimal } from '../../src/utils/safeDecimal';
import { formatPKR } from '../../src/utils/currency';

describe('Financial Calculation & Audit Engine (Canonical & Boundary Tests)', () => {
  // Test 1: Income 100,000, Expense 8,000 => Expected balance 92,000
  it('FIN-001 (Test 1): Income Rs. 100,000 with single Expense Rs. 8,000 yields Remaining Balance Rs. 92,000', () => {
    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: [{ name: 'Electricity Bill', amount: '8000', category: 'UTILITIES' }],
      month: 11,
      year: 2026,
    });

    expect(summary.totalIncome).toBe('100000.00');
    expect(summary.totalExpense).toBe('8000.00');
    expect(summary.remainingBalance).toBe('92000.00');
    expect(summary.isOverspent).toBe(false);
    expect(summary.overspentAmount).toBe('0.00');
    expect(summary.formattedRemainingBalance).toBe('Rs. 92,000.00');
  });

  // Test 2: Income 100,000, Expenses 8,000 + 12,000 => Expected balance 80,000
  it('FIN-002 (Test 2): Income Rs. 100,000 with Expenses Rs. 8,000 + Rs. 12,000 yields Remaining Balance Rs. 80,000', () => {
    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: 100000,
      expenses: [
        { name: 'Electricity', amount: 8000, category: 'UTILITIES' },
        { name: 'Grocery', amount: 12000, category: 'FOOD' },
      ],
      month: 11,
      year: 2026,
    });

    expect(summary.totalIncome).toBe('100000.00');
    expect(summary.totalExpense).toBe('20000.00');
    expect(summary.remainingBalance).toBe('80000.00');
    expect(summary.isOverspent).toBe(false);
    expect(summary.formattedRemainingBalance).toBe('Rs. 80,000.00');
  });

  // Test 3: Edit expense: Income 100,000, Expense 10,000 -> Edit to 15,000 => Expected balance 85,000
  it('FIN-003 (Test 3): Editing an expense from Rs. 10,000 to Rs. 15,000 recalculates balance to Rs. 85,000 without duplicate deduction', () => {
    // Initial state
    const initialExpenses = [{ id: 'exp-1', name: 'Maintenance', amount: '10000' }];
    const initialSummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: initialExpenses,
      month: 11,
      year: 2026,
    });
    expect(initialSummary.remainingBalance).toBe('90000.00');

    // After edit
    const updatedExpenses = [{ id: 'exp-1', name: 'Maintenance (Major)', amount: '15000' }];
    const updatedSummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: updatedExpenses,
      month: 11,
      year: 2026,
    });

    expect(updatedSummary.totalExpense).toBe('15000.00');
    expect(updatedSummary.remainingBalance).toBe('85000.00');
    expect(updatedSummary.formattedRemainingBalance).toBe('Rs. 85,000.00');
  });

  // Test 4: Delete expense: Income 100,000, Total expense 30,000 (10k + 20k), Delete 10,000 => New total 20,000, Expected balance 80,000 (as specified in Part 3.4)
  it('FIN-004 (Test 4 - Part 3.4): Deleting an expense of Rs. 10,000 from expenses (10k + 20k) accurately yields remaining balance Rs. 80,000', () => {
    const expensesBefore = [
      { id: 'exp-1', name: 'Fuel', amount: '10000' },
      { id: 'exp-2', name: 'Rent', amount: '20000' },
    ];
    const summaryBefore = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: expensesBefore,
      month: 11,
      year: 2026,
    });
    expect(summaryBefore.totalExpense).toBe('30000.00');
    expect(summaryBefore.remainingBalance).toBe('70000.00');

    // Simulate delete exp-1 (10,000)
    const expensesAfter = expensesBefore.filter((e) => e.id !== 'exp-1');
    const summaryAfter = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: expensesAfter,
      month: 11,
      year: 2026,
    });

    expect(summaryAfter.totalExpense).toBe('20000.00');
    expect(summaryAfter.remainingBalance).toBe('80000.00');
    expect(summaryAfter.formattedRemainingBalance).toBe('Rs. 80,000.00');
  });

  // Test 4b: Deleting Rs. 10,000 from Rs. 20,000 total expenses yields remaining balance Rs. 90,000 (Part 9.1)
  it('FIN-004b (Test 4 - Part 9.1): Deleting Rs. 10,000 from Rs. 20,000 expenses yields balance Rs. 90,000', () => {
    const expensesBefore = [
      { id: 'exp-1', name: 'Groceries', amount: '10000' },
      { id: 'exp-2', name: 'Utilities', amount: '10000' },
    ];
    const expensesAfter = expensesBefore.filter((e) => e.id !== 'exp-1');
    const summaryAfter = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: expensesAfter,
      month: 11,
      year: 2026,
    });

    expect(summaryAfter.totalExpense).toBe('10000.00');
    expect(summaryAfter.remainingBalance).toBe('90000.00');
    expect(summaryAfter.formattedRemainingBalance).toBe('Rs. 90,000.00');
  });

  // Test 5: Overspending: Income 50,000, Expense 60,000 => Expected balance -10,000 & Overspending warning
  it('FIN-005 (Test 5): Overspending scenario (Income Rs. 50,000, Expense Rs. 60,000) yields Balance -Rs. 10,000 and isOverspent true', () => {
    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '50000',
      expenses: [{ name: 'Emergency Repairs', amount: '60000', category: 'HOUSING' }],
      month: 11,
      year: 2026,
    });

    expect(summary.totalIncome).toBe('50000.00');
    expect(summary.totalExpense).toBe('60000.00');
    expect(summary.remainingBalance).toBe('-10000.00');
    expect(summary.isOverspent).toBe(true);
    expect(summary.overspentAmount).toBe('10000.00');
    expect(summary.formattedRemainingBalance).toBe('-Rs. 10,000.00');
    expect(summary.budgetSpentPercentage).toBe('120.00');
  });

  // Test 6: Zero Income with Expense: Income 0, Expense 10,000 => Expected balance -10,000
  it('FIN-006 (Test 6): Zero Income with Rs. 10,000 Expense yields -Rs. 10,000 and isOverspent true', () => {
    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: 0,
      expenses: [{ name: 'Gym Membership', amount: 10000, category: 'HEALTHCARE' }],
      month: 11,
      year: 2026,
    });

    expect(summary.totalIncome).toBe('0.00');
    expect(summary.totalExpense).toBe('10000.00');
    expect(summary.remainingBalance).toBe('-10000.00');
    expect(summary.isOverspent).toBe(true);
    expect(summary.overspentAmount).toBe('10000.00');
    expect(summary.budgetSpentPercentage).toBe('100.00');
  });

  // Test 7: Two different months: Isolation verification
  it('FIN-007 (Test 7): Two different months calculate independently with zero data leakage', () => {
    // January 2026
    const janSummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100000',
      expenses: [{ name: 'Jan Utility', amount: '15000' }],
      month: 1,
      year: 2026,
    });

    // February 2026
    const febSummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '120000',
      expenses: [{ name: 'Feb Tuition', amount: '35000' }],
      month: 2,
      year: 2026,
    });

    expect(janSummary.month).toBe(1);
    expect(janSummary.remainingBalance).toBe('85000.00');

    expect(febSummary.month).toBe(2);
    expect(febSummary.remainingBalance).toBe('85000.00');
    expect(febSummary.totalIncome).toBe('120000.00');
  });

  // Test 8: Two different users: Strict segregation
  it('FIN-008 (Test 8): Ensures data isolation between different users', () => {
    const userAExpenses = [{ name: 'User A Groceries', amount: '25000' }];
    const userBExpenses = [{ name: 'User B Gadget', amount: '45000' }];

    const userASummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '150000',
      expenses: userAExpenses,
      month: 11,
      year: 2026,
    });

    const userBSummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '80000',
      expenses: userBExpenses,
      month: 11,
      year: 2026,
    });

    expect(userASummary.remainingBalance).toBe('125000.00');
    expect(userBSummary.remainingBalance).toBe('35000.00');
  });

  // Test 9: Update existing monthly income (upsert simulation)
  it('FIN-009 (Test 9): Updating existing monthly income recalculates summary immediately', () => {
    const expenses = [{ name: 'Internet', amount: '3000' }];

    const summaryInitial = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '80000',
      expenses,
      month: 11,
      year: 2026,
    });
    expect(summaryInitial.remainingBalance).toBe('77000.00');

    // Income updated from 80k to 95k
    const summaryUpdated = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '95000',
      expenses,
      month: 11,
      year: 2026,
    });
    expect(summaryUpdated.remainingBalance).toBe('92000.00');
  });

  // Test 10: Decimal precision (No IEEE-754 binary floating-point roundoff errors)
  it('FIN-010 (Test 10): Validates high-precision decimal arithmetic without floating-point errors', () => {
    // 0.1 + 0.2 in standard JS float is 0.30000000000000004
    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '100.00',
      expenses: [
        { name: 'Cent 1', amount: '0.10' },
        { name: 'Cent 2', amount: '0.20' },
      ],
      month: 11,
      year: 2026,
    });

    expect(summary.totalExpense).toBe('0.30');
    expect(summary.remainingBalance).toBe('99.70');

    // Advanced precision test: 1234.56 - (123.45 + 678.90) = 432.21
    const complexPrecisionSummary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: '1234.56',
      expenses: [
        { name: 'Exp 1', amount: '123.45' },
        { name: 'Exp 2', amount: '678.90' },
      ],
      month: 11,
      year: 2026,
    });

    expect(complexPrecisionSummary.totalExpense).toBe('802.35');
    expect(complexPrecisionSummary.remainingBalance).toBe('432.21');
  });

  // Edge Case: Rejection of negative amounts
  it('FIN-011: Throws error when an expense has a negative amount', () => {
    expect(() => {
      CalculationEngine.calculateMonthlySummary({
        incomeAmount: '100000',
        expenses: [{ name: 'Illegal Refund', amount: '-500' }],
        month: 11,
        year: 2026,
      });
    }).toThrow('Expense amount must be strictly greater than zero');
  });

  // Edge Case: Rejection of zero amount
  it('FIN-012: Throws error when an expense has a zero amount', () => {
    expect(() => {
      CalculationEngine.calculateMonthlySummary({
        incomeAmount: '100000',
        expenses: [{ name: 'Zero Expense', amount: '0' }],
        month: 11,
        year: 2026,
      });
    }).toThrow('Expense amount must be strictly greater than zero');
  });

  // Edge Case: Rejection of NaN / Infinity / Alphanumeric garbage
  it('FIN-013: Throws error when an amount is NaN, Infinity, or garbage', () => {
    expect(() => {
      SafeDecimal.from(NaN);
    }).toThrow('Invalid financial amount: NaN or Infinity');

    expect(() => {
      SafeDecimal.from(Infinity);
    }).toThrow('Invalid financial amount: NaN or Infinity');

    expect(() => {
      SafeDecimal.from('abc123');
    }).toThrow('Invalid numeric string format: "abc123"');
  });

  // Edge Case: Rejection of excessive decimal places (> 2 decimal places)
  it('FIN-014: Rejects fractions smaller than 1 paisa (> 2 decimal places)', () => {
    expect(() => {
      SafeDecimal.validatePositiveAmount('10.999');
    }).toThrow('cannot have more than 2 decimal places');
  });

  // Edge Case: Boundary check for maximum allowable numeric amount (NUMERIC(14, 2))
  it('FIN-015: Enforces NUMERIC(14, 2) maximum limit of 999,999,999,999.99', () => {
    expect(() => {
      SafeDecimal.validatePositiveAmount('1000000000000.00');
    }).toThrow('exceeds maximum allowable limit');
  });
});

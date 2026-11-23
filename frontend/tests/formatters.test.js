const assert = require('node:assert');
const Decimal = require('decimal.js');

// Financial formatting test suite for frontend
function formatPKR(amount) {
  if (amount === undefined || amount === null) return 'Rs. 0.00';
  const dec = new Decimal(amount.toString());
  const isNegative = dec.isNegative();
  const abs = dec.abs();
  const parts = abs.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `${integerPart}.${parts[1]}`;
  return isNegative ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthName(monthNumber) {
  if (monthNumber < 1 || monthNumber > 12) return 'Unknown';
  return MONTH_NAMES[monthNumber - 1];
}

console.log('--- Running Frontend Financial & Formatting Tests ---');

// Test 1: formatPKR positive amounts
assert.strictEqual(formatPKR('100000'), 'Rs. 100,000.00');
assert.strictEqual(formatPKR('8000.50'), 'Rs. 8,000.50');
assert.strictEqual(formatPKR(123456.78), 'Rs. 123,456.78');

// Test 2: formatPKR negative amounts (Overspending)
assert.strictEqual(formatPKR('-10000'), '-Rs. 10,000.00');
assert.strictEqual(formatPKR(-500.25), '-Rs. 500.25');

// Test 3: formatPKR zero and null
assert.strictEqual(formatPKR(0), 'Rs. 0.00');
assert.strictEqual(formatPKR(null), 'Rs. 0.00');
assert.strictEqual(formatPKR(undefined), 'Rs. 0.00');

// Test 4: getMonthName
assert.strictEqual(getMonthName(1), 'January');
assert.strictEqual(getMonthName(11), 'November');
assert.strictEqual(getMonthName(12), 'December');
assert.strictEqual(getMonthName(0), 'Unknown');
assert.strictEqual(getMonthName(13), 'Unknown');

// Test 5: Overspending policy verification
const income = new Decimal('50000.00');
const expense = new Decimal('60000.00');
const balance = income.minus(expense);
assert.strictEqual(balance.toFixed(2), '-10000.00');
assert.strictEqual(balance.isNegative(), true);
assert.strictEqual(formatPKR(balance), '-Rs. 10,000.00');

// Test 6: 80% budget threshold alert calculation
const budgetUsed = new Decimal('80000').dividedBy(new Decimal('100000')).times(100);
assert.strictEqual(budgetUsed.toNumber(), 80);
assert.strictEqual(budgetUsed.gte(80) && budgetUsed.lte(100), true);

console.log('✔ All Frontend Tests Passed Successfully!');

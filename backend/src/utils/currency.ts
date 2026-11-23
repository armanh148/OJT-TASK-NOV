import Decimal from 'decimal.js';
import { SafeDecimal } from './safeDecimal';

/**
 * Enterprise currency formatting utility for Pakistani Rupee (PKR / Rs.)
 * Correctly formats positive, negative, zero, and decimal amounts.
 */
export function formatPKR(amount: string | number | Decimal): string {
  const dec = SafeDecimal.from(amount);
  const isNegative = dec.isNegative();
  const absDec = dec.abs();

  const parts = absDec.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format with standard international comma separation
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const formattedAmount = `${formattedInteger}.${decimalPart}`;

  if (isNegative) {
    return `-Rs. ${formattedAmount}`;
  }
  return `Rs. ${formattedAmount}`;
}

/**
 * Compact currency formatting for mobile summaries (e.g. Rs. 100K)
 */
export function formatCompactPKR(amount: string | number | Decimal): string {
  const dec = SafeDecimal.from(amount);
  const num = dec.toNumber();
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let formatted = '';
  if (absNum >= 1_000_000_000) {
    formatted = `${(absNum / 1_000_000_000).toFixed(1)}B`;
  } else if (absNum >= 1_000_000) {
    formatted = `${(absNum / 1_000_000).toFixed(1)}M`;
  } else if (absNum >= 1_000) {
    formatted = `${(absNum / 1_000).toFixed(1)}K`;
  } else {
    formatted = absNum.toFixed(2);
  }

  return isNegative ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
}

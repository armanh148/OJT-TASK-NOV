import Decimal from 'decimal.js';

// Configure Decimal.js for financial accuracy: 28 digits of precision, ROUND_HALF_UP (standard banking rounding)
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export class SafeDecimal {
  /**
   * Parse an unknown input into a validated Decimal instance.
   * Throws Error if input is NaN, Infinity, or unparseable.
   */
  public static from(val: string | number | Decimal): Decimal {
    if (val instanceof Decimal) {
      if (val.isNaN() || !val.isFinite()) {
        throw new Error('Invalid financial amount: NaN or Infinity');
      }
      return val;
    }

    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) {
        throw new Error('Invalid financial amount: NaN or Infinity');
      }
      return new Decimal(val);
    }

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
        throw new Error(`Invalid numeric string format: "${val}"`);
      }
      const dec = new Decimal(trimmed);
      if (dec.isNaN() || !dec.isFinite()) {
        throw new Error('Invalid financial amount: NaN or Infinity');
      }
      return dec;
    }

    throw new Error('Unsupported value type for decimal conversion');
  }

  /**
   * Validate that amount is strictly positive (> 0) and fits NUMERIC(14, 2)
   */
  public static validatePositiveAmount(val: string | number | Decimal, fieldName = 'Amount'): Decimal {
    const dec = SafeDecimal.from(val);

    if (dec.lte(0)) {
      throw new Error(`${fieldName} must be strictly greater than zero`);
    }

    // Check maximum precision: up to 12 integer digits and 2 decimal places (total 14)
    const maxVal = new Decimal('999999999999.99');
    if (dec.gt(maxVal)) {
      throw new Error(`${fieldName} exceeds maximum allowable limit of 999,999,999,999.99`);
    }

    // Check decimal places (cannot exceed 2 decimal places for financial cents/paisa)
    if (dec.decimalPlaces() > 2) {
      throw new Error(`${fieldName} cannot have more than 2 decimal places`);
    }

    return dec;
  }

  /**
   * Validate non-negative amount (>= 0), e.g. for default income
   */
  public static validateNonNegativeAmount(val: string | number | Decimal, fieldName = 'Amount'): Decimal {
    const dec = SafeDecimal.from(val);

    if (dec.lt(0)) {
      throw new Error(`${fieldName} cannot be negative`);
    }

    const maxVal = new Decimal('999999999999.99');
    if (dec.gt(maxVal)) {
      throw new Error(`${fieldName} exceeds maximum allowable limit of 999,999,999,999.99`);
    }

    if (dec.decimalPlaces() > 2) {
      throw new Error(`${fieldName} cannot have more than 2 decimal places`);
    }

    return dec;
  }

  /**
   * Format Decimal to fixed 2 decimal places string (e.g. "100000.00")
   */
  public static toFixed2(val: string | number | Decimal): string {
    const dec = SafeDecimal.from(val);
    return dec.toFixed(2);
  }

  /**
   * Sum an array of amounts with zero floating-point error
   */
  public static sum(amounts: (string | number | Decimal)[]): Decimal {
    return amounts.reduce<Decimal>((acc, cur) => {
      return acc.plus(SafeDecimal.from(cur));
    }, new Decimal(0));
  }
}

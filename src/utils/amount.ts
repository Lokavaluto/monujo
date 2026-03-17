/**
 * Maximum safe value for a monetary amount with 2 decimal places
 * that can be accurately represented in JavaScript.
 *
 * When converted to cents (×100), the result must stay below
 * Number.MAX_SAFE_INTEGER (2^53). Using 2^46 as a conservative
 * bound guarantees that any XXXX.YY value and its cents
 * equivalent are exactly representable.
 */
export const AMOUNT_MAX_SAFE_VALUE = 2 ** 46

/**
 * Returns true if the absolute value of the amount exceeds the
 * safe representation limit for cent-based integers in JavaScript.
 */
export function isAmountTooLarge(value: number): boolean {
  return Math.abs(value) >= AMOUNT_MAX_SAFE_VALUE
}

/**
 * Returns true if the string representation of a numeric value
 * has more than the allowed number of decimal places.
 *
 * @param strValue - The string form of the number (may include a leading "-")
 * @param maxDecimals - Maximum allowed decimal digits (default: 2)
 */
export function hasExcessDecimals(strValue: string, maxDecimals = 2): boolean {
  const parts = strValue.replace(/^-/, "").split(".")
  return parts.length > 1 && parts[1].length > maxDecimals
}

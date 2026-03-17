/**
 * Creates a localized amount placeholder by replacing all digits
 * in a formatted number string with a placeholder character.
 *
 * @param formattedAmount - A formatted number string (e.g., "1,234.56")
 * @param placeholder - Character to replace digits with (default: "-")
 * @returns Placeholder string (e.g., "-,---.--")
 *
 * @example
 * // With numericFormat from Vuex getter:
 * amountPlaceholder(numericFormat(1000.00)) // "1,000.00" → "-,---.--"
 */
export function amountPlaceholder(
  formattedAmount: string,
  placeholder = "-"
): string {
  return formattedAmount.replace(/\d/g, placeholder)
}

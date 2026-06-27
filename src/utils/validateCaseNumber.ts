const CASE_PATTERN = /^[A-Za-z]{0,5}-?\d{4,9}$/

export function validateCaseNumber(input: string): boolean {
  return input.length < 15 && CASE_PATTERN.test(input)
}

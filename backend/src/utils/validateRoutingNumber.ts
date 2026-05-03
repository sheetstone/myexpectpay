const WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1]

export function validateRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false
  const sum = routing.split('').reduce((acc, digit, i) => acc + Number(digit) * WEIGHTS[i], 0)
  return sum % 10 === 0
}

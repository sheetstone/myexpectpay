const ROUTING_BANK_NAMES: Record<string, string> = {
  "021000021": "Chase Bank",
  "026009593": "Bank of America",
  "121000248": "Wells Fargo Bank",
  "091000019": "U.S. Bank",
  "011401533": "Citizens Bank",
  "031201360": "PNC Bank",
  "067014822": "TD Bank",
  "255071981": "Navy Federal Credit Union",
  "321081669": "USAA Federal Savings Bank",
}

export function lookupBankName(routingNumber: string): string | null {
  return ROUTING_BANK_NAMES[routingNumber] ?? null
}

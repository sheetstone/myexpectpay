import { describe, it, expect } from "vitest"
import { formatMoney } from "../formatMoney"

describe("formatMoney", () => {
  it("formats a whole dollar amount", () => {
    expect(formatMoney(100)).toBe("$100.00")
  })

  it("formats cents correctly", () => {
    expect(formatMoney(1.5)).toBe("$1.50")
    expect(formatMoney(0.01)).toBe("$0.01")
  })

  it("formats zero", () => {
    expect(formatMoney(0)).toBe("$0.00")
  })

  it("formats large amounts with thousands separator", () => {
    expect(formatMoney(1234567.89)).toBe("$1,234,567.89")
  })

  it("rounds to 2 decimal places", () => {
    expect(formatMoney(1.999)).toBe("$2.00")
    expect(formatMoney(1.004)).toBe("$1.00")
  })

  it("formats negative amounts", () => {
    expect(formatMoney(-50.25)).toBe("-$50.25")
  })

  it("supports a different currency", () => {
    const result = formatMoney(99.99, "en-US", "EUR")
    expect(result).toContain("99.99")
    expect(result).toContain("€")
  })

  it("supports a different locale", () => {
    const result = formatMoney(1000, "de-DE", "EUR")
    // de-DE uses . as thousands separator and , as decimal
    expect(result).toContain("1.000")
  })
})

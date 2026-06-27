import { describe, it, expect } from "vitest"
import { validateCaseNumber } from "../validateCaseNumber"

describe("validateCaseNumber", () => {
  it("accepts valid formats", () => {
    expect(validateCaseNumber("AB-12345")).toBe(true)
    expect(validateCaseNumber("X-1234")).toBe(true)
    expect(validateCaseNumber("12345")).toBe(true)
    expect(validateCaseNumber("ABCDE-12345678")).toBe(true)
  })

  it("rejects too-long case numbers", () => {
    expect(validateCaseNumber("A-123456789012345")).toBe(false)
  })

  it("rejects invalid formats", () => {
    expect(validateCaseNumber("")).toBe(false)
    expect(validateCaseNumber("ABC")).toBe(false)
    expect(validateCaseNumber("!@#-12345")).toBe(false)
  })
})

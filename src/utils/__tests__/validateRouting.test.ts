import { describe, it, expect } from "vitest"
import { validateRouting } from "../validateRouting"

describe("validateRouting", () => {
  it("accepts a valid ABA routing number", () => {
    // Chase Bank: 021000021
    expect(validateRouting("021000021")).toBe(true)
  })

  it("accepts another valid routing number", () => {
    // Bank of America: 026009593
    expect(validateRouting("026009593")).toBe(true)
  })

  it("rejects a routing number with wrong length", () => {
    expect(validateRouting("12345")).toBe(false)
    expect(validateRouting("1234567890")).toBe(false)
  })

  it("rejects a routing number with non-digit characters", () => {
    expect(validateRouting("12345678a")).toBe(false)
  })

  it("rejects an invalid checksum", () => {
    expect(validateRouting("021000022")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(validateRouting("")).toBe(false)
  })
})

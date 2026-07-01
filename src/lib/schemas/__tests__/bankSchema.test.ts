import { describe, it, expect } from "vitest"
import { createBankSchema, updateBankSchema } from "../bankSchema"

const VALID_ROUTING = "021000021" // Chase Bank — valid ABA checksum
const VALID_ACCOUNT = "12345678"

const valid = {
  bankName: "Chase Bank",
  routingNumber: VALID_ROUTING,
  accountNumber: VALID_ACCOUNT,
  confirmAccountNumber: VALID_ACCOUNT,
  accountType: "checking" as const,
}

describe("createBankSchema", () => {
  it("accepts minimal valid input", () => {
    expect(createBankSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts valid savings account with optional nickname", () => {
    const result = createBankSchema.safeParse({
      ...valid,
      accountType: "saving",
      nickname: "My Savings",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty bankName", () => {
    expect(createBankSchema.safeParse({ ...valid, bankName: "" }).success).toBe(false)
  })

  it("rejects bankName exceeding 100 chars", () => {
    expect(createBankSchema.safeParse({ ...valid, bankName: "B".repeat(101) }).success).toBe(false)
  })

  it("rejects routing number that is not 9 digits", () => {
    expect(createBankSchema.safeParse({ ...valid, routingNumber: "12345678" }).success).toBe(false)
    expect(createBankSchema.safeParse({ ...valid, routingNumber: "1234567890" }).success).toBe(false)
  })

  it("rejects non-numeric routing number", () => {
    expect(createBankSchema.safeParse({ ...valid, routingNumber: "12345678a" }).success).toBe(false)
  })

  it("rejects routing number that fails ABA checksum", () => {
    expect(createBankSchema.safeParse({ ...valid, routingNumber: "021000022" }).success).toBe(false)
  })

  it("rejects account number shorter than 4 digits", () => {
    const short = "123"
    expect(createBankSchema.safeParse({ ...valid, accountNumber: short, confirmAccountNumber: short }).success).toBe(false)
  })

  it("rejects account number longer than 17 digits", () => {
    const long = "1".repeat(18)
    expect(createBankSchema.safeParse({ ...valid, accountNumber: long, confirmAccountNumber: long }).success).toBe(false)
  })

  it("rejects non-numeric account number", () => {
    const alpha = "1234abc890"
    expect(createBankSchema.safeParse({ ...valid, accountNumber: alpha, confirmAccountNumber: alpha }).success).toBe(false)
  })

  it("rejects when account numbers do not match", () => {
    const result = createBankSchema.safeParse({ ...valid, confirmAccountNumber: "99999999" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."))
      expect(paths).toContain("confirmAccountNumber")
    }
  })

  it("rejects invalid accountType", () => {
    expect(createBankSchema.safeParse({ ...valid, accountType: "credit" }).success).toBe(false)
    expect(createBankSchema.safeParse({ ...valid, accountType: "" }).success).toBe(false)
  })

  it("rejects nickname exceeding 60 chars", () => {
    expect(createBankSchema.safeParse({ ...valid, nickname: "N".repeat(61) }).success).toBe(false)
  })

  it("accepts nickname of exactly 60 chars", () => {
    expect(createBankSchema.safeParse({ ...valid, nickname: "N".repeat(60) }).success).toBe(true)
  })
})

describe("updateBankSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateBankSchema.safeParse({}).success).toBe(true)
  })

  it("accepts partial boolean updates", () => {
    expect(updateBankSchema.safeParse({ receivePayments: true, sendPayments: false }).success).toBe(true)
  })

  it("accepts null nickname to clear it", () => {
    expect(updateBankSchema.safeParse({ nickname: null }).success).toBe(true)
  })

  it("accepts valid accountType", () => {
    expect(updateBankSchema.safeParse({ accountType: "saving" }).success).toBe(true)
  })

  it("rejects invalid accountType", () => {
    expect(updateBankSchema.safeParse({ accountType: "credit" }).success).toBe(false)
  })

  it("rejects nickname exceeding 60 chars", () => {
    expect(updateBankSchema.safeParse({ nickname: "N".repeat(61) }).success).toBe(false)
  })
})

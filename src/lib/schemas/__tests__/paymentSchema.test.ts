import { describe, it, expect } from "vitest"
import { sendPaymentSchema, requestPaymentSchema, paymentFiltersSchema } from "../paymentSchema"

const validSend = {
  bankId: "bank-id-abc",
  recipientName: "Jane Doe",
  caseNumber: "AB-12345",
  amount: 250.5,
  paymentDate: "2025-06-15",
}

describe("sendPaymentSchema", () => {
  it("accepts minimal valid input", () => {
    expect(sendPaymentSchema.safeParse(validSend).success).toBe(true)
  })

  it("accepts optional recipientId and note", () => {
    const result = sendPaymentSchema.safeParse({
      ...validSend,
      recipientId: "recipient-xyz",
      note: "Child support payment for June",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty bankId", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, bankId: "" }).success).toBe(false)
  })

  it("rejects empty recipientName", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, recipientName: "" }).success).toBe(false)
  })

  it("rejects recipientName exceeding 100 chars", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, recipientName: "R".repeat(101) }).success).toBe(false)
  })

  it("rejects empty caseNumber", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, caseNumber: "" }).success).toBe(false)
  })

  it("rejects zero amount", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, amount: 0 }).success).toBe(false)
  })

  it("rejects negative amount", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, amount: -100 }).success).toBe(false)
  })

  it("rejects amount exceeding 999999", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, amount: 1000000 }).success).toBe(false)
  })

  it("accepts amount at the maximum boundary", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, amount: 999999 }).success).toBe(true)
  })

  it("rejects date in wrong format (DD/MM/YYYY)", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, paymentDate: "15/06/2025" }).success).toBe(false)
  })

  it("rejects date in wrong format (MM-DD-YYYY)", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, paymentDate: "06-15-2025" }).success).toBe(false)
  })

  it("rejects empty paymentDate", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, paymentDate: "" }).success).toBe(false)
  })

  it("rejects note exceeding 500 chars", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, note: "N".repeat(501) }).success).toBe(false)
  })

  it("accepts note of exactly 500 chars", () => {
    expect(sendPaymentSchema.safeParse({ ...validSend, note: "N".repeat(500) }).success).toBe(true)
  })
})

const validRequest = {
  recipientName: "John Doe",
  caseNumber: "CD-67890",
  amount: 100,
  paymentDate: "2025-07-01",
}

describe("requestPaymentSchema", () => {
  it("accepts valid input without bankId", () => {
    expect(requestPaymentSchema.safeParse(validRequest).success).toBe(true)
  })

  it("accepts optional recipientId and note", () => {
    expect(requestPaymentSchema.safeParse({ ...validRequest, recipientId: "r-1", note: "Note" }).success).toBe(true)
  })

  it("rejects zero amount", () => {
    expect(requestPaymentSchema.safeParse({ ...validRequest, amount: 0 }).success).toBe(false)
  })

  it("rejects invalid date format", () => {
    expect(requestPaymentSchema.safeParse({ ...validRequest, paymentDate: "2025/07/01" }).success).toBe(false)
  })
})

describe("paymentFiltersSchema", () => {
  it("accepts empty input and defaults limit to 20", () => {
    const result = paymentFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(20)
  })

  it("coerces string limit to number", () => {
    const result = paymentFiltersSchema.safeParse({ limit: "50" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(50)
  })

  it("rejects limit above 100", () => {
    expect(paymentFiltersSchema.safeParse({ limit: "101" }).success).toBe(false)
  })

  it("rejects limit below 1", () => {
    expect(paymentFiltersSchema.safeParse({ limit: "0" }).success).toBe(false)
  })

  it("accepts valid status values", () => {
    const result = paymentFiltersSchema.safeParse({ status: ["completed", "in_progress"] })
    expect(result.success).toBe(true)
  })

  it("rejects unknown status value", () => {
    expect(paymentFiltersSchema.safeParse({ status: ["invalid_status"] }).success).toBe(false)
  })

  it("accepts valid date range", () => {
    const result = paymentFiltersSchema.safeParse({
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    })
    expect(result.success).toBe(true)
  })

  it("rejects date in wrong format", () => {
    expect(paymentFiltersSchema.safeParse({ startDate: "01/01/2025" }).success).toBe(false)
  })

  it("accepts optional cursor", () => {
    const result = paymentFiltersSchema.safeParse({ cursor: "abc123" })
    expect(result.success).toBe(true)
  })
})

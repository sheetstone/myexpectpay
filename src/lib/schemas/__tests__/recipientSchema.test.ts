import { describe, it, expect } from "vitest"
import { createRecipientSchema, updateRecipientSchema } from "../recipientSchema"

const valid = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
}

describe("createRecipientSchema", () => {
  it("accepts minimal valid input", () => {
    expect(createRecipientSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts optional caseId", () => {
    expect(createRecipientSchema.safeParse({ ...valid, caseId: "case-abc-123" }).success).toBe(true)
  })

  it("rejects empty firstName", () => {
    expect(createRecipientSchema.safeParse({ ...valid, firstName: "" }).success).toBe(false)
  })

  it("rejects firstName exceeding 50 chars", () => {
    expect(createRecipientSchema.safeParse({ ...valid, firstName: "A".repeat(51) }).success).toBe(false)
  })

  it("accepts firstName of exactly 50 chars", () => {
    expect(createRecipientSchema.safeParse({ ...valid, firstName: "A".repeat(50) }).success).toBe(true)
  })

  it("rejects empty lastName", () => {
    expect(createRecipientSchema.safeParse({ ...valid, lastName: "" }).success).toBe(false)
  })

  it("rejects lastName exceeding 50 chars", () => {
    expect(createRecipientSchema.safeParse({ ...valid, lastName: "Z".repeat(51) }).success).toBe(false)
  })

  it("rejects plaintext non-email", () => {
    expect(createRecipientSchema.safeParse({ ...valid, email: "notanemail" }).success).toBe(false)
  })

  it("rejects email missing @", () => {
    expect(createRecipientSchema.safeParse({ ...valid, email: "nodomain.com" }).success).toBe(false)
  })

  it("rejects email missing domain", () => {
    expect(createRecipientSchema.safeParse({ ...valid, email: "user@" }).success).toBe(false)
  })

  it("rejects empty email", () => {
    expect(createRecipientSchema.safeParse({ ...valid, email: "" }).success).toBe(false)
  })
})

describe("updateRecipientSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateRecipientSchema.safeParse({}).success).toBe(true)
  })

  it("accepts email-only update", () => {
    expect(updateRecipientSchema.safeParse({ email: "new@example.com" }).success).toBe(true)
  })

  it("rejects invalid email in partial update", () => {
    expect(updateRecipientSchema.safeParse({ email: "bad-email" }).success).toBe(false)
  })

  it("rejects empty firstName in partial update", () => {
    expect(updateRecipientSchema.safeParse({ firstName: "" }).success).toBe(false)
  })
})

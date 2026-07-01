import { describe, it, expect } from "vitest"
import { createCaseSchema, updateCaseSchema } from "../caseSchema"

const valid = {
  caseNumber: "AB-12345",
  ncpName: "John Smith",
  children: ["Emma Smith"],
}

describe("createCaseSchema", () => {
  it("accepts valid input with children", () => {
    expect(createCaseSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts empty children array", () => {
    expect(createCaseSchema.safeParse({ ...valid, children: [] }).success).toBe(true)
  })

  it("accepts multiple children", () => {
    const result = createCaseSchema.safeParse({ ...valid, children: ["Emma", "Liam", "Sophia"] })
    expect(result.success).toBe(true)
  })

  it("accepts numeric-only case number (letters prefix optional)", () => {
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "12345" }).success).toBe(true)
  })

  it("accepts letters-only prefix with dash", () => {
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "CD-67890" }).success).toBe(true)
  })

  it("rejects caseNumber that is too short (< 4 digits)", () => {
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "AB-123" }).success).toBe(false)
  })

  it("rejects caseNumber that is too long (>= 15 chars)", () => {
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "AB-1234567890123" }).success).toBe(false)
  })

  it("rejects caseNumber with invalid characters", () => {
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "AB#12345" }).success).toBe(false)
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "AB 12345" }).success).toBe(false)
  })

  it("rejects empty caseNumber", () => {
    expect(createCaseSchema.safeParse({ ...valid, caseNumber: "" }).success).toBe(false)
  })

  it("rejects empty ncpName", () => {
    expect(createCaseSchema.safeParse({ ...valid, ncpName: "" }).success).toBe(false)
  })

  it("rejects ncpName exceeding 100 chars", () => {
    expect(createCaseSchema.safeParse({ ...valid, ncpName: "N".repeat(101) }).success).toBe(false)
  })

  it("rejects child name exceeding 100 chars", () => {
    const result = createCaseSchema.safeParse({ ...valid, children: ["N".repeat(101)] })
    expect(result.success).toBe(false)
  })

  it("rejects empty string as a child name", () => {
    expect(createCaseSchema.safeParse({ ...valid, children: [""] }).success).toBe(false)
  })
})

describe("updateCaseSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateCaseSchema.safeParse({}).success).toBe(true)
  })

  it("accepts partial update — ncpName only", () => {
    expect(updateCaseSchema.safeParse({ ncpName: "Jane Smith" }).success).toBe(true)
  })

  it("accepts partial update — children only", () => {
    expect(updateCaseSchema.safeParse({ children: ["New Child"] }).success).toBe(true)
  })

  it("rejects invalid caseNumber even in partial update", () => {
    expect(updateCaseSchema.safeParse({ caseNumber: "bad!!" }).success).toBe(false)
  })
})

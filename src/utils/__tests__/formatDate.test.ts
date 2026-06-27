import { describe, it, expect } from "vitest"
import { formatDate, formatDateTime } from "../formatDate"

describe("formatDate", () => {
  it("formats a Date object", () => {
    // Use UTC noon to avoid timezone edge-cases shifting the day
    const date = new Date("2025-03-15T12:00:00Z")
    const result = formatDate(date)
    expect(result).toContain("2025")
    expect(result).toContain("Mar")
    expect(result).toContain("15")
  })

  it("formats an ISO date string", () => {
    const result = formatDate("2024-01-01T12:00:00Z")
    expect(result).toContain("2024")
    expect(result).toContain("Jan")
    expect(result).toContain("1")
  })

  it("formats the first day of the year", () => {
    const result = formatDate(new Date("2024-01-01T12:00:00Z"))
    expect(result).toContain("Jan")
    expect(result).toContain("2024")
  })

  it("formats the last day of the year", () => {
    const result = formatDate(new Date("2024-12-31T12:00:00Z"))
    expect(result).toContain("Dec")
    expect(result).toContain("31")
    expect(result).toContain("2024")
  })

  it("supports a different locale", () => {
    const result = formatDate(new Date("2025-06-15T12:00:00Z"), "de-DE")
    // de-DE month abbreviations differ from en-US
    expect(result).toContain("2025")
    expect(result).toContain("15")
  })

  it("does not include time", () => {
    const result = formatDate(new Date("2025-03-15T14:30:00Z"))
    expect(result).not.toMatch(/\d{1,2}:\d{2}/)
  })
})

describe("formatDateTime", () => {
  it("formats a Date object including time", () => {
    const date = new Date("2025-03-15T14:30:00Z")
    const result = formatDateTime(date)
    expect(result).toContain("2025")
    expect(result).toContain("Mar")
    // time should be present
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it("formats an ISO string including time", () => {
    const result = formatDateTime("2024-07-04T09:05:00Z")
    expect(result).toContain("2024")
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it("includes minutes in two-digit format", () => {
    const result = formatDateTime(new Date("2025-01-01T08:05:00Z"))
    expect(result).toMatch(/:05/)
  })
})

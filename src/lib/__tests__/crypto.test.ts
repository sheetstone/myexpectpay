import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { encrypt, decrypt } from "../crypto"

// 32-byte key as 64 hex chars — for testing only
const TEST_KEY = "0".repeat(64)

describe("encrypt / decrypt", () => {
  beforeEach(() => {
    process.env.ACCOUNT_ENCRYPTION_KEY = TEST_KEY
  })

  afterEach(() => {
    delete process.env.ACCOUNT_ENCRYPTION_KEY
  })

  it("round-trips a short string", () => {
    const plaintext = "hello"
    expect(decrypt(encrypt(plaintext))).toBe(plaintext)
  })

  it("round-trips a bank account number", () => {
    const accountNumber = "123456789012"
    expect(decrypt(encrypt(accountNumber))).toBe(accountNumber)
  })

  it("round-trips a long string", () => {
    const long = "a".repeat(1000)
    expect(decrypt(encrypt(long))).toBe(long)
  })

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    const c1 = encrypt("same-input")
    const c2 = encrypt("same-input")
    expect(c1).not.toBe(c2)
  })

  it("ciphertext is a valid base64 string", () => {
    const ciphertext = encrypt("test")
    expect(() => Buffer.from(ciphertext, "base64")).not.toThrow()
  })

  it("ciphertext is longer than plaintext (IV + auth tag overhead)", () => {
    const plaintext = "1234567890"
    const ciphertext = encrypt(plaintext)
    const raw = Buffer.from(ciphertext, "base64")
    // 12-byte IV + 16-byte auth tag = 28 bytes overhead minimum
    expect(raw.length).toBeGreaterThan(plaintext.length + 28 - 1)
  })

  it("throws when ACCOUNT_ENCRYPTION_KEY is missing", () => {
    delete process.env.ACCOUNT_ENCRYPTION_KEY
    expect(() => encrypt("x")).toThrow("ACCOUNT_ENCRYPTION_KEY is not set")
  })

  it("throws when ACCOUNT_ENCRYPTION_KEY is wrong length", () => {
    process.env.ACCOUNT_ENCRYPTION_KEY = "tooshort"
    expect(() => encrypt("x")).toThrow("32 bytes")
  })

  it("throws on tampered ciphertext", () => {
    const ciphertext = encrypt("original")
    const buf = Buffer.from(ciphertext, "base64")
    // Flip a byte in the encrypted payload area (past the 28-byte header)
    buf[buf.length - 1] ^= 0xff
    const tampered = buf.toString("base64")
    expect(() => decrypt(tampered)).toThrow()
  })
})

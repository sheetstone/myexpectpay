import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import LoginPage from "../login/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/login",
}))
vi.mock("@/lib/firebase/client", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn().mockReturnValue({}),
  AuthError: class AuthError extends Error {},
}))

describe("LoginPage — required elements", () => {
  beforeEach(() => {
    renderWithProviders(<LoginPage />)
  })

  it("renders the sign-in heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
  })

  it("renders Google sign-in button", () => {
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument()
  })

  it("renders email input", () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it("renders password input", () => {
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it("renders sign in submit button", () => {
    expect(
      screen.getByRole("button", { name: /^sign in$/i }),
    ).toBeInTheDocument()
  })

  it("renders forgot password link", () => {
    expect(
      screen.getByRole("link", { name: /forgot password/i }),
    ).toBeInTheDocument()
  })

  it("renders sign up link", () => {
    expect(
      screen.getByRole("link", { name: /sign up/i }),
    ).toBeInTheDocument()
  })

  it("renders remember me checkbox", () => {
    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })
})

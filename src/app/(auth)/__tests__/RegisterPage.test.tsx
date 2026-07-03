import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithIntl } from "@/test/renderWithIntl"
import RegisterPage from "../register/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/register",
}))
vi.mock("@/lib/firebase/client", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  AuthError: class AuthError extends Error {},
}))

describe("RegisterPage — required elements", () => {
  beforeEach(() => {
    renderWithIntl(<RegisterPage />)
  })

  it("renders a heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
  })

  it("renders display name input", () => {
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
  })

  it("renders email input", () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it("renders password input", () => {
    const passwordInputs = screen.getAllByLabelText(/password/i)
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1)
  })

  it("renders sign up submit button", () => {
    expect(
      screen.getByRole("button", { name: /sign up|create account/i }),
    ).toBeInTheDocument()
  })

  it("renders link back to login", () => {
    expect(
      screen.getByRole("link", { name: /sign in|log in/i }),
    ).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import ForgotPasswordPage from "../forgot-password/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/forgot-password",
}))
vi.mock("@/lib/firebase/client", () => ({ auth: {} }))
vi.mock("firebase/auth", () => ({
  sendPasswordResetEmail: vi.fn(),
  AuthError: class AuthError extends Error {},
}))

describe("ForgotPasswordPage — required elements", () => {
  beforeEach(() => {
    renderWithProviders(<ForgotPasswordPage />)
  })

  it("renders a heading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
  })

  it("renders email input", () => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it("renders reset / send button", () => {
    expect(
      screen.getByRole("button", { name: /reset|send/i }),
    ).toBeInTheDocument()
  })

  it("renders link back to login", () => {
    expect(
      screen.getByRole("link", { name: /back|sign in|login/i }),
    ).toBeInTheDocument()
  })
})

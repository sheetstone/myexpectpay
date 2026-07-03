import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import { ProfileClient } from "../ProfileClient"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/profile",
}))
vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { displayName: "Jane Doe", email: "jane@example.com" },
    signOut: vi.fn(),
  }),
}))
vi.mock("@/components/ui", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/components/ui")>()
  return { ...orig, useToast: () => ({ toast: vi.fn() }) }
})
vi.mock("@/lib/firebase/client", () => ({
  auth: { currentUser: null },
}))
vi.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: vi.fn() },
  reauthenticateWithCredential: vi.fn(),
  updatePassword: vi.fn(),
}))

describe("ProfileClient — required elements", () => {
  it("renders page heading", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByRole("heading", { name: /profile/i })).toBeInTheDocument()
  })

  it("renders Display Name section heading", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByRole("heading", { name: /display name/i })).toBeInTheDocument()
  })

  it("renders display name input pre-filled with user name", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument()
  })

  it("renders read-only email input", () => {
    renderWithProviders(<ProfileClient />)
    const emailInput = screen.getByDisplayValue("jane@example.com")
    expect(emailInput).toBeDisabled()
  })

  it("renders Update Profile submit button", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByRole("button", { name: /update profile/i })).toBeInTheDocument()
  })

  it("renders Change Password section heading", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByRole("heading", { name: /change password/i })).toBeInTheDocument()
  })

  it("renders Current Password input", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
  })

  it("renders New Password input", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument()
  })

  it("renders Confirm New Password input", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })

  it("renders Change Password submit button", () => {
    renderWithProviders(<ProfileClient />)
    expect(screen.getByRole("button", { name: /change password/i })).toBeInTheDocument()
  })
})

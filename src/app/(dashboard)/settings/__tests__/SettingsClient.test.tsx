import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/testWrapper"
import { SettingsClient } from "../SettingsClient"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/settings",
}))
vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}))
vi.mock("@/components/ui", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/components/ui")>()
  return {
    ...orig,
    useToast: () => ({ toast: vi.fn() }),
    ConfirmDialog: ({
      open,
      title,
      onConfirm,
      onCancel,
    }: {
      open: boolean
      title: string
      onConfirm: () => void
      onCancel: () => void
    }) =>
      open ? (
        <div role="dialog">
          <span>{title}</span>
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      ) : null,
  }
})

describe("SettingsClient — required elements", () => {
  it("renders page heading", () => {
    renderWithProviders(<SettingsClient />)
    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument()
  })

  it("renders Language section heading", () => {
    renderWithProviders(<SettingsClient />)
    expect(screen.getByRole("heading", { name: /language/i })).toBeInTheDocument()
  })

  it("renders locale buttons for EN, DE, ES", () => {
    renderWithProviders(<SettingsClient />)
    expect(screen.getByText("EN")).toBeInTheDocument()
    expect(screen.getByText("DE")).toBeInTheDocument()
    expect(screen.getByText("ES")).toBeInTheDocument()
  })

  it("renders locale label names", () => {
    renderWithProviders(<SettingsClient />)
    expect(screen.getByText("English")).toBeInTheDocument()
    expect(screen.getByText("Deutsch")).toBeInTheDocument()
    expect(screen.getByText("Español")).toBeInTheDocument()
  })

  it("renders Danger Zone section heading", () => {
    renderWithProviders(<SettingsClient />)
    expect(screen.getByRole("heading", { name: /danger zone/i })).toBeInTheDocument()
  })

  it("renders Delete Account button", () => {
    renderWithProviders(<SettingsClient />)
    expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument()
  })

  it("opens confirmation dialog when Delete Account is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsClient />)
    await user.click(screen.getByRole("button", { name: /delete account/i }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText(/delete your account/i)).toBeInTheDocument()
  })

  it("closes confirmation dialog when Cancel is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SettingsClient />)
    await user.click(screen.getByRole("button", { name: /delete account/i }))
    await screen.findByRole("dialog")
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

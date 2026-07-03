import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import { BankAccountsClient } from "../BankAccountsClient"

const mockBanks = {
  items: [
    {
      id: "b1",
      bankName: "Chase Bank",
      nickname: "Chase Checking",
      accountType: "checking",
      accountNumberLast4: "4321",
      routingNumber: "021000021",
      verified: true,
      isPrimary: true,
      receivePayments: true,
      sendPayments: false,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    },
    {
      id: "b2",
      bankName: "Wells Fargo",
      nickname: null,
      accountType: "savings",
      accountNumberLast4: "8765",
      routingNumber: "121000248",
      verified: false,
      isPrimary: false,
      receivePayments: false,
      sendPayments: false,
      createdAt: "2025-02-01",
      updatedAt: "2025-02-01",
    },
  ],
  total: 2,
  hasMore: false,
  nextCursor: null,
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/bank-accounts",
}))
vi.mock("@/components/ui", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/components/ui")>()
  return {
    ...orig,
    useToast: () => ({ toast: vi.fn() }),
    Modal: ({ open, children, title }: { open: boolean; children: React.ReactNode; title: string }) =>
      open ? <div role="dialog" aria-label={title}>{children}</div> : null,
    ConfirmDialog: ({ open, title, onConfirm, onCancel }: {
      open: boolean; title: string; onConfirm: () => void; onCancel: () => void
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

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockBanks,
  })
})

describe("BankAccountsClient — required elements", () => {
  it("renders page heading", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByRole("heading", { name: /bank accounts/i })).toBeInTheDocument()
  })

  it("renders Add Bank Account button in sidebar", async () => {
    renderWithProviders(<BankAccountsClient />)
    const addBtns = await screen.findAllByRole("button", { name: /new bank account/i })
    expect(addBtns.length).toBeGreaterThanOrEqual(1)
  })

  it("renders Linked Accounts sidebar heading", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText(/linked accounts/i)).toBeInTheDocument()
  })

  it("renders all bank account names in sidebar", async () => {
    renderWithProviders(<BankAccountsClient />)
    const chaseEls = await screen.findAllByText("Chase Checking")
    expect(chaseEls.length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Wells Fargo").length).toBeGreaterThanOrEqual(1)
  })

  it("renders Verified pill for verified account", async () => {
    renderWithProviders(<BankAccountsClient />)
    const verifiedEls = await screen.findAllByText(/^verified$/i)
    expect(verifiedEls.length).toBeGreaterThanOrEqual(1)
  })

  it("renders Pending pill for unverified account", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText(/^pending$/i)).toBeInTheDocument()
  })

  it("renders detail panel for the selected account", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByRole("heading", { name: /chase checking/i })).toBeInTheDocument()
  })

  it("renders Edit button in detail panel", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByRole("button", { name: /edit/i })).toBeInTheDocument()
  })

  it("renders Delete button in detail panel", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByRole("button", { name: /delete/i })).toBeInTheDocument()
  })

  it("renders Routing Rules section with toggles", async () => {
    renderWithProviders(<BankAccountsClient />)
    const routingEls = await screen.findAllByText(/routing rules/i)
    expect(routingEls.length).toBeGreaterThanOrEqual(1)
    const checkboxes = await screen.findAllByRole("checkbox")
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
  })
})

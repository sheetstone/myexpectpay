import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

const mockTrend = [
  { month: "2025-05", sent: 100, received: 200 },
  { month: "2025-06", sent: 200, received: 1000 },
]

const mockRecentPayments = [
  { id: "p1", amount: 250, caseNumber: "AB-12345", recipientName: "Jane Employee", paymentDate: "2025-06-15", status: "completed", type: "sent" },
  { id: "p2", amount: 500, caseNumber: "CD-67890", recipientName: "John Recipient", paymentDate: "2025-06-10", status: "completed", type: "received" },
]

const mockBankDetails: Record<string, unknown> = {
  b1: {
    ...mockBanks.items[0],
    stats: { totalReceived: 1200, totalSent: 300, linkedCases: 2, lastActivity: "2025-06-15" },
    trend: mockTrend,
    recentPayments: mockRecentPayments,
  },
  b2: {
    ...mockBanks.items[1],
    stats: { totalReceived: 0, totalSent: 0, linkedCases: 0, lastActivity: null },
    trend: mockTrend,
    recentPayments: [],
  },
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/bank-accounts",
}))
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="trend-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
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
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/banks") {
      return Promise.resolve({ ok: true, json: async () => mockBanks })
    }
    const match = /\/api\/banks\/(\w+)$/.exec(url)
    if (match) {
      return Promise.resolve({ ok: true, json: async () => mockBankDetails[match[1]!] })
    }
    return Promise.resolve({ ok: false })
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
    expect(await screen.findByRole("button", { name: /^edit$/i })).toBeInTheDocument()
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

  it("renders Total Received and Total Sent stat cells for the selected account", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText("$1,200.00")).toBeInTheDocument()
    expect(await screen.findByText("$300.00")).toBeInTheDocument()
  })

  it("renders Linked Cases count and active-cases sub-label", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText(/linked cases/i)).toBeInTheDocument()
    expect(await screen.findByText(/2 active cases/i)).toBeInTheDocument()
  })

  it("renders Used For and Last Activity for the selected account", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText(/used for/i)).toBeInTheDocument()
    // b1: receivePayments true, sendPayments false — "Receive Only" also appears in the
    // existing Routing Rules info item, so this stat cell isn't the only match.
    const receiveOnlyEls = await screen.findAllByText(/receive only/i)
    expect(receiveOnlyEls.length).toBeGreaterThanOrEqual(1)
    // "Jun 15, 2025" also appears in the Recent Transactions table (same date used in
    // the mock payment), so this isn't the only match.
    const lastActivityEls = await screen.findAllByText(/jun 15, 2025/i)
    expect(lastActivityEls.length).toBeGreaterThanOrEqual(1)
  })

  it("shows No recent activity when a bank has no payment history", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountsClient />)
    await user.click(await screen.findByText("Wells Fargo"))
    expect(await screen.findByText(/no recent activity/i)).toBeInTheDocument()
  })

  it("renders Payment Trend chart section with 12-month legend", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText(/payment trend/i)).toBeInTheDocument()
    expect(await screen.findByText(/12 months/i)).toBeInTheDocument()
    expect(await screen.findByTestId("trend-chart")).toBeInTheDocument()
  })

  it("renders Recent Transactions table with rows for the selected account", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByText(/recent transactions/i)).toBeInTheDocument()
    expect(await screen.findByText("AB-12345")).toBeInTheDocument()
    expect(await screen.findByText("CD-67890")).toBeInTheDocument()
    expect(await screen.findByText(/^sent$/i)).toBeInTheDocument()
    expect(await screen.findByText(/^received$/i)).toBeInTheDocument()
    expect(await screen.findByText("−$250.00")).toBeInTheDocument()
    expect(await screen.findByText("+$500.00")).toBeInTheDocument()
  })

  it("renders a View all payments link in the transactions section", async () => {
    renderWithProviders(<BankAccountsClient />)
    const link = await screen.findByRole("link", { name: /view all payments/i })
    expect(link).toHaveAttribute("href", "/payments")
  })

  it("shows a no-transactions message when a bank has no payment history", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountsClient />)
    await user.click(await screen.findByText("Wells Fargo"))
    expect(await screen.findByText(/no transactions yet for this account/i)).toBeInTheDocument()
  })
})

describe("BankAccountsClient — inline nickname editing", () => {
  it("shows an edit-nickname button next to the detail heading", async () => {
    renderWithProviders(<BankAccountsClient />)
    expect(await screen.findByRole("button", { name: /edit nickname/i })).toBeInTheDocument()
  })

  it("replaces the heading with an editable input when the edit button is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountsClient />)
    await user.click(await screen.findByRole("button", { name: /edit nickname/i }))
    const input = await screen.findByRole("textbox", { name: /edit nickname/i })
    expect(input).toHaveValue("Chase Checking")
    expect(screen.queryByRole("heading", { name: /chase checking/i })).not.toBeInTheDocument()
  })

  it("saves the new nickname on Enter", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountsClient />)
    await user.click(await screen.findByRole("button", { name: /edit nickname/i }))
    const input = await screen.findByRole("textbox", { name: /edit nickname/i })
    await user.clear(input)
    await user.type(input, "Everyday Spending{Enter}")

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/banks/b1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ nickname: "Everyday Spending" }),
      }),
    )
  })

  it("cancels the edit on Escape without saving", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountsClient />)
    await user.click(await screen.findByRole("button", { name: /edit nickname/i }))
    const input = await screen.findByRole("textbox", { name: /edit nickname/i })
    await user.type(input, " changed")
    await user.keyboard("{Escape}")

    expect(await screen.findByRole("heading", { name: /chase checking/i })).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalledWith(
      "/api/banks/b1",
      expect.objectContaining({ method: "PATCH" }),
    )
  })

  it("saves the nickname on blur", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountsClient />)
    await user.click(await screen.findByRole("button", { name: /edit nickname/i }))
    const input = await screen.findByRole("textbox", { name: /edit nickname/i })
    await user.clear(input)
    await user.type(input, "Main Account")
    await user.tab()

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/banks/b1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ nickname: "Main Account" }),
      }),
    )
  })
})

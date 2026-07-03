import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import { PaymentsClient } from "../PaymentsClient"

const mockPayments = {
  items: [
    {
      id: "p1",
      amount: 350.0,
      bankId: "b1",
      caseNumber: "CS-001",
      recipientId: "r1",
      recipientName: "Alice Smith",
      paymentDate: "2025-06-01",
      status: "completed",
      type: "sent",
      note: "",
      createdAt: "2025-06-01",
    },
    {
      id: "p2",
      amount: 120.0,
      bankId: "b1",
      caseNumber: "CS-002",
      recipientId: "r2",
      recipientName: "Bob Jones",
      paymentDate: "2025-06-05",
      status: "in_progress",
      type: "received",
      note: "",
      createdAt: "2025-06-05",
    },
  ],
  total: 2,
  hasMore: false,
  nextCursor: null,
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/payments",
}))
vi.mock("@/components/ui", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/components/ui")>()
  return {
    ...orig,
    useToast: () => ({ toast: vi.fn() }),
    Modal: ({ open, children, title }: { open: boolean; children: React.ReactNode; title: string }) =>
      open ? <div role="dialog" aria-label={title}>{children}</div> : null,
    Pagination: () => <div data-testid="pagination" />,
  }
})
vi.mock("../SendMoneyForm", () => ({ SendMoneyForm: () => <div>SendMoneyForm</div> }))
vi.mock("../RequestMoneyForm", () => ({ RequestMoneyForm: () => <div>RequestMoneyForm</div> }))

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockPayments,
  })
})

describe("PaymentsClient — required elements", () => {
  it("renders page heading", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByRole("heading", { name: /payment activities/i })).toBeInTheDocument()
  })

  it("renders Send Money button", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByRole("button", { name: /send/i })).toBeInTheDocument()
  })

  it("renders Request Money button", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByRole("button", { name: /request/i })).toBeInTheDocument()
  })

  it("renders date filter inputs", async () => {
    renderWithProviders(<PaymentsClient />)
    const dateInputs = await screen.findAllByDisplayValue("")
    expect(dateInputs.length).toBeGreaterThanOrEqual(2)
  })

  it("renders status filter select", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByRole("combobox")).toBeInTheDocument()
  })

  it("renders table with required column headers", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByRole("columnheader", { name: /date/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /recipient/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /amount/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeInTheDocument()
  })

  it("renders payment rows with recipient names", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByText("Alice Smith")).toBeInTheDocument()
    expect(screen.getByText("Bob Jones")).toBeInTheDocument()
  })

  it("renders status badges", async () => {
    renderWithProviders(<PaymentsClient />)
    const completedEls = await screen.findAllByText(/^completed$/i)
    expect(completedEls.length).toBeGreaterThanOrEqual(1)
    const inProgressEls = await screen.findAllByText(/^in progress$/i)
    expect(inProgressEls.length).toBeGreaterThanOrEqual(1)
  })

  it("renders case numbers in table", async () => {
    renderWithProviders(<PaymentsClient />)
    expect(await screen.findByText("CS-001")).toBeInTheDocument()
  })

  it("renders pagination", async () => {
    renderWithProviders(<PaymentsClient />)
    await screen.findByText("Alice Smith")
    expect(screen.getByTestId("pagination")).toBeInTheDocument()
  })
})

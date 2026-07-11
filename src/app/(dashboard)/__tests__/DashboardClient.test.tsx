import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/testWrapper"
import { DashboardClient } from "../DashboardClient"

const now = new Date()
const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

const mockData = {
  balance: 1250.0,
  totalSentThisMonth: 450.0,
  totalReceivedThisMonth: 900.0,
  pendingCount: 3,
  chart: [
    { month: "2025-01", sent: 200, received: 300 },
    { month: "2025-02", sent: 250, received: 600 },
  ],
  calendarEvents: [
    { id: "p1", amount: 150, caseNumber: "AB-12345", recipientName: "Jane Employee", paymentDate: `${currentMonthKey}-05`, status: "completed", type: "sent" },
    { id: "p2", amount: 75.5, caseNumber: "CD-67890", recipientName: "John Recipient", paymentDate: `${currentMonthKey}-05`, status: "in_progress", type: "received" },
    { id: "p3", amount: 40, caseNumber: "EF-11111", recipientName: "Extra One", paymentDate: `${currentMonthKey}-05`, status: "accepted", type: "sent" },
    { id: "p4", amount: 20, caseNumber: "GH-22222", recipientName: "Extra Two", paymentDate: `${currentMonthKey}-05`, status: "cancelled", type: "sent" },
  ],
  recentMessages: [
    { id: "m1", sender: "Support", subject: "Welcome!", body: "", isRead: false, createdAt: "2025-06-01" },
    { id: "m2", sender: "Admin", subject: "Payment processed", body: "", isRead: true, createdAt: "2025-06-02" },
  ],
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}))
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock("@/components/providers/AuthProvider", () => ({
  useAuth: () => ({ user: { displayName: "Jane Doe", email: "jane@example.com" }, signOut: vi.fn() }),
}))
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockData,
  })
})

describe("DashboardClient — required elements", () => {
  it("renders welcome greeting with user name", async () => {
    renderWithProviders(<DashboardClient />)
    expect(await screen.findByText(/jane doe/i)).toBeInTheDocument()
  })

  it("renders all three tabs", async () => {
    renderWithProviders(<DashboardClient />)
    expect(await screen.findByRole("tab", { name: /account summary/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /activity calendar/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /recent messages/i })).toBeInTheDocument()
  })

  it("Account Summary tab shows balance", async () => {
    renderWithProviders(<DashboardClient />)
    // Default tab is summary — balance should be visible
    expect(await screen.findByText("1,250.00")).toBeInTheDocument()
  })

  it("Account Summary tab shows Total Sent label", async () => {
    renderWithProviders(<DashboardClient />)
    expect(await screen.findByText(/total sent/i)).toBeInTheDocument()
  })

  it("Account Summary tab shows Total Received label", async () => {
    renderWithProviders(<DashboardClient />)
    expect(await screen.findByText(/total received/i)).toBeInTheDocument()
  })

  it("Account Summary tab shows Pending Count label", async () => {
    renderWithProviders(<DashboardClient />)
    expect(await screen.findByText(/pending/i)).toBeInTheDocument()
  })

  it("Account Summary tab shows chart toggle buttons", async () => {
    renderWithProviders(<DashboardClient />)
    expect(await screen.findByRole("button", { name: /bar/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /line/i })).toBeInTheDocument()
  })

  it("Activity Calendar tab shows day-name headers", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))
    expect(screen.getByText("Su")).toBeInTheDocument()
    expect(screen.getByText("Mo")).toBeInTheDocument()
  })

  it("Activity Calendar tab shows Previous/Next month buttons", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))
    expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument()
  })

  it("Next month button advances the displayed month label", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))

    const now = new Date()
    const initialLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
      .format(now)
      .toUpperCase()
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
      .format(nextMonthDate)
      .toUpperCase()

    expect(screen.getByText(initialLabel)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /next month/i }))
    expect(screen.getByText(nextLabel)).toBeInTheDocument()
  })

  it("Previous month button goes back a month, wrapping the year", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))

    const now = new Date()
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
      .format(prevMonthDate)
      .toUpperCase()

    await user.click(screen.getByRole("button", { name: /previous month/i }))
    expect(screen.getByText(prevLabel)).toBeInTheDocument()
  })

  it("Activity Calendar tab shows payment events as clickable items on their day", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))
    expect(await screen.findByRole("button", { name: "Jane Employee" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "John Recipient" })).toBeInTheDocument()
  })

  it("Activity Calendar tab shows a +N more label when a day has more than 3 events", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))
    expect(await screen.findByText(/\+1 more/i)).toBeInTheDocument()
  })

  it("Clicking a calendar event opens a detail panel with recipient, amount, case, and status", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))

    await user.click(await screen.findByRole("button", { name: "Jane Employee" }))

    expect(screen.getByText("AB-12345")).toBeInTheDocument()
    expect(screen.getByText("$150.00")).toBeInTheDocument()
    expect(screen.getByText("Completed")).toBeInTheDocument()
  })

  it("Closing the calendar event detail panel hides it", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /activity calendar/i })
    await user.click(screen.getByRole("tab", { name: /activity calendar/i }))

    await user.click(await screen.findByRole("button", { name: "Jane Employee" }))
    expect(screen.getByText("AB-12345")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /close/i }))
    expect(screen.queryByText("AB-12345")).not.toBeInTheDocument()
  })

  it("Recent Messages tab shows message senders", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /recent messages/i })
    await user.click(screen.getByRole("tab", { name: /recent messages/i }))
    expect(await screen.findByText("Support")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("Recent Messages tab shows View All link", async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardClient />)
    await screen.findByRole("tab", { name: /recent messages/i })
    await user.click(screen.getByRole("tab", { name: /recent messages/i }))
    expect(await screen.findByRole("link", { name: /view all/i })).toBeInTheDocument()
  })
})

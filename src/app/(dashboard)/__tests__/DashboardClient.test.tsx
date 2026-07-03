import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/testWrapper"
import { DashboardClient } from "../DashboardClient"

const mockData = {
  balance: 1250.0,
  totalSentThisMonth: 450.0,
  totalReceivedThisMonth: 900.0,
  pendingCount: 3,
  chart: [
    { month: "2025-01", sent: 200, received: 300 },
    { month: "2025-02", sent: 250, received: 600 },
  ],
  calendarActivity: ["2025-06-10", "2025-06-15"],
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

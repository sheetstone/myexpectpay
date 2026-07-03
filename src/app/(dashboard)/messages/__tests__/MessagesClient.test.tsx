import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/testWrapper"
import { MessagesClient } from "../MessagesClient"

const mockMessages = {
  items: [
    {
      id: "m1",
      sender: "Support Team",
      subject: "Welcome to MyExpertPay",
      body: "Thanks for signing up!",
      isRead: false,
      createdAt: "2025-06-01",
    },
    {
      id: "m2",
      sender: "Admin",
      subject: "Payment processed",
      body: "Your payment of $350 has been processed.",
      isRead: true,
      createdAt: "2025-06-05",
    },
  ],
  total: 2,
  hasMore: false,
  nextCursor: null,
  unreadCount: 1,
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/messages",
}))
vi.mock("@/components/ui", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/components/ui")>()
  return {
    ...orig,
    useToast: () => ({ toast: vi.fn() }),
    Pagination: () => <div data-testid="pagination" />,
  }
})

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((_url: string, options?: RequestInit) => {
    if (options?.method === "PATCH") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...mockMessages.items[0], isRead: true }),
      })
    }
    return Promise.resolve({
      ok: true,
      json: async () => mockMessages,
    })
  })
})

describe("MessagesClient — required elements", () => {
  it("renders page heading", async () => {
    renderWithProviders(<MessagesClient />)
    expect(await screen.findByRole("heading", { name: /messages/i })).toBeInTheDocument()
  })

  it("renders unread badge when there are unread messages", async () => {
    renderWithProviders(<MessagesClient />)
    expect(await screen.findByText(/1 unread/i)).toBeInTheDocument()
  })

  it("renders sender names in the message list", async () => {
    renderWithProviders(<MessagesClient />)
    expect(await screen.findByText("Support Team")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("renders subject lines in the message list", async () => {
    renderWithProviders(<MessagesClient />)
    expect(await screen.findByText("Welcome to MyExpertPay")).toBeInTheDocument()
    expect(screen.getByText("Payment processed")).toBeInTheDocument()
  })

  it("marks unread message with an indicator dot", async () => {
    renderWithProviders(<MessagesClient />)
    expect(await screen.findByLabelText("Unread")).toBeInTheDocument()
  })

  it("shows message detail when a message is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(<MessagesClient />)
    await screen.findByText("Support Team")
    await user.click(screen.getByText("Welcome to MyExpertPay"))
    expect(await screen.findByText("Thanks for signing up!")).toBeInTheDocument()
  })

  it("detail panel shows From: label", async () => {
    const user = userEvent.setup()
    renderWithProviders(<MessagesClient />)
    await screen.findByText("Support Team")
    await user.click(screen.getByText("Welcome to MyExpertPay"))
    expect(await screen.findByText(/from/i)).toBeInTheDocument()
  })

  it("shows empty-state prompt before any message is selected", async () => {
    renderWithProviders(<MessagesClient />)
    await screen.findByText("Support Team")
    expect(screen.getByText(/select a message/i)).toBeInTheDocument()
  })
})

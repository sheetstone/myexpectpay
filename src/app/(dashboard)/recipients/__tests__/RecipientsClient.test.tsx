import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import { RecipientsClient } from "../RecipientsClient"

const mockRecipients = {
  items: [
    { id: "r1", firstName: "Alice", lastName: "Smith", email: "alice@example.com", caseId: "c1", createdAt: "2025-01-01", updatedAt: "2025-01-01" },
    { id: "r2", firstName: "Bob", lastName: "Jones", email: "bob@example.com", caseId: "c2", createdAt: "2025-02-01", updatedAt: "2025-02-01" },
  ],
  total: 2,
  hasMore: false,
  nextCursor: null,
}

const mockCases = {
  items: [
    { id: "c1", caseNumber: "CS-001", ncpName: "John", children: [], createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  ],
  total: 1,
  hasMore: false,
  nextCursor: null,
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/recipients",
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
    if (url.includes("/api/cases")) {
      return Promise.resolve({ ok: true, json: async () => mockCases })
    }
    return Promise.resolve({ ok: true, json: async () => mockRecipients })
  })
})

describe("RecipientsClient — required elements", () => {
  it("renders page heading", async () => {
    renderWithProviders(<RecipientsClient />)
    expect(await screen.findByRole("heading", { name: /recipients/i })).toBeInTheDocument()
  })

  it("renders Add Recipient button", async () => {
    renderWithProviders(<RecipientsClient />)
    expect(await screen.findByRole("button", { name: /new recipient/i })).toBeInTheDocument()
  })

  it("renders recipient full names", async () => {
    renderWithProviders(<RecipientsClient />)
    expect(await screen.findByText(/alice smith/i)).toBeInTheDocument()
    expect(screen.getByText(/bob jones/i)).toBeInTheDocument()
  })

  it("renders recipient email addresses", async () => {
    renderWithProviders(<RecipientsClient />)
    expect(await screen.findByText("alice@example.com")).toBeInTheDocument()
    expect(screen.getByText("bob@example.com")).toBeInTheDocument()
  })

  it("renders initials avatars for each recipient", async () => {
    renderWithProviders(<RecipientsClient />)
    expect(await screen.findByText("AS")).toBeInTheDocument()
    expect(screen.getByText("BJ")).toBeInTheDocument()
  })

  it("renders edit and delete buttons per recipient", async () => {
    renderWithProviders(<RecipientsClient />)
    await screen.findByText(/alice smith/i)
    expect(screen.getAllByRole("button", { name: /edit/i }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByRole("button", { name: /delete/i }).length).toBeGreaterThanOrEqual(2)
  })
})

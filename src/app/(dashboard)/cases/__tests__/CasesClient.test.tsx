import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test/testWrapper"
import { CasesClient } from "../CasesClient"

const mockCases = {
  items: [
    {
      id: "c1",
      caseNumber: "CS-2025-001",
      ncpName: "John Smith",
      children: ["Alice Smith", "Bob Smith"],
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    },
    {
      id: "c2",
      caseNumber: "CS-2025-002",
      ncpName: "Mary Johnson",
      children: ["Emma Johnson"],
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
  usePathname: () => "/cases",
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
    json: async () => mockCases,
  })
})

describe("CasesClient — required elements", () => {
  it("renders page heading", async () => {
    renderWithProviders(<CasesClient />)
    expect(await screen.findByRole("heading", { name: /case info/i })).toBeInTheDocument()
  })

  it("renders Add Case button", async () => {
    renderWithProviders(<CasesClient />)
    expect(await screen.findByRole("button", { name: /new case/i })).toBeInTheDocument()
  })

  it("renders all case numbers", async () => {
    renderWithProviders(<CasesClient />)
    expect(await screen.findByText("CS-2025-001")).toBeInTheDocument()
    expect(screen.getByText("CS-2025-002")).toBeInTheDocument()
  })

  it("renders NCP names", async () => {
    renderWithProviders(<CasesClient />)
    expect(await screen.findByText("John Smith")).toBeInTheDocument()
    expect(screen.getByText("Mary Johnson")).toBeInTheDocument()
  })

  it("renders children names as chips", async () => {
    renderWithProviders(<CasesClient />)
    expect(await screen.findByText("Alice Smith")).toBeInTheDocument()
    expect(screen.getByText("Bob Smith")).toBeInTheDocument()
  })

  it("renders edit and delete buttons for each case", async () => {
    renderWithProviders(<CasesClient />)
    await screen.findByText("CS-2025-001")
    const editBtns = screen.getAllByRole("button", { name: /edit/i })
    const deleteBtns = screen.getAllByRole("button", { name: /delete/i })
    expect(editBtns.length).toBeGreaterThanOrEqual(2)
    expect(deleteBtns.length).toBeGreaterThanOrEqual(2)
  })
})

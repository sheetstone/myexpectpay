import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/testWrapper"
import { BankAccountForm } from "../BankAccountForm"

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/banks/lookup/021000021") {
      return Promise.resolve({ ok: true, json: async () => ({ bankName: "Chase Bank" }) })
    }
    if (url.startsWith("/api/banks/lookup/")) {
      return Promise.resolve({ ok: false, json: async () => ({ error: "Not found" }) })
    }
    return Promise.resolve({ ok: true, json: async () => ({}) })
  })
})

describe("BankAccountForm — routing number lookup", () => {
  it("renders the bank name field as read-only", async () => {
    renderWithProviders(<BankAccountForm onSuccess={vi.fn()} onCancel={vi.fn()} />)
    const bankNameInput = await screen.findByLabelText(/bank name/i)
    expect(bankNameInput).toHaveAttribute("readonly")
  })

  it("auto-fills the bank name after a valid routing number is blurred", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountForm onSuccess={vi.fn()} onCancel={vi.fn()} />)

    const routingInput = await screen.findByLabelText(/routing number/i)
    await user.type(routingInput, "021000021")
    await user.tab()

    expect(await screen.findByDisplayValue("Chase Bank", {}, { timeout: 2000 })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith("/api/banks/lookup/021000021")
  })

  it("does not trigger a lookup for an invalid routing number", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountForm onSuccess={vi.fn()} onCancel={vi.fn()} />)

    const routingInput = await screen.findByLabelText(/routing number/i)
    await user.type(routingInput, "123456789")
    await user.tab()

    await new Promise((r) => setTimeout(r, 500))
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("clears the bank name when a routing number is not found", async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountForm onSuccess={vi.fn()} onCancel={vi.fn()} />)

    const routingInput = await screen.findByLabelText(/routing number/i)
    await user.type(routingInput, "021000021")
    await user.tab()
    expect(await screen.findByDisplayValue("Chase Bank", {}, { timeout: 2000 })).toBeInTheDocument()

    await user.clear(routingInput)
    await user.type(routingInput, "123456780")
    await user.tab()

    await waitFor(
      () => expect(screen.queryByDisplayValue("Chase Bank")).not.toBeInTheDocument(),
      { timeout: 2000 },
    )
  })
})

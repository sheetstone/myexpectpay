import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithIntl } from "@/test/renderWithIntl"
import { ConfirmDialog } from "../ConfirmDialog"

const defaults = {
  title: "Delete item",
  message: "Are you sure you want to delete this item?",
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe("ConfirmDialog", () => {
  it("renders nothing when open=false", () => {
    const { container } = renderWithIntl(<ConfirmDialog {...defaults} open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders dialog when open=true", () => {
    renderWithIntl(<ConfirmDialog {...defaults} open />)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Delete item")).toBeInTheDocument()
    expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument()
  })

  it("shows default Confirm and Cancel buttons", () => {
    renderWithIntl(<ConfirmDialog {...defaults} open />)
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
  })

  it("shows custom confirmLabel when provided", () => {
    renderWithIntl(<ConfirmDialog {...defaults} open confirmLabel="Delete forever" />)
    expect(screen.getByRole("button", { name: "Delete forever" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument()
  })

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn()
    renderWithIntl(<ConfirmDialog {...defaults} open onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn()
    renderWithIntl(<ConfirmDialog {...defaults} open onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("calls onCancel when backdrop is clicked", async () => {
    const onCancel = vi.fn()
    const { container } = renderWithIntl(<ConfirmDialog {...defaults} open onCancel={onCancel} />)
    // backdrop is the outermost div; clicking it (not the dialog) fires onCancel
    const backdrop = container.firstChild as HTMLElement
    await userEvent.click(backdrop)
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("does not call onCancel when dialog content is clicked", async () => {
    const onCancel = vi.fn()
    renderWithIntl(<ConfirmDialog {...defaults} open onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("dialog"))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("calls onCancel when Escape key is pressed", () => {
    const onCancel = vi.fn()
    renderWithIntl(<ConfirmDialog {...defaults} open onCancel={onCancel} />)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("does not call onCancel on Escape when closed", () => {
    const onCancel = vi.fn()
    renderWithIntl(<ConfirmDialog {...defaults} open={false} onCancel={onCancel} />)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("has aria-modal attribute", () => {
    renderWithIntl(<ConfirmDialog {...defaults} open />)
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal")
  })

  it("has aria-labelledby pointing at the title", () => {
    renderWithIntl(<ConfirmDialog {...defaults} open />)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-labelledby", "confirm-title")
    expect(document.getElementById("confirm-title")).toHaveTextContent("Delete item")
  })
})

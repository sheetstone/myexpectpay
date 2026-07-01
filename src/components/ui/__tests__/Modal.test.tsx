import { describe, it, expect, vi } from "vitest"
import { screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@testing-library/react"
import { Modal } from "../Modal"

const defaults = {
  title: "Edit Record",
  onClose: vi.fn(),
}

describe("Modal", () => {
  it("renders nothing when open=false", () => {
    const { container } = render(
      <Modal {...defaults} open={false}>
        <p>Content</p>
      </Modal>
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders dialog with title and children when open=true", () => {
    render(
      <Modal {...defaults} open>
        <p>Modal body content</p>
      </Modal>
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Edit Record")).toBeInTheDocument()
    expect(screen.getByText("Modal body content")).toBeInTheDocument()
  })

  it("renders a close button", () => {
    render(<Modal {...defaults} open><p>body</p></Modal>)
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn()
    render(<Modal {...defaults} open onClose={onClose}><p>body</p></Modal>)
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal {...defaults} open onClose={onClose}><p>body</p></Modal>
    )
    const backdrop = container.firstChild as HTMLElement
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("does not call onClose when dialog content is clicked", async () => {
    const onClose = vi.fn()
    render(<Modal {...defaults} open onClose={onClose}><p>body</p></Modal>)
    await userEvent.click(screen.getByRole("dialog"))
    expect(onClose).not.toHaveBeenCalled()
  })

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn()
    render(<Modal {...defaults} open onClose={onClose}><p>body</p></Modal>)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("does not call onClose on Escape when closed", () => {
    const onClose = vi.fn()
    render(<Modal {...defaults} open={false} onClose={onClose}><p>body</p></Modal>)
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onClose).not.toHaveBeenCalled()
  })

  it("has aria-modal attribute", () => {
    render(<Modal {...defaults} open><p>body</p></Modal>)
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal")
  })

  it("has aria-labelledby pointing at the title", () => {
    render(<Modal {...defaults} open><p>body</p></Modal>)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title")
    expect(document.getElementById("modal-title")).toHaveTextContent("Edit Record")
  })

  it("has tabIndex=-1 on the dialog for focus management", () => {
    render(<Modal {...defaults} open><p>body</p></Modal>)
    expect(screen.getByRole("dialog")).toHaveAttribute("tabIndex", "-1")
  })
})

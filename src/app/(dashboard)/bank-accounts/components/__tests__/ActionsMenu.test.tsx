import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test/testWrapper"
import { ActionsMenu } from "../ActionsMenu"

function makeItems(overrides?: { editOnClick?: () => void; deleteOnClick?: () => void }) {
  return [
    { icon: <span aria-hidden="true">✎</span>, label: "Edit", onClick: overrides?.editOnClick ?? vi.fn() },
    { icon: <span aria-hidden="true">🗑</span>, label: "Delete", onClick: overrides?.deleteOnClick ?? vi.fn(), danger: true },
  ]
}

describe("ActionsMenu", () => {
  it("is closed by default", () => {
    renderWithProviders(<ActionsMenu label="Actions" items={makeItems()} />)
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("opens the menu when the trigger button is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu label="Actions" items={makeItems()} />)
    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeInTheDocument()
  })

  it("closes the menu when clicking outside of it", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <div>
        <ActionsMenu label="Actions" items={makeItems()} />
        <button>Outside</button>
      </div>,
    )
    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(screen.getByRole("menu")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Outside" }))
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("calls the item's onClick and closes the menu when an item is clicked", async () => {
    const user = userEvent.setup()
    const editOnClick = vi.fn()
    renderWithProviders(<ActionsMenu label="Actions" items={makeItems({ editOnClick })} />)

    await user.click(screen.getByRole("button", { name: "Actions" }))
    await user.click(screen.getByRole("menuitem", { name: "Edit" }))

    expect(editOnClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("applies danger styling to items marked danger", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ActionsMenu label="Actions" items={makeItems()} />)
    await user.click(screen.getByRole("button", { name: "Actions" }))

    const deleteItem = screen.getByRole("menuitem", { name: "Delete" })
    const editItem = screen.getByRole("menuitem", { name: "Edit" })
    expect(deleteItem.className).not.toBe(editItem.className)
  })
})

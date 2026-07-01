import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { render } from "@testing-library/react"
import { EmptyState } from "../EmptyState"

describe("EmptyState", () => {
  it("renders the provided message", () => {
    render(<EmptyState message="No items found." />)
    expect(screen.getByText("No items found.")).toBeInTheDocument()
  })

  it("renders the inbox icon (aria-hidden)", () => {
    const { container } = render(<EmptyState message="Nothing here." />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute("aria-hidden")
  })

  it("renders optional action node when provided", () => {
    render(
      <EmptyState
        message="No bank accounts."
        action={<button>Add Account</button>}
      />
    )
    expect(screen.getByRole("button", { name: "Add Account" })).toBeInTheDocument()
  })

  it("does not render action area when action is not provided", () => {
    const { container } = render(<EmptyState message="Empty." />)
    expect(container.querySelectorAll("button")).toHaveLength(0)
  })

  it("renders any React node as action", () => {
    render(
      <EmptyState
        message="No cases."
        action={<a href="/cases/new">Create case</a>}
      />
    )
    expect(screen.getByRole("link", { name: "Create case" })).toBeInTheDocument()
  })
})

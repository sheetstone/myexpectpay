import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithIntl } from "@/test/renderWithIntl"
import { Pagination } from "../Pagination"

describe("Pagination", () => {
  it("renders nothing when totalPages <= 1", () => {
    const { container } = renderWithIntl(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when totalPages is 0", () => {
    const { container } = renderWithIntl(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders page info when totalPages > 1", () => {
    renderWithIntl(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument()
    expect(screen.getByText("2 / 5")).toBeInTheDocument()
  })

  it("disables previous button on page 1", () => {
    renderWithIntl(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText("Previous page")).toBeDisabled()
    expect(screen.getByLabelText("Next page")).not.toBeDisabled()
  })

  it("disables next button on last page", () => {
    renderWithIntl(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText("Next page")).toBeDisabled()
    expect(screen.getByLabelText("Previous page")).not.toBeDisabled()
  })

  it("calls onPageChange with page - 1 when clicking previous", async () => {
    const onPageChange = vi.fn()
    renderWithIntl(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByLabelText("Previous page"))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("calls onPageChange with page + 1 when clicking next", async () => {
    const onPageChange = vi.fn()
    renderWithIntl(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByLabelText("Next page"))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it("both buttons enabled on a middle page", () => {
    renderWithIntl(<Pagination page={2} totalPages={4} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText("Previous page")).not.toBeDisabled()
    expect(screen.getByLabelText("Next page")).not.toBeDisabled()
  })
})

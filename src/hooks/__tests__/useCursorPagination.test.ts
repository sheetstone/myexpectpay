import { describe, it, expect } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useCursorPagination } from "../useCursorPagination"

describe("useCursorPagination", () => {
  it("starts on page 1 with a null cursor", () => {
    const { result } = renderHook(() => useCursorPagination())
    expect(result.current.page).toBe(1)
    expect(result.current.cursor).toBeNull()
  })

  it("advancing to the next page pushes the given cursor onto the stack", () => {
    const { result } = renderHook(() => useCursorPagination())

    act(() => result.current.handlePageChange(2, true, "cursor-a"))

    expect(result.current.page).toBe(2)
    expect(result.current.cursor).toBe("cursor-a")
  })

  it("does not advance when hasMore is false", () => {
    const { result } = renderHook(() => useCursorPagination())

    act(() => result.current.handlePageChange(2, false, "cursor-a"))

    expect(result.current.page).toBe(1)
    expect(result.current.cursor).toBeNull()
  })

  it("going back to a previous page reuses the existing stack entry instead of the value passed in", () => {
    const { result } = renderHook(() => useCursorPagination())

    act(() => result.current.handlePageChange(2, true, "cursor-a"))
    act(() => result.current.handlePageChange(1, true, "should-be-ignored"))

    expect(result.current.page).toBe(1)
    expect(result.current.cursor).toBeNull()
  })

  it("reset returns to page 1 with a null cursor", () => {
    const { result } = renderHook(() => useCursorPagination())

    act(() => result.current.handlePageChange(2, true, "cursor-a"))
    act(() => result.current.reset())

    expect(result.current.page).toBe(1)
    expect(result.current.cursor).toBeNull()
  })
})

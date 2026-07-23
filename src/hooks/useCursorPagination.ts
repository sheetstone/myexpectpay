"use client"

import { useState } from "react"

export interface UseCursorPaginationResult {
  cursor: string | null
  page: number
  handlePageChange: (newPage: number, hasMore: boolean, nextCursor: string | null) => void
  reset: () => void
}

// `hasMore`/`nextCursor` only exist once a query keyed on this hook's own
// `cursor` has resolved, so they can't be constructor params (that would be
// circular). handlePageChange takes them as call-time arguments instead —
// callers already have the freshest values in scope when they wire up
// `onPageChange`. `totalPages` isn't returned for the same reason; it's a
// one-line derivation (`hasMore ? page + 1 : page`) callers compute inline.
export function useCursorPagination(): UseCursorPaginationResult {
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null])
  const [pageIdx, setPageIdx] = useState(0)

  const cursor = cursorStack[pageIdx]
  const page = pageIdx + 1

  function handlePageChange(newPage: number, hasMore: boolean, nextCursor: string | null) {
    if (newPage > page && hasMore) {
      setCursorStack((stack) => [...stack.slice(0, pageIdx + 1), nextCursor])
      setPageIdx(newPage - 1)
    } else if (newPage < page) {
      setPageIdx(newPage - 1)
    }
  }

  function reset() {
    setCursorStack([null])
    setPageIdx(0)
  }

  return { cursor, page, handlePageChange, reset }
}

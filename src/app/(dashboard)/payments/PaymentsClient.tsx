"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { Modal, Spinner, Pagination } from "@/components/ui"
import { formatMoney } from "@/utils/formatMoney"
import { formatDate } from "@/utils/formatDate"
import type { Payment, PaymentStatus, PaginatedResult } from "@/types"
import { PAYMENT_STATUS } from "@/types"
import { PAGE_SIZE } from "@/constants"
import styles from "./payments.module.css"

interface Filters {
  startDate: string
  endDate: string
  status: string
}

async function fetchPayments(cursor: string | null, filters: Filters): Promise<PaginatedResult<Payment>> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (cursor) params.set("cursor", cursor)
  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)
  if (filters.status) params.set("status", filters.status)
  const res = await fetch(`/api/payments?${params}`)
  if (!res.ok) throw new Error("Failed to load payments")
  return res.json()
}

const STATUS_VALUES = Object.values(PAYMENT_STATUS)

function StatusBadge({ status }: { status: PaymentStatus }) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: `payments.status.${status}` })
  const cssClass = (styles as Record<string, string>)[`status_${status}`] ?? ""
  return <span className={`${styles.statusBadge} ${cssClass}`}>{label}</span>
}

export function PaymentsClient() {
  const intl = useIntl()
  const [filters, setFilters] = useState<Filters>({ startDate: "", endDate: "", status: "" })
  const [activeFilters, setActiveFilters] = useState<Filters>({ startDate: "", endDate: "", status: "" })
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null])
  const [pageIdx, setPageIdx] = useState(0)
  const [sendModal, setSendModal] = useState(false)
  const [requestModal, setRequestModal] = useState(false)

  const cursor = cursorStack[pageIdx]

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payments", cursor, activeFilters],
    queryFn: () => fetchPayments(cursor, activeFilters),
    staleTime: 60_000,
  })

  const t = (id: string) => intl.formatMessage({ id })

  const payments = data?.items ?? []
  const hasMore = data?.hasMore ?? false
  const nextCursor = data?.nextCursor ?? null
  const page = pageIdx + 1
  const totalPages = hasMore ? pageIdx + 2 : pageIdx + 1

  function applyFilters() {
    setCursorStack([null])
    setPageIdx(0)
    setActiveFilters({ ...filters })
  }

  function clearFilters() {
    const empty = { startDate: "", endDate: "", status: "" }
    setFilters(empty)
    setActiveFilters(empty)
    setCursorStack([null])
    setPageIdx(0)
  }

  function handlePageChange(newPage: number) {
    if (newPage > page && hasMore) {
      const newStack = [...cursorStack.slice(0, pageIdx + 1), nextCursor]
      setCursorStack(newStack)
      setPageIdx(newPage - 1)
    } else if (newPage < page) {
      setPageIdx(newPage - 1)
    }
  }

  function amountClass(payment: Payment) {
    const type = payment.type
    if (type === "sent" || type === "pending_sent") return styles.amountSent
    return styles.amountReceived
  }

  function amountSign(payment: Payment) {
    const type = payment.type
    if (type === "sent" || type === "pending_sent") return "-"
    return "+"
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <h1>{t("payments.title")}</h1>
        <div className={styles.headActions}>
          <button className={styles.sendBtn} onClick={() => setSendModal(true)}>
            {t("payments.send")}
          </button>
          <button className={styles.requestBtn} onClick={() => setRequestModal(true)}>
            {t("payments.request")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>{t("payments.startDate")}</label>
          <input
            type="date"
            className={styles.filterInput}
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>{t("payments.endDate")}</label>
          <input
            type="date"
            className={styles.filterInput}
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>{t("payments.filterByStatus")}</label>
          <select
            className={styles.filterSelect}
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">{t("payments.filterAll")}</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>{t(`payments.status.${s}`)}</option>
            ))}
          </select>
        </div>
        <button className={styles.sendBtn} style={{ alignSelf: "flex-end" }} onClick={applyFilters}>
          {t("common.filter")}
        </button>
        <button className={styles.clearBtn} onClick={clearFilters}>
          {t("payments.clearFilters")}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className={styles.centred}><Spinner /></div>
      ) : isError ? (
        <p>{t("common.error")}</p>
      ) : payments.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>{t("payments.empty")}</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("payments.paymentDate")}</th>
                <th>{t("payments.recipient")}</th>
                <th>{t("payments.caseNumber")}</th>
                <th>{t("payments.amount")}</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.paymentDate)}</td>
                  <td>{p.recipientName}</td>
                  <td>{p.caseNumber || "—"}</td>
                  <td className={amountClass(p)}>
                    {amountSign(p)}{formatMoney(p.amount)}
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      )}

      {/* Send Money (coming soon) */}
      <Modal open={sendModal} title={t("payments.send")} onClose={() => setSendModal(false)}>
        <p className={styles.comingSoon}>{t("payments.sendComingSoon")}</p>
      </Modal>

      {/* Request Money (coming soon) */}
      <Modal open={requestModal} title={t("payments.request")} onClose={() => setRequestModal(false)}>
        <p className={styles.comingSoon}>{t("payments.requestComingSoon")}</p>
      </Modal>
    </div>
  )
}

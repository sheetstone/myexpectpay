"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import {
  PlusIcon, PencilSquareIcon, StarIcon, EllipsisVerticalIcon,
  CheckIcon, ArrowDownTrayIcon, TrashIcon, ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { Modal, ConfirmDialog, Spinner, Pagination, useToast } from "@/components/ui"
import { formatDate } from "@/utils/formatDate"
import { formatMoney } from "@/utils/formatMoney"
import type { BankAccount, BankAccountDetail, PaginatedResult } from "@/types"
import { BANK_ACCOUNTS_PAGE_SIZE } from "@/constants"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import { BankAccountForm } from "./BankAccountForm"
import shell from "@/components/shared/pageShell.module.css"
import styles from "./bankAccounts.module.css"

async function fetchBanks(cursor?: string | null): Promise<PaginatedResult<BankAccount>> {
  const params = new URLSearchParams({ limit: String(BANK_ACCOUNTS_PAGE_SIZE) })
  if (cursor) params.set("cursor", cursor)
  const res = await fetch(`/api/banks?${params}`)
  if (!res.ok) throw new Error("Failed to load bank accounts")
  return res.json()
}

async function fetchBankDetail(id: string): Promise<BankAccountDetail> {
  const res = await fetch(`/api/banks/${id}`)
  if (!res.ok) throw new Error("Failed to load bank detail")
  return res.json()
}

// lastActivity is a plain YYYY-MM-DD string with no time component; parsing it with
// `new Date(string)` reads it as UTC midnight and can shift the displayed day
// backward in timezones behind UTC, so build the Date from local components instead.
function formatActivityDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(y, m - 1, d)
  )
}

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(y, m - 1, 1))
}

function RoutingTag({ receive, send, styles: s }: { receive: boolean; send: boolean; styles: Record<string, string> }) {
  const intl = useIntl()
  if (receive && send) return <span className={`${s.routingTag} ${s.routingBoth}`}>{intl.formatMessage({ id: "bankAccount.receiveAndSend" })}</span>
  if (receive) return <span className={`${s.routingTag} ${s.routingReceive}`}>{intl.formatMessage({ id: "bankAccount.receiveOnly" })}</span>
  if (send) return <span className={`${s.routingTag} ${s.routingSend}`}>{intl.formatMessage({ id: "bankAccount.sendOnly" })}</span>
  return <span className={`${s.routingTag} ${s.routingNone}`}>{intl.formatMessage({ id: "bankAccount.notRouted" })}</span>
}

export function BankAccountsClient() {
  const intl = useIntl()
  const qc = useQueryClient()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null)
  const [editingNickname, setEditingNickname] = useState(false)
  const [nickDraft, setNickDraft] = useState("")
  const cancellingNicknameRef = useRef(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const { cursor, page, handlePageChange: handlePageChangeRaw } = useCursorPagination()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["banks", cursor],
    queryFn: () => fetchBanks(cursor),
    staleTime: 60_000,
  })

  const hasMore = data?.hasMore ?? false
  const nextCursor = data?.nextCursor ?? null
  const totalPages = hasMore ? page + 1 : page

  function handlePageChange(newPage: number) {
    handlePageChangeRaw(newPage, hasMore, nextCursor)
    setSelectedId(null)
  }

  const effectiveBankId = selectedId ?? data?.items[0]?.id ?? null

  const { data: detail } = useQuery({
    queryKey: ["banks", effectiveBankId],
    queryFn: () => fetchBankDetail(effectiveBankId!),
    enabled: Boolean(effectiveBankId),
  })

  // Reset per-account UI state when the selected bank changes. Adjusted during
  // render (rather than in a useEffect) per https://react.dev/learn/you-might-not-need-an-effect
  // to avoid an extra cascading render pass.
  const [uiResetForBankId, setUiResetForBankId] = useState(effectiveBankId)
  if (effectiveBankId !== uiResetForBankId) {
    setUiResetForBankId(effectiveBankId)
    setEditingNickname(false)
    setActionsOpen(false)
  }

  useEffect(() => {
    if (!actionsOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [actionsOpen])

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/banks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] })
      if (selectedId === deleteTarget?.id) setSelectedId(null)
      setDeleteTarget(null)
      toast.toast(intl.formatMessage({ id: "common.deleteSuccess" }), "success")
    },
    onError: () => toast.toast(intl.formatMessage({ id: "common.error" }), "error"),
  })

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/banks/${id}/verify`, { method: "POST" })
      if (!res.ok) throw new Error("Verify failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] })
      toast.toast(intl.formatMessage({ id: "bankAccount.verified" }), "success")
    },
    onError: () => toast.toast(intl.formatMessage({ id: "common.error" }), "error"),
  })

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/banks/${id}/primary`, { method: "POST" })
      if (!res.ok) throw new Error("Set primary failed")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banks"] }),
    onError: () => toast.toast(intl.formatMessage({ id: "common.error" }), "error"),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "receivePayments" | "sendPayments"; value: boolean }) => {
      const res = await fetch(`/api/banks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error("Update failed")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banks"] }),
    onError: () => toast.toast(intl.formatMessage({ id: "common.error" }), "error"),
  })

  const nicknameMutation = useMutation({
    mutationFn: async ({ id, nickname }: { id: string; nickname: string | null }) => {
      const res = await fetch(`/api/banks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      })
      if (!res.ok) throw new Error("Update failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] })
      setEditingNickname(false)
    },
    onError: () => toast.toast(intl.formatMessage({ id: "bankAccount.nicknameSaveError" }), "error"),
  })

  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values)

  const accounts = data?.items ?? []
  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null

  function startEditNickname() {
    if (!selected) return
    setNickDraft(selected.nickname ?? "")
    setEditingNickname(true)
  }

  function saveNickname() {
    if (!selected || nicknameMutation.isPending) return
    nicknameMutation.mutate({ id: selected.id, nickname: nickDraft.trim() || null })
  }

  function handleNicknameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      saveNickname()
    } else if (e.key === "Escape") {
      cancellingNicknameRef.current = true
      setEditingNickname(false)
    }
  }

  function handleNicknameBlur() {
    if (cancellingNicknameRef.current) {
      cancellingNicknameRef.current = false
      return
    }
    saveNickname()
  }

  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={shell.centred}><Spinner /></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.root}>
        <p>{t("common.error")}</p>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={shell.pageHead}>
        <div className={styles.headText}>
          <h1>{t("bankAccount.title")}</h1>
          <p>{t("bankAccount.description")}</p>
        </div>
        <button className={shell.addBtn} onClick={() => setShowAddModal(true)}>
          <PlusIcon width={16} height={16} />
          {t("bankAccount.add")}
        </button>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarList}>
            <div className={styles.sidebarHead}>
              <p className={styles.sidebarTitle}>{t("bankAccount.linkedAccounts")}</p>
              <span className={styles.sidebarCount}>{accounts.length}</span>
            </div>
            {accounts.length === 0 ? (
              <p className={styles.sidebarEmpty}>{t("bankAccount.empty")}</p>
            ) : (
              <ul className={styles.accountList}>
                {accounts.map((account) => {
                  const isSelected = (selectedId ?? accounts[0]?.id) === account.id
                  const initial = (account.nickname ?? account.bankName).charAt(0).toUpperCase()
                  return (
                    <li
                      key={account.id}
                      className={`${styles.accountItem}${isSelected ? ` ${styles.selected}` : ""}`}
                      onClick={() => setSelectedId(account.id)}
                    >
                      <div className={styles.accountInitial}>{initial}</div>
                      <div>
                        <div className={styles.accountName}>{account.nickname ?? account.bankName}</div>
                        <div className={styles.accountSub}>
                          {t(`bankAccount.${account.accountType}`)} &middot; &bull;&bull;&bull;&bull;{account.accountNumberLast4}
                        </div>
                      </div>
                      <span className={`${styles.pill} ${account.verified ? styles.pillVerified : styles.pillPending}`}>
                        {account.verified ? t("bankAccount.verified") : "Pending"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            {totalPages > 1 && (
              <div className={styles.sidebarPagination}>
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
          <button className={styles.addBtnSidebar} onClick={() => setShowAddModal(true)}>
            <PlusIcon width={14} height={14} />
            {t("bankAccount.add")}
          </button>
        </aside>

        {/* Detail panel */}
        {selected ? (
          <div className={styles.detail}>
            <div className={styles.detailHead}>
              <div>
                <div className={styles.nicknameRow}>
                  {editingNickname ? (
                    <input
                      className={styles.nicknameInput}
                      value={nickDraft}
                      onChange={(e) => setNickDraft(e.target.value)}
                      onKeyDown={handleNicknameKeyDown}
                      onBlur={handleNicknameBlur}
                      autoFocus
                      disabled={nicknameMutation.isPending}
                      maxLength={60}
                      aria-label={t("bankAccount.editNickname")}
                    />
                  ) : (
                    <h2 className={styles.detailTitle}>{selected.nickname ?? selected.bankName}</h2>
                  )}
                  {!editingNickname && (
                    <button
                      type="button"
                      className={styles.nicknameEditBtn}
                      onClick={startEditNickname}
                      aria-label={t("bankAccount.editNickname")}
                      title={t("bankAccount.editNickname")}
                    >
                      <PencilSquareIcon width={14} height={14} />
                    </button>
                  )}
                  {selected.isPrimary && (
                    <span className={`${styles.pill} ${styles.pillPrimary}`}>
                      {t("bankAccount.primaryBadge")}
                    </span>
                  )}
                </div>
                <p className={styles.detailSub}>
                  {t("bankAccount.accountEndingIn", { last4: selected.accountNumberLast4 })}
                </p>
              </div>
              <div className={styles.detailActions}>
                {!selected.isPrimary && (
                  <button
                    className={styles.primaryBtn}
                    onClick={() => setPrimaryMutation.mutate(selected.id)}
                    disabled={setPrimaryMutation.isPending}
                  >
                    <StarIcon width={14} height={14} />
                    {t("bankAccount.setPrimary")}
                  </button>
                )}
                <div className={styles.actionsMenuWrap} ref={actionsRef}>
                  <button
                    className={styles.actionsBtn}
                    onClick={() => setActionsOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={actionsOpen}
                  >
                    <EllipsisVerticalIcon width={16} height={16} />
                    {t("bankAccount.actions")}
                  </button>
                  {actionsOpen && (
                    <div className={styles.actionsMenu} role="menu">
                      <button
                        className={styles.actionsMenuItem}
                        role="menuitem"
                        onClick={() => { setActionsOpen(false); setEditAccount(selected) }}
                      >
                        <PencilSquareIcon width={16} height={16} />
                        {t("common.edit")}
                      </button>
                      {!selected.verified && (
                        <button
                          className={styles.actionsMenuItem}
                          role="menuitem"
                          onClick={() => { setActionsOpen(false); verifyMutation.mutate(selected.id) }}
                        >
                          <CheckIcon width={16} height={16} />
                          {t("bankAccount.verify")}
                        </button>
                      )}
                      <button
                        className={styles.actionsMenuItem}
                        role="menuitem"
                        onClick={() => setActionsOpen(false)}
                      >
                        <ArrowDownTrayIcon width={16} height={16} />
                        {t("bankAccount.downloadStatement")}
                      </button>
                      <button
                        className={`${styles.actionsMenuItem} ${styles.actionsMenuItemDanger}`}
                        role="menuitem"
                        onClick={() => { setActionsOpen(false); setDeleteTarget(selected) }}
                      >
                        <TrashIcon width={16} height={16} />
                        {t("common.delete")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verify banner */}
            {!selected.verified && (
              <div className={styles.verifyBanner}>
                <div className={styles.verifyBannerIcon}>
                  <ExclamationTriangleIcon width={16} height={16} />
                </div>
                <div className={styles.verifyBannerText}>
                  <div className={styles.verifyBannerTitle}>{t("bankAccount.verifyBannerTitle")}</div>
                  <div className={styles.verifyBannerDesc}>{t("bankAccount.verifyBannerDesc")}</div>
                </div>
                <button
                  className={styles.verifyBtn}
                  onClick={() => verifyMutation.mutate(selected.id)}
                  disabled={verifyMutation.isPending}
                >
                  {t("bankAccount.verify")}
                </button>
              </div>
            )}

            {/* Stats row */}
            {detail && detail.id === selected.id && (
              <div className={styles.statsRow}>
                <div className={styles.statCell}>
                  <span className={styles.statLabel}>{t("dashboard.totalReceived")}</span>
                  <span className={styles.statValue}>{formatMoney(detail.stats.totalReceived)}</span>
                </div>
                <div className={styles.statCell}>
                  <span className={styles.statLabel}>{t("dashboard.totalSent")}</span>
                  <span className={styles.statValue}>{formatMoney(detail.stats.totalSent)}</span>
                </div>
                <div className={styles.statCell}>
                  <span className={styles.statLabel}>{t("bankAccount.linkedCases")}</span>
                  <span className={styles.statValueSm}>{detail.stats.linkedCases}</span>
                  <span className={styles.statSub}>
                    {t("bankAccount.activeCases", { count: detail.stats.linkedCases })}
                  </span>
                </div>
                <div className={styles.statCell}>
                  <span className={styles.statLabel}>{t("bankAccount.usedFor")}</span>
                  <span className={styles.statValueSm}>
                    <RoutingTag receive={selected.receivePayments} send={selected.sendPayments} styles={styles} />
                  </span>
                  <span className={styles.statSub}>
                    {t("bankAccount.lastActivity")}{" "}
                    {detail.stats.lastActivity ? formatActivityDate(detail.stats.lastActivity) : t("bankAccount.noActivity")}
                  </span>
                </div>
              </div>
            )}

            {/* Info grid */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("bankAccount.bankName")}</span>
                <span className={styles.infoValue}>{selected.bankName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("bankAccount.accountType")}</span>
                <span className={styles.infoValue}>{t(`bankAccount.${selected.accountType}`)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("bankAccount.routingNumber")}</span>
                <span className={styles.infoValue}>{selected.routingNumber}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("bankAccount.accountNumber")}</span>
                <span className={styles.infoValue}>&bull;&bull;&bull;&bull; {selected.accountNumberLast4}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <span className={`${styles.badge} ${selected.verified ? styles.badgeVerified : styles.badgeUnverified}`}>
                  {selected.verified ? t("bankAccount.verified") : t("bankAccount.unverified")}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("bankAccount.routingRules")}</span>
                <RoutingTag receive={selected.receivePayments} send={selected.sendPayments} styles={styles} />
              </div>
            </div>

            {/* Routing toggles */}
            <div className={styles.section}>
              <p className={styles.sectionTitle}>{t("bankAccount.routingRules")}</p>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>
                  <span className={styles.toggleLabelMain}>{t("bankAccount.receivePayments")}</span>
                  <span className={styles.toggleLabelSub}>{t("bankAccount.receivePaymentsDesc")}</span>
                </span>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={selected.receivePayments}
                    onChange={(e) =>
                      toggleMutation.mutate({ id: selected.id, field: "receivePayments", value: e.target.checked })
                    }
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>
                  <span className={styles.toggleLabelMain}>{t("bankAccount.sendPayments")}</span>
                  <span className={styles.toggleLabelSub}>{t("bankAccount.sendPaymentsDesc")}</span>
                </span>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={selected.sendPayments}
                    onChange={(e) =>
                      toggleMutation.mutate({ id: selected.id, field: "sendPayments", value: e.target.checked })
                    }
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>

            {/* Trend chart */}
            {detail && detail.id === selected.id && (
              <div className={styles.section}>
                <div className={styles.trendHead}>
                  <p className={styles.sectionTitle}>{t("bankAccount.paymentTrend")}</p>
                  <span className={styles.trendLegend}>{t("bankAccount.twelveMonths")}</span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart
                    data={detail.trend.map((item) => ({ ...item, month: monthLabel(item.month) }))}
                    margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                  >
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem" }}
                      formatter={(v) => (typeof v === "number" ? formatMoney(v) : String(v))}
                    />
                    <Line type="monotone" dataKey="sent" name={t("dashboard.totalSent")} stroke="var(--color-danger)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                    <Line type="monotone" dataKey="received" name={t("dashboard.totalReceived")} stroke="var(--color-success)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent transactions */}
            {detail && detail.id === selected.id && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>{t("bankAccount.recentTransactions")}</p>
                {detail.recentPayments.length === 0 ? (
                  <p className={styles.txEmpty}>{t("bankAccount.noTransactions")}</p>
                ) : (
                  <>
                    <table className={styles.txTable}>
                      <thead>
                        <tr>
                          <th>{t("payments.paymentDate")}</th>
                          <th>{t("payments.caseNumber")}</th>
                          <th>{t("payments.type")}</th>
                          <th className={styles.txAmtHeader}>{t("payments.amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.recentPayments.map((tx) => {
                          const isReceive = tx.type === "received" || tx.type === "pending_received"
                          return (
                            <tr key={tx.id}>
                              <td>{formatActivityDate(tx.paymentDate)}</td>
                              <td>{tx.caseNumber || "—"}</td>
                              <td>
                                <span className={`${styles.txType}${isReceive ? ` ${styles.txTypeReceived}` : ` ${styles.txTypeSent}`}`}>
                                  {isReceive ? t("payments.typeReceived") : t("payments.typeSent")}
                                </span>
                              </td>
                              <td className={`${styles.txAmt}${isReceive ? ` ${styles.txAmtReceived}` : ` ${styles.txAmtSent}`}`}>
                                {isReceive ? "+" : "−"}{formatMoney(tx.amount)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <div className={styles.txFoot}>
                      <Link href="/payments" className={styles.txLink}>
                        {t("bankAccount.viewAllPayments")}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Added</p>
              <p className={styles.infoValue}>{formatDate(selected.createdAt)}</p>
            </div>
          </div>
        ) : (
          <div className={styles.detail}>
            <p className={styles.detailEmpty}>{t("bankAccount.empty")}</p>
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal
        open={showAddModal}
        title={t("bankAccount.addTitle")}
        onClose={() => setShowAddModal(false)}
      >
        <BankAccountForm
          onSuccess={() => {
            setShowAddModal(false)
            qc.invalidateQueries({ queryKey: ["banks"] })
            toast.toast(intl.formatMessage({ id: "common.saveSuccess" }), "success")
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={Boolean(editAccount)}
        title={t("bankAccount.edit")}
        onClose={() => setEditAccount(null)}
      >
        {editAccount && (
          <BankAccountForm
            account={editAccount}
            onSuccess={() => {
              setEditAccount(null)
              qc.invalidateQueries({ queryKey: ["banks"] })
              toast.toast(intl.formatMessage({ id: "common.saveSuccess" }), "success")
            }}
            onCancel={() => setEditAccount(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("bankAccount.deleteTitle")}
        message={t("bankAccount.deleteConfirm")}
        confirmLabel={t("common.delete")}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

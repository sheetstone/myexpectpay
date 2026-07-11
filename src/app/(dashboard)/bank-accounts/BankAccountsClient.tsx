"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Modal, ConfirmDialog, Spinner, useToast } from "@/components/ui"
import { formatDate } from "@/utils/formatDate"
import { formatMoney } from "@/utils/formatMoney"
import type { BankAccount, BankAccountDetail, PaginatedResult } from "@/types"
import { BankAccountForm } from "./BankAccountForm"
import styles from "./bankAccounts.module.css"

async function fetchBanks(): Promise<PaginatedResult<BankAccount>> {
  const res = await fetch("/api/banks")
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["banks"],
    queryFn: fetchBanks,
    staleTime: 60_000,
  })

  const effectiveBankId = selectedId ?? data?.items[0]?.id ?? null

  const { data: detail } = useQuery({
    queryKey: ["banks", effectiveBankId],
    queryFn: () => fetchBankDetail(effectiveBankId!),
    enabled: Boolean(effectiveBankId),
  })

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

  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values)

  const accounts = data?.items ?? []
  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null

  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.centred}><Spinner /></div>
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
      <div className={styles.pageHead}>
        <div className={styles.headText}>
          <h1>{t("bankAccount.title")}</h1>
          <p>{t("bankAccount.description")}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
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
                <h2 className={styles.detailTitle}>{selected.nickname ?? selected.bankName}</h2>
                <p className={styles.detailSub}>
                  {t("bankAccount.accountEndingIn", { last4: selected.accountNumberLast4 })}
                </p>
              </div>
              <div className={styles.detailActions}>
                {!selected.verified && (
                  <button
                    className={styles.verifyBtn}
                    onClick={() => verifyMutation.mutate(selected.id)}
                    disabled={verifyMutation.isPending}
                  >
                    {t("bankAccount.verify")}
                  </button>
                )}
                <button className={styles.editBtn} onClick={() => setEditAccount(selected)}>
                  {t("common.edit")}
                </button>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(selected)}>
                  {t("common.delete")}
                </button>
              </div>
            </div>

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

"use client"

import { useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Modal, ConfirmDialog, Spinner, useToast } from "@/components/ui"
import { formatDate } from "@/utils/formatDate"
import type { BankAccount, BankAccountDetail, PaginatedResult } from "@/types"
import { BANK_ACCOUNTS_PAGE_SIZE } from "@/constants"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import { BankAccountForm } from "./BankAccountForm"
import { BankSidebar } from "./components/BankSidebar"
import { BankDetailHeader } from "./components/BankDetailHeader"
import { VerifyBanner } from "./components/VerifyBanner"
import { BankStatsRow } from "./components/BankStatsRow"
import { BankInfoGrid } from "./components/BankInfoGrid"
import { RoutingRulesSection } from "./components/RoutingRulesSection"
import { PaymentTrendChart } from "./components/PaymentTrendChart"
import { RecentTransactionsTable } from "./components/RecentTransactionsTable"
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
  }

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
        <BankSidebar
          accounts={accounts}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddNew={() => setShowAddModal(true)}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Detail panel */}
        {selected ? (
          <div className={styles.detail}>
            <BankDetailHeader
              bank={selected}
              editingNickname={editingNickname}
              nickDraft={nickDraft}
              onNickDraftChange={setNickDraft}
              onStartEditNickname={startEditNickname}
              onNicknameKeyDown={handleNicknameKeyDown}
              onNicknameBlur={handleNicknameBlur}
              isSavingNickname={nicknameMutation.isPending}
              onSetPrimary={() => setPrimaryMutation.mutate(selected.id)}
              isSettingPrimary={setPrimaryMutation.isPending}
              onEdit={() => setEditAccount(selected)}
              onVerify={() => verifyMutation.mutate(selected.id)}
              onDelete={() => setDeleteTarget(selected)}
            />

            {/* Verify banner */}
            {!selected.verified && (
              <VerifyBanner
                onVerify={() => verifyMutation.mutate(selected.id)}
                isPending={verifyMutation.isPending}
              />
            )}

            {/* Stats row */}
            {detail && detail.id === selected.id && (
              <BankStatsRow
                stats={detail.stats}
                receivePayments={selected.receivePayments}
                sendPayments={selected.sendPayments}
              />
            )}

            {/* Info grid */}
            <BankInfoGrid bank={selected} />

            {/* Routing toggles */}
            <RoutingRulesSection
              receivePayments={selected.receivePayments}
              sendPayments={selected.sendPayments}
              onToggle={(field, value) => toggleMutation.mutate({ id: selected.id, field, value })}
            />

            {/* Trend chart */}
            {detail && detail.id === selected.id && (
              <PaymentTrendChart trend={detail.trend} />
            )}

            {/* Recent transactions */}
            {detail && detail.id === selected.id && (
              <RecentTransactionsTable payments={detail.recentPayments} />
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

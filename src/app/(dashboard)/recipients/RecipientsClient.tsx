"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Modal, ConfirmDialog, Spinner, Pagination, useToast } from "@/components/ui"
import type { Recipient, Case, PaginatedResult } from "@/types"
import { PAGE_SIZE } from "@/constants"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import { RecipientForm } from "./RecipientForm"
import styles from "./recipients.module.css"

async function fetchRecipients(cursor?: string | null): Promise<PaginatedResult<Recipient>> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (cursor) params.set("cursor", cursor)
  const res = await fetch(`/api/recipients?${params}`)
  if (!res.ok) throw new Error("Failed to load recipients")
  return res.json()
}

async function fetchAllCases(): Promise<Case[]> {
  const res = await fetch("/api/cases?limit=100")
  if (!res.ok) return []
  const data: PaginatedResult<Case> = await res.json()
  return data.items
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export function RecipientsClient() {
  const intl = useIntl()
  const qc = useQueryClient()
  const { toast } = useToast()
  const { cursor, page, handlePageChange: handlePageChangeRaw } = useCursorPagination()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editRecipient, setEditRecipient] = useState<Recipient | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Recipient | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recipients", cursor],
    queryFn: () => fetchRecipients(cursor),
    staleTime: 60_000,
  })

  const { data: cases } = useQuery({
    queryKey: ["cases-all"],
    queryFn: fetchAllCases,
    staleTime: 120_000,
  })

  const caseMap = new Map((cases ?? []).map((c) => [c.id, c.caseNumber]))

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recipients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recipients"] })
      setDeleteTarget(null)
      toast(intl.formatMessage({ id: "common.deleteSuccess" }), "success")
    },
    onError: () => toast(intl.formatMessage({ id: "common.error" }), "error"),
  })

  const t = (id: string) => intl.formatMessage({ id })

  const recipients = data?.items ?? []
  const hasMore = data?.hasMore ?? false
  const nextCursor = data?.nextCursor ?? null
  const totalPages = hasMore ? page + 1 : page

  function handlePageChange(newPage: number) {
    handlePageChangeRaw(newPage, hasMore, nextCursor)
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <h1>{t("recipients.title")}</h1>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <PlusIcon width={16} height={16} />
          {t("recipients.add")}
        </button>
      </div>

      {isLoading ? (
        <div className={styles.centred}><Spinner /></div>
      ) : isError ? (
        <p>{t("common.error")}</p>
      ) : recipients.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>{t("recipients.empty")}</p>
      ) : (
        <>
          <div className={styles.grid}>
            {recipients.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.avatar}>{initials(r.firstName, r.lastName)}</div>
                  <div className={styles.nameBlock}>
                    <p className={styles.fullName}>{r.firstName} {r.lastName}</p>
                    <p className={styles.email}>{r.email}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => setEditRecipient(r)} aria-label={t("common.edit")}>
                      <PencilSquareIcon width={14} height={14} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => setDeleteTarget(r)} aria-label={t("common.delete")}>
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>
                </div>
                {r.caseId && caseMap.has(r.caseId) && (
                  <span className={styles.caseChip}>Case: {caseMap.get(r.caseId)}</span>
                )}
              </div>
            ))}
          </div>
          <div className={styles.pagination}>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      <Modal open={showAddModal} title={t("recipients.addTitle")} onClose={() => setShowAddModal(false)}>
        <RecipientForm
          onSuccess={() => {
            setShowAddModal(false)
            qc.invalidateQueries({ queryKey: ["recipients"] })
            toast(intl.formatMessage({ id: "common.saveSuccess" }), "success")
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal open={Boolean(editRecipient)} title={t("recipients.edit")} onClose={() => setEditRecipient(null)}>
        {editRecipient && (
          <RecipientForm
            recipient={editRecipient}
            onSuccess={() => {
              setEditRecipient(null)
              qc.invalidateQueries({ queryKey: ["recipients"] })
              toast(intl.formatMessage({ id: "common.saveSuccess" }), "success")
            }}
            onCancel={() => setEditRecipient(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("recipients.deleteTitle")}
        message={t("recipients.deleteConfirm")}
        confirmLabel={t("common.delete")}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

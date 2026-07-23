"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"
import { Modal, ConfirmDialog, Spinner, Pagination, useToast } from "@/components/ui"
import type { Case, PaginatedResult } from "@/types"
import { PAGE_SIZE } from "@/constants"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import { CaseForm } from "./CaseForm"
import styles from "./cases.module.css"

async function fetchCases(cursor?: string | null): Promise<PaginatedResult<Case>> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (cursor) params.set("cursor", cursor)
  const res = await fetch(`/api/cases?${params}`)
  if (!res.ok) throw new Error("Failed to load cases")
  return res.json()
}

export function CasesClient() {
  const intl = useIntl()
  const qc = useQueryClient()
  const { toast } = useToast()
  const { cursor, page, handlePageChange: handlePageChangeRaw } = useCursorPagination()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCase, setEditCase] = useState<Case | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cases", cursor],
    queryFn: () => fetchCases(cursor),
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cases/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] })
      setDeleteTarget(null)
      toast(intl.formatMessage({ id: "common.deleteSuccess" }), "success")
    },
    onError: () => toast(intl.formatMessage({ id: "common.error" }), "error"),
  })

  const t = (id: string) => intl.formatMessage({ id })

  const cases = data?.items ?? []
  const hasMore = data?.hasMore ?? false
  const nextCursor = data?.nextCursor ?? null
  const totalPages = hasMore ? page + 1 : page

  function handlePageChange(newPage: number) {
    handlePageChangeRaw(newPage, hasMore, nextCursor)
  }

  return (
    <div className={styles.root}>
      <div className={styles.pageHead}>
        <h1>{t("cases.title")}</h1>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <PlusIcon width={16} height={16} />
          {t("cases.add")}
        </button>
      </div>

      {isLoading ? (
        <div className={styles.centred}><Spinner /></div>
      ) : isError ? (
        <p>{t("common.error")}</p>
      ) : cases.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>{t("cases.empty")}</p>
      ) : (
        <>
          <div className={styles.grid}>
            {cases.map((c) => (
              <div key={c.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.caseNumber}>{c.caseNumber}</h2>
                    <p className={styles.ncpName}>{c.ncpName}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => setEditCase(c)} aria-label={t("common.edit")}>
                      <PencilSquareIcon width={14} height={14} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => setDeleteTarget(c)} aria-label={t("common.delete")}>
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>
                </div>
                {c.children.length > 0 && (
                  <div>
                    <p className={styles.childrenLabel}>{t("cases.children")}</p>
                    <ul className={styles.childrenList}>
                      {c.children.map((child, i) => (
                        <li key={i} className={styles.childChip}>{child}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.pagination}>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      <Modal open={showAddModal} title={t("cases.addTitle")} onClose={() => setShowAddModal(false)}>
        <CaseForm
          onSuccess={() => {
            setShowAddModal(false)
            qc.invalidateQueries({ queryKey: ["cases"] })
            toast(intl.formatMessage({ id: "common.saveSuccess" }), "success")
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal open={Boolean(editCase)} title={t("cases.edit")} onClose={() => setEditCase(null)}>
        {editCase && (
          <CaseForm
            caseItem={editCase}
            onSuccess={() => {
              setEditCase(null)
              qc.invalidateQueries({ queryKey: ["cases"] })
              toast(intl.formatMessage({ id: "common.saveSuccess" }), "success")
            }}
            onCancel={() => setEditCase(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("cases.deleteTitle")}
        message={t("cases.deleteConfirm")}
        confirmLabel={t("common.delete")}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

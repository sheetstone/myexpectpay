"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useIntl } from "react-intl"
import { Spinner, Pagination } from "@/components/ui"
import { formatDate } from "@/utils/formatDate"
import type { Message, MessagesResponse } from "@/types"
import { PAGE_SIZE } from "@/constants"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import shell from "@/components/shared/pageShell.module.css"
import styles from "./messages.module.css"

async function fetchMessages(cursor: string | null): Promise<MessagesResponse> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (cursor) params.set("cursor", cursor)
  const res = await fetch(`/api/messages?${params}`)
  if (!res.ok) throw new Error("Failed to load messages")
  return res.json()
}

async function markRead(id: string): Promise<Message> {
  const res = await fetch(`/api/messages/${id}/read`, { method: "PATCH" })
  if (!res.ok) throw new Error("Failed to mark as read")
  return res.json()
}

export function MessagesClient() {
  const intl = useIntl()
  const qc = useQueryClient()
  const { cursor, page, handlePageChange: handlePageChangeRaw } = useCursorPagination()
  const [selected, setSelected] = useState<Message | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages", cursor],
    queryFn: () => fetchMessages(cursor),
    staleTime: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["messages"] })
      setSelected(updated)
    },
  })

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values)

  const messages = data?.items ?? []
  const hasMore = data?.hasMore ?? false
  const nextCursor = data?.nextCursor ?? null
  const unreadCount = data?.unreadCount ?? 0
  const totalPages = hasMore ? page + 1 : page

  function handleSelect(msg: Message) {
    setSelected(msg)
    if (!msg.isRead) markReadMutation.mutate(msg.id)
  }

  function handlePageChange(newPage: number) {
    handlePageChangeRaw(newPage, hasMore, nextCursor)
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
        <div>
          <h1 className={styles.pageTitle}>{t("messages.title")}</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {t("messages.unread", { count: unreadCount })}
            </span>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Message list */}
        <aside className={styles.sidebar}>
          {messages.length === 0 ? (
            <p className={styles.empty}>{t("messages.empty")}</p>
          ) : (
            <ul className={styles.list}>
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className={`${styles.item} ${!msg.isRead ? styles.unread : ""} ${selected?.id === msg.id ? styles.active : ""}`}
                  onClick={() => handleSelect(msg)}
                >
                  {!msg.isRead && <span className={styles.dot} aria-label="Unread" />}
                  <div className={styles.itemBody}>
                    <div className={styles.itemTop}>
                      <span className={styles.sender}>{msg.sender}</span>
                      <span className={styles.date}>{formatDate(msg.createdAt)}</span>
                    </div>
                    <span className={styles.subject}>{msg.subject}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </aside>

        {/* Message detail */}
        <div className={styles.detail}>
          {selected ? (
            <>
              <div className={styles.detailHead}>
                <h2 className={styles.detailSubject}>{selected.subject}</h2>
                <div className={styles.detailMeta}>
                  <span className={styles.detailSender}>
                    {t("messages.from")}: <strong>{selected.sender}</strong>
                  </span>
                  <span className={styles.detailDate}>{formatDate(selected.createdAt)}</span>
                </div>
              </div>
              <div className={styles.detailBody}>{selected.body}</div>
            </>
          ) : (
            <div className={styles.detailEmpty}>
              <p>{messages.length > 0 ? "Select a message to read it." : t("messages.empty")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

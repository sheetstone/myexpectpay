import { Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { PAGE_SIZE } from "@/constants"
import type { Message, MessagesResponse } from "@/types"

interface ListOptions {
  cursor?: string
  limit?: number
}

function messagesCol(uid: string) {
  return getAdminDb().collection("users").doc(uid).collection("messages")
}

function docToMessage(id: string, data: FirebaseFirestore.DocumentData): Message {
  return {
    id,
    sender: data.sender,
    subject: data.subject,
    body: data.body,
    isRead: data.isRead,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
  }
}

export async function listMessages(
  uid: string,
  options: ListOptions = {},
): Promise<MessagesResponse> {
  const { limit = PAGE_SIZE, cursor } = options
  const col = messagesCol(uid)
  let query = col.orderBy("createdAt", "desc").limit(limit + 1)

  if (cursor) {
    const cursorDoc = await col.doc(cursor).get()
    if (cursorDoc.exists) query = query.startAfter(cursorDoc)
  }

  const [snapshot, unreadSnap] = await Promise.all([
    query.get(),
    col.where("isRead", "==", false).count().get(),
  ])

  const docs = snapshot.docs
  const hasMore = docs.length > limit
  const items = docs.slice(0, limit).map((d) => docToMessage(d.id, d.data()))

  return {
    items,
    unreadCount: unreadSnap.data().count,
    nextCursor: hasMore ? docs[limit - 1]!.id : null,
    hasMore,
  }
}

export async function getMessage(uid: string, id: string): Promise<Message | null> {
  const doc = await messagesCol(uid).doc(id).get()
  if (!doc.exists) return null
  return docToMessage(doc.id, doc.data()!)
}

export async function markMessageRead(uid: string, id: string): Promise<Message | null> {
  const ref = messagesCol(uid).doc(id)
  const doc = await ref.get()
  if (!doc.exists) return null

  await ref.update({ isRead: true })
  const updated = await ref.get()
  return docToMessage(updated.id, updated.data()!)
}

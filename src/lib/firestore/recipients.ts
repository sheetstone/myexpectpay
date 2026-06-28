import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { PAGE_SIZE } from "@/constants"
import type { Recipient, CreateRecipientInput, UpdateRecipientInput, PaginatedResult } from "@/types"

interface ListOptions {
  cursor?: string
  limit?: number
}

function recipientsCol(uid: string) {
  return getAdminDb().collection("users").doc(uid).collection("recipients")
}

function docToRecipient(id: string, data: FirebaseFirestore.DocumentData): Recipient {
  return {
    id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    caseId: data.caseId ?? null,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  }
}

export async function listRecipients(
  uid: string,
  options: ListOptions = {},
): Promise<PaginatedResult<Recipient>> {
  const { limit = PAGE_SIZE, cursor } = options
  const col = recipientsCol(uid)
  let query = col.orderBy("createdAt", "desc").limit(limit + 1)

  if (cursor) {
    const cursorDoc = await col.doc(cursor).get()
    if (cursorDoc.exists) query = query.startAfter(cursorDoc)
  }

  const snapshot = await query.get()
  const docs = snapshot.docs
  const hasMore = docs.length > limit
  const items = docs.slice(0, limit).map((d) => docToRecipient(d.id, d.data()))

  return { items, nextCursor: hasMore ? docs[limit - 1]!.id : null, hasMore }
}

export async function getRecipient(uid: string, id: string): Promise<Recipient | null> {
  const doc = await recipientsCol(uid).doc(id).get()
  if (!doc.exists) return null
  return docToRecipient(doc.id, doc.data()!)
}

export async function createRecipient(
  uid: string,
  input: CreateRecipientInput,
): Promise<Recipient> {
  const now = FieldValue.serverTimestamp()
  const ref = await recipientsCol(uid).add({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    caseId: input.caseId ?? null,
    createdAt: now,
    updatedAt: now,
  })
  const created = await ref.get()
  return docToRecipient(created.id, created.data()!)
}

export async function updateRecipient(
  uid: string,
  id: string,
  input: UpdateRecipientInput,
): Promise<Recipient | null> {
  const ref = recipientsCol(uid).doc(id)
  if (!(await ref.get()).exists) return null

  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
  if (input.firstName !== undefined) updates.firstName = input.firstName
  if (input.lastName !== undefined) updates.lastName = input.lastName
  if (input.email !== undefined) updates.email = input.email
  if (input.caseId !== undefined) updates.caseId = input.caseId ?? null

  await ref.update(updates)
  const updated = await ref.get()
  return docToRecipient(updated.id, updated.data()!)
}

export async function deleteRecipient(uid: string, id: string): Promise<boolean> {
  const ref = recipientsCol(uid).doc(id)
  if (!(await ref.get()).exists) return false
  await ref.delete()
  return true
}

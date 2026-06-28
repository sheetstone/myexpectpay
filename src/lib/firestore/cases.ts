import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { PAGE_SIZE } from "@/constants"
import type { Case, CreateCaseInput, UpdateCaseInput, PaginatedResult } from "@/types"

interface ListOptions {
  cursor?: string
  limit?: number
}

function casesCol(uid: string) {
  return getAdminDb().collection("users").doc(uid).collection("cases")
}

function docToCase(id: string, data: FirebaseFirestore.DocumentData): Case {
  return {
    id,
    caseNumber: data.caseNumber,
    ncpName: data.ncpName,
    children: data.children ?? [],
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  }
}

export async function listCases(
  uid: string,
  options: ListOptions = {},
): Promise<PaginatedResult<Case>> {
  const { limit = PAGE_SIZE, cursor } = options
  const col = casesCol(uid)
  let query = col.orderBy("createdAt", "desc").limit(limit + 1)

  if (cursor) {
    const cursorDoc = await col.doc(cursor).get()
    if (cursorDoc.exists) query = query.startAfter(cursorDoc)
  }

  const snapshot = await query.get()
  const docs = snapshot.docs
  const hasMore = docs.length > limit
  const items = docs.slice(0, limit).map((d) => docToCase(d.id, d.data()))

  return { items, nextCursor: hasMore ? docs[limit - 1]!.id : null, hasMore }
}

export async function getCase(uid: string, id: string): Promise<Case | null> {
  const doc = await casesCol(uid).doc(id).get()
  if (!doc.exists) return null
  return docToCase(doc.id, doc.data()!)
}

export async function createCase(uid: string, input: CreateCaseInput): Promise<Case> {
  const now = FieldValue.serverTimestamp()
  const ref = await casesCol(uid).add({ ...input, createdAt: now, updatedAt: now })
  const created = await ref.get()
  return docToCase(created.id, created.data()!)
}

export async function updateCase(
  uid: string,
  id: string,
  input: UpdateCaseInput,
): Promise<Case | null> {
  const ref = casesCol(uid).doc(id)
  if (!(await ref.get()).exists) return null

  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() })
  const updated = await ref.get()
  return docToCase(updated.id, updated.data()!)
}

export async function deleteCase(uid: string, id: string): Promise<boolean> {
  const ref = casesCol(uid).doc(id)
  if (!(await ref.get()).exists) return false
  await ref.delete()
  return true
}

import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { PAGE_SIZE } from "@/constants"
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  type Payment,
  type SendPaymentInput,
  type RequestPaymentInput,
  type PaymentFilters,
  type PaymentStatus,
  type PaginatedResult,
} from "@/types"

function paymentsCol(uid: string) {
  return getAdminDb().collection("users").doc(uid).collection("payments")
}

function docToPayment(id: string, data: FirebaseFirestore.DocumentData): Payment {
  return {
    id,
    amount: data.amount,
    caseNumber: data.caseNumber,
    recipientId: data.recipientId ?? null,
    recipientName: data.recipientName,
    bankId: data.bankId ?? null,
    paymentDate: data.paymentDate,
    status: data.status as PaymentStatus,
    type: data.type,
    note: data.note ?? null,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
  }
}

export async function listPayments(
  uid: string,
  filters: PaymentFilters = {},
): Promise<PaginatedResult<Payment>> {
  const { limit = PAGE_SIZE, cursor, startDate, endDate, status } = filters
  const col = paymentsCol(uid)

  const hasDateFilter = Boolean(startDate || endDate)

  // Range filter on paymentDate requires orderBy on paymentDate (Firestore constraint)
  let query = hasDateFilter
    ? col.orderBy("paymentDate", "desc")
    : col.orderBy("createdAt", "desc")

  if (startDate) query = query.where("paymentDate", ">=", startDate)
  if (endDate) query = query.where("paymentDate", "<=", endDate)
  if (status?.length) query = query.where("status", "in", status)

  query = query.limit(limit + 1)

  if (cursor) {
    const cursorDoc = await col.doc(cursor).get()
    if (cursorDoc.exists) query = query.startAfter(cursorDoc)
  }

  const snapshot = await query.get()
  const docs = snapshot.docs
  const hasMore = docs.length > limit
  const items = docs.slice(0, limit).map((d) => docToPayment(d.id, d.data()))

  return { items, nextCursor: hasMore ? docs[limit - 1]!.id : null, hasMore }
}

export async function getPayment(uid: string, id: string): Promise<Payment | null> {
  const doc = await paymentsCol(uid).doc(id).get()
  if (!doc.exists) return null
  return docToPayment(doc.id, doc.data()!)
}

export async function createSendPayment(
  uid: string,
  input: SendPaymentInput,
): Promise<Payment> {
  const now = FieldValue.serverTimestamp()
  const ref = await paymentsCol(uid).add({
    amount: input.amount,
    caseNumber: input.caseNumber,
    recipientId: input.recipientId ?? null,
    recipientName: input.recipientName,
    bankId: input.bankId,
    paymentDate: input.paymentDate,
    status: PAYMENT_STATUS.in_progress,
    type: PAYMENT_TYPE.sent,
    note: input.note ?? null,
    createdAt: now,
  })
  const created = await ref.get()
  return docToPayment(created.id, created.data()!)
}

export async function createRequestPayment(
  uid: string,
  input: RequestPaymentInput,
): Promise<Payment> {
  const now = FieldValue.serverTimestamp()
  const ref = await paymentsCol(uid).add({
    amount: input.amount,
    caseNumber: input.caseNumber,
    recipientId: input.recipientId ?? null,
    recipientName: input.recipientName,
    bankId: null,
    paymentDate: input.paymentDate,
    status: PAYMENT_STATUS.in_progress,
    type: PAYMENT_TYPE.pending_received,
    note: input.note ?? null,
    createdAt: now,
  })
  const created = await ref.get()
  return docToPayment(created.id, created.data()!)
}

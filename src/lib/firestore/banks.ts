import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { encrypt, decrypt } from "@/lib/crypto"
import { PAGE_SIZE } from "@/constants"
import type {
  BankAccount,
  BankStats,
  CalendarEvent,
  ChartDataItem,
  CreateBankAccountInput,
  UpdateBankAccountInput,
  PaginatedResult,
  PaymentStatus,
  PaymentType,
} from "@/types"

interface ListOptions {
  cursor?: string
  limit?: number
}

function banksCol(uid: string) {
  return getAdminDb().collection("users").doc(uid).collection("bankAccounts")
}

function docToBankAccount(id: string, data: FirebaseFirestore.DocumentData): BankAccount {
  return {
    id,
    bankName: data.bankName,
    nickname: data.nickname ?? null,
    routingNumber: decrypt(data.routingNumber),
    accountNumberLast4: data.accountNumberLast4,
    accountType: data.accountType,
    verified: data.verified,
    isPrimary: data.isPrimary,
    receivePayments: data.receivePayments,
    sendPayments: data.sendPayments,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  }
}

export async function listBanks(
  uid: string,
  options: ListOptions = {},
): Promise<PaginatedResult<BankAccount>> {
  const { limit = PAGE_SIZE, cursor } = options
  const col = banksCol(uid)
  let query = col.orderBy("createdAt", "desc").limit(limit + 1)

  if (cursor) {
    const cursorDoc = await col.doc(cursor).get()
    if (cursorDoc.exists) query = query.startAfter(cursorDoc)
  }

  const snapshot = await query.get()
  const docs = snapshot.docs
  const hasMore = docs.length > limit
  const items = docs.slice(0, limit).map((d) => docToBankAccount(d.id, d.data()))

  return { items, nextCursor: hasMore ? docs[limit - 1]!.id : null, hasMore }
}

export async function getBank(uid: string, id: string): Promise<BankAccount | null> {
  const doc = await banksCol(uid).doc(id).get()
  if (!doc.exists) return null
  return docToBankAccount(doc.id, doc.data()!)
}

export async function getBankStats(uid: string, bankId: string): Promise<BankStats> {
  const paymentsSnap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("payments")
    .where("bankId", "==", bankId)
    .get()

  let totalReceived = 0
  let totalSent = 0
  let lastActivity: string | null = null
  const caseNumbers = new Set<string>()

  paymentsSnap.docs.forEach((doc) => {
    const data = doc.data()
    const amount = data.amount as number
    const type = data.type as string
    const paymentDate = data.paymentDate as string
    const caseNumber = data.caseNumber as string | undefined

    if (type === "sent" || type === "pending_sent") totalSent += amount
    if (type === "received" || type === "pending_received") totalReceived += amount
    if (caseNumber) caseNumbers.add(caseNumber)
    if (!lastActivity || paymentDate > lastActivity) lastActivity = paymentDate
  })

  return { totalReceived, totalSent, linkedCases: caseNumbers.size, lastActivity }
}

export async function getBankTrend(uid: string, bankId: string): Promise<ChartDataItem[]> {
  const paymentsSnap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("payments")
    .where("bankId", "==", bankId)
    .get()

  const now = new Date()
  const chartMap = new Map<string, { sent: number; received: number }>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    chartMap.set(key, { sent: 0, received: 0 })
  }

  paymentsSnap.docs.forEach((doc) => {
    const data = doc.data()
    const amount = data.amount as number
    const type = data.type as string
    const paymentDate = data.paymentDate as string
    const monthKey = paymentDate.slice(0, 7)

    const entry = chartMap.get(monthKey)
    if (entry) {
      if (type === "sent" || type === "pending_sent") entry.sent += amount
      if (type === "received" || type === "pending_received") entry.received += amount
    }
  })

  return Array.from(chartMap.entries()).map(([month, vals]) => ({ month, ...vals }))
}

export async function getBankRecentPayments(
  uid: string,
  bankId: string,
  limit = 5,
): Promise<CalendarEvent[]> {
  const paymentsSnap = await getAdminDb()
    .collection("users")
    .doc(uid)
    .collection("payments")
    .where("bankId", "==", bankId)
    .get()

  const payments: CalendarEvent[] = paymentsSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      amount: data.amount as number,
      caseNumber: data.caseNumber as string,
      recipientName: data.recipientName as string,
      paymentDate: data.paymentDate as string,
      status: data.status as PaymentStatus,
      type: data.type as PaymentType,
    }
  })

  return payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, limit)
}

export async function createBank(
  uid: string,
  input: CreateBankAccountInput,
): Promise<BankAccount> {
  const last4 = input.accountNumber.slice(-4)
  const now = FieldValue.serverTimestamp()

  const ref = await banksCol(uid).add({
    bankName: input.bankName,
    nickname: input.nickname ?? null,
    routingNumber: encrypt(input.routingNumber),
    accountNumber: encrypt(input.accountNumber),
    accountNumberLast4: last4,
    accountType: input.accountType,
    verified: false,
    isPrimary: false,
    receivePayments: true,
    sendPayments: true,
    createdAt: now,
    updatedAt: now,
  })

  const created = await ref.get()
  return docToBankAccount(created.id, created.data()!)
}

export async function updateBank(
  uid: string,
  id: string,
  input: UpdateBankAccountInput,
): Promise<BankAccount | null> {
  const ref = banksCol(uid).doc(id)
  if (!(await ref.get()).exists) return null

  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() })
  const updated = await ref.get()
  return docToBankAccount(updated.id, updated.data()!)
}

export async function deleteBank(uid: string, id: string): Promise<boolean> {
  const ref = banksCol(uid).doc(id)
  if (!(await ref.get()).exists) return false
  await ref.delete()
  return true
}

export async function verifyBank(uid: string, id: string): Promise<BankAccount | null> {
  const ref = banksCol(uid).doc(id)
  if (!(await ref.get()).exists) return null

  await ref.update({ verified: true, updatedAt: FieldValue.serverTimestamp() })
  const updated = await ref.get()
  return docToBankAccount(updated.id, updated.data()!)
}

export async function setPrimaryBank(uid: string, id: string): Promise<BankAccount | null> {
  const col = banksCol(uid)
  const db = getAdminDb()
  const targetRef = col.doc(id)

  // Reading the current primary account(s) and writing the swap must happen
  // atomically — otherwise two concurrent calls can each read the pre-swap
  // state and both "succeed," leaving more than one account flagged primary.
  const exists = await db.runTransaction(async (transaction) => {
    const [targetDoc, currentPrimary] = await Promise.all([
      transaction.get(targetRef),
      transaction.get(col.where("isPrimary", "==", true)),
    ])
    if (!targetDoc.exists) return false

    currentPrimary.docs.forEach((d) => {
      if (d.id !== id) {
        transaction.update(d.ref, { isPrimary: false, updatedAt: FieldValue.serverTimestamp() })
      }
    })
    transaction.update(targetRef, { isPrimary: true, updatedAt: FieldValue.serverTimestamp() })
    return true
  })

  if (!exists) return null
  const updated = await targetRef.get()
  return docToBankAccount(updated.id, updated.data()!)
}

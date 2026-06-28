import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin"
import { encrypt, decrypt } from "@/lib/crypto"
import { PAGE_SIZE } from "@/constants"
import type {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
  PaginatedResult,
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
  const targetDoc = await col.doc(id).get()
  if (!targetDoc.exists) return null

  const db = getAdminDb()
  const batch = db.batch()

  const currentPrimary = await col.where("isPrimary", "==", true).get()
  currentPrimary.docs.forEach((d) =>
    batch.update(d.ref, { isPrimary: false, updatedAt: FieldValue.serverTimestamp() }),
  )
  batch.update(col.doc(id), { isPrimary: true, updatedAt: FieldValue.serverTimestamp() })
  await batch.commit()

  const updated = await col.doc(id).get()
  return docToBankAccount(updated.id, updated.data()!)
}

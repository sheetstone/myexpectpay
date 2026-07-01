/**
 * Data migration script: old Firebase app → new MyExpertPay Firestore structure.
 *
 * Prerequisites:
 *   1. Complete P08-001 (audit old data structure) and fill in the transform functions below.
 *   2. Set environment variables:
 *        FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY  (new app)
 *        ACCOUNT_ENCRYPTION_KEY  (AES-256 key, 64 hex chars)
 *        OLD_FIREBASE_PROJECT_ID, OLD_FIREBASE_CLIENT_EMAIL, OLD_FIREBASE_PRIVATE_KEY  (old app)
 *        — if old and new share the same project, the OLD_* vars are optional.
 *
 * Usage:
 *   npm run migrate -- --dry-run   # preview, no writes
 *   npm run migrate                 # live run
 *   npm run migrate -- --uid=<uid>  # migrate a single user
 */

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore, Timestamp, WriteBatch } from "firebase-admin/firestore"
import { encrypt } from "../src/lib/crypto"

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes("--dry-run")
const SINGLE_UID = process.argv.find((a) => a.startsWith("--uid="))?.split("=")[1]
const BATCH_SIZE = 400 // Firestore limit is 500; leave headroom

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

function initAdminApp(name: string, projectId: string, clientEmail?: string, privateKey?: string) {
  const existing = getApps().find((a) => a.name === name)
  if (existing) return existing
  if (clientEmail && privateKey) {
    return initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }) },
      name
    )
  }
  return initializeApp({ projectId }, name)
}

const newApp = initAdminApp(
  "new",
  requiredEnv("FIREBASE_PROJECT_ID"),
  process.env.FIREBASE_CLIENT_EMAIL,
  process.env.FIREBASE_PRIVATE_KEY
)

const sameProject =
  !process.env.OLD_FIREBASE_PROJECT_ID ||
  process.env.OLD_FIREBASE_PROJECT_ID === process.env.FIREBASE_PROJECT_ID

const oldApp = sameProject
  ? newApp
  : initAdminApp(
      "old",
      requiredEnv("OLD_FIREBASE_PROJECT_ID"),
      process.env.OLD_FIREBASE_CLIENT_EMAIL,
      process.env.OLD_FIREBASE_PRIVATE_KEY
    )

const newDb = getFirestore(newApp)
const oldDb = getFirestore(oldApp)

// ---------------------------------------------------------------------------
// Counters
// ---------------------------------------------------------------------------

const stats = {
  users: 0,
  bankAccounts: { processed: 0, written: 0, errors: 0 },
  cases: { processed: 0, written: 0, errors: 0 },
  recipients: { processed: 0, written: 0, errors: 0 },
  payments: { processed: 0, written: 0, errors: 0 },
}

function log(msg: string) {
  process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`)
}

// ---------------------------------------------------------------------------
// Batch writer helper
// ---------------------------------------------------------------------------

async function commitBatch(batch: WriteBatch): Promise<void> {
  if (DRY_RUN) {
    log("  [dry-run] would commit batch")
    return
  }
  await batch.commit()
}

// ---------------------------------------------------------------------------
// Transform functions
// TODO: fill these in after completing P08-001 (old schema audit).
//
// Each function receives a raw old-app document snapshot and returns the
// new-app document data, or null to skip the record.
// ---------------------------------------------------------------------------

type OldBankAccount = Record<string, unknown>
type OldCase = Record<string, unknown>
type OldRecipient = Record<string, unknown>
type OldPayment = Record<string, unknown>

function transformBankAccount(uid: string, docId: string, old: OldBankAccount) {
  // TODO: map old fields to new schema.
  // Example assuming old app used flat fields at `bankAccounts/{docId}`:
  const routingNumber = String(old.routingNumber ?? old.routing_number ?? "")
  const accountNumber = String(old.accountNumber ?? old.account_number ?? "")
  if (!routingNumber || !accountNumber) {
    log(`  SKIP bankAccount ${docId} for uid ${uid}: missing routing/account number`)
    return null
  }
  const last4 = accountNumber.slice(-4)
  return {
    bankName: String(old.bankName ?? old.bank_name ?? "Unknown"),
    nickname: old.nickname ? String(old.nickname) : null,
    routingNumber: encrypt(routingNumber),
    accountNumber: encrypt(accountNumber),
    accountNumberLast4: last4,
    accountType: (old.accountType ?? old.account_type ?? "checking") as "checking" | "savings",
    verified: Boolean(old.verified ?? false),
    isPrimary: Boolean(old.isPrimary ?? old.is_primary ?? false),
    receivePayments: Boolean(old.receivePayments ?? old.receive_payments ?? true),
    sendPayments: Boolean(old.sendPayments ?? old.send_payments ?? true),
    createdAt: (old.createdAt as Timestamp) ?? Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
}

function transformCase(uid: string, docId: string, old: OldCase) {
  // TODO: map old fields to new schema.
  const caseNumber = String(old.caseNumber ?? old.case_number ?? "")
  if (!caseNumber) {
    log(`  SKIP case ${docId} for uid ${uid}: missing caseNumber`)
    return null
  }
  return {
    caseNumber,
    ncpName: String(old.ncpName ?? old.ncp_name ?? ""),
    children: Array.isArray(old.children) ? (old.children as string[]) : [],
    createdAt: (old.createdAt as Timestamp) ?? Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
}

function transformRecipient(uid: string, docId: string, old: OldRecipient) {
  // TODO: map old fields to new schema.
  const email = String(old.email ?? "")
  if (!email) {
    log(`  SKIP recipient ${docId} for uid ${uid}: missing email`)
    return null
  }
  return {
    firstName: String(old.firstName ?? old.first_name ?? ""),
    lastName: String(old.lastName ?? old.last_name ?? ""),
    email,
    caseId: old.caseId ? String(old.caseId) : null,
    createdAt: (old.createdAt as Timestamp) ?? Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
}

function transformPayment(uid: string, docId: string, old: OldPayment) {
  // TODO: map old fields to new schema.
  const amount = Number(old.amount ?? 0)
  if (!amount) {
    log(`  SKIP payment ${docId} for uid ${uid}: amount is 0`)
    return null
  }
  return {
    amount,
    bankId: String(old.bankId ?? old.bank_id ?? ""),
    caseNumber: String(old.caseNumber ?? old.case_number ?? ""),
    recipientId: old.recipientId ? String(old.recipientId) : null,
    recipientName: String(old.recipientName ?? old.recipient_name ?? ""),
    paymentDate: String(old.paymentDate ?? old.payment_date ?? ""),
    status: String(old.status ?? "completed"),
    type: (old.type ?? "send") as "send" | "request",
    note: old.note ? String(old.note) : null,
    createdAt: (old.createdAt as Timestamp) ?? Timestamp.now(),
  }
}

// ---------------------------------------------------------------------------
// Per-collection migrators
// ---------------------------------------------------------------------------

async function migrateBankAccounts(uid: string) {
  // TODO: update this path to match the old app's Firestore structure.
  const oldSnap = await oldDb.collection(`users/${uid}/bankAccounts`).get()
  let batch = newDb.batch()
  let batchCount = 0

  for (const doc of oldSnap.docs) {
    stats.bankAccounts.processed++
    try {
      const data = transformBankAccount(uid, doc.id, doc.data())
      if (!data) continue
      const ref = newDb.doc(`users/${uid}/bankAccounts/${doc.id}`)
      if (DRY_RUN) {
        log(`  [dry-run] would write bankAccount ${doc.id}`)
      } else {
        batch.set(ref, data, { merge: true })
        batchCount++
        stats.bankAccounts.written++
      }
    } catch (e) {
      stats.bankAccounts.errors++
      log(`  ERROR bankAccount ${doc.id} for uid ${uid}: ${e}`)
    }
    if (batchCount >= BATCH_SIZE) {
      await commitBatch(batch)
      batch = newDb.batch()
      batchCount = 0
    }
  }
  if (batchCount > 0) await commitBatch(batch)
}

async function migrateCases(uid: string) {
  const oldSnap = await oldDb.collection(`users/${uid}/cases`).get()
  let batch = newDb.batch()
  let batchCount = 0

  for (const doc of oldSnap.docs) {
    stats.cases.processed++
    try {
      const data = transformCase(uid, doc.id, doc.data())
      if (!data) continue
      const ref = newDb.doc(`users/${uid}/cases/${doc.id}`)
      if (DRY_RUN) {
        log(`  [dry-run] would write case ${doc.id}`)
      } else {
        batch.set(ref, data, { merge: true })
        batchCount++
        stats.cases.written++
      }
    } catch (e) {
      stats.cases.errors++
      log(`  ERROR case ${doc.id} for uid ${uid}: ${e}`)
    }
    if (batchCount >= BATCH_SIZE) {
      await commitBatch(batch)
      batch = newDb.batch()
      batchCount = 0
    }
  }
  if (batchCount > 0) await commitBatch(batch)
}

async function migrateRecipients(uid: string) {
  const oldSnap = await oldDb.collection(`users/${uid}/recipients`).get()
  let batch = newDb.batch()
  let batchCount = 0

  for (const doc of oldSnap.docs) {
    stats.recipients.processed++
    try {
      const data = transformRecipient(uid, doc.id, doc.data())
      if (!data) continue
      const ref = newDb.doc(`users/${uid}/recipients/${doc.id}`)
      if (DRY_RUN) {
        log(`  [dry-run] would write recipient ${doc.id}`)
      } else {
        batch.set(ref, data, { merge: true })
        batchCount++
        stats.recipients.written++
      }
    } catch (e) {
      stats.recipients.errors++
      log(`  ERROR recipient ${doc.id} for uid ${uid}: ${e}`)
    }
    if (batchCount >= BATCH_SIZE) {
      await commitBatch(batch)
      batch = newDb.batch()
      batchCount = 0
    }
  }
  if (batchCount > 0) await commitBatch(batch)
}

async function migratePayments(uid: string) {
  const oldSnap = await oldDb.collection(`users/${uid}/payments`).get()
  let batch = newDb.batch()
  let batchCount = 0

  for (const doc of oldSnap.docs) {
    stats.payments.processed++
    try {
      const data = transformPayment(uid, doc.id, doc.data())
      if (!data) continue
      const ref = newDb.doc(`users/${uid}/payments/${doc.id}`)
      if (DRY_RUN) {
        log(`  [dry-run] would write payment ${doc.id}`)
      } else {
        batch.set(ref, data, { merge: true })
        batchCount++
        stats.payments.written++
      }
    } catch (e) {
      stats.payments.errors++
      log(`  ERROR payment ${doc.id} for uid ${uid}: ${e}`)
    }
    if (batchCount >= BATCH_SIZE) {
      await commitBatch(batch)
      batch = newDb.batch()
      batchCount = 0
    }
  }
  if (batchCount > 0) await commitBatch(batch)
}

async function migrateUser(uid: string) {
  log(`Migrating uid: ${uid}`)
  await Promise.all([
    migrateBankAccounts(uid),
    migrateCases(uid),
    migrateRecipients(uid),
    migratePayments(uid),
  ])
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log(`Migration starting — dry-run=${DRY_RUN}`)

  if (SINGLE_UID) {
    await migrateUser(SINGLE_UID)
    stats.users = 1
  } else {
    // TODO: update this path to match where users are stored in the old app.
    // If same project and users are stored under `users/{uid}`, this lists all user docs.
    const usersSnap = await oldDb.collection("users").get()
    stats.users = usersSnap.size
    log(`Found ${stats.users} users`)
    for (const userDoc of usersSnap.docs) {
      await migrateUser(userDoc.id)
    }
  }

  log("Migration complete.")
  log(`  Users processed:     ${stats.users}`)
  log(`  Bank accounts:       ${stats.bankAccounts.written}/${stats.bankAccounts.processed} written, ${stats.bankAccounts.errors} errors`)
  log(`  Cases:               ${stats.cases.written}/${stats.cases.processed} written, ${stats.cases.errors} errors`)
  log(`  Recipients:          ${stats.recipients.written}/${stats.recipients.processed} written, ${stats.recipients.errors} errors`)
  log(`  Payments:            ${stats.payments.written}/${stats.payments.processed} written, ${stats.payments.errors} errors`)

  if (
    stats.bankAccounts.errors + stats.cases.errors + stats.recipients.errors + stats.payments.errors >
    0
  ) {
    process.exit(1)
  }
}

main().catch((e) => {
  log(`FATAL: ${e}`)
  process.exit(1)
})

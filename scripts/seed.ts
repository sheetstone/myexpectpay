#!/usr/bin/env tsx
/**
 * Standalone seed script — works without a browser session.
 *
 * Usage:
 *   npm run seed                          # prompts for UID
 *   npm run seed -- --uid=<firebaseUid>   # non-interactive
 *
 * Credentials (pick one):
 *   - Set FIRESTORE_EMULATOR_HOST to target the local emulator
 *   - Set FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + FIREBASE_PROJECT_ID for a service account
 *   - Or rely on Application Default Credentials (gcloud auth application-default login)
 */

import { readFileSync } from "fs"
import { resolve } from "path"

// Load .env.local so Firebase Admin credentials are available (same as Next.js does)
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const line of raw.split("\n")) {
      const t = line.trim()
      if (!t || t.startsWith("#")) continue
      const eq = t.indexOf("=")
      if (eq === -1) continue
      const k = t.slice(0, eq).trim()
      const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
      if (k && !(k in process.env)) process.env[k] = v
    }
  } catch { /* no .env.local — rely on shell env or ADC */ }
}
loadEnvLocal()

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore"
import { createCipheriv, randomBytes } from "crypto"
import { createInterface } from "readline/promises"
import { stdin as input, stdout as output } from "process"

// ── Firebase Admin init ───────────────────────────────────────────────────────

function initAdmin() {
  if (getApps().length) return
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    "myexpertpay"

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  if (privateKey && clientEmail) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  } else {
    // ADC or emulator
    initializeApp({ projectId })
  }
}

// ── Encryption (mirrors src/lib/crypto.ts) ───────────────────────────────────

function encrypt(plaintext: string): string {
  const key = process.env.ACCOUNT_ENCRYPTION_KEY
  if (!key) {
    // In emulator / dev without key: store plaintext with a dev prefix so
    // the app knows not to try to decrypt it.
    console.warn("⚠  ACCOUNT_ENCRYPTION_KEY not set — storing account numbers as plaintext (dev only)")
    return `plain:${plaintext}`
  }
  const keyBuf = Buffer.from(key, "hex")
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", keyBuf, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

// ── Random helpers ────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randAmount(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function daysAgoDate(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

const FIRST_NAMES = ["James", "Maria", "David", "Sarah", "Carlos", "Emma", "Michael", "Olivia", "Daniel", "Sophia"]
const LAST_NAMES  = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Taylor"]
const BANK_NAMES  = ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "US Bank", "PNC Bank", "TD Bank"]
const ROUTING_NOS = ["021000021", "026009593", "121000248", "111000025", "121122676"]
const STATUSES    = ["completed", "in_progress", "accepted", "returned", "cancelled"] as const
const TYPES       = ["sent", "received", "pending_sent", "pending_received"] as const
const MSG_SENDERS = ["ExpertPay Support", "Payment System", "Compliance Team", "Account Services"]

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed(uid: string) {
  initAdmin()
  const db = getFirestore()
  const userRef = db.collection("users").doc(uid)

  // Clear existing data
  async function clearCol(name: string) {
    const snap = await userRef.collection(name).get()
    if (!snap.empty) {
      const batch = db.batch()
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
    }
  }

  process.stdout.write(`Clearing existing data for uid=${uid} … `)
  await Promise.all(["bankAccounts", "cases", "recipients", "payments", "messages"].map(clearCol))
  console.log("done.")

  const ts = FieldValue.serverTimestamp()

  // ── Bank accounts (2–3) ───────────────────────────────────────────────────
  const bankCount = randInt(2, 3)
  const bankRefs: FirebaseFirestore.DocumentReference[] = []
  const bankBatch = db.batch()

  for (let i = 0; i < bankCount; i++) {
    const ref = userRef.collection("bankAccounts").doc()
    bankRefs.push(ref)
    const last4 = String(randInt(1000, 9999))
    const acctNo = `4${randInt(100000000, 999999999)}${last4}`
    bankBatch.set(ref, {
      bankName: pick(BANK_NAMES),
      nickname: i === 0 ? `${pick(["Main", "Primary", "Personal"])} Checking` : `${pick(["Savings", "Secondary", "Business"])}`,
      routingNumber: encrypt(pick(ROUTING_NOS)),
      accountNumber: encrypt(acctNo),
      accountNumberLast4: last4,
      accountType: i === 0 ? "checking" : pick(["checking", "saving"]),
      verified: i === 0 ? true : Math.random() > 0.4,
      isPrimary: i === 0,
      receivePayments: true,
      sendPayments: i === 0,
      createdAt: ts,
      updatedAt: ts,
    })
  }
  await bankBatch.commit()

  // ── Cases (2) ────────────────────────────────────────────────────────────
  const caseLetters = () => String.fromCharCode(randInt(65, 90)) + String.fromCharCode(randInt(65, 90))
  const caseRefs: { ref: FirebaseFirestore.DocumentReference; number: string }[] = []
  const caseBatch = db.batch()

  for (let i = 0; i < 2; i++) {
    const ref = userRef.collection("cases").doc()
    const ncp = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    const caseNumber = `${caseLetters()}-${randInt(10000, 99999)}`
    const childCount = randInt(1, 3)
    const children = Array.from({ length: childCount }, () => `${pick(FIRST_NAMES)} ${ncp.split(" ")[1]}`)
    caseRefs.push({ ref, number: caseNumber })
    caseBatch.set(ref, {
      caseNumber,
      ncpName: ncp,
      children,
      createdAt: ts,
      updatedAt: ts,
    })
  }
  await caseBatch.commit()

  // ── Recipients (3) ───────────────────────────────────────────────────────
  const recNames: string[] = []
  const recBatch = db.batch()

  for (let i = 0; i < 3; i++) {
    const ref = userRef.collection("recipients").doc()
    const first = pick(FIRST_NAMES)
    const last  = pick(LAST_NAMES)
    recNames.push(`${first} ${last}`)
    recBatch.set(ref, {
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@example.com`,
      caseId: i < 2 ? caseRefs[i].ref.id : null,
      createdAt: ts,
      updatedAt: ts,
    })
  }
  await recBatch.commit()

  // ── Payments (18–24, spread over 12 months) ───────────────────────────────
  const paymentBatch = db.batch()
  const paymentCount = randInt(18, 24)

  // Spread payments across the last 12 months
  const usedDays = new Set<number>()
  function uniqueDaysAgo(min: number, max: number): number {
    let d: number
    do { d = randInt(min, max) } while (usedDays.has(d))
    usedDays.add(d)
    return d
  }

  // Bucket: recent (0–30), 1–2mo (31–90), 3–6mo (91–180), 6–12mo (181–365)
  const buckets = [
    { min: 0,   max: 30,  count: Math.floor(paymentCount * 0.3) },
    { min: 31,  max: 90,  count: Math.floor(paymentCount * 0.3) },
    { min: 91,  max: 180, count: Math.floor(paymentCount * 0.2) },
    { min: 181, max: 365, count: Math.floor(paymentCount * 0.2) },
  ]

  for (const bucket of buckets) {
    for (let i = 0; i < bucket.count; i++) {
      const dAgo = uniqueDaysAgo(bucket.min, bucket.max)
      const date = daysAgoDate(dAgo)
      const isRecent = dAgo < 14
      const type  = pick(TYPES)
      const status = isRecent ? pick(["in_progress", "accepted", "completed"] as const) : pick(STATUSES)
      const ref = userRef.collection("payments").doc()
      paymentBatch.set(ref, {
        amount: randAmount(200, 1500),
        bankId: bankRefs[0].id,
        caseNumber: Math.random() > 0.25 ? pick(caseRefs).number : null,
        recipientId: null,
        recipientName: pick(recNames),
        paymentDate: isoDate(date),
        status,
        type,
        note: Math.random() > 0.7 ? pick(["Monthly support", "Back payment", "Adjustment", "Q2 support"]) : null,
        createdAt: Timestamp.fromDate(date),
      })
    }
  }
  await paymentBatch.commit()

  // ── Messages (5–7) ────────────────────────────────────────────────────────
  const msgBatch = db.batch()
  const msgTemplates = [
    { subj: "Your account has been verified", body: "Your ExpertPay account has been successfully verified. You can now send and receive payments.", isRead: true,  dAgo: randInt(1, 3) },
    { subj: `New payment received — $${randAmount(400, 1200).toFixed(2)}`, body: "A payment has been received. The funds will be available within 1–3 business days.", isRead: false, dAgo: randInt(2, 7) },
    { subj: "Action required: review routing rules", body: "Please review your bank account routing rules to ensure payments are directed correctly.", isRead: false, dAgo: randInt(5, 10) },
    { subj: "Payment processed successfully", body: "Your recent payment has been submitted and is being processed.", isRead: true, dAgo: randInt(8, 15) },
    { subj: "Monthly statement is ready", body: "Your monthly payment statement is now available. Log in to view a full summary.", isRead: true, dAgo: randInt(28, 35) },
    { subj: "Security notice: new device login", body: "A login was detected from a new device. If this was not you, please contact support immediately.", isRead: false, dAgo: randInt(1, 4) },
    { subj: "Case update: document required", body: "An update to one of your cases requires a supporting document. Please log in to upload it.", isRead: false, dAgo: randInt(3, 9) },
  ]

  const msgCount = randInt(5, 7)
  const chosen = [...msgTemplates].sort(() => Math.random() - 0.5).slice(0, msgCount)

  for (const msg of chosen) {
    const date = daysAgoDate(msg.dAgo)
    msgBatch.set(userRef.collection("messages").doc(), {
      sender: pick(MSG_SENDERS),
      subject: msg.subj,
      body: msg.body,
      isRead: msg.isRead,
      createdAt: Timestamp.fromDate(date),
    })
  }
  await msgBatch.commit()

  console.log(`✅  Seeded uid=${uid}`)
  console.log(`    bank accounts : ${bankCount}`)
  console.log(`    cases         : 2`)
  console.log(`    recipients    : 3`)
  console.log(`    payments      : ${paymentCount}`)
  console.log(`    messages      : ${msgCount}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const uidFlag = process.argv.find((a) => a.startsWith("--uid="))?.slice(6)

  let uid = uidFlag?.trim()

  if (!uid) {
    const rl = createInterface({ input, output })
    uid = (await rl.question("Enter user UID: ")).trim()
    rl.close()
  }

  if (!uid) {
    console.error("Error: UID is required.")
    process.exit(1)
  }

  await seed(uid)
  process.exit(0)
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})

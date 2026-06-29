import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAdminDb } from "@/lib/firebase/admin"
import { encrypt } from "@/lib/crypto"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { PAYMENT_STATUS, PAYMENT_TYPE } from "@/types"

export const dynamic = "force-dynamic"

// Only available in development
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }

  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getAdminDb()
  const uid = session.uid
  const userRef = db.collection("users").doc(uid)

  // Clear existing data first
  async function clearCollection(colName: string) {
    const snap = await userRef.collection(colName).get()
    const batch = db.batch()
    snap.docs.forEach((d) => batch.delete(d.ref))
    if (snap.docs.length > 0) await batch.commit()
  }

  await Promise.all([
    clearCollection("bankAccounts"),
    clearCollection("cases"),
    clearCollection("recipients"),
    clearCollection("payments"),
    clearCollection("messages"),
  ])

  const now = FieldValue.serverTimestamp()

  // ── Bank accounts ──────────────────────────────────────────────────────────
  const bank1Ref = userRef.collection("bankAccounts").doc()
  const bank2Ref = userRef.collection("bankAccounts").doc()

  await Promise.all([
    bank1Ref.set({
      bankName: "Chase Bank",
      nickname: "Main Checking",
      routingNumber: encrypt("021000021"),
      accountNumber: encrypt("4532015112830366"),
      accountNumberLast4: "0366",
      accountType: "checking",
      verified: true,
      isPrimary: true,
      receivePayments: true,
      sendPayments: true,
      createdAt: now,
      updatedAt: now,
    }),
    bank2Ref.set({
      bankName: "Bank of America",
      nickname: "Savings",
      routingNumber: encrypt("026009593"),
      accountNumber: encrypt("6011111111111117"),
      accountNumberLast4: "1117",
      accountType: "saving",
      verified: true,
      isPrimary: false,
      receivePayments: true,
      sendPayments: false,
      createdAt: now,
      updatedAt: now,
    }),
  ])

  // ── Cases ──────────────────────────────────────────────────────────────────
  const case1Ref = userRef.collection("cases").doc()
  const case2Ref = userRef.collection("cases").doc()

  await Promise.all([
    case1Ref.set({
      caseNumber: "AB-12345",
      ncpName: "John Smith",
      children: ["Emma Smith", "Liam Smith"],
      createdAt: now,
      updatedAt: now,
    }),
    case2Ref.set({
      caseNumber: "CD-67890",
      ncpName: "Mary Johnson",
      children: ["Sophie Johnson"],
      createdAt: now,
      updatedAt: now,
    }),
  ])

  // ── Recipients ─────────────────────────────────────────────────────────────
  const rec1Ref = userRef.collection("recipients").doc()
  const rec2Ref = userRef.collection("recipients").doc()
  const rec3Ref = userRef.collection("recipients").doc()

  await Promise.all([
    rec1Ref.set({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      caseId: case1Ref.id,
      createdAt: now,
      updatedAt: now,
    }),
    rec2Ref.set({
      firstName: "Bob",
      lastName: "Brown",
      email: "bob.brown@example.com",
      caseId: case2Ref.id,
      createdAt: now,
      updatedAt: now,
    }),
    rec3Ref.set({
      firstName: "Alice",
      lastName: "Green",
      email: "alice.green@example.com",
      caseId: null,
      createdAt: now,
      updatedAt: now,
    }),
  ])

  // ── Payments (12 months of history) ────────────────────────────────────────
  const today = new Date()
  const paymentBatch = db.batch()

  const paymentData = [
    // Recent month — current  (in_progress / accepted)
    { daysAgo: 2,  amount: 850,  type: PAYMENT_TYPE.sent,             status: PAYMENT_STATUS.in_progress,  recipient: "Jane Doe",  case: "AB-12345" },
    { daysAgo: 5,  amount: 1200, type: PAYMENT_TYPE.received,         status: PAYMENT_STATUS.accepted,     recipient: "Bob Brown", case: "CD-67890" },
    { daysAgo: 8,  amount: 450,  type: PAYMENT_TYPE.sent,             status: PAYMENT_STATUS.completed,    recipient: "Alice Green", case: null },
    { daysAgo: 12, amount: 320,  type: PAYMENT_TYPE.pending_received, status: PAYMENT_STATUS.in_progress,  recipient: "Jane Doe",  case: "AB-12345" },
    // 1 month ago
    { daysAgo: 35, amount: 900,  type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Bob Brown",  case: "CD-67890" },
    { daysAgo: 38, amount: 1100, type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.completed, recipient: "Jane Doe",   case: "AB-12345" },
    { daysAgo: 42, amount: 250,  type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.cancelled, recipient: "Alice Green", case: null },
    // 2 months ago
    { daysAgo: 65, amount: 780,  type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Jane Doe",  case: "AB-12345" },
    { daysAgo: 70, amount: 650,  type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.completed, recipient: "Bob Brown", case: "CD-67890" },
    // 3 months ago
    { daysAgo: 95,  amount: 1050, type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Jane Doe",  case: "AB-12345" },
    { daysAgo: 100, amount: 890,  type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.completed, recipient: "Alice Green", case: null },
    // 4 months ago
    { daysAgo: 125, amount: 720, type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Bob Brown", case: "CD-67890" },
    { daysAgo: 130, amount: 980, type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.returned,  recipient: "Jane Doe",  case: "AB-12345" },
    // 5 months ago
    { daysAgo: 155, amount: 840, type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Jane Doe",  case: "AB-12345" },
    { daysAgo: 160, amount: 560, type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.completed, recipient: "Bob Brown", case: "CD-67890" },
    // 6+ months ago
    { daysAgo: 185, amount: 900,  type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Jane Doe",   case: "AB-12345" },
    { daysAgo: 215, amount: 750,  type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.completed, recipient: "Alice Green", case: null },
    { daysAgo: 245, amount: 1100, type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Bob Brown",  case: "CD-67890" },
    { daysAgo: 275, amount: 640,  type: PAYMENT_TYPE.received, status: PAYMENT_STATUS.completed, recipient: "Jane Doe",   case: "AB-12345" },
    { daysAgo: 335, amount: 870,  type: PAYMENT_TYPE.sent,     status: PAYMENT_STATUS.completed, recipient: "Bob Brown",  case: "CD-67890" },
  ]

  for (const p of paymentData) {
    const date = new Date(today)
    date.setDate(date.getDate() - p.daysAgo)
    const paymentDate = date.toISOString().slice(0, 10)
    const ref = userRef.collection("payments").doc()
    paymentBatch.set(ref, {
      amount: p.amount,
      caseNumber: p.case ?? null,
      recipientId: null,
      recipientName: p.recipient,
      bankId: bank1Ref.id,
      paymentDate,
      status: p.status,
      type: p.type,
      note: null,
      createdAt: Timestamp.fromDate(date),
    })
  }
  await paymentBatch.commit()

  // ── Messages ───────────────────────────────────────────────────────────────
  const msgBatch = db.batch()
  const messages = [
    {
      sender: "ExpertPay Support",
      subject: "Your account has been verified",
      body: "Congratulations! Your ExpertPay account has been successfully verified. You can now send and receive payments.",
      isRead: true,
      daysAgo: 1,
    },
    {
      sender: "Payment System",
      subject: "New payment received — $1,200.00",
      body: "A payment of $1,200.00 has been received from Bob Brown (Case CD-67890). The funds will be available within 1–3 business days.",
      isRead: false,
      daysAgo: 3,
    },
    {
      sender: "ExpertPay Support",
      subject: "Action required: review routing rules",
      body: "Please review your bank account routing rules to ensure payments are directed to the correct accounts.",
      isRead: false,
      daysAgo: 6,
    },
    {
      sender: "Payment System",
      subject: "Payment processed — $850.00",
      body: "Your payment of $850.00 to Jane Doe (Case AB-12345) has been submitted and is being processed.",
      isRead: true,
      daysAgo: 10,
    },
    {
      sender: "ExpertPay Support",
      subject: "Monthly statement for last month is ready",
      body: "Your monthly payment statement is now available. Log in to view a full summary of your payment activity.",
      isRead: true,
      daysAgo: 32,
    },
  ]

  for (const msg of messages) {
    const date = new Date(today)
    date.setDate(date.getDate() - msg.daysAgo)
    const ref = userRef.collection("messages").doc()
    msgBatch.set(ref, {
      sender: msg.sender,
      subject: msg.subject,
      body: msg.body,
      isRead: msg.isRead,
      createdAt: Timestamp.fromDate(date),
    })
  }
  await msgBatch.commit()

  return NextResponse.json({
    ok: true,
    uid,
    seeded: {
      bankAccounts: 2,
      cases: 2,
      recipients: 3,
      payments: paymentData.length,
      messages: messages.length,
    },
  })
}

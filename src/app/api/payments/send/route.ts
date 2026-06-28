import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createSendPayment } from "@/lib/firestore/payments"
import { getBank } from "@/lib/firestore/banks"
import { getRecipient } from "@/lib/firestore/recipients"
import { sendPaymentSchema } from "@/lib/schemas/paymentSchema"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = sendPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const bank = await getBank(session.uid, parsed.data.bankId)
  if (!bank) {
    return NextResponse.json({ error: "Bank account not found" }, { status: 400 })
  }
  if (!bank.verified) {
    return NextResponse.json({ error: "Bank account is not verified" }, { status: 400 })
  }

  if (parsed.data.recipientId) {
    const recipient = await getRecipient(session.uid, parsed.data.recipientId)
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 400 })
    }
  }

  const payment = await createSendPayment(session.uid, parsed.data)
  return NextResponse.json(payment, { status: 201 })
}

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createRequestPayment } from "@/lib/firestore/payments"
import { getRecipient } from "@/lib/firestore/recipients"
import { requestPaymentSchema } from "@/lib/schemas/paymentSchema"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = requestPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.recipientId) {
    const recipient = await getRecipient(session.uid, parsed.data.recipientId)
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 400 })
    }
  }

  const payment = await createRequestPayment(session.uid, parsed.data)
  return NextResponse.json(payment, { status: 201 })
}

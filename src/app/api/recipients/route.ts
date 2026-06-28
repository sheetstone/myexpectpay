import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { listRecipients, createRecipient } from "@/lib/firestore/recipients"
import { getCase } from "@/lib/firestore/cases"
import { createRecipientSchema } from "@/lib/schemas/recipientSchema"
import { PAGE_SIZE } from "@/constants"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get("cursor") ?? undefined
  const limit = Math.min(Number(searchParams.get("limit") ?? PAGE_SIZE), 100)

  const result = await listRecipients(session.uid, { cursor, limit })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createRecipientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.caseId) {
    const c = await getCase(session.uid, parsed.data.caseId)
    if (!c) {
      return NextResponse.json({ error: "Case not found" }, { status: 400 })
    }
  }

  const recipient = await createRecipient(session.uid, parsed.data)
  return NextResponse.json(recipient, { status: 201 })
}

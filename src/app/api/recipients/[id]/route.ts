import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateRecipient, deleteRecipient } from "@/lib/firestore/recipients"
import { getCase } from "@/lib/firestore/cases"
import { updateRecipientSchema } from "@/lib/schemas/recipientSchema"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = updateRecipientSchema.safeParse(body)
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

  const { id } = await params
  const recipient = await updateRecipient(session.uid, id, parsed.data)
  if (!recipient) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(recipient)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const deleted = await deleteRecipient(session.uid, id)
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateCase, deleteCase } from "@/lib/firestore/cases"
import { updateCaseSchema } from "@/lib/schemas/caseSchema"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = updateCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { id } = await params
  const c = await updateCase(session.uid, id, parsed.data)
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(c)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const deleted = await deleteCase(session.uid, id)
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { markMessageRead } from "@/lib/firestore/messages"

export const dynamic = "force-dynamic"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const message = await markMessageRead(session.uid, id)
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(message)
}

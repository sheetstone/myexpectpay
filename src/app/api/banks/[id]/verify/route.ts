import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { verifyBank } from "@/lib/firestore/banks"

export const dynamic = "force-dynamic"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const bank = await verifyBank(session.uid, id)
  if (!bank) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(bank)
}

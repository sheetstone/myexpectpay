import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import {
  getBank,
  getBankStats,
  getBankTrend,
  getBankRecentPayments,
  updateBank,
  deleteBank,
} from "@/lib/firestore/banks"
import { updateBankSchema } from "@/lib/schemas/bankSchema"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const bank = await getBank(session.uid, id)
  if (!bank) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const [stats, trend, recentPayments] = await Promise.all([
    getBankStats(session.uid, id),
    getBankTrend(session.uid, id),
    getBankRecentPayments(session.uid, id),
  ])
  return NextResponse.json({ ...bank, stats, trend, recentPayments })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = updateBankSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { id } = await params
  const bank = await updateBank(session.uid, id, parsed.data)
  if (!bank) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(bank)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const deleted = await deleteBank(session.uid, id)
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}

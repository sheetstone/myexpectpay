import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { listBanks, createBank } from "@/lib/firestore/banks"
import { createBankSchema } from "@/lib/schemas/bankSchema"
import { PAGE_SIZE } from "@/constants"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get("cursor") ?? undefined
  const limit = Math.min(Number(searchParams.get("limit") ?? PAGE_SIZE), 100)

  const result = await listBanks(session.uid, { cursor, limit })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createBankSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const bank = await createBank(session.uid, parsed.data)
  return NextResponse.json(bank, { status: 201 })
}

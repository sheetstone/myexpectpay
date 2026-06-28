import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { listMessages } from "@/lib/firestore/messages"
import { PAGE_SIZE } from "@/constants"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get("cursor") ?? undefined
  const limit = Math.min(Number(searchParams.get("limit") ?? PAGE_SIZE), 100)

  const result = await listMessages(session.uid, { cursor, limit })
  return NextResponse.json(result)
}

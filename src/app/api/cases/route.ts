import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { listCases, createCase } from "@/lib/firestore/cases"
import { createCaseSchema } from "@/lib/schemas/caseSchema"
import { PAGE_SIZE } from "@/constants"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const cursor = searchParams.get("cursor") ?? undefined
  const limit = Math.min(Number(searchParams.get("limit") ?? PAGE_SIZE), 100)

  const result = await listCases(session.uid, { cursor, limit })
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const c = await createCase(session.uid, parsed.data)
  return NextResponse.json(c, { status: 201 })
}

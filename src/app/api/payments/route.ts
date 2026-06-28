import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { listPayments } from "@/lib/firestore/payments"
import { paymentFiltersSchema } from "@/lib/schemas/paymentSchema"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const statusParam = searchParams.getAll("status")

  const raw = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    status: statusParam.length > 0 ? statusParam : undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  }

  const parsed = paymentFiltersSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const result = await listPayments(session.uid, parsed.data)
  return NextResponse.json(result)
}

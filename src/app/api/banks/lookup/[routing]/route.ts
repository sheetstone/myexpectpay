import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { validateRouting } from "@/utils/validateRouting"
import { lookupBankName } from "@/lib/bankLookup"

export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ routing: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { routing } = await params
  if (!validateRouting(routing)) {
    return NextResponse.json({ error: "Invalid routing number" }, { status: 400 })
  }

  const bankName = lookupBankName(routing)
  if (!bankName) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ bankName })
}

import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { z } from "zod"

export const dynamic = "force-dynamic"

const bodySchema = z.object({ idToken: z.string().min(1) })

const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { idToken } = parsed.data

  try {
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    })

    return response
  } catch (err) {
    console.error("[session] createSessionCookie failed:", err)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

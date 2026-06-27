import { NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { getSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await getSession()

  if (session) {
    await getAdminAuth().revokeRefreshTokens(session.uid).catch(() => {})
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })

  return response
}

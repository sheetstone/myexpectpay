import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin"

const profileSchema = z.object({
  displayName: z.string().min(2).max(100),
})

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  await getAdminAuth().updateUser(session.uid, { displayName: parsed.data.displayName })
  return NextResponse.json({ ok: true })
}

export const dynamic = "force-dynamic"

const SUBCOLLECTIONS = [
  "bankAccounts",
  "cases",
  "recipients",
  "payments",
  "messages",
] as const

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const db = getAdminDb()
  const uid = session.uid
  const userRef = db.collection("users").doc(uid)

  for (const sub of SUBCOLLECTIONS) {
    const snap = await userRef.collection(sub).get()
    // Firestore batches are capped at 500 writes
    for (let i = 0; i < snap.docs.length; i += 500) {
      const batch = db.batch()
      snap.docs.slice(i, i + 500).forEach((doc) => batch.delete(doc.ref))
      await batch.commit()
    }
  }

  await userRef.delete()

  // Fully remove the auth identity. deleteUser also invalidates all
  // sessions/refresh tokens, so an explicit revoke is unnecessary.
  await getAdminAuth().deleteUser(uid)

  // Clear the session cookie so the browser isn't left holding a stale one.
  const response = new NextResponse(null, { status: 204 })
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}

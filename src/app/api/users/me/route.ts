import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin"

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
  await getAdminAuth().revokeRefreshTokens(uid)

  return new NextResponse(null, { status: 204 })
}

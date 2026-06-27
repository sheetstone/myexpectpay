import { cookies } from "next/headers"
import { getAdminAuth } from "@/lib/firebase/admin"

export interface SessionUser {
  uid: string
  email: string | undefined
  name: string | undefined
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")?.value

  if (!sessionCookie) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name as string | undefined,
    }
  } catch {
    return null
  }
}

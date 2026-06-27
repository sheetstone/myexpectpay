import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get("session")?.value

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))
  let isValid = false

  if (sessionCookie) {
    try {
      await getAdminAuth().verifySessionCookie(sessionCookie, true)
      isValid = true
    } catch {
      isValid = false
    }
  }

  if (isAuthRoute && isValid) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!isAuthRoute && !isValid) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

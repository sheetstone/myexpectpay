import { NextRequest, NextResponse } from "next/server"

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get("session")?.value
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  )

  // Redirect unauthenticated requests away from protected routes.
  // Auth-route redirects for already-authenticated users are handled
  // server-side in (auth)/layout.tsx using the full Firebase Admin verification.
  if (!isAuthRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

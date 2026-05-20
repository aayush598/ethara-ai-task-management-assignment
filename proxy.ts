import { NextResponse, type NextRequest } from "next/server"

const publicRoutes = ["/", "/login", "/register"]

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some((route) => pathname === route)
  const isAuthApi = pathname.startsWith("/api/auth")
  const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/favicon")

  if (isStatic) return NextResponse.next()

  const sessionCookie = request.cookies.get("better-auth.session_token")?.value
  const isAuthenticated = !!sessionCookie

  if (!isAuthenticated && !isPublic && !isAuthApi) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

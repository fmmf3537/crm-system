import { NextResponse, type NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const AUTH_COOKIE_NAME = "crm_token"
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"

type TokenPayload = { sub: string; role?: string }

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/activities") ||
    pathname.startsWith("/admin")

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  let payload: TokenPayload | null = null
  try {
    payload = jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith("/admin") && payload?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/customers/:path*",
    "/activities/:path*",
    "/admin/:path*",
  ],
}


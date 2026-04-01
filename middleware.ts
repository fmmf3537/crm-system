import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify, type JWTPayload } from "jose"

const AUTH_COOKIE_NAME = "crm_token"
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"

type TokenPayload = { sub: string; role?: string }
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

export async function middleware(request: NextRequest) {
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
    const verified = await jwtVerify(token, JWT_SECRET_KEY)
    const jwtPayload = verified.payload as JWTPayload
    payload = {
      sub: String(jwtPayload.sub ?? ""),
      role: typeof jwtPayload.role === "string" ? jwtPayload.role : undefined,
    }
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


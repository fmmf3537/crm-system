import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { AUTH_COOKIE_NAME, signToken, verifyPassword } from "@/lib/auth"
import { findUserByEmail } from "@/lib/users-store"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { email, password } = (body ?? {}) as {
    email?: string
    password?: string
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "邮箱和密码必填" },
      { status: 400 },
    )
  }

  const user = await findUserByEmail(email)
  if (!user || user.status !== "active") {
    return NextResponse.json(
      { error: "账号不存在或已停用" },
      { status: 401 },
    )
  }

  const ok = await verifyPassword(password, user.password)
  if (!ok) {
    return NextResponse.json(
      { error: "邮箱或密码错误" },
      { status: 401 },
    )
  }

  const token = signToken(user)
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
  })
}


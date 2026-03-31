import { NextResponse } from "next/server"

import { hashPassword, requireUser, verifyPassword } from "@/lib/auth"
import { readUsers, writeUsers } from "@/lib/users-store"

export async function PUT(request: Request) {
  const user = await requireUser()
  if (!user) {
    return NextResponse.json({ error: "未登录或账号无效" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        oldPassword?: string
        newPassword?: string
      }
    | null

  if (!body?.oldPassword || !body?.newPassword) {
    return NextResponse.json(
      { error: "旧密码和新密码必填" },
      { status: 400 },
    )
  }
  if (body.newPassword.length < 6) {
    return NextResponse.json(
      { error: "新密码至少 6 位" },
      { status: 400 },
    )
  }

  const users = await readUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx === -1) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 })
  }

  const current = users[idx]
  const ok = await verifyPassword(body.oldPassword, current.password)
  if (!ok) {
    return NextResponse.json({ error: "旧密码不正确" }, { status: 400 })
  }

  current.password = await hashPassword(body.newPassword)
  current.updatedAt = new Date().toISOString()
  users[idx] = current
  await writeUsers(users)

  return NextResponse.json({ ok: true })
}


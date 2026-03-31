import { NextResponse } from "next/server"

import { requireUser, toSafeUser } from "@/lib/auth"
import { readUsers, writeUsers } from "@/lib/users-store"

export async function PUT(request: Request) {
  const user = await requireUser()
  if (!user) {
    return NextResponse.json({ error: "未登录或账号无效" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string
        phone?: string
        department?: string
        avatarUrl?: string
      }
    | null

  if (!body) {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 })
  }

  const users = await readUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx === -1) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 })
  }

  const current = users[idx]
  const next = {
    ...current,
    name: body.name?.trim() || current.name,
    phone: body.phone?.trim() ?? current.phone,
    department: body.department?.trim() ?? current.department,
    avatarUrl: body.avatarUrl?.trim() || current.avatarUrl,
    updatedAt: new Date().toISOString(),
  }

  users[idx] = next
  await writeUsers(users)

  return NextResponse.json({ user: toSafeUser(next) })
}


import { NextResponse } from "next/server"

import { hashPassword, requireAdmin, toSafeUser } from "@/lib/auth"
import { readUsers, writeUsers } from "@/lib/users-store"
import type { User } from "@/types/user"

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: "无权限，只有管理员可以创建用户" },
      { status: 403 },
    )
  }

  const body = await request.json().catch(() => null)
  const {
    username,
    email,
    password,
    name,
    role = "sales",
    teamId,
    department = "",
    phone = "",
    status = "active",
  } = (body ?? {}) as Partial<User> & { password?: string }

  if (!email || !password || !username || !name) {
    return NextResponse.json(
      { error: "用户名、姓名、邮箱和密码必填" },
      { status: 400 },
    )
  }

  const users = await readUsers()
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json(
      { error: "邮箱已被使用" },
      { status: 409 },
    )
  }

  const now = new Date().toISOString()
  const hashed = await hashPassword(password)
  const user: User = {
    id: crypto.randomUUID(),
    username,
    email,
    password: hashed,
    name,
    role: role ?? "sales",
    teamId,
    department,
    phone,
    status: status ?? "active",
    createdAt: now,
    updatedAt: now,
  }

  users.push(user)
  await writeUsers(users)

  return NextResponse.json(toSafeUser(user), { status: 201 })
}


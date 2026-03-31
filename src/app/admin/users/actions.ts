"use server"

import { revalidatePath } from "next/cache"

import { hashPassword, requireAdmin, toSafeUser } from "@/lib/auth"
import { readUsers, writeUsers, findUserById } from "@/lib/users-store"
import {
  type UserCreateValues,
  type UserUpdateValues,
  userCreateSchema,
  userUpdateSchema,
} from "@/lib/validations/user"
import type { SafeUser, User } from "@/types/user"

export type UserActionResult =
  | { ok: true; user: SafeUser }
  | { ok: false; error: string }

export type PasswordResetResult =
  | { ok: true; newPassword: string }
  | { ok: false; error: string }

export type DeleteResult = { ok: true } | { ok: false; error: string }

export async function adminCreateUser(
  input: UserCreateValues,
): Promise<UserActionResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: "无权限" }

  const parsed = userCreateSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      ok: false,
      error: fieldErrors[0] ?? parsed.error.message ?? "校验失败",
    }
  }

  const data = parsed.data
  const users = await readUsers()
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, error: "邮箱已被使用" }
  }

  const now = new Date().toISOString()
  const hashed = await hashPassword(data.password)

  const user: User = {
    id: crypto.randomUUID(),
    username: data.username,
    email: data.email,
    password: hashed,
    name: data.name,
    role: data.role,
    teamId: data.teamId,
    department: data.department,
    phone: data.phone,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  }

  users.push(user)
  await writeUsers(users)
  revalidatePath("/admin/users")

  return { ok: true, user: toSafeUser(user) }
}

export async function adminUpdateUser(
  id: string,
  input: UserUpdateValues,
): Promise<UserActionResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: "无权限" }

  const parsed = userUpdateSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      ok: false,
      error: fieldErrors[0] ?? parsed.error.message ?? "校验失败",
    }
  }

  const users = await readUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return { ok: false, error: "用户不存在" }

  const existing = users[index]

  if (
    users.some(
      (u) =>
        u.id !== id && u.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )
  ) {
    return { ok: false, error: "邮箱已被使用" }
  }

  const now = new Date().toISOString()
  const next: User = {
    ...existing,
    ...parsed.data,
    teamId: parsed.data.teamId || undefined,
    updatedAt: now,
  }

  users[index] = next
  await writeUsers(users)
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${id}`)

  return { ok: true, user: toSafeUser(next) }
}

export async function adminDeleteUser(id: string): Promise<DeleteResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: "无权限" }
  if (admin.id === id) return { ok: false, error: "不能删除当前登录账号" }

  const users = await readUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return { ok: false, error: "用户不存在" }

  users.splice(index, 1)
  await writeUsers(users)
  revalidatePath("/admin/users")

  return { ok: true }
}

export async function adminResetPassword(id: string): Promise<PasswordResetResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: "无权限" }

  const user = await findUserById(id)
  if (!user) return { ok: false, error: "用户不存在" }

  const newPassword = Math.random().toString(36).slice(-10)
  const hashed = await hashPassword(newPassword)

  const users = await readUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return { ok: false, error: "用户不存在" }

  users[index] = {
    ...users[index],
    password: hashed,
    updatedAt: new Date().toISOString(),
  }
  await writeUsers(users)
  revalidatePath(`/admin/users/${id}`)

  return { ok: true, newPassword }
}


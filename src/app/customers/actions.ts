"use server"

import { revalidatePath } from "next/cache"

import {
  getCustomerById,
  readCustomers,
  writeCustomers,
} from "@/lib/customers-store"
import { readProjects } from "@/lib/projects-store"
import { requireUser } from "@/lib/auth"
import { canAccessByOwnership } from "@/lib/permissions"
import { readUsers } from "@/lib/users-store"
import { customerFormSchema, type CustomerFormValues } from "@/lib/validations/customer"
import type { Customer } from "@/types/customer"

function nowIso() {
  return new Date().toISOString()
}

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string }

export async function createCustomer(
  input: CustomerFormValues,
): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) {
    return { ok: false, message: "未登录或账号无效" }
  }
  const parsed = customerFormSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      ok: false,
      message: fieldErrors[0] ?? parsed.error.message ?? "校验失败",
    }
  }

  const data = parsed.data
  const id = crypto.randomUUID()
  const ts = nowIso()
  const row: Customer = {
    ...data,
    ownerId: currentUser.id,
    id,
    createdAt: ts,
    updatedAt: ts,
  }

  const all = await readCustomers()
  all.push(row)
  await writeCustomers(all)

  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)

  return { ok: true, id }
}

export async function updateCustomer(
  id: string,
  input: CustomerFormValues,
): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) {
    return { ok: false, message: "未登录或账号无效" }
  }
  const parsed = customerFormSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      ok: false,
      message: fieldErrors[0] ?? parsed.error.message ?? "校验失败",
    }
  }

  const existing = await getCustomerById(id)
  if (!existing) {
    return { ok: false, message: "客户不存在" }
  }
  if (currentUser.role !== "admin") {
    const allUsers = await readUsers()
    if (!canAccessByOwnership(currentUser, existing.ownerId, allUsers)) {
      return { ok: false, message: "无权限操作该客户" }
    }
  }

  const data = parsed.data
  const next: Customer = {
    ...existing,
    ...data,
    ownerId: existing.ownerId ?? currentUser.id,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
  }

  const all = await readCustomers()
  const idx = all.findIndex((c) => c.id === id)
  if (idx === -1) {
    return { ok: false, message: "客户不存在" }
  }
  all[idx] = next
  await writeCustomers(all)

  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)

  return { ok: true, id }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) {
    return { ok: false, message: "未登录或账号无效" }
  }

  const existing = await getCustomerById(id)
  if (!existing) {
    return { ok: false, message: "客户不存在" }
  }
  if (currentUser.role !== "admin") {
    const allUsers = await readUsers()
    if (!canAccessByOwnership(currentUser, existing.ownerId, allUsers)) {
      return { ok: false, message: "无权限操作该客户" }
    }
  }

  const projects = await readProjects()
  if (projects.some((p) => p.customerId === id)) {
    return { ok: false, message: "该客户下存在项目，无法删除" }
  }

  const all = await readCustomers()
  const next = all.filter((c) => c.id !== id)
  await writeCustomers(next)
  revalidatePath("/customers")

  return { ok: true, id }
}

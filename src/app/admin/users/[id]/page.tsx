import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { UserForm } from "@/components/admin/user-form"
import { findUserById } from "@/lib/users-store"
import { toSafeUser } from "@/lib/auth"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await findUserById(id)
  if (!user) return { title: "用户不存在" }
  return { title: `${user.username} - 用户信息` }
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params
  const user = await findUserById(id)
  if (!user) notFound()

  return <UserForm mode="edit" user={toSafeUser(user)} />
}


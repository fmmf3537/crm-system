import type { Metadata } from "next"

import { UserForm } from "@/components/admin/user-form"

export const metadata: Metadata = {
  title: "新增用户 - 管理后台",
}

export default function NewUserPage() {
  return <UserForm mode="create" />
}


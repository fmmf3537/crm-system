import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { getCurrentUserFromRequest } from "@/lib/auth"

export const metadata: Metadata = {
  title: "登录",
}

export default async function LoginPage() {
  const user = await getCurrentUserFromRequest()
  if (user) {
    redirect("/dashboard")
  }

  return <LoginForm />
}


"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? "退出中..." : "退出登录"}
    </Button>
  )
}


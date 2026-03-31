import Link from "next/link"

import { PageSystemHeading } from "@/components/brand/page-system-heading"
import { Button } from "@/components/ui/button"

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageSystemHeading moduleLabel="用户管理" />
          <h1 className="text-xl font-semibold tracking-tight">用户管理</h1>
          <p className="text-sm text-muted-foreground">仅管理员可访问的用户管理中心</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">仪表盘</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/users/new">新增用户</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}


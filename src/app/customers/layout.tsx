import Link from "next/link"

import { PageSystemHeading } from "@/components/brand/page-system-heading"
import { Button } from "@/components/ui/button"

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageSystemHeading moduleLabel="客户管理" />
          <h1 className="text-xl font-semibold tracking-tight">客户管理</h1>
          <p className="text-sm text-muted-foreground">
            维护客户档案、等级与对接信息
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">首页</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/customers/new">新增客户</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}

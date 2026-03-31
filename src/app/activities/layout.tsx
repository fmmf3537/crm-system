import Link from "next/link"

import { PageSystemHeading } from "@/components/brand/page-system-heading"
import { Button } from "@/components/ui/button"

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageSystemHeading moduleLabel="跟进记录" />
          <h1 className="text-xl font-semibold tracking-tight">跟进记录</h1>
          <p className="text-sm text-muted-foreground">记录触达与下次跟进计划</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">首页</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/activities/new">新增记录</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}

import Link from "next/link"

import { LogoutButton } from "@/components/auth/logout-button"
import { SystemLogo } from "@/components/brand/system-logo"
import { Button } from "@/components/ui/button"

/** 全站顶栏：Logo + 系统全称 + 快捷入口 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SystemLogo size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px]">
              辰航卓越销售管理系统
            </p>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              客户关系 · 项目 · 跟进一体化
            </p>
          </div>
        </Link>
        <nav className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/dashboard">仪表盘</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/customers">客户</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link href="/projects">项目</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">个人中心</Link>
          </Button>
          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}

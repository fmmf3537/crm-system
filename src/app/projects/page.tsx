import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { readCustomers } from "@/lib/customers-store"
import { getCurrentUserFromRequest } from "@/lib/auth"
import { filterByOwnership } from "@/lib/permissions"
import { readUsers } from "@/lib/users-store"
import { readProjects, sortProjectsByUpdatedDesc } from "@/lib/projects-store"
import { PROJECT_STAGES } from "@/types/project"

export const metadata: Metadata = {
  title: "项目列表",
}

type SearchParams = Promise<{ stage?: string; q?: string; page?: string }>
const PAGE_SIZE = 10

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatDate(date: string) {
  return date || "-"
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const stageFilter = PROJECT_STAGES.find((s) => s === sp.stage)
  const q = (sp.q ?? "").trim()
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1)

  const [currentUser, projects, customers, allUsers] = await Promise.all([
    getCurrentUserFromRequest(),
    readProjects(),
    readCustomers(),
    readUsers(),
  ])
  if (!currentUser) {
    // 理论上被 middleware 拦截，这里兜底
    return null
  }
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const owned = filterByOwnership(currentUser, projects, allUsers)
  const filtered = sortProjectsByUpdatedDesc(owned).filter((p) => {
    if (stageFilter && p.stage !== stageFilter) return false
    if (!q) return true
    const customer = customerMap.get(p.customerId)
    const haystack = [
      p.name,
      p.owner,
      p.type,
      p.stage,
      p.keyFactor,
      p.risk,
      customer?.name ?? "",
      customer?.shortName ?? "",
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(q.toLowerCase())
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  const paramsFor = (opts: {
    stage?: string
    q?: string
    page?: number
  }): string => {
    const params = new URLSearchParams()
    const stage = opts.stage ?? stageFilter
    const keyword = opts.q ?? q
    const p = opts.page ?? 1
    if (stage) params.set("stage", stage)
    if (keyword) params.set("q", keyword)
    if (p > 1) params.set("page", String(p))
    const s = params.toString()
    return s ? `/projects?${s}` : "/projects"
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="flex flex-wrap items-center gap-2" action="/projects" method="get">
        {stageFilter ? <input type="hidden" name="stage" value={stageFilter} /> : null}
        <Input
          name="q"
          defaultValue={q}
          placeholder="搜索项目/客户/负责人/风险..."
          className="max-w-sm"
        />
        <Button type="submit" size="sm">
          搜索
        </Button>
        {q ? (
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={paramsFor({ q: "", page: 1 })}>清空</Link>
          </Button>
        ) : null}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={!stageFilter ? "default" : "outline"} size="sm" asChild>
          <Link href={paramsFor({ stage: "", page: 1 })}>全部阶段</Link>
        </Button>
        {PROJECT_STAGES.map((stage) => (
          <Button
            key={stage}
            variant={stageFilter === stage ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={paramsFor({ stage, page: 1 })}>{stage}</Link>
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>项目名称</TableHead>
            <TableHead>客户</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>阶段</TableHead>
            <TableHead>负责人</TableHead>
            <TableHead>预计金额</TableHead>
            <TableHead>实际金额</TableHead>
            <TableHead>预计签约日期</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                暂无项目数据
              </TableCell>
            </TableRow>
          ) : (
            rows.map((p) => {
              const customer = customerMap.get(p.customerId)
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer?.name ?? "未知客户"}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.stage}</TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell>{formatCurrency(p.expectedAmount)}</TableCell>
                  <TableCell>{formatCurrency(p.actualAmount)}</TableCell>
                  <TableCell>{formatDate(p.expectedDate)}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          共 {filtered.length} 条 · 第 {safePage}/{pageCount} 页
        </p>
        {pageCount > 1 ? (
          <nav className="flex items-center gap-2" aria-label="分页">
            {safePage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={paramsFor({ page: safePage - 1 })}>上一页</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
            )}
            {safePage < pageCount ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={paramsFor({ page: safePage + 1 })}>下一页</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            )}
          </nav>
        ) : null}
      </div>
    </div>
  )
}

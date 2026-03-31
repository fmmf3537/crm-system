import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCurrentUserFromRequest } from "@/lib/auth"
import { readCustomers, sortByUpdatedDesc } from "@/lib/customers-store"
import { filterByOwnership } from "@/lib/permissions"
import { readUsers } from "@/lib/users-store"

export const metadata: Metadata = {
  title: "客户列表",
}

const PAGE_SIZE = 10

type SearchParams = Promise<{ page?: string }>

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1)
  const [currentUser, customers, allUsers] = await Promise.all([
    getCurrentUserFromRequest(),
    readCustomers(),
    readUsers(),
  ])
  if (!currentUser) return null
  const owned = filterByOwnership(currentUser, customers, allUsers)
  const sorted = sortByUpdatedDesc(owned)
  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * PAGE_SIZE
  const rows = sorted.slice(start, start + PAGE_SIZE)

  const makeHref = (p: number) =>
    p <= 1 ? "/customers" : `/customers?page=${p}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          共 {total} 条 · 第 {safePage}/{pageCount} 页
        </p>
        <Button size="sm" asChild>
          <Link href="/customers/new">新增客户</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>简称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>行业</TableHead>
            <TableHead>等级</TableHead>
            <TableHead>地区</TableHead>
            <TableHead>评分</TableHead>
            <TableHead>更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                暂无客户，请先
                <Link
                  className="px-1 font-medium text-foreground underline underline-offset-4"
                  href="/customers/new"
                >
                  新增
                </Link>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link
                    className="text-foreground underline-offset-4 hover:underline"
                    href={`/customers/${c.id}`}
                  >
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell>{c.shortName}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell className="max-w-[12rem] truncate text-muted-foreground">
                  {c.industry.length ? c.industry.join("、") : "—"}
                </TableCell>
                <TableCell>{c.level}</TableCell>
                <TableCell>{c.region}</TableCell>
                <TableCell>{c.rating}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTime(c.updatedAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageCount > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-end gap-2"
          aria-label="分页"
        >
          {safePage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={makeHref(safePage - 1)}>上一页</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              上一页
            </Button>
          )}
          <span className="text-sm text-muted-foreground tabular-nums">
            {safePage} / {pageCount}
          </span>
          {safePage < pageCount ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={makeHref(safePage + 1)}>下一页</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              下一页
            </Button>
          )}
        </nav>
      ) : null}
    </div>
  )
}

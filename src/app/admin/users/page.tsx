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
import { readUsers } from "@/lib/users-store"

export const metadata: Metadata = {
  title: "用户列表 - 管理后台",
}

type SearchParams = Promise<{ page?: string }>
const PAGE_SIZE = 10

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1)
  const users = (await readUsers()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const total = users.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * PAGE_SIZE
  const rows = users.slice(start, start + PAGE_SIZE)

  const makeHref = (p: number) =>
    p <= 1 ? "/admin/users" : `/admin/users?page=${p}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          共 {total} 个用户 · 第 {safePage}/{pageCount} 页
        </p>
        <Button size="sm" asChild>
          <Link href="/admin/users/new">新增用户</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>部门</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                暂无用户数据
              </TableCell>
            </TableRow>
          ) : (
            rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {u.username}
                  </Link>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.department}</TableCell>
                <TableCell>{u.status}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleString("zh-CN")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageCount > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            asChild={safePage > 1}
          >
            {safePage > 1 ? (
              <Link href={makeHref(safePage - 1)}>上一页</Link>
            ) : (
              <>上一页</>
            )}
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {safePage} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= pageCount}
            asChild={safePage < pageCount}
          >
            {safePage < pageCount ? (
              <Link href={makeHref(safePage + 1)}>下一页</Link>
            ) : (
              <>下一页</>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  )
}


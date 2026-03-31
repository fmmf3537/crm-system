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
import { readActivities, sortActivitiesByDateDesc } from "@/lib/activities-store"
import { getCurrentUserFromRequest } from "@/lib/auth"
import { readCustomers } from "@/lib/customers-store"
import { filterByOwnership } from "@/lib/permissions"
import { readProjects } from "@/lib/projects-store"
import { readUsers } from "@/lib/users-store"

export const metadata: Metadata = {
  title: "跟进记录",
}

export default async function ActivitiesPage() {
  const [currentUser, activities, customers, projects, allUsers] = await Promise.all(
    [
      getCurrentUserFromRequest(),
      readActivities(),
      readCustomers(),
      readProjects(),
      readUsers(),
    ],
  )
  if (!currentUser) return null
  const ownedActivities = filterByOwnership(currentUser, activities, allUsers)
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const projectMap = new Map(projects.map((p) => [p.id, p]))
  const rows = sortActivitiesByDateDesc(ownedActivities)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">共 {rows.length} 条记录</p>
        <Button size="sm" asChild>
          <Link href="/activities/new">新增记录</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>跟进日期</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>项目名称</TableHead>
            <TableHead>客户名称</TableHead>
            <TableHead>跟进人</TableHead>
            <TableHead>跟进内容</TableHead>
            <TableHead>下次跟进计划</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                暂无跟进记录
              </TableCell>
            </TableRow>
          ) : (
            rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell className="max-w-48 truncate">
                  {projectMap.get(item.projectId)?.name ?? "未知项目"}
                </TableCell>
                <TableCell>{customerMap.get(item.customerId)?.name ?? "未知客户"}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell className="max-w-72 whitespace-normal break-words text-muted-foreground">
                  {item.content}
                </TableCell>
                <TableCell className="max-w-72 whitespace-normal break-words">
                  <p>{item.nextDate || "-"}</p>
                  <p className="text-muted-foreground">{item.nextTask || "-"}</p>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

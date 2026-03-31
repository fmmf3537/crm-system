import type { Metadata } from "next"
import Link from "next/link"

import { PageSystemHeading } from "@/components/brand/page-system-heading"
import { StageFunnelChart } from "@/components/dashboard/stage-funnel-chart"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCurrentUserFromRequest } from "@/lib/auth"
import { readCustomers } from "@/lib/customers-store"
import { filterByOwnership } from "@/lib/permissions"
import { readProjects } from "@/lib/projects-store"
import { PROJECT_STAGES } from "@/types/project"
import { readUsers } from "@/lib/users-store"

export const metadata: Metadata = {
  title: "销售仪表盘",
}

function currency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatDate(date: string) {
  if (!date) return "-"
  return date
}

export default async function DashboardPage() {
  const [currentUser, projectsRaw, customers, allUsers] = await Promise.all([
    getCurrentUserFromRequest(),
    readProjects(),
    readCustomers(),
    readUsers(),
  ])
  if (!currentUser) return null
  const projects = filterByOwnership(currentUser, projectsRaw, allUsers)
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const today = new Date(now.toISOString().slice(0, 10))
  const d30 = new Date(today)
  d30.setDate(d30.getDate() + 30)

  const customerMap = new Map(customers.map((c) => [c.id, c.name]))

  const funnelData = PROJECT_STAGES.map((stage) => {
    const count = projects.filter((p) => p.stage === stage).length
    return { stage, count, label: `${stage} (${count})` }
  })

  const totalExpectedAmount = projects.reduce((sum, p) => sum + p.expectedAmount, 0)
  const signedAmount = projects
    .filter((p) => p.stage === "签约" || p.stage === "交付")
    .reduce((sum, p) => sum + p.actualAmount, 0)
  const monthlyAdded = projects.filter((p) => {
    const d = new Date(p.createdAt)
    return d.getFullYear() === year && d.getMonth() === month
  }).length

  const upcomingSigned = projects
    .filter((p) => {
      if (!p.expectedDate) return false
      if (p.stage === "签约" || p.stage === "交付") return false
      const d = new Date(p.expectedDate)
      return d >= today && d <= d30
    })
    .sort(
      (a, b) =>
        new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime(),
    )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <PageSystemHeading moduleLabel="销售仪表盘" />
          <h1 className="text-xl font-semibold tracking-tight">销售仪表盘</h1>
          <p className="text-sm text-muted-foreground">项目漏斗与签约进度概览</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/projects">项目列表</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/projects/new">新建项目</Link>
          </Button>
          {currentUser.role === "admin" ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/users">用户管理</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>总预计金额</CardDescription>
            <CardTitle className="text-2xl">{currency(totalExpectedAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>已签约金额（含交付）</CardDescription>
            <CardTitle className="text-2xl">{currency(signedAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>本月新增项目数</CardDescription>
            <CardTitle className="text-2xl">{monthlyAdded}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>各阶段项目数量（漏斗）</CardTitle>
          <CardDescription>按项目阶段统计数量</CardDescription>
        </CardHeader>
        <CardContent>
          <StageFunnelChart data={funnelData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>30 天内应签约项目</CardTitle>
          <CardDescription>未签约且预计签约日期在 30 天内</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目名称</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>阶段</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>预计签约日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingSigned.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    暂无 30 天内应签约项目
                  </TableCell>
                </TableRow>
              ) : (
                upcomingSigned.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${p.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{customerMap.get(p.customerId) ?? "未知客户"}</TableCell>
                    <TableCell>{p.stage}</TableCell>
                    <TableCell>{p.owner}</TableCell>
                    <TableCell>{formatDate(p.expectedDate)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

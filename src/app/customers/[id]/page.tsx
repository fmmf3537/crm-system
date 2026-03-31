import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CustomerForm } from "@/components/customers/customer-form"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCustomerById } from "@/lib/customers-store"
import { readProjects, sortProjectsByUpdatedDesc } from "@/lib/projects-store"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const c = await getCustomerById(id)
  if (!c) return { title: "客户不存在" }
  return { title: `${c.name} · 客户详情` }
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const customer = await getCustomerById(id)
  if (!customer) notFound()
  const relatedProjects = sortProjectsByUpdatedDesc(await readProjects()).filter(
    (p) => p.customerId === customer.id,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/customers">返回列表</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/activities/new?customerId=${encodeURIComponent(customer.id)}`}>
            新增跟进记录
          </Link>
        </Button>
      </div>
      <CustomerForm mode="edit" customer={customer} />

      <section className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">关联项目</h2>
          <Button size="sm" asChild>
            <Link href={`/projects/new?customerId=${encodeURIComponent(customer.id)}`}>
              新建项目
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目名称</TableHead>
              <TableHead>阶段</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>预计金额</TableHead>
              <TableHead>预计签约日期</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relatedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  暂无关联项目
                </TableCell>
              </TableRow>
            ) : (
              relatedProjects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-foreground underline-offset-4 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>{p.stage}</TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell>{p.expectedAmount.toLocaleString("zh-CN")}</TableCell>
                  <TableCell>{p.expectedDate}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

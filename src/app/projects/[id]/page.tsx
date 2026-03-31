import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ProjectForm } from "@/components/projects/project-form"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { readCustomers } from "@/lib/customers-store"
import { getProjectById } from "@/lib/projects-store"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return { title: "项目不存在" }
  return { title: `${project.name} · 项目详情` }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN")
  } catch {
    return iso
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) notFound()

  const customers = await readCustomers()

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/projects">返回列表</Link>
        </Button>
        <Button size="sm" asChild>
          <Link
            href={`/activities/new?projectId=${encodeURIComponent(project.id)}&customerId=${encodeURIComponent(project.customerId)}`}
          >
            新增跟进记录
          </Link>
        </Button>
      </div>

      <ProjectForm mode="edit" project={project} customers={customers} />

      <section className="grid gap-2">
        <h2 className="text-base font-semibold">阶段变更记录</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>阶段</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>操作人</TableHead>
              <TableHead>原因</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.stageHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  暂无流转记录
                </TableCell>
              </TableRow>
            ) : (
              [...project.stageHistory]
                .reverse()
                .map((h, idx) => (
                  <TableRow key={`${h.changedAt}-${idx}`}>
                    <TableCell>{h.stage}</TableCell>
                    <TableCell>{formatTime(h.changedAt)}</TableCell>
                    <TableCell>{h.operator}</TableCell>
                    <TableCell className="max-w-md whitespace-normal break-words text-muted-foreground">
                      {h.reason}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

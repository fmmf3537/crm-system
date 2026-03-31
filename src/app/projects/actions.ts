"use server"

import { revalidatePath } from "next/cache"

import { getCustomerById } from "@/lib/customers-store"
import { requireUser } from "@/lib/auth"
import { canAccessByOwnership } from "@/lib/permissions"
import { readActivities, writeActivities } from "@/lib/activities-store"
import { readUsers } from "@/lib/users-store"
import {
  getProjectById,
  readProjects,
  writeProjects,
} from "@/lib/projects-store"
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations/project"
import type { Project, ProjectStageChange } from "@/types/project"
import { PROJECT_STAGES } from "@/types/project"

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string }

function nowIso() {
  return new Date().toISOString()
}

function firstFieldError(values: ProjectFormValues): string | null {
  const parsed = projectFormSchema.safeParse(values)
  if (parsed.success) return null
  const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat()
  return fieldErrors[0] ?? parsed.error.message ?? "校验失败"
}

function isNextStageOnly(from: Project["stage"], to: Project["stage"]): boolean {
  const fromIdx = PROJECT_STAGES.indexOf(from)
  const toIdx = PROJECT_STAGES.indexOf(to)
  return toIdx === fromIdx + 1
}

export async function createProject(values: ProjectFormValues): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) return { ok: false, message: "未登录或账号无效" }
  const message = firstFieldError(values)
  if (message) return { ok: false, message }
  if (values.stage !== "线索") {
    return { ok: false, message: "新建项目必须从“线索”阶段开始" }
  }

  const customer = await getCustomerById(values.customerId)
  if (!customer) return { ok: false, message: "关联客户不存在" }

  const id = crypto.randomUUID()
  const ts = nowIso()
  const stageHistory: ProjectStageChange[] = [
    {
      stage: values.stage,
      changedAt: ts,
      reason: values.stageReason?.trim() || "创建项目",
      operator: values.stageOperator?.trim() || values.owner,
    },
  ]

  const row: Project = {
    id,
    ownerId: currentUser.id,
    name: values.name,
    customerId: values.customerId,
    type: values.type,
    stage: values.stage,
    expectedAmount: values.expectedAmount,
    actualAmount: values.actualAmount,
    expectedDate: values.expectedDate,
    owner: values.owner,
    keyFactor: values.keyFactor,
    risk: values.risk,
    stageHistory,
    createdAt: ts,
    updatedAt: ts,
  }

  const all = await readProjects()
  all.push(row)
  await writeProjects(all)

  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  return { ok: true, id }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) return { ok: false, message: "未登录或账号无效" }

  const existing = await getProjectById(id)
  if (!existing) return { ok: false, message: "项目不存在" }
  if (currentUser.role !== "admin") {
    const allUsers = await readUsers()
    if (!canAccessByOwnership(currentUser, existing.ownerId, allUsers)) {
      return { ok: false, message: "无权限操作该项目" }
    }
  }

  const [allProjects, allActivities] = await Promise.all([
    readProjects(),
    readActivities(),
  ])
  const nextProjects = allProjects.filter((p) => p.id !== id)
  const nextActivities = allActivities.filter((a) => a.projectId !== id)
  await writeProjects(nextProjects)
  await writeActivities(nextActivities)

  revalidatePath("/projects")
  revalidatePath("/activities")
  return { ok: true, id }
}

export async function updateProject(
  id: string,
  values: ProjectFormValues,
): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) return { ok: false, message: "未登录或账号无效" }
  const message = firstFieldError(values)
  if (message) return { ok: false, message }

  const existing = await getProjectById(id)
  if (!existing) return { ok: false, message: "项目不存在" }
  if (currentUser.role !== "admin") {
    const allUsers = await readUsers()
    if (!canAccessByOwnership(currentUser, existing.ownerId, allUsers)) {
      return { ok: false, message: "无权限操作该项目" }
    }
  }

  const customer = await getCustomerById(values.customerId)
  if (!customer) return { ok: false, message: "关联客户不存在" }

  const stageChanged = values.stage !== existing.stage
  if (stageChanged && !isNextStageOnly(existing.stage, values.stage)) {
    return { ok: false, message: "阶段只能按顺序推进一档" }
  }
  if (stageChanged && !values.stageReason?.trim()) {
    return { ok: false, message: "变更阶段时必须填写变更原因" }
  }
  if (stageChanged && !values.stageOperator?.trim()) {
    return { ok: false, message: "变更阶段时必须填写操作人" }
  }

  const nextHistory = [...existing.stageHistory]
  if (stageChanged) {
    nextHistory.push({
      stage: values.stage,
      changedAt: nowIso(),
      reason: values.stageReason!.trim(),
      operator: values.stageOperator!.trim(),
    })
  }

  const next: Project = {
    ...existing,
    name: values.name,
    customerId: values.customerId,
    type: values.type,
    stage: values.stage,
    expectedAmount: values.expectedAmount,
    actualAmount: values.actualAmount,
    expectedDate: values.expectedDate,
    owner: values.owner,
    keyFactor: values.keyFactor,
    risk: values.risk,
    stageHistory: nextHistory,
    updatedAt: nowIso(),
  }

  const all = await readProjects()
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) return { ok: false, message: "项目不存在" }
  all[idx] = next
  await writeProjects(all)

  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  return { ok: true, id }
}

"use server"

import { revalidatePath } from "next/cache"

import { writeActivities, readActivities } from "@/lib/activities-store"
import { getCustomerById } from "@/lib/customers-store"
import { getProjectById } from "@/lib/projects-store"
import { requireUser } from "@/lib/auth"
import {
  activityFormSchema,
  type ActivityFormValues,
} from "@/lib/validations/activity"
import type { Activity } from "@/types/activity"

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string }

function nowIso() {
  return new Date().toISOString()
}

export async function createActivity(
  values: ActivityFormValues,
): Promise<ActionResult> {
  const currentUser = await requireUser()
  if (!currentUser) return { ok: false, message: "未登录或账号无效" }
  const parsed = activityFormSchema.safeParse(values)
  if (!parsed.success) {
    const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      ok: false,
      message: fieldErrors[0] ?? parsed.error.message ?? "校验失败",
    }
  }

  const data = parsed.data
  const [project, customer] = await Promise.all([
    getProjectById(data.projectId),
    getCustomerById(data.customerId),
  ])
  if (!project) return { ok: false, message: "关联项目不存在" }
  if (!customer) return { ok: false, message: "关联客户不存在" }
  if (project.customerId !== customer.id) {
    return { ok: false, message: "所选客户与项目不匹配" }
  }

  const id = crypto.randomUUID()
  const row: Activity = {
    id,
    ownerId: currentUser.id,
    projectId: data.projectId,
    customerId: data.customerId,
    type: data.type,
    content: data.content,
    date: data.date,
    nextDate: data.nextDate,
    nextTask: data.nextTask,
    owner: data.owner,
    createdAt: nowIso(),
  }

  const all = await readActivities()
  all.push(row)
  await writeActivities(all)

  revalidatePath("/activities")
  return { ok: true, id }
}

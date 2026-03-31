import type { Activity } from "@/types/activity"
import { prisma } from "@/lib/prisma"

export async function readActivities(): Promise<Activity[]> {
  const rows = await prisma.activity.findMany({
    orderBy: { date: "desc" },
  })
  return rows.map((a) => ({
    id: a.id,
    ownerId: a.ownerId ?? undefined,
    projectId: a.projectId,
    customerId: a.customerId,
    type: a.type as Activity["type"],
    content: a.content,
    date: a.date.toISOString().slice(0, 10),
    nextDate: a.nextDate ? a.nextDate.toISOString().slice(0, 10) : "",
    nextTask: a.nextTask,
    owner: a.owner,
    createdAt: a.createdAt.toISOString(),
  }))
}

export async function writeActivities(activities: Activity[]): Promise<void> {
  await prisma.activity.deleteMany()
  await prisma.activity.createMany({
    data: activities.map((a) => ({
      id: a.id,
      ownerId: a.ownerId ?? null,
      projectId: a.projectId,
      customerId: a.customerId,
      type: a.type,
      content: a.content,
      date: new Date(a.date),
      nextDate: a.nextDate ? new Date(a.nextDate) : null,
      nextTask: a.nextTask,
      owner: a.owner,
      createdAt: new Date(a.createdAt),
    })),
    skipDuplicates: true,
  })
}

export function sortActivitiesByDateDesc(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

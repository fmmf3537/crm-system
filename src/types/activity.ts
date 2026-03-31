export const ACTIVITY_TYPES = ["拜访", "电话", "微信", "邮件", "招投标"] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export type Activity = {
  id: string
  ownerId?: string
  projectId: string
  customerId: string
  type: ActivityType
  content: string
  date: string
  nextDate: string
  nextTask: string
  owner: string
  createdAt: string
}

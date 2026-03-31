import { z } from "zod"

import { ACTIVITY_TYPES } from "@/types/activity"

export const activityFormSchema = z.object({
  projectId: z.string().trim().min(1, "请选择关联项目"),
  customerId: z.string().trim().min(1, "请选择关联客户"),
  type: z.enum(ACTIVITY_TYPES),
  content: z.string().trim().min(1, "请输入跟进内容"),
  date: z.string().trim().min(1, "请选择跟进日期"),
  nextDate: z.string().trim().min(1, "请选择下次跟进日期"),
  nextTask: z.string().trim().min(1, "请输入下次跟进事项"),
  owner: z.string().trim().min(1, "请输入跟进人"),
})

export type ActivityFormValues = z.infer<typeof activityFormSchema>

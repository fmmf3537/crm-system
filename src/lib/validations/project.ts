import { z } from "zod"

import { PROJECT_STAGES, PROJECT_TYPES } from "@/types/project"

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "请输入项目名称"),
  customerId: z.string().trim().min(1, "请选择关联客户"),
  type: z.enum(PROJECT_TYPES),
  stage: z.enum(PROJECT_STAGES),
  expectedAmount: z.coerce.number().min(0, "预计金额不能小于 0"),
  actualAmount: z.coerce.number().min(0, "实际金额不能小于 0"),
  expectedDate: z.string().trim().min(1, "请选择预计签约日期"),
  owner: z.string().trim().min(1, "请输入项目负责人"),
  keyFactor: z.string().trim().min(1, "请输入胜负手"),
  risk: z.string().trim().min(1, "请输入风险点"),
  stageReason: z.string().trim().optional(),
  stageOperator: z.string().trim().optional(),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

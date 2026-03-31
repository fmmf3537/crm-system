import { z } from "zod"

import {
  CUSTOMER_LEVELS,
  CUSTOMER_TYPES,
  INDUSTRIES,
} from "@/types/customer"

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "请输入客户名称"),
  shortName: z.string().trim().min(1, "请输入客户简称"),
  type: z.enum(CUSTOMER_TYPES),
  industry: z.array(z.enum(INDUSTRIES)).default([]),
  level: z.enum(CUSTOMER_LEVELS),
  region: z.string().trim().min(1, "请输入省份-城市"),
  contactName: z.string().trim().min(1, "请输入主对接人姓名"),
  contactPosition: z.string().trim().min(1, "请输入对接人职位"),
  contactPhone: z
    .string()
    .trim()
    .min(1, "请输入对接人电话")
    .regex(/^[\d\-+\s()]{5,20}$/, "电话格式不正确"),
  rating: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined
      const n = typeof val === "number" ? val : Number(val)
      return Number.isFinite(n) ? n : NaN
    },
    z
      .number({ required_error: "请输入关系评分" })
      .int("须为整数")
      .min(1, "最低 1 分")
      .max(10, "最高 10 分"),
  ),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

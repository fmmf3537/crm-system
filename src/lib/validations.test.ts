import { describe, expect, it } from "vitest"

import { activityFormSchema } from "@/lib/validations/activity"
import { customerFormSchema } from "@/lib/validations/customer"
import { projectFormSchema } from "@/lib/validations/project"
import { userCreateSchema } from "@/lib/validations/user"

describe("validation schemas", () => {
  it("validates customer form", () => {
    const result = customerFormSchema.safeParse({
      name: "客户A",
      shortName: "A",
      type: "政府",
      industry: ["能源"],
      level: "A战略",
      region: "西安",
      contactName: "张三",
      contactPosition: "经理",
      contactPhone: "13512345678",
      rating: 8,
    })
    expect(result.success).toBe(true)
  })

  it("validates project form", () => {
    const result = projectFormSchema.safeParse({
      name: "项目A",
      customerId: "c1",
      type: "招投标",
      stage: "线索",
      expectedAmount: 1000,
      actualAmount: 0,
      expectedDate: "2026-03-31",
      owner: "李四",
      keyFactor: "优势",
      risk: "无",
      stageReason: "",
      stageOperator: "",
    })
    expect(result.success).toBe(true)
  })

  it("validates activity form", () => {
    const result = activityFormSchema.safeParse({
      projectId: "p1",
      customerId: "c1",
      type: "拜访",
      content: "沟通需求",
      date: "2026-03-31",
      nextDate: "2026-04-10",
      nextTask: "提交方案",
      owner: "王五",
    })
    expect(result.success).toBe(true)
  })

  it("rejects short password on user create", () => {
    const result = userCreateSchema.safeParse({
      username: "u1",
      name: "user1",
      email: "u1@example.com",
      password: "123",
      role: "sales",
      teamId: "",
      department: "",
      phone: "",
      status: "active",
    })
    expect(result.success).toBe(false)
  })
})


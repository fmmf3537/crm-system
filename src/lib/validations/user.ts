import { z } from "zod"

import { USER_ROLES, USER_STATUS } from "@/types/user"

export const userCreateSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  name: z.string().trim().min(1, "请输入姓名"),
  email: z.string().trim().email("请输入有效邮箱"),
  password: z.string().min(6, "初始密码至少 6 位"),
  role: z.enum(USER_ROLES),
  teamId: z.string().trim().optional(),
  department: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  status: z.enum(USER_STATUS),
})

export type UserCreateValues = z.infer<typeof userCreateSchema>

export const userUpdateSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  name: z.string().trim().min(1, "请输入姓名"),
  email: z.string().trim().email("请输入有效邮箱"),
  role: z.enum(USER_ROLES),
  teamId: z.string().trim().optional().nullable(),
  department: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  status: z.enum(USER_STATUS),
})

export type UserUpdateValues = z.infer<typeof userUpdateSchema>


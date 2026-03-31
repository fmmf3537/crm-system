export const USER_ROLES = ["admin", "manager", "sales"] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUS = ["active", "inactive"] as const
export type UserStatus = (typeof USER_STATUS)[number]

export type User = {
  id: string
  username: string
  email: string
  password: string
  avatarUrl?: string
  name: string
  role: UserRole
  teamId?: string
  department: string
  phone: string
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export type SafeUser = Omit<User, "password">


import type { User } from "@/types/user"
import { prisma } from "@/lib/prisma"

export async function readUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  })
  return rows.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    password: u.password,
    avatarUrl: u.avatarUrl ?? "",
    name: u.name,
    role: u.role as User["role"],
    teamId: u.teamId ?? "",
    department: u.department,
    phone: u.phone,
    status: u.status as User["status"],
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }))
}

export async function writeUsers(users: User[]): Promise<void> {
  // 简单实现：先清空再插入（仅用于管理界面批量写入）
  await prisma.user.deleteMany()
  await prisma.user.createMany({
    data: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password,
      avatarUrl: u.avatarUrl && u.avatarUrl.length > 0 ? u.avatarUrl : null,
      name: u.name,
      role: u.role,
      teamId: u.teamId && u.teamId.length > 0 ? u.teamId : null,
      department: u.department,
      phone: u.phone,
      status: u.status,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    })),
    skipDuplicates: true,
  })
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const u = await prisma.user.findUnique({
    where: { email },
  })
  if (!u) return null
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    password: u.password,
    avatarUrl: u.avatarUrl ?? "",
    name: u.name,
    role: u.role as User["role"],
    teamId: u.teamId ?? "",
    department: u.department,
    phone: u.phone,
    status: u.status as User["status"],
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const u = await prisma.user.findUnique({
    where: { id },
  })
  if (!u) return null
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    password: u.password,
    avatarUrl: u.avatarUrl ?? "",
    name: u.name,
    role: u.role as User["role"],
    teamId: u.teamId ?? "",
    department: u.department,
    phone: u.phone,
    status: u.status as User["status"],
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }
}


import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

import type { SafeUser, User } from "@/types/user"
import { findUserById } from "@/lib/users-store"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
const JWT_EXPIRES_IN = "7d"
export const AUTH_COOKIE_NAME = "crm_token"

export type JwtPayload = {
  sub: string
  role: User["role"]
}

export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user
  return rest
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(user: User): string {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function getCurrentUserFromRequest(): Promise<SafeUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await findUserById(payload.sub)
  if (!user) return null
  return toSafeUser(user)
}

export async function requireUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await findUserById(payload.sub)
  if (!user || user.status !== "active") return null
  return user
}

export async function requireAdmin(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await findUserById(payload.sub)
  if (!user || user.role !== "admin" || user.status !== "active") return null
  return user
}


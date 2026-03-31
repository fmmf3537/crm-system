import { describe, expect, it } from "vitest"

import {
  hashPassword,
  signToken,
  toSafeUser,
  verifyPassword,
  verifyToken,
} from "@/lib/auth"
import type { User } from "@/types/user"

const user: User = {
  id: "u-1",
  username: "tester",
  email: "tester@example.com",
  password: "plain",
  avatarUrl: "",
  name: "测试用户",
  role: "sales",
  teamId: "",
  department: "",
  phone: "",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("auth helpers", () => {
  it("hashes and verifies password", async () => {
    const hash = await hashPassword("123456")
    expect(hash).not.toBe("123456")
    expect(await verifyPassword("123456", hash)).toBe(true)
    expect(await verifyPassword("bad", hash)).toBe(false)
  })

  it("signs and verifies token", () => {
    const token = signToken(user)
    const payload = verifyToken(token)
    expect(payload?.sub).toBe(user.id)
    expect(payload?.role).toBe(user.role)
  })

  it("removes password from safe user", () => {
    const safe = toSafeUser(user)
    expect("password" in safe).toBe(false)
    expect(safe.id).toBe(user.id)
  })
})


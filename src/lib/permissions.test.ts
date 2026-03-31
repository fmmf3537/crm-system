import { describe, expect, it } from "vitest"

import { canAccessByOwnership, filterByOwnership } from "@/lib/permissions"
import type { SafeUser, User } from "@/types/user"

const users: User[] = [
  {
    id: "admin-1",
    username: "admin",
    email: "admin@example.com",
    password: "x",
    name: "管理员",
    role: "admin",
    teamId: "A",
    department: "",
    phone: "",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "manager-1",
    username: "manager",
    email: "manager@example.com",
    password: "x",
    name: "经理",
    role: "manager",
    teamId: "A",
    department: "",
    phone: "",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "sales-1",
    username: "sales1",
    email: "sales1@example.com",
    password: "x",
    name: "销售1",
    role: "sales",
    teamId: "A",
    department: "",
    phone: "",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "sales-2",
    username: "sales2",
    email: "sales2@example.com",
    password: "x",
    name: "销售2",
    role: "sales",
    teamId: "B",
    department: "",
    phone: "",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
]

describe("permissions", () => {
  it("allows admin to access any record", () => {
    const admin = users[0] as SafeUser
    expect(canAccessByOwnership(admin, "sales-1", users)).toBe(true)
    expect(canAccessByOwnership(admin, undefined, users)).toBe(true)
  })

  it("allows sales to access only own records", () => {
    const sales = users[2] as SafeUser
    expect(canAccessByOwnership(sales, "sales-1", users)).toBe(true)
    expect(canAccessByOwnership(sales, "sales-2", users)).toBe(false)
  })

  it("allows manager to access same team", () => {
    const manager = users[1] as SafeUser
    expect(canAccessByOwnership(manager, "sales-1", users)).toBe(true)
    expect(canAccessByOwnership(manager, "sales-2", users)).toBe(false)
  })

  it("filters records by ownership", () => {
    const manager = users[1] as SafeUser
    const records = [
      { id: "r1", ownerId: "sales-1" },
      { id: "r2", ownerId: "sales-2" },
      { id: "r3", ownerId: "manager-1" },
    ]
    expect(filterByOwnership(manager, records, users).map((r) => r.id)).toEqual([
      "r1",
      "r3",
    ])
  })

  it("denies records without owner for non-admin roles", () => {
    const sales = users[2] as SafeUser
    expect(canAccessByOwnership(sales, undefined, users)).toBe(false)
  })

  it("manager without team only accesses self-owned records", () => {
    const managerNoTeam = {
      ...users[1],
      teamId: "",
    } as SafeUser
    expect(canAccessByOwnership(managerNoTeam, "manager-1", users)).toBe(true)
    expect(canAccessByOwnership(managerNoTeam, "sales-1", users)).toBe(false)
  })
})


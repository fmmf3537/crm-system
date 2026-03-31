import { beforeEach, describe, expect, it, vi } from "vitest"

const requireUser = vi.fn()
const getCustomerById = vi.fn()
const readCustomers = vi.fn()
const writeCustomers = vi.fn()
const readProjects = vi.fn()
const readUsers = vi.fn()
const canAccessByOwnership = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))
vi.mock("@/lib/auth", () => ({
  requireUser,
}))
vi.mock("@/lib/customers-store", () => ({
  getCustomerById,
  readCustomers,
  writeCustomers,
}))
vi.mock("@/lib/projects-store", () => ({
  readProjects,
}))
vi.mock("@/lib/users-store", () => ({
  readUsers,
}))
vi.mock("@/lib/permissions", () => ({
  canAccessByOwnership,
}))

const validInput = {
  name: "客户A",
  shortName: "A",
  type: "政府" as const,
  industry: ["能源"] as const,
  level: "A战略" as const,
  region: "西安",
  contactName: "张三",
  contactPosition: "经理",
  contactPhone: "13800138000",
  rating: 8,
}

describe("customers actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("createCustomer returns unauthorized when no user", async () => {
    requireUser.mockResolvedValue(null)
    const { createCustomer } = await import("@/app/customers/actions")
    const res = await createCustomer(validInput as any)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("未登录")
  })

  it("updateCustomer denies non-owner", async () => {
    requireUser.mockResolvedValue({ id: "u1", role: "sales" })
    getCustomerById.mockResolvedValue({ id: "c1", ownerId: "u2", createdAt: "2026-01-01" })
    readUsers.mockResolvedValue([])
    canAccessByOwnership.mockReturnValue(false)

    const { updateCustomer } = await import("@/app/customers/actions")
    const res = await updateCustomer("c1", validInput as any)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("无权限")
  })

  it("deleteCustomer blocks when customer has projects", async () => {
    requireUser.mockResolvedValue({ id: "admin", role: "admin" })
    getCustomerById.mockResolvedValue({ id: "c1", ownerId: "u1" })
    readProjects.mockResolvedValue([{ id: "p1", customerId: "c1" }])

    const { deleteCustomer } = await import("@/app/customers/actions")
    const res = await deleteCustomer("c1")
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("存在项目")
  })

  it("deleteCustomer succeeds when no related project", async () => {
    requireUser.mockResolvedValue({ id: "admin", role: "admin" })
    getCustomerById.mockResolvedValue({ id: "c1", ownerId: "u1" })
    readProjects.mockResolvedValue([])
    readCustomers.mockResolvedValue([{ id: "c1" }, { id: "c2" }])

    const { deleteCustomer } = await import("@/app/customers/actions")
    const res = await deleteCustomer("c1")
    expect(res.ok).toBe(true)
    expect(writeCustomers).toHaveBeenCalledTimes(1)
  })
})


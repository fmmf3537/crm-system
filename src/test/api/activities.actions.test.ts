import { beforeEach, describe, expect, it, vi } from "vitest"

const requireUser = vi.fn()
const readActivities = vi.fn()
const writeActivities = vi.fn()
const getCustomerById = vi.fn()
const getProjectById = vi.fn()

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))
vi.mock("@/lib/auth", () => ({
  requireUser,
}))
vi.mock("@/lib/activities-store", () => ({
  readActivities,
  writeActivities,
}))
vi.mock("@/lib/customers-store", () => ({
  getCustomerById,
}))
vi.mock("@/lib/projects-store", () => ({
  getProjectById,
}))

const validInput = {
  projectId: "p1",
  customerId: "c1",
  type: "拜访" as const,
  content: "跟进内容",
  date: "2026-04-01",
  nextDate: "2026-04-10",
  nextTask: "继续推进",
  owner: "张三",
}

describe("activities actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("createActivity returns unauthorized when no user", async () => {
    requireUser.mockResolvedValue(null)
    const { createActivity } = await import("@/app/activities/actions")
    const res = await createActivity(validInput as any)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("未登录")
  })

  it("createActivity rejects project-customer mismatch", async () => {
    requireUser.mockResolvedValue({ id: "u1", role: "sales" })
    getProjectById.mockResolvedValue({ id: "p1", customerId: "c2" })
    getCustomerById.mockResolvedValue({ id: "c1" })

    const { createActivity } = await import("@/app/activities/actions")
    const res = await createActivity(validInput as any)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("不匹配")
  })

  it("createActivity appends new record on success", async () => {
    requireUser.mockResolvedValue({ id: "u1", role: "sales" })
    getProjectById.mockResolvedValue({ id: "p1", customerId: "c1" })
    getCustomerById.mockResolvedValue({ id: "c1" })
    readActivities.mockResolvedValue([{ id: "a0" }])

    const { createActivity } = await import("@/app/activities/actions")
    const res = await createActivity(validInput as any)
    expect(res.ok).toBe(true)
    expect(writeActivities).toHaveBeenCalledTimes(1)
  })
})


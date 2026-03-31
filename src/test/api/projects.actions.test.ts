import { beforeEach, describe, expect, it, vi } from "vitest"

const requireUser = vi.fn()
const getCustomerById = vi.fn()
const getProjectById = vi.fn()
const readProjects = vi.fn()
const writeProjects = vi.fn()
const readActivities = vi.fn()
const writeActivities = vi.fn()
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
}))
vi.mock("@/lib/projects-store", () => ({
  getProjectById,
  readProjects,
  writeProjects,
}))
vi.mock("@/lib/activities-store", () => ({
  readActivities,
  writeActivities,
}))
vi.mock("@/lib/users-store", () => ({
  readUsers,
}))
vi.mock("@/lib/permissions", () => ({
  canAccessByOwnership,
}))

const validProjectInput = {
  name: "项目A",
  customerId: "c1",
  type: "招投标" as const,
  stage: "线索" as const,
  expectedAmount: 1000,
  actualAmount: 0,
  expectedDate: "2026-12-31",
  owner: "张三",
  keyFactor: "优势",
  risk: "预算",
  stageReason: "",
  stageOperator: "",
}

describe("projects actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("createProject rejects when initial stage not 线索", async () => {
    requireUser.mockResolvedValue({ id: "u1", role: "sales" })
    const { createProject } = await import("@/app/projects/actions")
    const res = await createProject({ ...validProjectInput, stage: "需求" } as any)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("线索")
  })

  it("updateProject denies unauthorized user", async () => {
    requireUser.mockResolvedValue({ id: "u1", role: "sales" })
    getProjectById.mockResolvedValue({
      id: "p1",
      ownerId: "u2",
      stage: "线索",
      stageHistory: [],
    })
    readUsers.mockResolvedValue([])
    canAccessByOwnership.mockReturnValue(false)

    const { updateProject } = await import("@/app/projects/actions")
    const res = await updateProject("p1", validProjectInput as any)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toContain("无权限")
  })

  it("deleteProject removes related activities", async () => {
    requireUser.mockResolvedValue({ id: "admin", role: "admin" })
    getProjectById.mockResolvedValue({ id: "p1", ownerId: "u1" })
    readProjects.mockResolvedValue([{ id: "p1" }, { id: "p2" }])
    readActivities.mockResolvedValue([{ id: "a1", projectId: "p1" }, { id: "a2", projectId: "p2" }])

    const { deleteProject } = await import("@/app/projects/actions")
    const res = await deleteProject("p1")
    expect(res.ok).toBe(true)
    expect(writeProjects).toHaveBeenCalledTimes(1)
    expect(writeActivities).toHaveBeenCalledTimes(1)
  })
})


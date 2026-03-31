import { beforeEach, describe, expect, it, vi } from "vitest"

const requireUser = vi.fn()
const toSafeUser = vi.fn()
const readUsers = vi.fn()
const writeUsers = vi.fn()

vi.mock("@/lib/auth", () => ({
  requireUser,
  toSafeUser,
}))

vi.mock("@/lib/users-store", () => ({
  readUsers,
  writeUsers,
}))

describe("PUT /api/users/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when not logged in", async () => {
    requireUser.mockResolvedValue(null)
    const { PUT } = await import("@/app/api/users/profile/route")
    const req = new Request("http://localhost/api/users/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "new" }),
      headers: { "content-type": "application/json" },
    })
    const res = await PUT(req)
    expect(res.status).toBe(401)
  })

  it("updates profile for current user", async () => {
    requireUser.mockResolvedValue({ id: "u1" })
    readUsers.mockResolvedValue([
      {
        id: "u1",
        name: "old",
        phone: "",
        department: "",
        avatarUrl: "",
      },
    ])
    toSafeUser.mockImplementation((u) => u)

    const { PUT } = await import("@/app/api/users/profile/route")
    const req = new Request("http://localhost/api/users/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "new name", phone: "123" }),
      headers: { "content-type": "application/json" },
    })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    expect(writeUsers).toHaveBeenCalledTimes(1)
  })
})


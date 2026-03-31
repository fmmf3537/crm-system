import { beforeEach, describe, expect, it, vi } from "vitest"

const getCurrentUserFromRequest = vi.fn()

vi.mock("@/lib/auth", () => ({
  getCurrentUserFromRequest,
}))

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when unauthenticated", async () => {
    getCurrentUserFromRequest.mockResolvedValue(null)
    const { GET } = await import("@/app/api/auth/me/route")
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it("returns current user when authenticated", async () => {
    getCurrentUserFromRequest.mockResolvedValue({
      id: "u1",
      email: "u1@example.com",
      username: "u1",
      role: "manager",
      status: "active",
    })
    const { GET } = await import("@/app/api/auth/me/route")
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.role).toBe("manager")
  })
})


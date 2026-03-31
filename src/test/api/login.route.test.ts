import { beforeEach, describe, expect, it, vi } from "vitest"

const setCookie = vi.fn()
const findUserByEmail = vi.fn()
const verifyPassword = vi.fn()
const signToken = vi.fn()

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: setCookie,
  }),
}))

vi.mock("@/lib/users-store", () => ({
  findUserByEmail,
}))

vi.mock("@/lib/auth", () => ({
  AUTH_COOKIE_NAME: "crm_token",
  verifyPassword,
  signToken,
}))

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 400 when email/password missing", async () => {
    const { POST } = await import("@/app/api/auth/login/route")
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "" }),
      headers: { "content-type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns 401 for bad credential", async () => {
    findUserByEmail.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      username: "u1",
      name: "u1",
      role: "sales",
      status: "active",
      password: "hash",
    })
    verifyPassword.mockResolvedValue(false)
    const { POST } = await import("@/app/api/auth/login/route")
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "bad" }),
      headers: { "content-type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("returns 200 and sets cookie on success", async () => {
    findUserByEmail.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      username: "u1",
      name: "u1",
      role: "sales",
      status: "active",
      password: "hash",
    })
    verifyPassword.mockResolvedValue(true)
    signToken.mockReturnValue("jwt-token")

    const { POST } = await import("@/app/api/auth/login/route")
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "123456" }),
      headers: { "content-type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(setCookie).toHaveBeenCalled()
  })
})


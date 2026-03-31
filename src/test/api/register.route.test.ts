import { beforeEach, describe, expect, it, vi } from "vitest"

const requireAdmin = vi.fn()
const hashPassword = vi.fn()
const toSafeUser = vi.fn()
const readUsers = vi.fn()
const writeUsers = vi.fn()

vi.mock("@/lib/auth", () => ({
  requireAdmin,
  hashPassword,
  toSafeUser,
}))

vi.mock("@/lib/users-store", () => ({
  readUsers,
  writeUsers,
}))

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 403 when requester is not admin", async () => {
    requireAdmin.mockResolvedValue(null)
    const { POST } = await import("@/app/api/auth/register/route")
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it("returns 409 when email already exists", async () => {
    requireAdmin.mockResolvedValue({ id: "admin1" })
    readUsers.mockResolvedValue([{ email: "dup@example.com" }])
    const { POST } = await import("@/app/api/auth/register/route")
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: "u1",
        name: "u1",
        email: "dup@example.com",
        password: "123456",
      }),
      headers: { "content-type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it("creates user when request is valid", async () => {
    requireAdmin.mockResolvedValue({ id: "admin1" })
    readUsers.mockResolvedValue([])
    hashPassword.mockResolvedValue("hashed")
    toSafeUser.mockImplementation((u) => ({ ...u, password: undefined }))

    const { POST } = await import("@/app/api/auth/register/route")
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: "u2",
        name: "u2",
        email: "u2@example.com",
        password: "123456",
      }),
      headers: { "content-type": "application/json" },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(writeUsers).toHaveBeenCalledTimes(1)
  })
})


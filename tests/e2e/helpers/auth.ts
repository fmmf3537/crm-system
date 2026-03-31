import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export type LoginUser = {
  email: string
  password: string
}

export async function login(page: Page, user: LoginUser) {
  await page.goto("/login")
  await page.getByLabel("邮箱").fill(user.email)
  await page.getByLabel("密码").fill(user.password)
  await page.getByRole("button", { name: "登录" }).click()
}

export async function loginAsAdmin(page: Page) {
  await login(page, { email: "e2e-admin@example.com", password: "Admin123!" })
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole("heading", { name: "销售仪表盘" })).toBeVisible()
}


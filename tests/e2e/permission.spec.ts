import { expect, test } from "@playwright/test"

import { login } from "./helpers/auth"

test("permission UI boundary for sales and manager", async ({ page }) => {
  await login(page, { email: "e2e-sales-a@example.com", password: "Sales123!" })
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole("button", { name: "用户管理" })).not.toBeVisible()

  await page.goto("/admin/users")
  await expect(page.getByText("Forbidden")).toBeVisible()

  await page.goto("/projects")
  await expect(page.getByText("团队A项目")).toBeVisible()
  await expect(page.getByText("团队B项目")).not.toBeVisible()

  await page.goto("/login")
  await login(page, { email: "e2e-manager@example.com", password: "Sales123!" })
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto("/projects")
  await expect(page.getByText("团队A项目")).toBeVisible()
  await expect(page.getByText("团队B项目")).not.toBeVisible()
})

test("error paths: form validation and unauthorized update", async ({ page }) => {
  await login(page, { email: "e2e-admin@example.com", password: "Admin123!" })
  await expect(page).toHaveURL(/\/dashboard/)

  await page.goto("/customers/new")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page.getByText("请输入客户名称")).toBeVisible()

  await page.goto("/projects/proj-team-a")
  await page.getByLabel("项目阶段").click()
  await page.getByRole("option", { name: "线索" }).click()
  await page.getByLabel("阶段变更原因（变更时必填）").fill("逆向回退")
  await page.getByLabel("操作人（变更时必填）").fill("管理员")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page.getByText("阶段只能按顺序推进一档")).toBeVisible()

  await page.goto("/login")
  await login(page, { email: "e2e-sales-a@example.com", password: "Sales123!" })
  await expect(page).toHaveURL(/\/dashboard/)
  await page.goto("/projects/proj-team-b")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page.getByText("无权限操作该项目")).toBeVisible()
})


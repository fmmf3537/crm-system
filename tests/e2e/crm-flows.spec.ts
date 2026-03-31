import { expect, test } from "@playwright/test"

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login")
  await page.getByLabel("邮箱").fill("e2e-admin@example.com")
  await page.getByLabel("密码").fill("Admin123!")
  await page.getByRole("button", { name: "登录" }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole("heading", { name: "销售仪表盘" })).toBeVisible()
}

test("login and logout flow", async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole("button", { name: "退出登录" }).click()
  await expect(page).toHaveURL(/\/login/)
})

test("create customer flow", async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto("/customers/new")

  const suffix = Date.now().toString().slice(-6)
  const customerName = `E2E客户${suffix}`
  await page.getByLabel("客户名称").fill(customerName)
  await page.getByLabel("客户简称").fill(`E2E${suffix}`)
  await page.getByLabel("省份-城市").fill("西安-高新区")
  await page.getByLabel("主对接人").fill("测试联系人")
  await page.getByLabel("对接人职位").fill("总监")
  await page.getByLabel("对接人电话").fill("13800138000")
  await page.getByLabel("关系评分（1-10）").fill("8")
  await page.getByRole("button", { name: "保存" }).click()

  await expect(page).toHaveURL(/\/customers\/.+/)
  await expect(page.getByText(customerName)).toBeVisible()
})

test("create project and activity flow", async ({ page }) => {
  await loginAsAdmin(page)
  const suffix = Date.now().toString().slice(-6)

  await page.goto("/projects/new")
  await page.getByLabel("项目名称").fill(`E2E项目${suffix}`)
  await page.getByLabel("项目负责人").fill("E2E负责人")
  await page.getByRole("combobox", { name: "关联客户" }).click()
  await page.getByRole("option").first().click()
  await page.getByLabel("预计签约日期").fill("2026-12-31")
  await page.getByLabel("预计金额").fill("100000")
  await page.getByLabel("实际金额").fill("0")
  await page.getByLabel("胜负手").fill("快速响应")
  await page.getByLabel("风险点").fill("预算审批")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page).toHaveURL(/\/projects\/.+/)

  await page.goto("/activities/new")
  await page.getByRole("combobox", { name: "关联项目" }).click()
  await page.getByRole("option").first().click()
  await page.getByLabel("跟进人").fill("E2E负责人")
  await page.getByLabel("跟进内容").fill(`E2E跟进内容${suffix}`)
  await page.getByLabel("跟进日期").fill("2026-04-01")
  await page.getByLabel("下次跟进日期").fill("2026-04-10")
  await page.getByLabel("下次跟进事项").fill("发送技术资料")
  await page.getByRole("button", { name: "保存" }).click()

  await expect(page).toHaveURL(/\/activities/)
  await expect(page.getByText(`E2E跟进内容${suffix}`)).toBeVisible()
})

test("admin create user flow", async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto("/admin/users/new")

  const suffix = Date.now().toString().slice(-6)
  const username = `e2e_user_${suffix}`
  const email = `e2e_user_${suffix}@example.com`

  await page.getByLabel("用户名").fill(username)
  await page.getByLabel("姓名").fill(`E2E用户${suffix}`)
  await page.getByLabel("邮箱").fill(email)
  await page.getByLabel("初始密码").fill("Admin123!")
  await page.getByLabel("团队 ID（可选）").fill("e2e-team")
  await page.getByLabel("部门").fill("销售部")
  await page.getByLabel("电话").fill("13800000000")
  await page.getByRole("button", { name: "保存" }).click()

  await expect(page).toHaveURL(/\/admin\/users/)
  await expect(page.getByText(username)).toBeVisible()
})


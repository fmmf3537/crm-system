import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

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

test("customer edit and delete flow", async ({ page }) => {
  await loginAsAdmin(page)
  const suffix = Date.now().toString().slice(-6)
  const customerName = `可删客户${suffix}`

  await page.goto("/customers/new")
  await page.getByLabel("客户名称").fill(customerName)
  await page.getByLabel("客户简称").fill(`删${suffix}`)
  await page.getByLabel("省份-城市").fill("西安")
  await page.getByLabel("主对接人").fill("原联系人")
  await page.getByLabel("对接人职位").fill("经理")
  await page.getByLabel("对接人电话").fill("13800138000")
  await page.getByLabel("关系评分（1-10）").fill("6")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page).toHaveURL(/\/customers\/.+/)

  await page.getByLabel("主对接人").fill("新联系人")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page.getByDisplayValue("新联系人")).toBeVisible()

  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "删除客户" }).click()
  await expect(page).toHaveURL(/\/customers/)
  await expect(page.getByText(customerName)).not.toBeVisible()
})

test("project edit and delete flow", async ({ page }) => {
  await loginAsAdmin(page)
  const suffix = Date.now().toString().slice(-6)
  const projectName = `可删项目${suffix}`

  await page.goto("/projects/new")
  await page.getByLabel("项目名称").fill(projectName)
  await page.getByLabel("项目负责人").fill("测试负责人")
  await page.getByRole("combobox", { name: "关联客户" }).click()
  await page.getByRole("option").first().click()
  await page.getByLabel("预计签约日期").fill("2026-12-31")
  await page.getByLabel("预计金额").fill("120000")
  await page.getByLabel("实际金额").fill("0")
  await page.getByLabel("胜负手").fill("速度")
  await page.getByLabel("风险点").fill("预算")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page).toHaveURL(/\/projects\/.+/)

  await page.getByLabel("项目阶段").click()
  await page.getByRole("option", { name: "需求" }).click()
  await page.getByLabel("阶段变更原因（变更时必填）").fill("需求明确")
  await page.getByLabel("操作人（变更时必填）").fill("测试负责人")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page.getByText("需求")).toBeVisible()

  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "删除项目" }).click()
  await expect(page).toHaveURL(/\/projects/)
  await expect(page.getByText(projectName)).not.toBeVisible()
})

test("user edit and delete flow", async ({ page }) => {
  await loginAsAdmin(page)
  const suffix = Date.now().toString().slice(-6)
  const username = `edit_del_${suffix}`
  const email = `edit_del_${suffix}@example.com`

  await page.goto("/admin/users/new")
  await page.getByLabel("用户名").fill(username)
  await page.getByLabel("姓名").fill(`编辑删除${suffix}`)
  await page.getByLabel("邮箱").fill(email)
  await page.getByLabel("初始密码").fill("Admin123!")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page).toHaveURL(/\/admin\/users/)

  await page.getByRole("link", { name: username }).click()
  await page.getByLabel("部门").fill("测试部")
  await page.getByRole("button", { name: "保存" }).click()
  await expect(page.getByDisplayValue("测试部")).toBeVisible()

  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "删除用户" }).click()
  await expect(page).toHaveURL(/\/admin\/users/)
  await expect(page.getByText(username)).not.toBeVisible()
})


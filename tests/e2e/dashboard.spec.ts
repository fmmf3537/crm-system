import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

test("dashboard report data consistency", async ({ page }) => {
  await loginAsAdmin(page)
  await expect(page.getByText("¥350,000")).toBeVisible()
  await expect(page.getByText("¥50,000")).toBeVisible()
  await expect(page.getByText("本月新增项目数")).toBeVisible()
  await expect(page.getByText("3")).toBeVisible()
  await expect(page.getByText("团队B项目")).toBeVisible()
})


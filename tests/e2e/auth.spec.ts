import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "./helpers/auth"

test("login and logout flow", async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole("button", { name: "退出登录" }).click()
  await expect(page).toHaveURL(/\/login/)
})


# 测试报告目录

由下列命令生成，每次会在 `runs/` 下创建**带时间戳的子文件夹**（例如 `2026-04-01_14-30-45`）：

- `pnpm run test:report` — API（Vitest）+ E2E（Playwright），E2E 会起 dev 服务，**耗时较长**。
- `pnpm run test:report:api` — **仅 API**，快速生成报告（等价于 `node scripts/test-report.cjs --api-only`）。

## 单次运行目录内常见文件

| 文件 / 目录 | 说明 |
|-------------|------|
| `SUMMARY.md` | 人类可读的摘要（时间、Git、退出码、耗时） |
| `results.json` | 机器可读的原始结果（stdout/stderr 全文） |
| `api-junit.xml` | API 测试 JUnit 报告 |
| `api-stdout.log` / `api-stderr.log` | Vitest 完整输出 |
| `e2e-stdout.log` / `e2e-stderr.log` | Playwright 列表输出 |
| `e2e-artifacts/` | Playwright `--output`（失败截图、trace 等） |
| `playwright-html/` | 从本次运行复制的 HTML 报告（若已生成） |

## 说明

- `runs/` 下的内容默认被 `.gitignore` 忽略，避免把大日志提交进仓库。
- E2E 会执行 `pretest:e2e`（安装 Chromium、重置 `test.db`），首次可能较慢。

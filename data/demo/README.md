# 演示与验证数据（Demo seed）

面向「仪表盘有数、权限可对比、列表有故事」的固定演示数据集，由 `scripts/seed-demo.cjs` 写入数据库。E2E 仍使用 `npm run test:db:reset` 与 `test.db`，与本流程独立。

## 数据库写到哪里

| 方式 | 说明 |
|------|------|
| **默认（推荐日常演示）** | 使用环境变量 `DATABASE_URL`（一般为 `file:./dev.db`）。 |
| **独立演示库** | 设置 `DEMO_DATABASE_URL`（例如 `file:./demo.db`），种子脚本**只**连该 URL；应用若要访问同一库，需在 `.env` 中把 `DATABASE_URL` 改为相同路径，或按需切换。 |

使用**新的** SQLite 文件前，必须先对该 URL 执行迁移，否则表不存在：

```bash
# 示例：创建并迁移 demo.db（PowerShell）
$env:DATABASE_URL="file:./demo.db"
npx prisma migrate deploy
$env:DEMO_DATABASE_URL="file:./demo.db"
npm run db:seed:demo:reset
```

（Bash 下可使用 `DATABASE_URL=file:./demo.db npx prisma migrate deploy`。）

## 命令

| 命令 | 行为 |
|------|------|
| `npm run db:seed:demo` | **合并模式（默认）**：删除 `demo-cust-*`、`demo-proj-*`、`demo-act-*` 后重新插入；演示用户按邮箱 **upsert**，不删除其他用户或非 demo 业务数据。 |
| `npm run db:seed:demo:reset` | **`--reset`**：按外键顺序清空 **全部** `Activity`、`Project`、`Customer`、`User` 后仅插入演示数据。 |

也可直接：`node scripts/seed-demo.cjs`、`node scripts/seed-demo.cjs --reset`、`node scripts/seed-demo.cjs --merge`。

### `--reset` 风险

**会删除当前连接库中的全部用户与业务数据**，仅适合「一键还原纯演示环境」或已确认可丢弃的库。**不要**对存有真实数据的 `dev.db` 在未备份的情况下执行 reset。

## 演示账号（密码均为明文，仅用于演示）

**统一密码：`Demo123!`**

登录页使用**邮箱**登录。

| 邮箱 | 角色 | 说明 |
|------|------|------|
| `demo-admin@demo.local` | admin | 全量数据；用户管理 |
| `demo-manager@demo.local` | manager | `team-east`，可见本团队销售负责的数据 |
| `demo-sales-east@demo.local` | sales | `team-east`，仅自己名下客户/项目 |
| `demo-sales-west@demo.local` | sales | `team-west`，仅自己名下客户/项目 |

## 数据集概要（与仪表盘对齐）

- **用户**：4（admin + manager + 东西销售各一）。
- **客户**：8（华东 4 归属 `demo-sales-east`，华西 4 归属 `demo-sales-west`）；`type` / `level` / `region` / `industry`（JSON 字符串数组）多样。
- **项目**：12，阶段覆盖漏斗各段；含「本月 / 上月」`createdAt`；未签约项中部分 `expectedDate` 落在 **今日～今日+30 天** 内、部分在外；签约/交付项目带 `actualAmount` 便于核对「已签约金额」。
- **跟进**：6 条，客户与项目一致，类型覆盖 `拜访`、`电话`、`微信`、`邮件`、`招投标`（见 `src/types/activity.ts`）。

枚举与模型约定以 `prisma/schema.prisma`、`src/types` 为准；`Project.stageHistory` 为 JSON **字符串**，与 `src/lib/projects-store.ts` 一致。

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 演示数据（可选）

一键灌入用于演示/验收的数据集（仪表盘、权限、漏斗、30 天内应签约等）：

- `npm run db:seed:demo` — 合并模式：只替换 `demo-*` 客户/项目/跟进，用户按邮箱 upsert。
- `npm run db:seed:demo:reset` — **清空当前库全部用户与业务数据**后仅保留演示数据；请勿用于存有真实数据的库。

演示账号、独立 `demo.db` 与 `--reset` 风险说明见 [data/demo/README.md](data/demo/README.md)。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Prisma Postgres Setup

This project uses Prisma with PostgreSQL (`provider = "postgresql"`).

1. Configure local environment:

```bash
cp .env.example .env
# set DATABASE_URL (and TEST_DATABASE_URL if needed)
```

2. Create migration from current schema (first time after switching from SQLite):

```bash
pnpm prisma migrate dev --name init_postgres
```

3. Generate client and run app:

```bash
pnpm prisma generate
pnpm dev
```

4. Apply migrations in non-dev environments:

```bash
pnpm prisma migrate deploy
```

### Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL` (required, Production + Preview)
- `JWT_SECRET` (required)
- `TEST_DATABASE_URL` (optional; only if you run tests in Vercel/CI)

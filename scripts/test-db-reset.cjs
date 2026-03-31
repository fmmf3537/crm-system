const { existsSync } = require("fs")
const { rm } = require("fs/promises")
const path = require("path")
const { spawnSync } = require("child_process")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const cwd = process.cwd()
const dbFile = path.join(cwd, "test.db")
const dbJournal = path.join(cwd, "test.db-journal")
const env = {
  ...process.env,
  DATABASE_URL: process.env.TEST_DATABASE_URL || "file:./test.db",
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, {
    cwd,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  })
  if (res.status !== 0) {
    process.exit(res.status || 1)
  }
}

async function main() {
  if (existsSync(dbFile)) await rm(dbFile, { force: true })
  if (existsSync(dbJournal)) await rm(dbJournal, { force: true })

  run("npx", ["prisma", "migrate", "deploy"])
  run("node", ["scripts/seed-from-json.cjs"])

  const prisma = new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
  })
  const adminPassword = await bcrypt.hash("Admin123!", 10)
  const userPassword = await bcrypt.hash("Sales123!", 10)

  const now = new Date()
  const in10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  const in20Days = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)

  await prisma.user.upsert({
    where: { email: "e2e-admin@example.com" },
    update: {
      password: adminPassword,
      role: "admin",
      status: "active",
      teamId: "team-admin",
      updatedAt: new Date(),
    },
    create: {
      id: "e2e-admin-id",
      username: "e2e-admin",
      email: "e2e-admin@example.com",
      password: adminPassword,
      name: "E2E 管理员",
      role: "admin",
      teamId: "team-admin",
      department: "QA",
      phone: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  await prisma.user.upsert({
    where: { email: "e2e-manager@example.com" },
    update: {
      password: userPassword,
      role: "manager",
      teamId: "team-a",
      status: "active",
      updatedAt: new Date(),
    },
    create: {
      id: "e2e-manager-id",
      username: "e2e-manager",
      email: "e2e-manager@example.com",
      password: userPassword,
      name: "E2E 经理",
      role: "manager",
      teamId: "team-a",
      department: "销售管理",
      phone: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.user.upsert({
    where: { email: "e2e-sales-a@example.com" },
    update: {
      password: userPassword,
      role: "sales",
      teamId: "team-a",
      status: "active",
      updatedAt: new Date(),
    },
    create: {
      id: "e2e-sales-a-id",
      username: "e2e-sales-a",
      email: "e2e-sales-a@example.com",
      password: userPassword,
      name: "E2E 销售A",
      role: "sales",
      teamId: "team-a",
      department: "销售一部",
      phone: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.user.upsert({
    where: { email: "e2e-sales-b@example.com" },
    update: {
      password: userPassword,
      role: "sales",
      teamId: "team-b",
      status: "active",
      updatedAt: new Date(),
    },
    create: {
      id: "e2e-sales-b-id",
      username: "e2e-sales-b",
      email: "e2e-sales-b@example.com",
      password: userPassword,
      name: "E2E 销售B",
      role: "sales",
      teamId: "team-b",
      department: "销售二部",
      phone: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  await prisma.activity.deleteMany()
  await prisma.project.deleteMany()
  await prisma.customer.deleteMany()

  await prisma.customer.createMany({
    data: [
      {
        id: "cust-team-a",
        ownerId: "e2e-sales-a-id",
        name: "团队A客户",
        shortName: "A客",
        type: "政府",
        industry: JSON.stringify(["能源"]),
        level: "A战略",
        region: "西安",
        contactName: "张三",
        contactPosition: "经理",
        contactPhone: "13800000001",
        rating: 8,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "cust-team-b",
        ownerId: "e2e-sales-b-id",
        name: "团队B客户",
        shortName: "B客",
        type: "民营",
        industry: JSON.stringify(["交通"]),
        level: "B重点",
        region: "北京",
        contactName: "李四",
        contactPosition: "总监",
        contactPhone: "13800000002",
        rating: 7,
        createdAt: now,
        updatedAt: now,
      },
    ],
  })

  await prisma.project.createMany({
    data: [
      {
        id: "proj-team-a",
        ownerId: "e2e-sales-a-id",
        name: "团队A项目",
        customerId: "cust-team-a",
        type: "招投标",
        stage: "签约",
        expectedAmount: 100000,
        actualAmount: 50000,
        expectedDate: in10Days,
        owner: "E2E销售A",
        keyFactor: "关系深",
        risk: "周期",
        stageHistory: JSON.stringify([
          { stage: "线索", changedAt: now.toISOString(), reason: "创建", operator: "E2E销售A" },
          { stage: "签约", changedAt: now.toISOString(), reason: "推进", operator: "E2E销售A" },
        ]),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "proj-team-b",
        ownerId: "e2e-sales-b-id",
        name: "团队B项目",
        customerId: "cust-team-b",
        type: "直接采购",
        stage: "线索",
        expectedAmount: 200000,
        actualAmount: 0,
        expectedDate: in20Days,
        owner: "E2E销售B",
        keyFactor: "价格",
        risk: "预算",
        stageHistory: JSON.stringify([
          { stage: "线索", changedAt: now.toISOString(), reason: "创建", operator: "E2E销售B" },
        ]),
        createdAt: now,
        updatedAt: now,
      },
    ],
  })

  await prisma.activity.createMany({
    data: [
      {
        id: "act-team-a",
        ownerId: "e2e-sales-a-id",
        projectId: "proj-team-a",
        customerId: "cust-team-a",
        type: "拜访",
        content: "种子跟进A",
        date: now,
        nextDate: in10Days,
        nextTask: "继续推进",
        owner: "E2E销售A",
        createdAt: now,
      },
    ],
  })
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


// 简单的 JSON -> SQLite 一次性导入脚本
// 使用方法（在项目根目录执行）：
// 1）确保 .env 里 DATABASE_URL 已配置为 SQLite
// 2）npm run prisma:generate
// 3）npm run prisma:migrate
// 4）npm run db:seed

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs/promises")
const path = require("path")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function readJson(fileName) {
  const full = path.join(process.cwd(), "data", fileName)
  try {
    const raw = await fs.readFile(full, "utf-8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (e) {
    console.warn(`读取 ${fileName} 失败（可能不存在），跳过`, e.message)
    return []
  }
}

async function seedUsers() {
  const users = await readJson("users.json")
  if (!users.length) {
    console.log("users.json 为空，跳过用户导入")
    return
  }
  console.log(`导入用户：${users.length} 条`)
  await prisma.user.createMany({
    data: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password,
      avatarUrl: u.avatarUrl && u.avatarUrl.length > 0 ? u.avatarUrl : null,
      name: u.name,
      role: u.role,
      teamId: u.teamId && u.teamId.length > 0 ? u.teamId : null,
      department: u.department,
      phone: u.phone,
      status: u.status,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    })),
  })
}

async function seedCustomers() {
  const customers = await readJson("customers.json")
  if (!customers.length) {
    console.log("customers.json 为空，跳过客户导入")
    return
  }
  console.log(`导入客户：${customers.length} 条`)
  await prisma.customer.createMany({
    data: customers.map((c) => ({
      id: c.id,
      ownerId: c.ownerId ?? null,
      name: c.name,
      shortName: c.shortName,
      type: c.type,
      industry: JSON.stringify(c.industry ?? []),
      level: c.level,
      region: c.region,
      contactName: c.contactName,
      contactPosition: c.contactPosition,
      contactPhone: c.contactPhone,
      rating: c.rating,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
  })
}

async function seedProjects() {
  const projects = await readJson("projects.json")
  if (!projects.length) {
    console.log("projects.json 为空，跳过项目导入")
    return
  }
  console.log(`导入项目：${projects.length} 条`)
  await prisma.project.createMany({
    data: projects.map((p) => ({
      id: p.id,
      ownerId: p.ownerId ?? null,
      name: p.name,
      customerId: p.customerId,
      type: p.type,
      stage: p.stage,
      expectedAmount: p.expectedAmount,
      actualAmount: p.actualAmount,
      expectedDate: p.expectedDate ? new Date(p.expectedDate) : null,
      owner: p.owner,
      keyFactor: p.keyFactor,
      risk: p.risk,
      stageHistory: JSON.stringify(p.stageHistory ?? []),
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })),
  })
}

async function seedActivities() {
  const activities = await readJson("activities.json")
  if (!activities.length) {
    console.log("activities.json 为空，跳过跟进记录导入")
    return
  }
  console.log(`导入跟进记录：${activities.length} 条`)
  await prisma.activity.createMany({
    data: activities.map((a) => ({
      id: a.id,
      ownerId: a.ownerId ?? null,
      projectId: a.projectId,
      customerId: a.customerId,
      type: a.type,
      content: a.content,
      date: new Date(a.date),
      nextDate: a.nextDate ? new Date(a.nextDate) : null,
      nextTask: a.nextTask,
      owner: a.owner,
      createdAt: new Date(a.createdAt),
    })),
  })
}

async function main() {
  console.log("开始从 data/*.json 导入到数据库（会清空对应表）")
  await prisma.activity.deleteMany()
  await prisma.project.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await seedUsers()
  await seedCustomers()
  await seedProjects()
  await seedActivities()
  console.log("导入完成")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


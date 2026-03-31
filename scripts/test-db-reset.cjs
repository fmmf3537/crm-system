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
  const password = await bcrypt.hash("Admin123!", 10)
  await prisma.user.upsert({
    where: { email: "e2e-admin@example.com" },
    update: {
      password,
      role: "admin",
      status: "active",
      updatedAt: new Date(),
    },
    create: {
      id: "e2e-admin-id",
      username: "e2e-admin",
      email: "e2e-admin@example.com",
      password,
      name: "E2E 管理员",
      role: "admin",
      teamId: "e2e-team",
      department: "QA",
      phone: "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


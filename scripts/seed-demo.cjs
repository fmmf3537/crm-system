/**
 * Demo / validation dataset for presentations (Prisma + bcrypt).
 *
 * Database URL: DEMO_DATABASE_URL if set, else DATABASE_URL (typically dev.db).
 *
 * Modes:
 *   --merge (default): Remove prior demo-* Activity/Project/Customer rows, upsert demo users & data.
 *   --reset:           Delete ALL rows in Activity, Project, Customer, User then insert demo set only.
 *
 * Run: npm run db:seed:demo
 *      npm run db:seed:demo:reset
 */

const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const STAGES = [
  "线索",
  "需求",
  "方案",
  "投标",
  "谈判",
  "签约",
  "交付",
]

const DEMO_PASSWORD = "Demo123!"

const USERS = [
  {
    id: "demo-user-admin",
    username: "demo-admin",
    email: "demo-admin@demo.local",
    name: "演示管理员",
    role: "admin",
    teamId: "admin-team",
    department: "管理",
  },
  {
    id: "demo-user-manager",
    username: "demo-manager",
    email: "demo-manager@demo.local",
    name: "华东经理",
    role: "manager",
    teamId: "team-east",
    department: "销售管理",
  },
  {
    id: "demo-user-sales-east",
    username: "demo-sales-east",
    email: "demo-sales-east@demo.local",
    name: "华东销售",
    role: "sales",
    teamId: "team-east",
    department: "华东销售部",
  },
  {
    id: "demo-user-sales-west",
    username: "demo-sales-west",
    email: "demo-sales-west@demo.local",
    name: "华西销售",
    role: "sales",
    teamId: "team-west",
    department: "华西销售部",
  },
]

const SALES_EAST = "demo-user-sales-east"
const SALES_WEST = "demo-user-sales-west"

/** @type {Array<{ id: string; ownerId: string; name: string; shortName: string; type: string; industry: string[]; level: string; region: string; contactName: string; contactPosition: string; contactPhone: string; rating: number }>} */
const CUSTOMERS = [
  {
    id: "demo-cust-east-1",
    ownerId: SALES_EAST,
    name: "华东智慧城市科技有限公司",
    shortName: "华东智城",
    type: "政府",
    industry: ["交通", "能源"],
    level: "A战略",
    region: "上海市",
    contactName: "陈明",
    contactPosition: "信息中心主任",
    contactPhone: "13800001001",
    rating: 5,
  },
  {
    id: "demo-cust-east-2",
    ownerId: SALES_EAST,
    name: "辰航东部能源集团",
    shortName: "东部能源",
    type: "国企",
    industry: ["能源", "军工"],
    level: "B重点",
    region: "南京市",
    contactName: "刘芳",
    contactPosition: "采购总监",
    contactPhone: "13800001002",
    rating: 4,
  },
  {
    id: "demo-cust-east-3",
    ownerId: SALES_EAST,
    name: "滨东医疗设备有限公司",
    shortName: "滨东医疗",
    type: "民营",
    industry: ["医疗", "其他"],
    level: "C一般",
    region: "杭州市",
    contactName: "王磊",
    contactPosition: "运营副总",
    contactPhone: "13800001003",
    rating: 3,
  },
  {
    id: "demo-cust-east-4",
    ownerId: SALES_EAST,
    name: "长三角交通设计院",
    shortName: "长三角交规",
    type: "其他",
    industry: ["交通"],
    level: "B重点",
    region: "苏州市",
    contactName: "赵静",
    contactPosition: "项目经理",
    contactPhone: "13800001004",
    rating: 4,
  },
  {
    id: "demo-cust-west-1",
    ownerId: SALES_WEST,
    name: "西部军工配套厂",
    shortName: "西军配套",
    type: "军队",
    industry: ["军工", "能源"],
    level: "A战略",
    region: "成都市",
    contactName: "周强",
    contactPosition: "装备处长",
    contactPhone: "13900002001",
    rating: 5,
  },
  {
    id: "demo-cust-west-2",
    ownerId: SALES_WEST,
    name: "蜀云数据科技股份有限公司",
    shortName: "蜀云数据",
    type: "民营",
    industry: ["其他", "医疗"],
    level: "B重点",
    region: "重庆市",
    contactName: "吴敏",
    contactPosition: "CTO",
    contactPhone: "13900002002",
    rating: 4,
  },
  {
    id: "demo-cust-west-3",
    ownerId: SALES_WEST,
    name: "川藏公路养护中心",
    shortName: "川藏养护",
    type: "政府",
    industry: ["交通"],
    level: "C一般",
    region: "拉萨市",
    contactName: "扎西",
    contactPosition: "养护科长",
    contactPhone: "13900002003",
    rating: 3,
  },
  {
    id: "demo-cust-west-4",
    ownerId: SALES_WEST,
    name: "西南联合大学附属医院",
    shortName: "西南联大附院",
    type: "其他",
    industry: ["医疗"],
    level: "B重点",
    region: "昆明市",
    contactName: "孙丽",
    contactPosition: "院办主任",
    contactPhone: "13900002004",
    rating: 4,
  },
]

function buildStageHistory(stage, anchorDate) {
  const idx = STAGES.indexOf(stage)
  if (idx < 0) throw new Error(`Unknown stage: ${stage}`)
  const pathStages = STAGES.slice(0, idx + 1)
  const anchor = anchorDate.getTime()
  const entries = pathStages.map((s, i) => ({
    stage: s,
    changedAt: new Date(anchor - (pathStages.length - 1 - i) * 3 * 86400000).toISOString(),
    reason: "演示数据推进",
    operator: "演示用户",
  }))
  return JSON.stringify(entries)
}

function ymd(d) {
  return d.toISOString().slice(0, 10)
}

function main() {
  const args = process.argv.slice(2)
  const reset = args.includes("--reset")
  const merge = args.includes("--merge") || !reset

  if (reset && args.includes("--merge")) {
    console.error("Use only one of --reset or --merge.")
    process.exit(1)
  }

  const dbUrl = process.env.DEMO_DATABASE_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.error("Set DATABASE_URL or DEMO_DATABASE_URL.")
    process.exit(1)
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  })

  return run(prisma, reset, merge, dbUrl)
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}

async function run(prisma, reset, merge, dbUrl) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const today = new Date(now.toISOString().slice(0, 10))
  const in7 = new Date(today)
  in7.setDate(in7.getDate() + 7)
  const in18 = new Date(today)
  in18.setDate(in18.getDate() + 18)
  const in25 = new Date(today)
  in25.setDate(in25.getDate() + 25)
  const out45 = new Date(today)
  out45.setDate(out45.getDate() + 45)
  const out55 = new Date(today)
  out55.setDate(out55.getDate() + 55)

  const thisMonth = (day) => new Date(y, m, day)
  const lastMonth = (day) => new Date(y, m - 1, day)

  if (reset) {
    console.warn(
      "[seed-demo] --reset: removing ALL activities, projects, customers, and users.",
    )
    await prisma.activity.deleteMany()
    await prisma.project.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.user.deleteMany()
  } else if (merge) {
    await prisma.activity.deleteMany({
      where: { id: { startsWith: "demo-act-" } },
    })
    await prisma.project.deleteMany({
      where: { id: { startsWith: "demo-proj-" } },
    })
    await prisma.customer.deleteMany({
      where: { id: { startsWith: "demo-cust-" } },
    })
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  const status = "active"
  const phone = ""

  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        username: u.username,
        password: passwordHash,
        name: u.name,
        role: u.role,
        teamId: u.teamId,
        department: u.department,
        phone,
        status,
        updatedAt: new Date(),
      },
      create: {
        id: u.id,
        username: u.username,
        email: u.email,
        password: passwordHash,
        name: u.name,
        role: u.role,
        teamId: u.teamId,
        department: u.department,
        phone,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  for (const c of CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        ownerId: c.ownerId,
        name: c.name,
        shortName: c.shortName,
        type: c.type,
        industry: JSON.stringify(c.industry),
        level: c.level,
        region: c.region,
        contactName: c.contactName,
        contactPosition: c.contactPosition,
        contactPhone: c.contactPhone,
        rating: c.rating,
        updatedAt: new Date(),
      },
      create: {
        id: c.id,
        ownerId: c.ownerId,
        name: c.name,
        shortName: c.shortName,
        type: c.type,
        industry: JSON.stringify(c.industry),
        level: c.level,
        region: c.region,
        contactName: c.contactName,
        contactPosition: c.contactPosition,
        contactPhone: c.contactPhone,
        rating: c.rating,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  /** @type {Array<{ id: string; customerId: string; ownerId: string; name: string; type: string; stage: string; expectedAmount: number; actualAmount: number; expectedDate: Date | null; owner: string; keyFactor: string; risk: string; createdAt: Date; anchor: Date }>} */
  const projectDefs = [
    {
      id: "demo-proj-01",
      customerId: "demo-cust-east-1",
      ownerId: SALES_EAST,
      name: "智慧交通信号改造项目",
      type: "招投标",
      stage: "线索",
      expectedAmount: 280000,
      actualAmount: 0,
      expectedDate: out55,
      owner: "华东销售",
      keyFactor: "预算已批，需方案入围",
      risk: "竞品低价",
      createdAt: thisMonth(6),
      anchor: thisMonth(4),
    },
    {
      id: "demo-proj-02",
      customerId: "demo-cust-west-1",
      ownerId: SALES_WEST,
      name: "装备维保数字化平台",
      type: "直接采购",
      stage: "线索",
      expectedAmount: 420000,
      actualAmount: 0,
      expectedDate: out45,
      owner: "华西销售",
      keyFactor: "处长意向明确",
      risk: "交付周期紧",
      createdAt: lastMonth(12),
      anchor: lastMonth(10),
    },
    {
      id: "demo-proj-03",
      customerId: "demo-cust-east-2",
      ownerId: SALES_EAST,
      name: "能源调度指挥中心扩容",
      type: "合作开发",
      stage: "需求",
      expectedAmount: 960000,
      actualAmount: 0,
      expectedDate: in18,
      owner: "华东销售",
      keyFactor: "高层已立项",
      risk: "接口标准未定",
      createdAt: thisMonth(8),
      anchor: thisMonth(5),
    },
    {
      id: "demo-proj-04",
      customerId: "demo-cust-west-2",
      ownerId: SALES_WEST,
      name: "医院数据中台一期",
      type: "招投标",
      stage: "需求",
      expectedAmount: 1350000,
      actualAmount: 0,
      expectedDate: out45,
      owner: "华西销售",
      keyFactor: "信息科牵头",
      risk: "招标流程长",
      createdAt: lastMonth(18),
      anchor: lastMonth(15),
    },
    {
      id: "demo-proj-05",
      customerId: "demo-cust-east-3",
      ownerId: SALES_EAST,
      name: "冷链仓储物联网改造",
      type: "直接采购",
      stage: "方案",
      expectedAmount: 510000,
      actualAmount: 0,
      expectedDate: in25,
      owner: "华东销售",
      keyFactor: "试用满意",
      risk: "价格敏感",
      createdAt: thisMonth(10),
      anchor: thisMonth(7),
    },
    {
      id: "demo-proj-06",
      customerId: "demo-cust-west-3",
      ownerId: SALES_WEST,
      name: "公路养护巡检系统",
      type: "合作开发",
      stage: "方案",
      expectedAmount: 380000,
      actualAmount: 0,
      expectedDate: out55,
      owner: "华西销售",
      keyFactor: "试点路段已选",
      risk: "网络条件弱",
      createdAt: lastMonth(22),
      anchor: lastMonth(19),
    },
    {
      id: "demo-proj-07",
      customerId: "demo-cust-east-4",
      ownerId: SALES_EAST,
      name: "设计院协同设计平台",
      type: "招投标",
      stage: "投标",
      expectedAmount: 720000,
      actualAmount: 0,
      expectedDate: in25,
      owner: "华东销售",
      keyFactor: "技术评分占优",
      risk: "开标延期可能",
      createdAt: thisMonth(12),
      anchor: thisMonth(9),
    },
    {
      id: "demo-proj-08",
      customerId: "demo-cust-east-1",
      ownerId: SALES_EAST,
      name: "核心区信号优化二期",
      type: "直接采购",
      stage: "谈判",
      expectedAmount: 1180000,
      actualAmount: 0,
      expectedDate: in7,
      owner: "华东销售",
      keyFactor: "决策链已打通",
      risk: "合同条款博弈",
      createdAt: thisMonth(14),
      anchor: thisMonth(11),
    },
    {
      id: "demo-proj-09",
      customerId: "demo-cust-west-4",
      ownerId: SALES_WEST,
      name: "附院患者服务小程序",
      type: "合作开发",
      stage: "谈判",
      expectedAmount: 290000,
      actualAmount: 0,
      expectedDate: out55,
      owner: "华西销售",
      keyFactor: "院领导关注体验",
      risk: "HIS 对接复杂",
      createdAt: lastMonth(8),
      anchor: lastMonth(5),
    },
    {
      id: "demo-proj-10",
      customerId: "demo-cust-east-2",
      ownerId: SALES_EAST,
      name: "集团 CRM 替换项目",
      type: "招投标",
      stage: "签约",
      expectedAmount: 2100000,
      actualAmount: 1850000,
      expectedDate: lastMonth(28),
      owner: "华东销售",
      keyFactor: "中标通知书已下达",
      risk: "实施资源",
      createdAt: lastMonth(25),
      anchor: lastMonth(20),
    },
    {
      id: "demo-proj-11",
      customerId: "demo-cust-west-2",
      ownerId: SALES_WEST,
      name: "蜀云主数据治理",
      type: "直接采购",
      stage: "交付",
      expectedAmount: 890000,
      actualAmount: 920000,
      expectedDate: thisMonth(3),
      owner: "华西销售",
      keyFactor: "验收标准对齐",
      risk: "变更请求",
      createdAt: lastMonth(5),
      anchor: lastMonth(2),
    },
    {
      id: "demo-proj-12",
      customerId: "demo-cust-west-1",
      ownerId: SALES_WEST,
      name: "备件供应链可视化",
      type: "合作开发",
      stage: "签约",
      expectedAmount: 650000,
      actualAmount: 640000,
      expectedDate: thisMonth(2),
      owner: "华西销售",
      keyFactor: "框架协议已签",
      risk: "二期未定",
      createdAt: lastMonth(14),
      anchor: lastMonth(11),
    },
  ]

  for (const p of projectDefs) {
    const stageHistory = buildStageHistory(p.stage, p.anchor)
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        ownerId: p.ownerId,
        name: p.name,
        customerId: p.customerId,
        type: p.type,
        stage: p.stage,
        expectedAmount: p.expectedAmount,
        actualAmount: p.actualAmount,
        expectedDate: p.expectedDate,
        owner: p.owner,
        keyFactor: p.keyFactor,
        risk: p.risk,
        stageHistory,
        createdAt: p.createdAt,
        updatedAt: new Date(),
      },
      create: {
        id: p.id,
        ownerId: p.ownerId,
        name: p.name,
        customerId: p.customerId,
        type: p.type,
        stage: p.stage,
        expectedAmount: p.expectedAmount,
        actualAmount: p.actualAmount,
        expectedDate: p.expectedDate,
        owner: p.owner,
        keyFactor: p.keyFactor,
        risk: p.risk,
        stageHistory,
        createdAt: p.createdAt,
        updatedAt: new Date(),
      },
    })
  }

  const actDate = ymd(lastMonth(20))
  const actNext = ymd(in18)

  /** @type {Array<{ id: string; projectId: string; customerId: string; ownerId: string; type: string; content: string; date: Date; nextDate: Date; nextTask: string; owner: string; createdAt: Date }>} */
  const activities = [
    {
      id: "demo-act-01",
      projectId: "demo-proj-08",
      customerId: "demo-cust-east-1",
      ownerId: SALES_EAST,
      type: "拜访",
      content: "与信息中心主任沟通二期范围与时间节点。",
      date: new Date(actDate),
      nextDate: new Date(actNext),
      nextTask: "提交商务报价草案",
      owner: "华东销售",
      createdAt: lastMonth(21),
    },
    {
      id: "demo-act-02",
      projectId: "demo-proj-03",
      customerId: "demo-cust-east-2",
      ownerId: SALES_EAST,
      type: "电话",
      content: "确认调度中心扩容需求清单与现场勘查时间。",
      date: new Date(ymd(thisMonth(9))),
      nextDate: new Date(ymd(in25)),
      nextTask: "安排现场勘查",
      owner: "华东销售",
      createdAt: thisMonth(9),
    },
    {
      id: "demo-act-03",
      projectId: "demo-proj-10",
      customerId: "demo-cust-east-2",
      ownerId: SALES_EAST,
      type: "招投标",
      content: "递交投标文件并完成澄清答疑。",
      date: new Date(ymd(lastMonth(22))),
      nextDate: new Date(ymd(thisMonth(1))),
      nextTask: "合同技术附件确认",
      owner: "华东销售",
      createdAt: lastMonth(23),
    },
    {
      id: "demo-act-04",
      projectId: "demo-proj-04",
      customerId: "demo-cust-west-2",
      ownerId: SALES_WEST,
      type: "微信",
      content: "与 CTO 同步数据中台架构图与分期计划。",
      date: new Date(ymd(lastMonth(19))),
      nextDate: new Date(ymd(out45)),
      nextTask: "准备 POC 环境",
      owner: "华西销售",
      createdAt: lastMonth(19),
    },
    {
      id: "demo-act-05",
      projectId: "demo-proj-11",
      customerId: "demo-cust-west-2",
      ownerId: SALES_WEST,
      type: "邮件",
      content: "发送周报：主数据映射进度与风险项。",
      date: new Date(ymd(thisMonth(4))),
      nextDate: new Date(ymd(in25)),
      nextTask: "组织业务方评审",
      owner: "华西销售",
      createdAt: thisMonth(4),
    },
    {
      id: "demo-act-06",
      projectId: "demo-proj-02",
      customerId: "demo-cust-west-1",
      ownerId: SALES_WEST,
      type: "拜访",
      content: "现场了解维保工单与备件流转痛点。",
      date: new Date(ymd(lastMonth(11))),
      nextDate: new Date(ymd(in7)),
      nextTask: "输出痛点分析报告",
      owner: "华西销售",
      createdAt: lastMonth(11),
    },
  ]

  for (const a of activities) {
    await prisma.activity.upsert({
      where: { id: a.id },
      update: {
        projectId: a.projectId,
        customerId: a.customerId,
        ownerId: a.ownerId,
        type: a.type,
        content: a.content,
        date: a.date,
        nextDate: a.nextDate,
        nextTask: a.nextTask,
        owner: a.owner,
      },
      create: {
        id: a.id,
        projectId: a.projectId,
        customerId: a.customerId,
        ownerId: a.ownerId,
        type: a.type,
        content: a.content,
        date: a.date,
        nextDate: a.nextDate,
        nextTask: a.nextTask,
        owner: a.owner,
        createdAt: a.createdAt,
      },
    })
  }

  console.log(
    reset
      ? "[seed-demo] Reset complete: demo users, 8 customers, 12 projects, 6 activities."
      : "[seed-demo] Merge complete: demo users upserted; demo-cust-/demo-proj-/demo-act- reloaded.",
  )
  console.log(`[seed-demo] Database: ${dbUrl.replace(/password=\S+/i, "password=***")}`)
  console.log("[seed-demo] All demo accounts use password:", DEMO_PASSWORD)
  console.log("[seed-demo] Login emails:")
  for (const u of USERS) {
    console.log(`  - ${u.email} (${u.role}, ${u.name})`)
  }
}

main()

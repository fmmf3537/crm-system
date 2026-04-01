/**
 * Runs API (Vitest) + E2E (Playwright) tests and writes a timestamped folder under test-reports/runs/.
 *
 * Usage:
 *   node scripts/test-report.cjs              # API + E2E（E2E 含 dev 服务，较慢）
 *   node scripts/test-report.cjs --api-only   # 仅 API，快速出报告
 */
const { spawnSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

const cwd = process.cwd()
const apiOnly = process.argv.includes("--api-only")

function pad(n) {
  return String(n).padStart(2, "0")
}

function timestampFolderName() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

function tryGitSha() {
  const r = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  })
  const s = (r.stdout || "").trim()
  return s || null
}

function run(label, command, args, extraEnv) {
  const started = Date.now()
  const r = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 80 * 1024 * 1024,
    env: { ...process.env, ...extraEnv },
  })
  const ms = Date.now() - started
  const stdout = r.stdout || ""
  const stderr = r.stderr || ""
  const status = r.status === null ? 1 : r.status
  const errMsg = r.error ? String(r.error.message || r.error) : null
  return { label, stdout, stderr, status, ms, errMsg }
}

function writeFile(runDir, name, content) {
  fs.writeFileSync(path.join(runDir, name), content, "utf8")
}

function copyDirIfExists(src, dest) {
  if (!fs.existsSync(src)) return false
  fs.cpSync(src, dest, { recursive: true })
  return true
}

function buildSummary({
  stamp,
  isoStart,
  gitSha,
  api,
  e2e,
  htmlDest,
  e2eSkipped,
}) {
  const apiOk = api.status === 0
  const e2eOk = e2eSkipped ? true : e2e.status === 0
  const overallOk = apiOk && e2eOk

  const e2eSection = e2eSkipped
    ? [
        `## E2E 测试（Playwright）`,
        ``,
        `- **状态**: 已跳过（\`--api-only\`）`,
        ``,
      ]
    : [
        `## E2E 测试（Playwright）`,
        ``,
        `- **退出码**: ${e2e.status}`,
        `- **耗时**: ${(e2e.ms / 1000).toFixed(1)} s`,
        e2e.errMsg ? `- **spawn 错误**: ${e2e.errMsg}` : null,
        `- **列表日志**: \`e2e-stdout.log\`, \`e2e-stderr.log\``,
        `- **产物目录**: \`e2e-artifacts/\`（trace、失败截图等）`,
        fs.existsSync(htmlDest)
          ? `- **HTML 报告**: 打开 \`playwright-html/index.html\``
          : `- **HTML 报告**: 未生成（可查看 e2e 日志）`,
        ``,
      ]

  const summaryMd = [
    `# 测试报告`,
    ``,
    `- **时间戳（文件夹名）**: \`${stamp}\``,
    `- **开始时间 (ISO)**: ${isoStart}`,
    apiOnly ? `- **模式**: 仅 API` : `- **模式**: API + E2E`,
    gitSha ? `- **Git**: \`${gitSha}\`` : `- **Git**: （未解析）`,
    ``,
    `## API 测试（Vitest: src/test/api）`,
    ``,
    `- **退出码**: ${api.status}`,
    `- **耗时**: ${(api.ms / 1000).toFixed(1)} s`,
    api.errMsg ? `- **spawn 错误**: ${api.errMsg}` : null,
    `- **JUnit**: \`api-junit.xml\``,
    `- **完整日志**: \`api-stdout.log\`, \`api-stderr.log\``,
    ``,
    ...e2eSection.filter(Boolean),
    `## 总览`,
    ``,
    overallOk ? `**结果: 全部通过**` : `**结果: 存在失败**（请查看上述日志与 JUnit）`,
    ``,
  ]
    .filter(Boolean)
    .join("\n")

  return { summaryMd, overallOk, apiOk, e2eOk }
}

function main() {
  const stamp = timestampFolderName()
  const runDir = path.join(cwd, "test-reports", "runs", stamp)
  fs.mkdirSync(runDir, { recursive: true })

  const isoStart = new Date().toISOString()
  const gitSha = tryGitSha()

  const results = {
    stamp,
    startedAt: isoStart,
    gitSha,
    apiOnly,
    api: null,
    e2e: null,
  }

  const junitPath = path.join(runDir, "api-junit.xml")
  const apiArgs = [
    "exec",
    "vitest",
    "run",
    "src/test/api",
    "--reporter=verbose",
    "--reporter=junit",
    `--outputFile.junit=${junitPath}`,
  ]
  results.api = run("api", "pnpm", apiArgs)

  writeFile(runDir, "api-stdout.log", results.api.stdout)
  writeFile(runDir, "api-stderr.log", results.api.stderr)

  const htmlDest = path.join(runDir, "playwright-html")

  if (apiOnly) {
    results.e2e = {
      label: "e2e",
      skipped: true,
      stdout: "",
      stderr: "",
      status: 0,
      ms: 0,
      errMsg: null,
    }
    writeFile(runDir, "e2e-stdout.log", "(skipped --api-only)\n")
    writeFile(runDir, "e2e-stderr.log", "")
  } else {
    writeFile(
      runDir,
      "SUMMARY.partial.md",
      [
        `# 测试报告（进行中）`,
        ``,
        `API 阶段已完成。E2E 正在运行（启动 dev + Playwright，可能需数分钟）。`,
        ``,
        `- **API 退出码**: ${results.api.status}`,
        `- **API 耗时**: ${(results.api.ms / 1000).toFixed(1)} s`,
        ``,
      ].join("\n"),
    )

    const e2eArgs = [
      "run",
      "test:e2e",
      "--",
      "--reporter=list",
      "--reporter=html",
      `--output=${path.join(runDir, "e2e-artifacts")}`,
    ]
    results.e2e = run("e2e", "pnpm", e2eArgs)

    writeFile(runDir, "e2e-stdout.log", results.e2e.stdout)
    writeFile(runDir, "e2e-stderr.log", results.e2e.stderr)

    const htmlDefault = path.join(cwd, "playwright-report")
    copyDirIfExists(htmlDefault, htmlDest)
  }

  writeFile(runDir, "results.json", JSON.stringify(results, null, 2))

  const { summaryMd, overallOk } = buildSummary({
    stamp,
    isoStart,
    gitSha,
    api: results.api,
    e2e: results.e2e,
    htmlDest,
    e2eSkipped: apiOnly,
  })

  writeFile(runDir, "SUMMARY.md", summaryMd)

  console.log(`\n测试报告已写入: ${runDir}\n${summaryMd}\n`)

  process.exit(overallOk ? 0 : 1)
}

main()

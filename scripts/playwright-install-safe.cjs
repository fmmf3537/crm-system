const os = require("node:os")
const path = require("node:path")
const fs = require("node:fs")
const { spawnSync } = require("node:child_process")

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getLockPath() {
  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "ms-playwright", "__dirlock")
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Caches", "ms-playwright", "__dirlock")
  }
  return path.join(os.homedir(), ".cache", "ms-playwright", "__dirlock")
}

async function waitOrClearLock(lockPath, maxWaitMs) {
  const start = Date.now()
  while (fs.existsSync(lockPath) && Date.now() - start < maxWaitMs) {
    console.log(`[playwright-install-safe] lock exists, waiting: ${lockPath}`)
    await sleep(5000)
  }

  if (fs.existsSync(lockPath)) {
    console.log(`[playwright-install-safe] stale lock detected, removing: ${lockPath}`)
    fs.rmSync(lockPath, { recursive: true, force: true })
  }
}

function installChromium() {
  const args = ["playwright", "install", "chromium"]
  const res = spawnSync("npx", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  })
  process.exit(res.status || 0)
}

async function main() {
  const lockPath = getLockPath()
  await waitOrClearLock(lockPath, 120000)
  installChromium()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

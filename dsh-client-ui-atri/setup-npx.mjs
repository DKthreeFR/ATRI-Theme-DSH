// setup-npx.mjs — 为「npm/npx 安装版」的 DeepSeek Harness 打上 ATRI 主题所需的核心补丁。
//
// 它做两件事：
//   1. 在 dsh-host-apiproxy 的 settings 白名单里加入 'atri-ui'（否则「UI 界面设置」会报 settings-not-exposed）
//   2. 把 dsh-client-ui-layout 的默认侧栏宽度 280 -> 295（展开侧栏 +15px）
//
// 既可作为脚本直接运行，也可被 bin/atri.mjs 的 `patch` 命令 import：
//   直接运行：node setup-npx.mjs [<node_modules根目录>]
//   import  ：import { runCorePatch } from './setup-npx.mjs'

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

/** 在 root 下递归查找 node_modules/@deepseek-ai/<name> */
function findScoped(root, name, depth = 0) {
  if (!root || depth > 7) return undefined
  let entries
  try { entries = readdirSync(root, { withFileTypes: true }) } catch { return undefined }
  for (const e of entries) {
    if (!e.isDirectory()) continue
    if (e.name === 'node_modules') {
      const direct = join(root, 'node_modules', '@deepseek-ai', name)
      if (existsSync(join(direct, 'package.json'))) return direct
      const nested = findScoped(join(root, 'node_modules'), name, depth + 1)
      if (nested) return nested
    } else {
      const nested = findScoped(join(root, e.name), name, depth + 1)
      if (nested) return nested
    }
  }
  return undefined
}

function searchRoots(name, extraRoot) {
  const roots = []
  try {
    const g = execSync('npm root -g', { encoding: 'utf8' }).trim()
    if (g) roots.push(g)
  } catch {}
  const home = process.env.USERPROFILE || process.env.HOME || ''
  if (home) roots.push(join(home, '.npm', '_npx'))
  if (extraRoot) roots.unshift(extraRoot)
  roots.push(here)

  for (const r of roots) {
    const found = findScoped(r, name)
    if (found) return found
  }
  return undefined
}

function patchFile(pkgDir, rel, patch) {
  const f = join(pkgDir, rel)
  if (!existsSync(f)) {
    console.log('[skip] 未找到 ' + f)
    return
  }
  const s = readFileSync(f, 'utf8')
  const result = patch(s)
  if (result.changed) {
    writeFileSync(f, result.text, 'utf8')
    console.log('[ok]   已修改 ' + f)
  } else {
    console.log('[skip] ' + f + '（已是最新，无需修改）')
  }
}

/** 打核心补丁。extraRoot 为可选的 node_modules 根目录（优先查找）。 */
export function runCorePatch(extraRoot) {
  const apiProxy = searchRoots('dsh-host-apiproxy', extraRoot)
  if (apiProxy) {
    console.log('找到 dsh-host-apiproxy: ' + apiProxy)
    patchFile(apiProxy, join('lib', 'index.js'), (s) => {
      if (s.includes('"atri-ui"')) return { changed: false, text: s }
      const t = s.replace('"web-search-deepseek"', '"web-search-deepseek", "atri-ui"')
      return { changed: t !== s, text: t }
    })
  } else {
    console.log('[warn] 未找到 dsh-host-apiproxy，请手动传入 node_modules 路径：node setup-npx.mjs <path>')
  }

  const layout = searchRoots('dsh-client-ui-layout', extraRoot)
  if (layout) {
    console.log('找到 dsh-client-ui-layout: ' + layout)
    patchFile(layout, join('lib', 'client.js'), (s) => {
      if (s.includes('? 295 :')) return { changed: false, text: s }
      const t = s.replace('? 280 :', '? 295 :')
      return { changed: t !== s, text: t }
    })
  } else {
    console.log('[warn] 未找到 dsh-client-ui-layout，请手动传入 node_modules 路径：node setup-npx.mjs <path>')
  }

  console.log('完成。重启 dsh 后刷新页面即可。')
}

// 直接运行时（node setup-npx.mjs）才执行；被 import 时不执行。
const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false

if (isMain) {
  runCorePatch(process.argv[2])
}

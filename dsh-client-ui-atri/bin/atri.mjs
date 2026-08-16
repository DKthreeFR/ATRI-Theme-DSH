#!/usr/bin/env node
// atri — ATRI 主题插件的 npm 一键安装器。
//
//   npx @dkthree/dsh-client-ui-atri install     把插件放进 web profile 并注册（纯视觉主题，装完即用）
//   npx @dkthree/dsh-client-ui-atri patch       （可选）给核心打补丁：设置白名单 + 侧栏加宽 15px
//   npx @dkthree/dsh-client-ui-atri uninstall   从 cordis.patch.yml 移除 ui-atri 注册（保留目录，安全）
//   npx @dkthree/dsh-client-ui-atri help        显示本帮助
//
// 仅使用 Node 内置模块，无第三方依赖。DSH_HOME 环境变量可覆盖 profile 根目录（默认 ~/.dsh）。

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PKG = '@dkthree/dsh-client-ui-atri'
const ID = 'ui-atri'
const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(here, '..')

const log = (m = '') => console.log(m)
const fail = (m) => {
  console.error('\n[error] ' + m + '\n')
  process.exit(1)
}

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

function webProfile() {
  return join(dshHome(), 'profiles', 'web')
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 把插件包的必要文件复制进 profile 的 node_modules。
function copyPackage() {
  const profile = webProfile()
  const target = join(profile, 'node_modules', '@dkthree', 'dsh-client-ui-atri')
  mkdirSync(target, { recursive: true })
  const items = ['lib', 'patches', 'package.json', 'setup-npx.mjs', 'README.md', 'LICENSE']
  let copied = 0
  for (const it of items) {
    const src = join(pkgRoot, it)
    if (!existsSync(src)) continue
    const dst = join(target, it)
    rmSync(dst, { recursive: true, force: true })
    cpSync(src, dst, { recursive: true, force: true })
    copied++
  }
  return { target, copied }
}

// 在 profile 的 cordis.patch.yml 里注册 / 移除 ui-atri 条目。
function patchYaml(action) {
  const yamlPath = join(webProfile(), 'cordis.patch.yml')
  let text = ''
  try {
    text = readFileSync(yamlPath, 'utf8')
  } catch {
    text = ''
  }

  const idRe = new RegExp('^\\s*-?\\s*id:\\s*' + escapeRe(ID) + '\\s*$', 'm')
  const hasId = idRe.test(text)

  if (action === 'uninstall') {
    if (!hasId) return { yamlPath, status: 'not-registered' }
    const lines = text.split(/\r?\n/)
    const out = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (/^\s*-\s*id:\s*ui-atri\s*$/.test(line)) {
        const baseIndent = (line.match(/^(\s*)/) || [''])[0].length
        i++
        // 跳过紧随其后、缩进更深的属性行（name / disabled 等）
        while (i < lines.length) {
          const nxt = lines[i]
          const nxtIndent = (nxt.match(/^(\s*)/) || [''])[0].length
          if (nxt.trim() !== '' && nxtIndent > baseIndent) i++
          else break
        }
        continue
      }
      out.push(line)
      i++
    }
    writeFileSync(yamlPath, out.join('\n').replace(/\s*$/, '') + '\n', 'utf8')
    return { yamlPath, status: 'unregistered' }
  }

  if (hasId) return { yamlPath, status: 'already-registered' }

  const entry = '    - id: ' + ID + "\n      name: '" + PKG + "'"
  let out
  if (!text.trim()) {
    out = '- insert:\n' + entry + '\n'
  } else if (/^\s*-\s*insert\s*:/m.test(text)) {
    out = text.replace(/\s*$/, '') + '\n' + entry + '\n'
  } else {
    out = text.replace(/\s*$/, '') + '\n- insert:\n' + entry + '\n'
  }
  writeFileSync(yamlPath, out, 'utf8')
  return { yamlPath, status: 'registered' }
}

function help() {
  log('ATRI 主题插件安装器  ·  ' + PKG)
  log('')
  log('用法：')
  log('  npx ' + PKG + ' install     安装主题（复制进 profile + 注册 cordis.patch.yml）')
  log('  npx ' + PKG + ' patch       启用「UI 界面设置」+「侧栏加宽 15px」（核心补丁）')
  log('  npx ' + PKG + ' uninstall   从 cordis.patch.yml 移除 ui-atri 注册')
  log('  npx ' + PKG + ' help        显示本帮助')
  log('')
  log('profile 根目录：' + dshHome() + '（可用环境变量 DSH_HOME 覆盖）')
}

async function main() {
  const cmd = process.argv[2] || 'help'

  if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    help()
    return
  }

  if (cmd === 'install') {
    log('ATRI 主题插件 · 安装')
    log('')
    if (!existsSync(webProfile())) {
      log('[warn] 未找到 web profile：' + webProfile())
      log('       请先运行一次 dsh web 生成 profile，或用 DSH_HOME 指定正确根目录。')
    }
    const { target, copied } = copyPackage()
    log('[ok] 已复制插件（' + copied + ' 项）到：')
    log('     ' + target)
    const r = patchYaml('install')
    if (r.status === 'already-registered') {
      log('[skip] cordis.patch.yml 已注册 ui-atri，无需重复添加')
    } else {
      log('[ok] 已在 cordis.patch.yml 注册 ui-atri')
    }
    log('')
    log('接下来：重启 dsh web，然后浏览器 Ctrl+Shift+R 强制刷新即可看到主题。')
    log('（可选）启用「UI 界面设置」+「侧栏加宽 15px」：npx ' + PKG + ' patch')
    return
  }

  if (cmd === 'patch') {
    log('ATRI 主题插件 · 核心补丁（设置白名单 + 侧栏加宽 15px）')
    log('')
    const mod = await import(pathToFileURL(join(pkgRoot, 'setup-npx.mjs')).href)
    mod.runCorePatch()
    return
  }

  if (cmd === 'uninstall') {
    log('ATRI 主题插件 · 卸载（仅移除注册，保留目录）')
    log('')
    const r = patchYaml('uninstall')
    if (r.status === 'not-registered') {
      log('[skip] cordis.patch.yml 里没有 ui-atri 注册')
    } else {
      log('[ok] 已从 cordis.patch.yml 移除 ui-atri 注册')
      log('     ' + r.yamlPath)
    }
    log('')
    log('目录本身未删除（安全）。如需彻底清除可手动删除：')
    log('  ' + join(webProfile(), 'node_modules', '@dkthree', 'dsh-client-ui-atri'))
    return
  }

  fail('未知命令：' + cmd + '（可用：install / patch / uninstall / help）')
}

main().catch((e) => fail(e && e.stack ? e.stack : String(e)))

#!/usr/bin/env node
// Packed-package UI verification ONLY: never point this runner at a user profile.
// Boots an owned, disposable non-Desktop DSH Web profile from the given tarball,
// drives a local Chrome through CDP, and asserts that switching the bundle off
// and back on mounts the Client sidebar entry and main panel again.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(join(repo, 'package.json'), 'utf8'))
const reportBasename = process.env.DSH_TEST_REPORT_BASENAME || `browser-hot-reenable-${manifest.version}`
assert.ok(/^[a-z0-9][a-z0-9._-]{0,100}$/.test(reportBasename) && !reportBasename.includes('..'), 'Evidence basename must not contain a path')
const cli = process.env.DSH_TEST_CLI || 'dsh'
const chromePath = process.env.DSH_TEST_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const tarball = resolve(process.argv[2] || join(repo, `skillre-dsh-plugin-skills-manager-${manifest.version}.tgz`))
assert.ok(tarball.endsWith('.tgz'), 'Supply the built tarball, not a source directory')
const tarballSha256 = createHash('sha256').update(await readFile(tarball)).digest('hex')
await access(tarball, constants.R_OK)
await access(chromePath, constants.X_OK)

const base = await realpath(tmpdir())
const owned = await mkdtemp(join(base, 'dsh-skills-manager-browser-'))
const owner = `browser-${manifest.version}-${process.pid}-${Date.now()}`
const home = join(owned, 'home')
const work = join(owned, 'work')
const chromeData = join(owned, 'chrome')
const store = join(owned, 'pnpm-store')
const cache = join(owned, 'npm-cache')
const profile = `skills-manager-browser-${owner.slice(-8)}`
assert.notEqual(profile, 'desktop')
const env = { ...process.env, DSH_HOME: home, DSH_AGENTS_HOME: join(home, 'agents'), DSH_TELEMETRY_DISABLED: '1', npm_config_cache: cache, npm_config_store_dir: store }
const checks = []
const children = []
let failure
let cleanupError
let cleanupVerified = false
let hostUrl = ''
let consoleErrors = []
const strip = text => String(text).replace(/\u001b\[[0-9;]*m/g, '').replace(/([?&]token=)[^\s"'<]+/g, '$1[redacted]')
const cleanup = { ownedRoot: owned, owner, profile, userProfileTouched: false, processesStopped: false, rootRemoved: false }

function track(child, label) {
  const record = { child, label, stopped: false }
  children.push(record)
  return record
}
function startProcess(label, command, args, options = {}) {
  const child = spawn(command, args, { cwd: work, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'], ...options })
  const record = track(child, label)
  record.output = ''
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', chunk => { record.output += chunk })
  child.stderr.on('data', chunk => { record.output += chunk })
  return record
}
async function stopProcess(record) {
  if (record.child.exitCode !== null || record.child.signalCode !== null) { record.stopped = true; return }
  try { process.kill(process.platform === 'win32' ? record.child.pid : -record.child.pid, 'SIGTERM') } catch (error) { if (error.code !== 'ESRCH') throw error }
  const deadline = Date.now() + 10000
  while (Date.now() < deadline && record.child.exitCode === null && record.child.signalCode === null) await delay(100)
  if (record.child.exitCode === null && record.child.signalCode === null) {
    try { process.kill(process.platform === 'win32' ? record.child.pid : -record.child.pid, 'SIGKILL') } catch (error) { if (error.code !== 'ESRCH') throw error }
    await delay(500)
  }
  record.stopped = true
}
async function groupAbsent(record) {
  if (record.child.pid === undefined) return false
  try { process.kill(process.platform === 'win32' ? record.child.pid : -record.child.pid, 0); return false } catch (error) { if (error.code === 'ESRCH') return true; throw error }
}
function run(label, command, args, timeoutMs = 300000) {
  const record = startProcess(label, command, args)
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => { reject(new Error(`${label} timed out after ${timeoutMs} ms`)) }, timeoutMs)
    record.child.once('error', error => { clearTimeout(timer); reject(error) })
    record.child.once('exit', code => {
      clearTimeout(timer)
      record.stopped = true
      if (code === 0) resolvePromise(record.output)
      else reject(new Error(`${label} exited ${code}:\n${strip(record.output).slice(-2000)}`))
    })
  })
}
async function cdpConnect(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl)
  await new Promise((resolvePromise, reject) => {
    ws.onopen = resolvePromise
    ws.onerror = () => reject(new Error(`cannot connect to the browser debugger at ${webSocketUrl}`))
  })
  let id = 0
  const pending = new Map()
  const events = []
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id !== undefined && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); return }
    events.push(message)
  }
  const send = (method, params = {}) => {
    const messageId = ++id
    return new Promise((resolvePromise, reject) => {
      pending.set(messageId, message => message.error !== undefined ? reject(new Error(`${method}: ${message.error.message}`)) : resolvePromise(message.result))
      ws.send(JSON.stringify({ id: messageId, method, params }))
    })
  }
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails !== undefined) throw new Error(`page evaluation failed: ${result.exceptionDetails.text}`)
    return result.result?.value
  }
  return { ws, send, evaluate, events }
}
async function waitFor(check, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await check()
    if (value) return value
    await delay(250)
  }
  throw new Error(`timed out waiting for ${label}`)
}
async function readPortFile(file, timeoutMs) {
  return waitFor(async () => {
    try {
      const text = await readFile(file, 'utf8')
      const [port] = text.trim().split('\n')
      return Number(port) > 0 ? Number(port) : undefined
    } catch { return undefined }
  }, timeoutMs, file)
}
async function pageTarget(port, host) {
  return waitFor(async () => {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
      return targets.find(target => target.type === 'page' && target.url.includes(host))
    } catch { return undefined }
  }, 60000, 'browser page target')
}
const localized = (zh, en) => `(function(){const labels=${JSON.stringify([zh, en])};return labels;})()`

try {
  await mkdir(home, { recursive: true })
  await mkdir(work, { recursive: true })
  await writeFile(join(owned, '.owned-by-skills-manager'), owner, { flag: 'wx', mode: 0o600 })
  await run('create-profile', cli, ['--profile', profile, '--from-default-profile', 'web', '--dump-config'])
  checks.push('profile-created')
  await run('install-tarball', cli, ['plugin', '--profile', profile, 'add', tarball, '--ignore-scripts', '--store-dir', store], 300000)
  checks.push('profile-tarball-install')
  const dump = await run('dump-config', cli, ['--profile', profile, '--dump-config'])
  assert.ok(dump.includes(manifest.name), 'installed profile dump must contain the bundle')
  checks.push('dump-config')

  let host
  try {
    host = startProcess('host', cli, ['--profile', profile, '--port', '0', '--no-open'])
    hostUrl = await waitFor(() => {
      const match = host.output.match(/http:\/\/127\.0\.0\.1:\d+\/\?token=[^\s]+/)
      return match?.[0]
    }, 90000, 'web host URL')
    checks.push('bounded-host-startup')
    const hostPort = new URL(hostUrl).port
    const hostAuthority = `127.0.0.1:${hostPort}`

    let chrome
    try {
      chrome = startProcess('chrome', chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--remote-debugging-port=0', `--user-data-dir=${chromeData}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', hostUrl])
      const debuggingPort = await readPortFile(join(chromeData, 'DevToolsActivePort'), 60000)
      checks.push('browser-launched')
      const target = await pageTarget(debuggingPort, hostAuthority)
      const cdp = await cdpConnect(target.webSocketDebuggerUrl)
      try {
        await cdp.send('Runtime.enable')
        await cdp.send('Log.enable')
        await cdp.send('Page.enable')
        const evaluate = cdp.evaluate
        const sidebarLabels = ['技能', 'Skills']
        const bundleLabels = ['技能管理', 'Skills Manager']
        const sidebar = () => evaluate(`JSON.stringify([...document.querySelectorAll('button')].map(button => button.getAttribute('aria-label') || '').filter(label => ${JSON.stringify(sidebarLabels)}.includes(label)))`)
        const click = (expression) => evaluate(`(() => { const element = ${expression}; if (!element) return false; element.click(); return true })()`)
        const openPluginManager = () => click(`[...document.querySelectorAll('button')].find(button => ['插件', 'Plugins'].includes(button.getAttribute('aria-label') || '') || ['插件', 'Plugins'].includes(button.textContent.trim()))`)
        const openBundle = () => click(`[...document.querySelectorAll('button')].find(button => ${JSON.stringify(bundleLabels)}.includes(button.textContent.trim()))`)
        const bundleSwitch = () => evaluate(`(() => { const switches = [...document.querySelectorAll('[role=switch]')]; if (switches.length === 0) return null; const first = switches[0]; return JSON.stringify({ checked: first.getAttribute('aria-checked'), disabled: first.disabled }) })()`)
        const clickBundleSwitch = () => click(`(() => { const switches = [...document.querySelectorAll('[role=switch]')]; return switches.length ? switches[0] : null })()`)

        const bootSidebar = JSON.parse(await waitFor(async () => {
          const value = await sidebar()
          return value.includes('技能') || value.includes('Skills') ? value : undefined
        }, 60000, 'Client boot sidebar entry'))
        assert.ok(bootSidebar.length > 0, 'the Client boot graph must mount the sidebar entry')
        checks.push('web-ui-boot')

        assert.equal(await openPluginManager(), true, 'Plugins sidebar navigation must exist')
        await waitFor(async () => { const switches = await bundleSwitch(); return switches !== null }, 30000, 'Plugins page')
        await waitFor(async () => bundleSwitch().then(value => value !== null), 30000, 'Plugins page switches')
        await waitFor(async () => (await evaluate(`document.body.innerText`)).includes(bundleLabels[0]) || (await evaluate(`document.body.innerText`)).includes(bundleLabels[1]), 30000, 'installed bundle list')
        assert.equal(await openBundle(), true, 'the bundle card must open')
        await waitFor(async () => { const value = await bundleSwitch(); return value !== null && JSON.parse(value).disabled === false }, 30000, 'bundle detail switch')

        for (const cycle of [1, 2]) {
          await clickBundleSwitch()
          await waitFor(async () => { const value = JSON.parse(await bundleSwitch()); return value.checked === 'false' && value.disabled === false }, 30000, `bundle switched off (cycle ${cycle})`)
          await waitFor(async () => { const value = await sidebar(); return !value.includes('技能') && !value.includes('Skills') ? true : undefined }, 30000, `sidebar entry removed (cycle ${cycle})`)
          checks.push(`web-ui-hot-disable-${cycle}`)
          await clickBundleSwitch()
          await waitFor(async () => { const value = JSON.parse(await bundleSwitch()); return value.checked === 'true' && value.disabled === false }, 30000, `bundle switched on (cycle ${cycle})`)
          await waitFor(async () => { const value = await sidebar(); return value.includes('技能') || value.includes('Skills') ? true : undefined }, 45000, `sidebar entry restored (cycle ${cycle})`)
          checks.push(`web-ui-hot-enable-${cycle}`)
        }
        checks.push('web-ui-hot-reenable')

        const sidebarEntry = await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(button => ['技能', 'Skills'].includes(button.getAttribute('aria-label') || '')); return button ? true : false })()`)
        assert.equal(sidebarEntry, true, 'the restored sidebar entry must be clickable')
        await click(`[...document.querySelectorAll('button')].find(button => ['技能', 'Skills'].includes(button.getAttribute('aria-label') || ''))`)
        const panelText = await waitFor(async () => {
          const text = await evaluate(`document.body.innerText`)
          return text.includes(bundleLabels[0]) || text.includes(bundleLabels[1]) ? text : undefined
        }, 30000, 'restored main panel')
        assert.ok(panelText.length > 0)
        checks.push('web-ui-panel-opens')

        await delay(1000)
        consoleErrors = cdp.events
          .filter(event => event.method === 'Runtime.exceptionThrown' || (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error') || (event.method === 'Log.entryAdded' && event.params.entry.level === 'error'))
          .map(event => event.method === 'Runtime.exceptionThrown'
            ? strip(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text)
            : strip(event.method === 'Log.entryAdded' ? event.params.entry.text : `console.error: ${event.params.args?.map(argument => argument.value ?? argument.description).join(' ')}`))
        assert.deepEqual(consoleErrors, [], `browser errors must be empty: ${consoleErrors.join('\n')}`)
        checks.push('web-ui-console-clean')
      } finally {
        cdp.ws.close()
      }
    } finally {
      if (chrome) await stopProcess(chrome)
    }
  } finally {
    if (host) await stopProcess(host)
  }

  assert.equal(await realpath(owned), owned, 'owned root must not have moved')
  assert.equal(createHash('sha256').update(await readFile(tarball)).digest('hex'), tarballSha256, 'the verified tarball changed during the test')
  checks.push('tarball-unchanged')
} catch (error) {
  failure = error
} finally {
  for (const record of children) { try { await stopProcess(record) } catch (error) { cleanupError ??= error } }
  try {
    for (const record of children) if (record.child.pid !== undefined && !(await groupAbsent(record))) throw new Error(`${record.label} process group is still present`)
    cleanup.processesStopped = true
    const marker = await readFile(join(owned, '.owned-by-skills-manager'), 'utf8')
    if (marker !== owner) throw new Error('owned marker changed before removal')
    if (process.env.DSH_TEST_KEEP !== '1') {
      await rm(owned, { recursive: true, force: true })
      cleanup.rootRemoved = true
      try { await access(owned); throw new Error('owned root still exists after cleanup') } catch (error) { if (error.code !== 'ENOENT') throw error }
    }
    cleanupVerified = cleanup.rootRemoved
  } catch (error) { cleanupError = error }
}

if (cleanupVerified) checks.push('owned-processes-stopped', 'owned-process-and-profile-cleanup')
else if (cleanupError !== undefined) failure = new AggregateError([failure, cleanupError].filter(Boolean), 'Browser verification cleanup could not be verified')
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
const dshVersion = spawnSync(cli, ['--version'], { encoding: 'utf8' }).stdout?.trim() || ''
const report = {
  schemaVersion: 1,
  package: manifest.name,
  version: manifest.version,
  dsh: dshVersion,
  verifiedAt: date,
  result: failure ? 'failed' : 'passed',
  checks,
  cleanupVerified,
  cleanup,
  consoleErrors,
  tarball,
  tarballSha256,
  ...(failure ? { error: strip(failure.stack ?? failure.message) } : {}),
}
const reportDir = join(repo, 'docs/verification')
await mkdir(reportDir, { recursive: true })
await writeFile(join(reportDir, `${reportBasename}.json`), `${JSON.stringify(report, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
if (failure) { process.stderr.write(`${strip(failure.stack ?? failure.message)}\n`); process.exitCode = 1 }

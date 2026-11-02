#!/usr/bin/env node
// Packed-package verification ONLY. Never point this runner at a user profile.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import { access, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(join(repo, 'package.json'), 'utf8'))
const reportBasename = process.env.DSH_TEST_REPORT_BASENAME || `isolated-mount-${manifest.version}`
assert.ok(/^[a-z0-9][a-z0-9._-]{0,100}$/.test(reportBasename) && !reportBasename.includes('..'), 'Evidence basename must not contain a path')
const snapshot = JSON.parse(await readFile(new URL('../../../toolchain.json', import.meta.url), 'utf8'))
const cli = process.env.DSH_TEST_CLI || 'dsh'
const tarball = resolve(process.argv[2] || join(repo, `skillre-dsh-plugin-skills-manager-${manifest.version}.tgz`))
assert.ok(isAbsolute(tarball) && /\.tgz$/.test(tarball), 'Supply the built tarball, not a source directory')
const tarballInfo = await lstat(tarball)
assert.ok(tarballInfo.isFile() && !tarballInfo.isSymbolicLink(), 'Supply a regular packed tarball, not a link')
const tarballSha256 = createHash('sha256').update(await readFile(tarball)).digest('hex')
const base = await realpath(tmpdir())
const owned = await mkdtemp(join(base, 'dsh-skills-manager-mount-'))
const owner = randomUUID()
const home = join(owned, 'home')
const work = join(owned, 'work')
const profile = `skills-manager-test-${owner.slice(0, 8)}`
assert.notEqual(profile, 'desktop')
const env = { ...process.env, DSH_HOME: home, DSH_AGENTS_HOME: join(home, 'agents'), DSH_PROFILE: profile, DSH_PROFILE_DIR: join(home, 'profiles', profile), DSH_TELEMETRY_DISABLED: '1', npm_config_cache: join(owned, 'npm-cache'), npm_config_store_dir: join(owned, 'pnpm-store') }
const children = []
const checks = []
const gatewayChecks = []
let failure
let cleanupVerified = false
let runtimeVersion = ''
let output = ''
let clientResource
let installedPackage
let packedPayload
const cleanup = { ownedRoot: owned, owner, profile, userProfileTouched: false, processesStopped: false, rootRemoved: false }
const strip = text => text.replace(/\u001b\[[0-9;]*m/g, '').replace(/([?&]token=)[^\s"'<]+/g, '$1[redacted]')
function containsPath(parent, target) {
  if (!isAbsolute(target)) return false
  const path = relative(parent, target)
  return !isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`)
}
async function packedFiles(root, prefix = '') {
  const files = []
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const file = prefix ? `${prefix}/${entry.name}` : entry.name
    const target = join(root, file)
    const info = await lstat(target)
    assert.ok(!info.isSymbolicLink(), 'Packed payload must not contain symlinks')
    const canonical = await realpath(target)
    assert.equal(canonical, resolve(target), 'Packed payload must remain canonical')
    assert.ok(containsPath(root, canonical), 'Packed payload escaped its installed package')
    if (info.isDirectory()) files.push(...await packedFiles(root, file))
    else { assert.ok(info.isFile(), 'Packed payload must contain only regular files'); files.push(file) }
  }
  return files.sort()
}
function groupAlive(child) {
  assert.ok(child.pid > 1 && child.pid !== process.pid, 'Only inspect the recorded owned process group')
  // Probe only AFTER close. EPERM is uncertainty, never proof of absence.
  try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, 0); return true } catch (error) { if (error.code === 'ESRCH') return false; throw error }
}
function persistProcesses() {
  return writeFile(join(owned, '.test-processes.json'), JSON.stringify(children.map(item => ({ pid: item.child.pid ?? null, args: item.args, stopped: item.stopped, result: item.result, signals: item.signals })), null, 2))
}
async function signalOwned(record, signal) {
  assert.equal(await realpath(owned), resolve(owned), 'Owned root must not have moved')
  assert.equal(await readFile(join(owned, '.owned-by-skills-manager'), 'utf8'), owner)
  const inventory = JSON.parse(await readFile(join(owned, '.test-processes.json'), 'utf8'))
  assert.ok(inventory.some(item => item.pid === record.child.pid && JSON.stringify(item.args) === JSON.stringify(record.args)), 'Signal target must match the owned PID record')
  const child = record.child
  if (child.exitCode !== null || child.signalCode !== null) return
  // ChildProcess holds the unreaped, directly spawned child. Do not signal a
  // negative PGID while it is live: that probe can be denied in a CLI sandbox.
  const sent = child.kill(signal)
  record.signals.push({ signal, sent })
}
function stop(record) {
  if (record.stopped) return Promise.resolve()
  if (record.stopPromise) return record.stopPromise // Never repeat a denied stop.
  record.stopPromise = (async () => {
    await record.persisted
    const child = record.child
    if (!child.pid) {
      assert.ok(record.spawnError, 'An unknown child cannot count as stopped')
      record.stopped = true // The spawn error proves no OS child was created.
      await persistProcesses()
      return
    }
    assert.ok(child.pid > 1 && child.pid !== process.pid, 'Only stop the recorded owned child')
    if (child.exitCode === null && child.signalCode === null) {
      await signalOwned(record, 'SIGTERM')
      const closed = await Promise.race([record.closed.then(() => true), delay(3000).then(() => false)])
      if (!closed) await signalOwned(record, 'SIGKILL')
    }
    await Promise.race([record.closed, delay(3000).then(() => { throw new Error(`Owned PID ${child.pid} did not close`) })])
    assert.equal(groupAlive(child), false, 'Owned process group must be gone before deleting its profile')
    record.groupAbsent = true
    record.stopped = true
    await persistProcesses()
  })()
  record.stopPromise.catch(error => { record.stopError = error })
  return record.stopPromise
}
function start(args, timeoutMs = 60000) {
  const child = spawn(cli, args, { cwd: work, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] })
  const record = { child, args, stopped: false, text: '', closed: null, result: null, signals: [], timer: null, stopPromise: null }
  record.closed = new Promise((res, rej) => {
    child.once('error', error => { record.spawnError = error; rej(error) })
    child.once('close', (code, signal) => { record.result = { code, signal }; res(record.result) })
  })
  const append = data => { record.text += data.toString(); if (record.text.length > 2 * 1024 * 1024) record.text = record.text.slice(-2 * 1024 * 1024) }
  child.stdout.on('data', append); child.stderr.on('data', append)
  const deadline = new Promise((res, rej) => {
    record.timer = setTimeout(() => {
      rej(new Error(`Owned CLI deadline exceeded (${timeoutMs}ms): ${args.join(' ')}`))
      void stop(record).catch(error => { record.stopError = error })
    }, timeoutMs)
  })
  record.finished = Promise.race([record.closed, deadline])
  record.finished.catch(() => {}) // Startup also has a bounded URL wait.
  record.closed.finally(() => clearTimeout(record.timer)).catch(() => {})
  children.push(record)
  record.persisted = persistProcesses()
  return record
}
async function run(args, timeoutMs = 60000) {
  const record = start(args, timeoutMs)
  await record.persisted
  const result = await record.finished
  await stop(record)
  output += `\n$ dsh ${args.join(' ')}\n${strip(record.text)}`
  assert.equal(result.code, 0, `CLI exited ${result.code}: ${strip(record.text).slice(-6000)}`)
  return record.text
}
async function rpc(origin, cookie, payload, endpoint = 'skillre-skills-manager/execute') {
  const rpcId = randomUUID()
  const response = await fetch(`${origin}/api/${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: cookie, Origin: origin }, body: JSON.stringify({ type: 'client-request', rpcId, method: endpoint, payload }), signal: AbortSignal.timeout(12000) })
  assert.equal(response.status, 200, `${endpoint}: RPC transport HTTP ${response.status}`)
  const envelope = await response.json()
  assert.equal(envelope.type, 'server-response')
  assert.equal(envelope.rpcId, rpcId)
  assert.equal(envelope.result.ok, true, `${endpoint}: ${JSON.stringify(envelope.result.error)}`)
  return envelope.result.value
}
async function authenticatedStartup() {
  const record = start(['--profile', profile, '--port', '0', '--no-open'], 60000)
  await record.persisted
  const tokenUrl = await new Promise((res, rej) => {
    const timeout = setTimeout(() => { finish(); rej(new Error(`No bounded startup URL: ${strip(record.text).slice(-6000)}`)) }, 25000)
    const inspect = () => {
      const text = record.text.replace(/\u001b\[[0-9;]*m/g, '')
      const match = text.match(/http:\/\/(?:127\.0\.0\.1|localhost):\d+\/[^\s"<>]*[?&]token=[^\s"<>]+/)
      if (match) { finish(); res(match[0]) }
    }
    const finish = () => { clearTimeout(timeout); record.child.stdout.off('data', inspect); record.child.stderr.off('data', inspect) }
    record.child.stdout.on('data', inspect); record.child.stderr.on('data', inspect)
    record.closed.then(result => { finish(); rej(new Error(`Startup exited: ${result.code}; ${strip(record.text).slice(-6000)}`)) }).catch(rej)
    inspect()
  })
  const origin = new URL(tokenUrl).origin
  const auth = await fetch(tokenUrl, { redirect: 'manual', signal: AbortSignal.timeout(12000) })
  assert.ok(auth.status === 302 || auth.status === 303, `Owned auth exchange returned HTTP ${auth.status}`)
  const cookie = auth.headers.getSetCookie().map(value => value.split(';', 1)[0]).join('; ')
  assert.ok(cookie)
  await auth.body?.cancel()
  return { record, origin, cookie }
}
async function welcomeApis(origin, cookie, stage) {
  // These no-argument Remote methods require the real Gateway { args: {} }
  // wrapper; the plugin's direct action payload is a different protocol.
  const settings = await rpc(origin, cookie, { args: {} }, 'settings/describe')
  assert.ok(settings !== null && typeof settings === 'object' && !Array.isArray(settings), 'Real Settings describe must return a record')
  assert.ok(Array.isArray(settings.namespaces), 'Real Settings namespaces must be an array (empty is valid)')
  // Settings exposes only volatile Config fields. This plugin has none; neither
  // its namespace nor a nonempty form list is required by Desktop welcome.
  // Bundle uninstall is proved separately by dependency/selection/dump/route.
  const providers = await rpc(origin, cookie, { args: {} }, 'llm/listConfigurableProviders')
  assert.ok(Array.isArray(providers), 'Real configurable provider directory must be an array (empty is valid)')
  gatewayChecks.push({ stage, settingsDescribe: { endpoint: '/api/settings/describe', status: 200, ok: true, namespaceCount: settings.namespaces.length, recordAndNamespaceArrayValid: true }, desktopWelcome: { endpoint: '/api/llm/listConfigurableProviders', status: 200, ok: true, providerCount: providers.length } })
  if (stage === 'with-plugin') checks.push('gateway-settings-describe', 'gateway-llm-list-configurable-providers')
  else if (stage === 'after-plugin-restart') checks.push('gateway-welcome-apis-after-plugin-restart')
  else checks.push('gateway-welcome-apis-after-uninstall')
}
try {
  // Everything after mkdtemp is covered by finally, including setup failure.
  await writeFile(join(owned, '.owned-by-skills-manager'), owner, { flag: 'wx', mode: 0o600 })
  await mkdir(home); await mkdir(work)
  runtimeVersion = (await run(['--version'])).trim()
  assert.equal(runtimeVersion, snapshot.dsh.version, 'Use the CLI matching the currently inspected DSH toolchain')
  await run(['--profile', profile, '--from-default-profile', 'web', '--dump-config'])
  const help = await run(['--profile', profile, '--help'])
  assert.ok(help.includes('--port') && help.includes('--no-open'), 'Verify the real app startup flags before booting')
  await run(['plugin', '--profile', profile, 'add', tarball, '--ignore-scripts', '--store-dir', join(owned, 'pnpm-store')], 180000)
  checks.push('profile-tarball-install')
  const profileDir = join(home, 'profiles', profile)
  const profileManifest = JSON.parse(await readFile(join(profileDir, 'package.json'), 'utf8'))
  assert.ok(Object.hasOwn(profileManifest.dependencies, manifest.name), 'Tarball dependency was not installed')
  assert.ok(profileManifest.dsh.profile.bundles.includes(manifest.name), 'Bundle selection was not saved')
  const dump = await run(['--profile', profile, '--dump-config'])
  assert.ok(dump.includes('skillre-skills-manager') && dump.includes(manifest.name), 'Bundle patch did not compose')
  checks.push('dump-config')
  const require = createRequire(join(profileDir, 'package.json'))
  const installedManifestPath = await realpath(require.resolve(`${manifest.name}/package.json`))
  assert.ok(containsPath(owned, installedManifestPath), 'Package resolution escaped the owned packed installation')
  const installedManifest = JSON.parse(await readFile(installedManifestPath, 'utf8'))
  assert.equal(installedManifest.name, manifest.name, 'Installed tarball package name must match the expected package')
  assert.equal(installedManifest.version, manifest.version, 'Installed tarball version must match the expected version')
  installedPackage = { name: installedManifest.name, version: installedManifest.version, manifestPath: installedManifestPath }
  const resolvePacked = async suffix => {
    const path = await realpath(require.resolve(`${manifest.name}/${suffix}`))
    assert.ok(containsPath(dirname(installedManifestPath), path), 'Packed resource escaped its installed package')
    return path
  }
  checks.push('packed-package-identity')
  // Verify every installed packed file against the frozen checkout, not only
  // name/version or a few hand-picked runtime files. Metadata-bearing final
  // verification must run after the final pack without concurrent rebuilds.
  packedPayload = []
  const installedFiles = await packedFiles(dirname(installedManifestPath))
  for (const required of ['package.json', 'lib/index.js', 'lib/transport.js', 'lib/client.js', 'compatibility.json', 'README.md', 'README.en.md', 'UNINSTALL.md', 'cordis.patch.yml', 'locale/en.json', 'locale/zh.json', 'icon.svg', 'LICENSE']) assert.ok(installedFiles.includes(required), `Required packed file missing: ${required}`)
  for (const file of installedFiles) {
    const path = await realpath(join(dirname(installedManifestPath), file))
    assert.ok(containsPath(dirname(installedManifestPath), path), 'Packed payload escaped its installed package')
    const installedBytes = await readFile(path)
    assert.deepEqual(installedBytes, await readFile(join(repo, file)), `Installed packed bytes differ: ${file}`)
    packedPayload.push({ path: file, bytes: installedBytes.length, sha256: createHash('sha256').update(installedBytes).digest('hex') })
  }
  checks.push('packed-payload-bytes', 'full-packed-payload-bytes')
  const localePath = await resolvePacked('locale/en.json')
  const zhPath = await resolvePacked('locale/zh.json')
  assert.equal(JSON.parse(await readFile(localePath, 'utf8')).meta.title, 'Skills Manager')
  assert.equal(JSON.parse(await readFile(zhPath, 'utf8')).meta.title, '技能管理')
  const iconPath = await resolvePacked('icon')
  assert.ok((await lstat(iconPath)).size <= 262144)
  assert.ok((await readFile(iconPath, 'utf8')).includes('Skills Manager'))
  checks.push('packed-display-resources')
  const fixture = join(home, 'agents/skills/test-local')
  const fixtureText = '---\nname: test-local\ndescription: Owned integration-test fixture\n---\n\nThis is test data, not a user skill.\n'
  await mkdir(fixture, { recursive: true })
  await writeFile(join(fixture, 'SKILL.md'), fixtureText)
  const { record, origin, cookie } = await authenticatedStartup()
  const unauthenticated = await fetch(`${origin}/api/skillre-skills-manager/execute`, { method: 'POST', headers: { 'content-type': 'application/json', Origin: origin }, body: JSON.stringify({ type: 'client-request', rpcId: randomUUID(), method: 'skillre-skills-manager/execute', payload: { action: 'list' } }), signal: AbortSignal.timeout(12000) })
  assert.equal(unauthenticated.status, 401, 'The real carrier must require authentication before exact-route dispatch')
  await unauthenticated.body?.cancel()
  checks.push('unauthenticated-request-refused')
  await welcomeApis(origin, cookie, 'with-plugin')
  assert.equal(record.text.includes('already has an interceptor'), false, 'Plugin activation must not take Gateway ownership')
  const list = await rpc(origin, cookie, { action: 'list' })
  const skill = list.skills.find(item => item.name === 'test-local' && item.rootId === 'user-agents')
  assert.ok(skill, 'The running plugin did not discover the owned skill fixture')
  for (const root of list.roots.filter(root => root.writable)) assert.ok(containsPath(home, root.path), 'A test mutation root escaped the owned home')
  assert.equal(list.roots.find(root => root.id === skill.rootId)?.path, join(home, 'agents/skills'))
  assert.equal(skill.entry, 'test-local')
  assert.equal(skill.path, join(fixture, 'SKILL.md'), 'Only mutate the exact owned fixture')
  assert.equal(skill.format, 'directory')
  const detail = await rpc(origin, cookie, { action: 'detail', id: skill.id })
  assert.equal(detail.skill.path, skill.path)
  assert.equal(detail.skill.rootId, skill.rootId)
  assert.match(detail.fingerprint, /^[0-9a-f]{64}$/)
  const checksResult = await rpc(origin, cookie, { action: 'check', id: skill.id })
  assert.equal(checksResult[0].status, 'untracked')
  const removal = await rpc(origin, cookie, { action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint })
  assert.ok(removal.backupId)
  await assert.rejects(access(fixture), error => error.code === 'ENOENT', 'Removal must change the owned filesystem')
  assert.equal((await rpc(origin, cookie, { action: 'list' })).skills.some(item => item.id === skill.id), false)
  await rpc(origin, cookie, { action: 'restore', rootId: skill.rootId, backupId: removal.backupId })
  assert.ok((await rpc(origin, cookie, { action: 'list' })).skills.some(item => item.id === skill.id))
  assert.equal(await readFile(join(fixture, 'SKILL.md'), 'utf8'), fixtureText)
  assert.equal((await rpc(origin, cookie, { action: 'detail', id: skill.id })).fingerprint, detail.fingerprint)
  checks.push('authenticated-rpc-lifecycle', 'bounded-startup')
  const indexResponse = await fetch(`${origin}/`, { headers: { Cookie: cookie }, signal: AbortSignal.timeout(12000) })
  assert.equal(indexResponse.status, 200, 'The owned DSH index was unavailable')
  const indexHtml = await indexResponse.text()
  const references = Array.from(indexHtml.matchAll(/["'](\/?plugins\/[^"'<>\s]+)["']/g), match => match[1].replaceAll('&amp;', '&').replaceAll('\\u0026', '&'))
  const resourceReference = references.find(reference => reference.includes(manifest.name) && reference.includes('rev='))
  assert.ok(resourceReference, 'The real DSH startup graph did not advertise this Client bundle')
  const resourceUrl = new URL(resourceReference, `${origin}/`)
  assert.equal(resourceUrl.origin, origin, 'Client resource must remain on the owned test carrier')
  assert.ok(resourceUrl.searchParams.get('rev'), 'Client delivery must use the DSH-advertised revision')
  const browserBundle = await fetch(resourceUrl, { signal: AbortSignal.timeout(12000) })
  assert.equal(browserBundle.status, 200, 'The real DSH carrier did not serve its advertised Client artifact')
  const browserCode = await browserBundle.text()
  const packedClient = await readFile(await resolvePacked('client'), 'utf8')
  assert.ok(packedClient.trim().length > 0, 'The packed Client artifact must not be empty')
  assert.ok(browserCode.includes(packedClient), 'Delivered revision must contain the installed packed Client artifact')
  assert.ok(browserCode.includes('window.__ModuleLoader__.load') && browserCode.includes('skillre-skills-manager'))
  clientResource = { path: resourceUrl.pathname + resourceUrl.search, rev: resourceUrl.searchParams.get('rev'), status: browserBundle.status, sha256: createHash('sha256').update(browserCode).digest('hex'), packedClientSha256: createHash('sha256').update(packedClient).digest('hex'), containsPackedClient: true }
  checks.push('client-bundle-delivery') // Not a browser/Electron visual pass.
  await stop(record)
  output += `\n$ bounded startup\n${strip(record.text)}`
  const restarted = await authenticatedStartup()
  await welcomeApis(restarted.origin, restarted.cookie, 'after-plugin-restart')
  assert.ok((await rpc(restarted.origin, restarted.cookie, { action: 'list' })).skills.some(item => item.id === skill.id), 'Owned restored fixture must survive packed-plugin restart')
  assert.equal((await rpc(restarted.origin, restarted.cookie, { action: 'detail', id: skill.id })).fingerprint, detail.fingerprint, 'Restarted packed plugin must preserve the restored fixture fingerprint')
  checks.push('packed-plugin-restart')
  await stop(restarted.record)
  output += `\n$ bounded startup with installed plugin after restart\n${strip(restarted.record.text)}`
  await run(['plugin', '--profile', profile, 'remove', manifest.name, '--config.ignore-scripts=true', `--config.store-dir=${join(owned, 'pnpm-store')}`], 180000)
  const after = JSON.parse(await readFile(join(profileDir, 'package.json'), 'utf8'))
  assert.equal(Object.hasOwn(after.dependencies ?? {}, manifest.name), false)
  assert.equal(after.dsh.profile.bundles.includes(manifest.name), false)
  await assert.rejects(access(join(profileDir, 'node_modules', manifest.name)), error => error.code === 'ENOENT')
  const afterDump = await run(['--profile', profile, '--dump-config'])
  assert.equal(afterDump.includes('skillre-skills-manager'), false)
  checks.push('profile-uninstall-absence')
  const afterStartup = await authenticatedStartup()
  await welcomeApis(afterStartup.origin, afterStartup.cookie, 'after-uninstall')
  const removedRoute = await fetch(`${afterStartup.origin}/api/skillre-skills-manager/execute`, { method: 'POST', headers: { 'content-type': 'application/json', Cookie: afterStartup.cookie, Origin: afterStartup.origin }, body: JSON.stringify({ type: 'client-request', rpcId: randomUUID(), method: 'skillre-skills-manager/execute', payload: { action: 'list' } }), signal: AbortSignal.timeout(12000) })
  assert.equal(removedRoute.status, 404, 'The removed plugin route must not remain mounted')
  await removedRoute.body?.cancel()
  checks.push('uninstalled-plugin-route-absent')
  await stop(afterStartup.record)
  output += `\n$ bounded startup after uninstall\n${strip(afterStartup.record.text)}`
} catch (error) { failure = error }
finally {
  try {
    const stopErrors = []
    for (const record of children) { try { await stop(record) } catch (error) { stopErrors.push(error) } }
    if (stopErrors.length) throw new AggregateError(stopErrors, 'An owned process stop could not be verified')
    cleanup.processesStopped = true
    const canonical = await realpath(owned)
    assert.equal(canonical, resolve(owned))
    assert.equal(dirname(canonical), base, 'Only delete the direct owned temporary root')
    assert.ok(canonical.startsWith(join(base, 'dsh-skills-manager-mount-')))
    assert.equal(await readFile(join(owned, '.owned-by-skills-manager'), 'utf8'), owner)
    const info = await lstat(owned)
    assert.ok(info.isDirectory() && !info.isSymbolicLink())
    if (process.getuid) assert.equal(info.uid, process.getuid(), 'Temporary root must belong to this OS user')
    await rm(canonical, { recursive: true, force: true })
    await assert.rejects(access(canonical), error => error.code === 'ENOENT')
    cleanup.rootRemoved = true
    cleanupVerified = true
    checks.push('owned-process-and-profile-cleanup')
  } catch (error) { failure = new AggregateError([failure, error].filter(Boolean), `Cleanup could not be verified; preserve owned test root ${owned}`) }
  let finalSha256
  try {
    finalSha256 = createHash('sha256').update(await readFile(tarball)).digest('hex')
    assert.equal(finalSha256, tarballSha256, 'The verified tarball changed during the test')
    checks.push('tarball-unchanged')
  } catch (error) { failure = new AggregateError([failure, error].filter(Boolean), 'Exact artifact verification failed') }
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
  const describeError = error => ({ message: strip(String(error?.message ?? error)), ...(error?.code ? { code: String(error.code) } : {}), ...(error?.errors ? { causes: error.errors.map(describeError) } : {}), ...(error?.cause ? { cause: describeError(error.cause) } : {}) })
  const processes = children.map(record => ({ pid: record.child.pid ?? null, args: record.args, stopped: record.stopped, closed: record.result, signals: record.signals, groupAbsent: record.groupAbsent ?? null, ...(record.stopError ? { stopError: describeError(record.stopError) } : {}) }))
  const report = { schemaVersion: 1, package: manifest.name, version: manifest.version, ...(installedPackage ? { installedPackage } : {}), ...(packedPayload ? { packedPayload } : {}), gatewayChecks, dsh: runtimeVersion, verifiedAt: date, result: failure ? 'failed' : 'passed', checks, cleanupVerified, cleanup, processes, tarball, tarballSha256: finalSha256 ?? tarballSha256, tarballSha256AtStart: tarballSha256, ...(clientResource ? { clientResource } : {}), ui: 'not-verified-user-deferred', ...(failure ? { error: describeError(failure) } : {}) }
  const reportDir = join(repo, 'docs/verification')
  try {
    await mkdir(reportDir, { recursive: true })
    // JSON is written last; a log-write failure cannot create a new pass report.
    await writeFile(join(reportDir, `${reportBasename}.log`), strip(output + children.map(record => `\n$ observed dsh ${(record.args ?? []).join(' ')}\n${record.text}`).join('')))
    await writeFile(join(reportDir, `${reportBasename}.json`), `${JSON.stringify(report, null, 2)}\n`)
  } catch (error) {
    failure = new AggregateError([failure, error].filter(Boolean), 'Verification evidence could not be persisted')
    report.result = 'failed'
    report.error = describeError(failure)
  } finally {
    // This path also runs when evidence persistence fails. It bounds the runner
    // without pretending an uncertain process exited: retain its root and PIDs.
    try {
      if (!cleanupVerified) process.stderr.write(`Unverified owned cleanup: ${JSON.stringify({ cleanup, processes })}\n`)
    } finally {
      for (const record of children) {
        clearTimeout(record.timer)
        if (!cleanupVerified) { record.child.stdout?.destroy(); record.child.stderr?.destroy(); record.child.unref() }
      }
    }
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}
if (failure) { process.stderr.write(`${failure.stack ?? failure}\n`); process.exitCode = 1 }

import { describe, expect, it } from 'vitest'
import { SkillsManager } from '../src/manager.js'
import { resolveConfig } from '../src/config.js'
import { GitHubSource } from '../src/github.js'
import { SkillsManagerError } from '../src/errors.js'
import type { Catalog, MutationResult, RepositoryInfo, SkillDetail } from '../src/types.js'
import { fakeGitHub, fixture } from './helpers.js'

describe('cancellation, recovery priority and stale checks', () => {
  for (const trigger of ['deadline', 'caller', 'dispose'] as const) {
    for (const recovery of [false, true]) {
      it(`${trigger} preserves ${recovery ? 'recovery-required' : 'ordinary cancellation'} semantics`, async () => {
        const config = resolveConfig({ operationTimeoutMs: 1000 })
        const remote = fakeGitHub()
        const source = new GitHubSource(config, remote.fetcher)
        let began!: () => void
        const started = new Promise<void>(resolve => { began = resolve })
        let clearCount = 0
        source.clear = () => { clearCount++ }
        source.search = async (_query, _limit, signal) => {
          began()
          return new Promise((_resolve, reject) => {
            const stop = () => reject(new SkillsManagerError(recovery ? 'recovery-required' : 'network', 'Controlled signal result'))
            if (signal.aborted) stop()
            else signal.addEventListener('abort', stop, { once: true })
          })
        }
        const manager = new SkillsManager(config, {}, source)
        const caller = new AbortController()
        const task = manager.execute({ action: 'search', query: 'fixture' }, caller.signal).catch(error => error as SkillsManagerError)
        await started
        let stop: Promise<void> | undefined
        if (trigger === 'caller') caller.abort()
        if (trigger === 'dispose') stop = manager.dispose()
        const error = await task as SkillsManagerError
        expect(error.code).toBe(recovery ? 'recovery-required' : trigger === 'deadline' ? 'timeout' : 'cancelled')
        if (stop) await stop
        else await manager.dispose()
        expect(clearCount).toBe(1)
        await expect(manager.execute({ action: 'list' })).rejects.toMatchObject({ code: 'unloaded' })
      })
    }
  }
  it('does not refill an old source check after removal and reinstall', async () => {
    const f = await fixture()
    try {
      const repo = await f.manager.execute({ action: 'inspect', source: 'test/skills' }) as RepositoryInfo
      const request = { action: 'install', rootId: 'user-agents', source: repo.repository, commit: repo.commit, skillPath: 'demo/SKILL.md' }
      await f.manager.execute(request)
      const skill = (await f.manager.execute({ action: 'list' }) as Catalog).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      const original = f.source.tree.bind(f.source)
      let release!: () => void
      let began!: () => void
      const hold = new Promise<void>(resolve => { release = resolve })
      const started = new Promise<void>(resolve => { began = resolve })
      f.source.tree = async (...args) => { began(); await hold; return original(...args) }
      const checking = f.manager.execute({ action: 'check' }).catch(error => error as SkillsManagerError)
      await started
      await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint }) as MutationResult
      release()
      expect((await checking as SkillsManagerError).code).toBe('stale')
      expect((await f.manager.execute({ action: 'list' }) as Catalog).skills).toEqual([])
      await f.manager.execute(request)
      const reinstalled = (await f.manager.execute({ action: 'list' }) as Catalog).skills[0]!
      expect(reinstalled.check?.status).toBe('latest')
    } finally { await f.cleanup() }
  })
})

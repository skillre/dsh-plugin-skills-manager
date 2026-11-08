import { describe, expect, it } from 'vitest'
import { parseRequest, resolveConfig } from '../src/config.js'
import { safeEntry, safeRelativePath } from '../src/fs-store.js'
import { parseRef, parseRepository } from '../src/github.js'
import { parseSkill } from '../src/skill-metadata.js'
import { skillText } from './helpers.js'

describe('strict authority and format boundaries', () => {
  it('rejects path traversal, Windows devices and control characters', () => {
    for (const entry of ['../x', '..', '.system', '.skills-manager', 'a/b', 'a\\b', 'CON', 'nul.md', 'file:', 'a\0']) expect(() => safeEntry(entry)).toThrow()
    for (const path of ['../x', '/x', 'a/../x', 'a//b', 'a\\b', 'a/.git/config', 'a/CON.txt']) expect(() => safeRelativePath(path)).toThrow()
    expect(safeRelativePath('references/example.txt')).toBe('references/example.txt')
  })
  it('accepts only public repository roots, not arbitrary URLs or local paths', () => {
    expect(parseRepository('https://github.com/Test/Skills.git')).toBe('test/skills')
    for (const source of ['http://github.com/test/skills', 'https://127.0.0.1/a/b', 'https://github.com/test/skills/tree/main', 'https://user:secret@github.com/test/skills', 'https://github.com/test/skills?q=x', 'git@github.com:test/skills', '../local']) expect(() => parseRepository(source)).toThrow()
    expect(parseRef('release/v1')).toBe('release/v1')
    expect(() => parseRef('bad\nref')).toThrow()
  })
  it('validates required action parameters and rejects authority-granting extras', () => {
    expect(parseRequest({ action: 'list' })).toEqual({ action: 'list' })
    expect(() => parseRequest({ action: 'install', source: 'test/skills', confirmed: true })).toThrow()
    expect(() => parseRequest({ action: 'remove', id: 'x', expectedFingerprint: '0'.repeat(64), approval: true })).toThrow()
    expect(() => parseRequest({ action: 'search', query: '', limit: 51 })).toThrow()
  })
  it('requires absolute roots and integer bounded deployment limits', () => {
    expect(resolveConfig({}).allowMutations).toBe(true)
    expect(() => resolveConfig({ agentsHome: './relative' })).toThrow()
    expect(() => resolveConfig({ checkConcurrency: 1.2 })).toThrow()
    expect(() => resolveConfig({ maxBundleFiles: 0 })).toThrow()
  })
  it('accepts only an environment variable name for the optional GitHub token', () => {
    expect(resolveConfig({}).githubTokenEnv).toBe('')
    expect(resolveConfig({ githubTokenEnv: 'GITHUB_TOKEN' }).githubTokenEnv).toBe('GITHUB_TOKEN')
    // A pasted token value must never be accepted as configuration.
    for (const value of ['ghp_secretvalue', 'github_pat_abc', 'gho_abc', 'glpat-abc', 'A-B', '1TOKEN', 'x'.repeat(65), 'TOKEN=VALUE', 'token value']) expect(() => resolveConfig({ githubTokenEnv: value })).toThrow()
    expect(() => resolveConfig({ githubTokenEnv: 'MY_GITHUB_TOKEN' })).not.toThrow()
  })
  it('parses multiline YAML descriptions and invocation policy while rejecting aliases and duplicate keys', () => {
    expect(parseSkill(skillText())).toMatchObject({ name: 'demo', modelInvocable: true, userInvocable: true })
    expect(parseSkill('---\nname: demo\ndescription: >\n  Multi line\n  description\ndisable-model-invocation: yes\nuser-invocable: off\n---\n')).toMatchObject({ description: 'Multi line description', modelInvocable: false, userInvocable: false })
    expect(() => parseSkill('---\nname: demo\ndescription: &a text\nwhenToUse: *a\n---\n')).toThrow()
    expect(() => parseSkill('---\nname: demo\nname: other\ndescription: text\n---\n')).toThrow()
    expect(() => parseSkill('---\nname: demo\ndescription: text\nuser-invocable: maybe\n---\n')).toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import { chooseRepositorySkill, folderName, installConflict, installStep, suggestEntryName } from '../src/client/choices.js'
import type { Catalog, LocalSkill } from '../src/types.js'

const skills = [
  { name: 'agent-browser', description: 'Browser control', skillPath: 'skills/agent-browser/SKILL.md' },
  { name: 'write-docs', description: 'Documentation', skillPath: 'docs/write-docs/SKILL.md' },
]

function local(overrides: Partial<LocalSkill> & Pick<LocalSkill, 'id' | 'entry' | 'name'>): LocalSkill {
  return { rootId: 'user-agents', description: '', path: `/skills/${overrides.entry}`, format: 'directory', writable: true, valid: true, modelInvocable: true, userInvocable: true, ...overrides }
}
function catalog(skills: LocalSkill[]): Catalog {
  return { roots: [{ id: 'user-agents', label: 'user-agents', path: '/skills', writable: true, source: 'user-agents' }], workspaces: [], skills, warnings: [], truncated: false, mutationsAllowed: true }
}

describe('install flow resolution', () => {
  it('reads the folder segment of a repository SKILL.md path', () => {
    expect(folderName('skills/agent-browser/SKILL.md')).toBe('agent-browser')
    expect(folderName('SKILL.md')).toBe('')
  })

  it('prefers an exact name, then the upstream skill id, then the folder, then a partial match', () => {
    expect(chooseRepositorySkill(skills, { name: 'write-docs' })).toBe(skills[1])
    expect(chooseRepositorySkill(skills, { skillId: 'write-docs' })).toBe(skills[1])
    expect(chooseRepositorySkill(skills, { name: 'agent' })?.name).toBe('agent-browser')
    expect(chooseRepositorySkill([{ name: 'renamed', skillPath: 'skill-data/write-docs/SKILL.md' }], { name: 'write-docs' })).toMatchObject({ name: 'renamed' })
    expect(chooseRepositorySkill(skills, { name: 'nothing-like-it' })).toBeUndefined()
    // A single-skill repository still opens its only review directly.
    expect(chooseRepositorySkill([skills[0]!], { name: 'unrelated' })).toBe(skills[0])
    expect(chooseRepositorySkill([], { name: 'x' })).toBeUndefined()
  })

  it('separates a same-source upgrade, a directory collision and a declared-name collision', () => {
    const installed = local({ id: 'a', entry: 'agent-browser', name: 'agent-browser', source: { kind: 'github', repository: 'vercel-labs/agent-browser', skillPath: 'skills/agent-browser/SKILL.md' } })
    const sameSource = installConflict(catalog([installed]), 'user-agents', 'agent-browser', undefined, { repository: 'vercel-labs/agent-browser', skillPath: 'skills/agent-browser/SKILL.md' })
    expect(sameSource).toMatchObject({ kind: 'same-source', entryOwner: { id: 'a' }, nameOwner: { id: 'a' } })
    const otherSource = installConflict(catalog([installed]), 'user-agents', 'agent-browser', undefined, { repository: 'other/repo', skillPath: 'skills/agent-browser/SKILL.md' })
    expect(otherSource).toMatchObject({ kind: 'other-source', nameOwner: { id: 'a' } })
    // Renaming the directory clears the entry collision but not the declared name.
    expect(installConflict(catalog([installed]), 'user-agents', 'agent-browser', 'agent-browser-other', { repository: 'other/repo', skillPath: 'skills/agent-browser/SKILL.md' })).toMatchObject({ kind: 'other-source', nameOwner: { id: 'a' } })
    // A different declared name may reuse the free entry, and a folder-only collision is renameable.
    const filler = local({ id: 'b', entry: 'notes', name: 'notes' })
    expect(installConflict(catalog([filler]), 'user-agents', 'notes', 'notes-2', { repository: 'x/y', skillPath: 'a/SKILL.md' })).toMatchObject({ kind: 'other-source', nameOwner: { id: 'b' } })
    expect(installConflict(catalog([{ ...filler, name: 'unrelated' }]), 'user-agents', 'notes', 'notes-2', { repository: 'x/y', skillPath: 'a/SKILL.md' })).toMatchObject({ kind: 'none' })
    expect(installConflict(catalog([installed]), 'user-dsh', 'agent-browser', undefined, { repository: 'x/y', skillPath: 'a/SKILL.md' })).toEqual({ kind: 'none' })
    expect(installConflict(null, 'user-agents', 'agent-browser', undefined, { repository: 'x/y', skillPath: 'a/SKILL.md' })).toEqual({ kind: 'none' })
  })

  it('suggests a free directory name derived from the repository', () => {
    const installed = local({ id: 'a', entry: 'agent-browser', name: 'agent-browser' })
    expect(suggestEntryName(null, 'user-agents', 'agent-browser', 'vercel-labs/agent-browser')).toBe('agent-browser')
    expect(suggestEntryName(catalog([installed]), 'user-agents', 'agent-browser', 'vercel-labs/agent-browser')).toBe('agent-browser-agent-browser')
    const taken = [installed, local({ id: 'b', entry: 'agent-browser-agent-browser', name: 'agent-browser' })]
    expect(suggestEntryName(catalog(taken), 'user-agents', 'agent-browser', 'vercel-labs/agent-browser')).toBe('agent-browser-agent-browser-2')
  })

  it('maps dialog state onto the three flow steps', () => {
    expect(installStep({ source: true, repository: false, preview: false })).toBe(0)
    expect(installStep({ source: true, repository: true, preview: false })).toBe(1)
    expect(installStep({ source: true, repository: true, preview: true })).toBe(2)
  })
})

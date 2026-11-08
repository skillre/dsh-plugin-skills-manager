import type { Catalog, LocalSkill } from '../types.js'

/**
 * Pure resolution helpers for the discover-and-install flow. They stay free of
 * React and of the Host bridge so the decisions that used to be buried in the
 * dialog (which repository skill a search hit means, and what to do when the
 * name is already taken locally) are directly testable.
 */

export function folderName(skillPath: string): string {
  const parts = skillPath.split('/').filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 2] ?? '' : ''
}

function normalise(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

/**
 * Pick the repository skill a search hit pointed at. A hit carries both the
 * directory-reported name and, when the directory exposes it, the upstream
 * skill id; either may be the directory name or the SKILL.md name depending on
 * the repository layout, so both are tried before falling back to a partial
 * match and finally to the only skill in the repository.
 */
export function chooseRepositorySkill<T extends { name: string; skillPath: string }>(skills: readonly T[], hints: { name?: string | undefined; skillId?: string | undefined }): T | undefined {
  if (skills.length === 0) return undefined
  const wanted = [normalise(hints.skillId), normalise(hints.name)].filter(value => value.length > 0)
  for (const hint of wanted) {
    const byName = skills.find(skill => normalise(skill.name) === hint)
    if (byName) return byName
  }
  for (const hint of wanted) {
    const byFolder = skills.find(skill => normalise(folderName(skill.skillPath)) === hint)
    if (byFolder) return byFolder
  }
  for (const hint of wanted) {
    const partial = skills.find(skill => normalise(skill.name).includes(hint) || normalise(folderName(skill.skillPath)).includes(hint))
    if (partial) return partial
  }
  return skills.length === 1 ? skills[0] : undefined
}

export type InstallConflictKind = 'none' | 'same-source' | 'other-source'
export interface InstallConflict {
  kind: InstallConflictKind
  /** Local entry whose directory already occupies the target name. */
  entryOwner?: LocalSkill
  /** Local skill that already declares this skill name; DSH would shadow one of them. */
  nameOwner?: LocalSkill
}

/**
 * Decide what installing `name` (optionally into a renamed `entry`) would
 * collide with. A same-source collision is an upgrade the user can run from
 * here; a directory collision can be resolved by renaming; a declared-name
 * collision cannot, because DSH resolves one skill per name.
 */
export function installConflict(catalog: Catalog | null | undefined, rootId: string, name: string, entry: string | undefined, source: { repository: string; skillPath: string }): InstallConflict {
  if (!catalog || !rootId) return { kind: 'none' }
  const wantedEntry = normalise(entry ?? name)
  const wantedName = normalise(name)
  const scoped = catalog.skills.filter(skill => skill.rootId === rootId)
  const entryOwner = scoped.find(skill => normalise(skill.entry) === wantedEntry)
  const nameOwner = scoped.find(skill => normalise(skill.name) === wantedName)
  const sameSource = (skill: LocalSkill | undefined): boolean => !!skill && skill.source?.repository === source.repository && skill.source?.skillPath === source.skillPath
  const kind: InstallConflictKind = sameSource(entryOwner) || sameSource(nameOwner) ? 'same-source' : entryOwner || nameOwner ? 'other-source' : 'none'
  return { kind, ...(entryOwner ? { entryOwner } : {}), ...(nameOwner ? { nameOwner } : {}) }
}

/** First directory name that is safe and free in the target location. */
export function suggestEntryName(catalog: Catalog | null | undefined, rootId: string, name: string, repository: string): string {
  const taken = new Set((catalog?.skills ?? []).filter(skill => skill.rootId === rootId).map(skill => skill.entry.toLowerCase()))
  if (!taken.has(normalise(name))) return name
  const suffix = (repository.split('/')[1] ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  const base = `${normalise(name)}${suffix ? `-${suffix}` : ''}`.replace(/^-+|-+$/g, '') || `${normalise(name)}-2`
  if (!taken.has(base)) return base
  for (let index = 2; index < 100; index++) {
    const candidate = `${base}-${index}`
    if (!taken.has(candidate)) return candidate
  }
  return base
}

/** Locale-independent step index for the install flow; 0-based. */
export function installStep(state: { source: boolean; repository: boolean; preview: boolean }): number {
  if (state.preview) return 2
  if (state.repository) return 1
  return 0
}

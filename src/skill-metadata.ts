import { parseDocument } from 'yaml'
import { fail } from './errors.js'

export interface SkillMetadata {
  name: string
  description: string
  modelInvocable: boolean
  userInvocable: boolean
}
export const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
function booleanField(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number' && (value === 0 || value === 1)) return value === 1
  if (typeof value === 'string') {
    if (/^(true|yes|on|1)$/i.test(value)) return true
    if (/^(false|no|off|0)$/i.test(value)) return false
  }
  fail('invalid-skill', 'Invalid skill invocation policy in frontmatter.')
}
export function parseSkill(content: string): SkillMetadata {
  const match = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(content)
  if (!match?.[1] || match[1].length > 65536) fail('invalid-skill', 'A skill requires bounded YAML frontmatter with name and description.')
  const document = parseDocument(match[1], { uniqueKeys: true, strict: true })
  if (document.errors.length) fail('invalid-skill', document.errors[0]?.message ?? 'Invalid skill frontmatter.')
  let meta: unknown
  try { meta = document.toJS({ maxAliasCount: 0 }) } catch { fail('invalid-skill', 'YAML aliases are not supported in skill frontmatter.') }
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) fail('invalid-skill', 'Skill frontmatter must be a mapping.')
  const data = meta as Record<string, unknown>
  if (typeof data.name !== 'string' || !SKILL_NAME.test(data.name) || data.name.length > 100) fail('invalid-skill', 'Skill name must be lowercase kebab-case (up to 100 characters).')
  if (typeof data.description !== 'string' || !data.description.trim() || data.description.length > 10000) fail('invalid-skill', 'Skill description must be nonempty text (up to 10,000 characters).')
  return {
    name: data.name,
    description: data.description.trim(),
    modelInvocable: !booleanField(data['disable-model-invocation'], false),
    userInvocable: booleanField(data['user-invocable'], true),
  }
}

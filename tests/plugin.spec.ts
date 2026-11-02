import { Inject } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import * as plugin from '../src/index.js'

describe('@skillre/dsh-plugin-skills-manager', () => {
  it('exports the native Cordis function-plugin contract and real service metadata', () => {
    expect(plugin.name).toBe('skillre-skills-manager')
    expect(plugin.apply).toBeTypeOf('function')
    expect('default' in plugin).toBe(false)
    // Native Cordis object-form injection is a service/intercept map, NOT the
    // historical {required, optional} dialect. Prevent a silent pending mount.
    expect(Inject.resolve(plugin.inject)).toEqual({ connection: null })
  })
})

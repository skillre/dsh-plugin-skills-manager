import { describe, expect, it } from 'vitest'
import { apply } from '../src/client/index.js'
import { LOCALE_NAMESPACE, PANEL_ID } from '../src/types.js'

/**
 * The Client Loader mounts, unmounts and remounts one plugin Fiber when the
 * bundle is switched off and on again. The locale service refuses a duplicate
 * dictionary for one namespace and locale, so the dictionaries must be owned by
 * the Fiber: a leaked registration makes every later activation fail.
 *
 * This fake mirrors the inspected contracts of `slots` and `locale` closely
 * enough to exercise the ownership path of `apply` without a browser.
 */
function createClientHarness() {
  const dictionaries = new Map<string, Map<string, Record<string, string>>>()
  const effects: Array<() => void> = []
  const registrations: Array<{ name: string; id?: string; key?: string; label?: string | (() => string); order?: number }> = []
  const locale = {
    register(namespace: string, localeOrDicts: string | Record<string, Record<string, string>>, dict?: Record<string, string>): () => void {
      const pairs: Array<[string, Record<string, string>]> = typeof localeOrDicts === 'string'
        ? [[localeOrDicts, dict ?? {}]]
        : Object.entries(localeOrDicts)
      let locales = dictionaries.get(namespace)
      if (!locales) { locales = new Map(); dictionaries.set(namespace, locales) }
      for (const [localeId] of pairs) if (locales.has(localeId)) throw new Error(`locale namespace "${namespace}" already has locale "${localeId}"`)
      for (const [localeId, entries] of pairs) locales.set(localeId, entries)
      return () => {
        const owner = dictionaries.get(namespace)
        if (!owner) return
        for (const [localeId, entries] of pairs) if (owner.get(localeId) === entries) owner.delete(localeId)
      }
    },
    bind: () => (key: string) => key,
    getSnapshot: () => ({ active: 'en', revision: 0 }),
    subscribe: () => () => {},
  }
  const slots = {
    inject(_key: string, callback: () => () => void): () => void {
      return callback()
    },
    register(options: { name: string; id?: string; key?: string; label?: string | (() => string); order?: number }): () => void {
      const registration = { name: options.name, ...options.id === undefined ? {} : { id: options.id }, ...options.key === undefined ? {} : { key: options.key }, ...options.label === undefined ? {} : { label: options.label }, ...options.order === undefined ? {} : { order: options.order } }
      registrations.push(registration)
      return () => {
        const index = registrations.indexOf(registration)
        if (index >= 0) registrations.splice(index, 1)
      }
    },
  }
  const ctx = {
    effect(callback: () => unknown): () => void {
      const disposer = callback()
      if (typeof disposer === 'function') effects.push(disposer as () => void)
      return () => {}
    },
    locale,
    slots,
    connection: { rpc: { async call() { return { ok: true, value: undefined } } } },
  }
  const unmount = () => { for (const dispose of effects.splice(0).reverse()) dispose() }
  return { ctx, dictionaries, effects, registrations, unmount }
}

describe('client plugin lifecycle', () => {
  it('owns the locale dictionaries and slot entries for the plugin Fiber', () => {
    const harness = createClientHarness()
    apply(harness.ctx as never)
    expect([...harness.dictionaries.get(LOCALE_NAMESPACE)?.keys() ?? []]).toEqual(['en', 'zh'])
    expect(harness.registrations.map(item => item.name)).toEqual(['settings.section', 'settings.section.icon'])
    // The manager is a Settings section: DSH's sidebar keeps its own entries.
    expect(harness.registrations.map(item => item.id)).toEqual([PANEL_ID, PANEL_ID])
    harness.unmount()
    expect([...harness.dictionaries.get(LOCALE_NAMESPACE)?.keys() ?? []]).toEqual([])
    expect(harness.registrations).toEqual([])
  })

  it('registers one localized Settings section that unmounts with the Fiber', () => {
    const harness = createClientHarness()
    apply(harness.ctx as never)
    const [entry] = harness.registrations
    expect(entry).toMatchObject({ name: 'settings.section', id: PANEL_ID, order: 25 })
    // A thunk keeps the nav label following the active locale without a re-registration.
    expect(typeof entry?.label).toBe('function')
    expect((entry?.label as () => string)()).toBe('nav')
    harness.unmount()
    expect(harness.registrations).toEqual([])
  })

  it('mounts again after an unmount instead of failing on duplicate dictionaries', () => {
    const harness = createClientHarness()
    apply(harness.ctx as never)
    harness.unmount()
    expect(() => apply(harness.ctx as never)).not.toThrow()
    expect([...harness.dictionaries.get(LOCALE_NAMESPACE)?.keys() ?? []].sort()).toEqual(['en', 'zh'])
    expect(harness.registrations.map(item => item.name)).toEqual(['settings.section', 'settings.section.icon'])
    // The manager is a Settings section: DSH's sidebar keeps its own entries.
    expect(harness.registrations.map(item => item.id)).toEqual([PANEL_ID, PANEL_ID])
    harness.unmount()
    expect(() => apply(harness.ctx as never)).not.toThrow()
  })
})

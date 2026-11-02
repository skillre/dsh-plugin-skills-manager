import { randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import type { Fiber } from '@deepseek-ai/cordis'
import { HostConnectionService as ConnectionRegistry, serverResponseSchema } from '@deepseek-ai/dsh-client-connection'
import type { HostConnectionHandle, PeerScope, Principal } from '@deepseek-ai/dsh-client-connection'
import { describe, expect, it, vi } from 'vitest'
import * as plugin from '../src/index.js'
import { createExecuteRoute, EXECUTE_PATH } from '../src/transport.js'
import { ENDPOINT } from '../src/types.js'
import type { Catalog } from '../src/types.js'
import { fixture, writeBundle } from './helpers.js'

const origin = 'http://127.0.0.1:34567'
function request(payload: unknown = { action: 'list' }, init: RequestInit = {}, endpoint = ENDPOINT): Request {
  return new Request(`${origin}/api/${endpoint}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'client-request', rpcId: randomUUID(), method: endpoint, payload }), ...init,
  })
}
async function result(response: Response) {
  expect(response.status).toBe(200)
  // Parse through the real Connection Client response contract, not a local mock.
  return serverResponseSchema.parse(await response.json())
}
async function host(order: 'gateway-first' | 'plugin-first' = 'gateway-first') {
  const f = await fixture()
  const ctx = new Context()
  const fibers: Fiber[] = []
  const gatewayCalls: string[] = []
  try {
    await writeBundle(`${f.skillRoot}/demo`)
    fibers.push(await ctx.plugin({ name: 'test-owned-connection', apply(ctx: Context) {
      // No carrier or credentials are opened here. Only the real exported
      // registry/Peer/Fiber dispatch is exercised; packed tests cover real auth.
      new ConnectionRegistry(ctx, [], {} as ConstructorParameters<typeof ConnectionRegistry>[2])
    } }))
    const connection = ctx.get('connection') as HostConnectionHandle
    const shared = connection.createSharedFetchHandler('/api')
    let pluginFiber!: Fiber
    const mountGateway = async () => {
      const fiber = await ctx.plugin({ name: 'test-gateway-interceptor', inject: ['connection'], apply(ctx: Context) {
        ctx.connection.rpc.intercept('/api', () => true, async endpoint => {
          gatewayCalls.push(endpoint)
          return { ok: true, value: { gateway: endpoint } }
        })
      } })
      fibers.push(fiber)
      return fiber
    }
    const mountPlugin = async () => {
      pluginFiber = await ctx.plugin(plugin, { ...f.config, enableAgentTool: false })
      fibers.push(pluginFiber)
    }
    let gatewayFiber: Fiber
    if (order === 'gateway-first') { gatewayFiber = await mountGateway(); await mountPlugin() }
    else { await mountPlugin(); gatewayFiber = await mountGateway() }
    const manager = ctx.get('skillreSkillsManager')!
    return { f, ctx, connection, shared, manager, pluginFiber, gatewayFiber, gatewayCalls,
      dispatch: (req: Request, peer: PeerScope = connection.browserPeer) => shared.fetch(req, peer),
      async cleanup() { try { for (const fiber of [...fibers].reverse()) await fiber.dispose() } finally { await f.cleanup() } },
    }
  } catch (error) {
    try { for (const fiber of [...fibers].reverse()) await fiber.dispose() } finally { await f.cleanup() }
    throw error
  }
}

describe('real ConnectionRegistry exact Fetch transport', () => {
  for (const order of ['gateway-first', 'plugin-first'] as const) {
    it(`${order}: coexists with the sole Gateway interceptor and withdraws only its route`, async () => {
      const h = await host(order)
      try {
        expect(h.shared.requestBodyMode({ method: 'POST', url: new URL(EXECUTE_PATH, origin) })).toBe('buffered')
        for (const endpoint of ['settings/describe', 'llm/listConfigurableProviders']) {
          expect((await result(await h.dispatch(request({}, {}, endpoint)))).result).toEqual({ ok: true, value: { gateway: endpoint } })
        }
        const list = (await result(await h.dispatch(request()))).result
        expect(list.ok).toBe(true)
        if (!list.ok) throw new Error(list.error.message)
        expect((list.value as Catalog).skills.some(skill => skill.name === 'demo')).toBe(true)
        expect(h.gatewayCalls).not.toContain(ENDPOINT) // Exact route won even when Gateway matched everything.
        const adjacent = `${ENDPOINT}/extra`
        expect((await result(await h.dispatch(request({}, {}, adjacent)))).result).toEqual({ ok: true, value: { gateway: adjacent } })
        const clear = vi.spyOn(h.manager.source, 'clear')
        await h.pluginFiber.dispose()
        await h.pluginFiber.dispose() // Idempotent Fiber cleanup cannot remove someone else's contribution.
        expect(clear).toHaveBeenCalledTimes(1)
        expect(h.ctx.get('skillreSkillsManager')).toBeUndefined()
        await expect(h.manager.execute({ action: 'list' })).rejects.toMatchObject({ code: 'unloaded' })
        expect((await result(await h.dispatch(request()))).result).toEqual({ ok: true, value: { gateway: ENDPOINT } })
        expect((await result(await h.dispatch(request({}, {}, 'settings/describe')))).result).toEqual({ ok: true, value: { gateway: 'settings/describe' } })
      } finally { await h.cleanup() }
    })
  }
  it('keeps its exact route when Gateway alone is unloaded, then remounts cleanly', async () => {
    const h = await host()
    try {
      await h.gatewayFiber.dispose()
      expect((await result(await h.dispatch(request()))).result.ok).toBe(true)
      expect((await h.dispatch(request({}, {}, 'settings/describe'))).status).toBe(404)
      await h.pluginFiber.restart()
      expect((await result(await h.dispatch(request()))).result.ok).toBe(true)
    } finally { await h.cleanup() }
  })
  it('lets the real shared handler reject non-owner Peers before decoding or execution', async () => {
    const h = await host()
    try {
      const guest = h.connection.createPeer({ principal: { kind: 'test-guest' } as unknown as Principal })
      const execute = vi.spyOn(h.manager, 'execute')
      const json = vi.spyOn(Request.prototype, 'json')
      try {
        expect((await h.dispatch(request(), guest)).status).toBe(403)
        expect(execute).not.toHaveBeenCalled()
        expect(json).not.toHaveBeenCalled()
      } finally { json.mockRestore(); await guest.dispose() }
    } finally { await h.cleanup() }
  })
  for (const method of ['GET', 'HEAD', 'PUT', 'DELETE']) {
    it(`does not own ${method} or a neighboring path`, async () => {
      const h = await host()
      try {
        const execute = vi.spyOn(h.manager, 'execute')
        expect((await h.dispatch(new Request(`${origin}${EXECUTE_PATH}`, { method }))).status).toBe(404)
        expect((await createExecuteRoute(h.manager).fetch(new Request(`${origin}/api/not-skills`, { method: 'POST' }))).status).toBe(404)
        expect(execute).not.toHaveBeenCalled()
      } finally { await h.cleanup() }
    })
  }
  for (const [label, body, rpcId] of [
    ['wrong discriminator', { type: 'server-response', rpcId: 'echo-me', method: ENDPOINT, payload: { action: 'list' } }, 'echo-me'],
    ['missing correlation', { type: 'client-request', method: ENDPOINT, payload: { action: 'list' } }, 'invalid-request'],
    ['non-string correlation', { type: 'client-request', rpcId: 12, method: ENDPOINT, payload: { action: 'list' } }, 'invalid-request'],
    ['missing method', { type: 'client-request', rpcId: 'echo-me', payload: { action: 'list' } }, 'echo-me'],
    ['missing payload', { type: 'client-request', rpcId: 'echo-me', method: ENDPOINT }, 'echo-me'],
    ['mismatched method', { type: 'client-request', rpcId: 'echo-me', method: 'settings/describe', payload: { action: 'list' } }, 'echo-me'],
    ['null envelope', null, 'invalid-request'],
    ['array envelope', [], 'invalid-request'],
  ] as const) {
    it(`refuses ${label} without reaching the manager`, async () => {
      const h = await host()
      try {
        const execute = vi.spyOn(h.manager, 'execute')
        const value = await result(await h.dispatch(request(undefined, { body: JSON.stringify(body) })))
        expect(value.rpcId).toBe(rpcId)
        expect(value.result).toMatchObject({ ok: false, error: { code: 'skills-manager/bad-request' } })
        expect(execute).not.toHaveBeenCalled()
        expect(h.gatewayCalls).not.toContain(ENDPOINT)
      } finally { await h.cleanup() }
    })
  }
  it('validates JSON media type, syntax, payload and preserves correlation on success/failure', async () => {
    const h = await host()
    try {
      const execute = vi.spyOn(h.manager, 'execute')
      expect((await h.dispatch(request({}, { headers: { 'content-type': 'text/plain' } }))).status).toBe(415)
      expect((await h.dispatch(request({}, { body: '{' }))).status).toBe(400)
      expect(execute).not.toHaveBeenCalled()
      const req = request({ action: 'list' }, { headers: { 'content-type': 'Application/JSON; charset=utf-8' } })
      const requestEnvelope = await req.clone().json() as { rpcId: string }
      const success = await result(await h.dispatch(req))
      expect(success.rpcId).toBe(requestEnvelope.rpcId)
      expect(success.result.ok).toBe(true)
      const failure = await result(await h.dispatch(request({ action: 'remove' })))
      expect(failure.result).toMatchObject({ ok: false, error: { code: 'skills-manager/invalid-or-failed' } })
    } finally { await h.cleanup() }
  })
  for (const trigger of ['caller', 'fiber'] as const) {
    it(`${trigger} cancellation settles in-flight work without harming Gateway`, async () => {
      const h = await host()
      try {
        let began!: () => void
        const started = new Promise<void>(resolve => { began = resolve })
        let operationSignal!: AbortSignal
        h.manager.source.search = async (_query, _limit, signal) => {
          operationSignal = signal
          began()
          return new Promise((_resolve, reject) => {
            const stop = () => reject(new DOMException('Owned test operation cancelled', 'AbortError'))
            if (signal.aborted) stop()
            else signal.addEventListener('abort', stop, { once: true })
          })
        }
        const caller = new AbortController()
        const pending = h.dispatch(request({ action: 'search', query: 'owned-test' }, { signal: caller.signal }))
        await started
        if (trigger === 'caller') caller.abort()
        else await h.pluginFiber.dispose()
        const cancelled = await result(await pending)
        expect(operationSignal.aborted).toBe(true)
        expect(cancelled.result).toMatchObject({ ok: false, error: { code: 'skills-manager/cancelled' } })
        expect((await result(await h.dispatch(request({}, {}, 'llm/listConfigurableProviders')))).result).toEqual({ ok: true, value: { gateway: 'llm/listConfigurableProviders' } })
      } finally { await h.cleanup() }
    })
  }
  it('does not dispatch a pre-cancelled request', async () => {
    const h = await host()
    try {
      const execute = vi.spyOn(h.manager, 'execute')
      const caller = new AbortController()
      caller.abort()
      expect((await result(await h.dispatch(request({ action: 'list' }, { signal: caller.signal })))).result).toMatchObject({ ok: false, error: { code: 'skills-manager/cancelled' } })
      expect(execute).not.toHaveBeenCalled()
    } finally { await h.cleanup() }
  })
})

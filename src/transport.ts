import { z } from 'zod'
import { errorMessage, SkillsManagerError } from './errors.js'
import { ENDPOINT } from './types.js'
import type { ManagerValue, RpcResult } from './types.js'

export const EXECUTE_PATH = `/api/${ENDPOINT}`

// Only the structural Fetch-route face inspected on the current Host is used.
// Gateway exclusively owns the shared RPC interceptor; this plugin must never
// claim it or add a physical server. Connection applies trust/authentication and
// rejects non-owner Peers before calling an exact route, including Desktop's
// shell-owned carrier.
export interface ExecuteRoute {
  readonly path: string
  readonly methods: readonly ['POST']
  readonly requestBody: 'buffered'
  readonly fetch: (request: Request) => Promise<Response>
}
export interface HostConnection {
  readonly fetch: { register(route: ExecuteRoute): () => Promise<void> }
}
interface ExecuteTarget {
  execute(payload: unknown, signal?: AbortSignal): Promise<ManagerValue>
}

// Re-express the inspected JSON unary envelope without a runtime DSH import.
// Connection strips unrelated envelope fields; endpoint payload validation is
// still owned by SkillsManager, not by this transport adapter.
const envelopeSchema = z.object({
  type: z.literal('client-request'),
  rpcId: z.string(),
  method: z.string(),
  payload: z.unknown(),
})
function response(rpcId: string, result: RpcResult<ManagerValue>): Response {
  return Response.json({ type: 'server-response', rpcId, result })
}
function rejected(rpcId: string, code: string, message: string): Response {
  return response(rpcId, { ok: false, error: { code: `skills-manager/${code}`, message, details: {} } })
}
function correlation(body: unknown): string {
  return body !== null && typeof body === 'object' && 'rpcId' in body && typeof body.rpcId === 'string' ? body.rpcId : 'invalid-request'
}

/** Exact buffered POST adapter preserving the existing Client RPC path/result. */
export function createExecuteRoute(manager: ExecuteTarget): ExecuteRoute {
  return {
    path: EXECUTE_PATH,
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch(request) {
      if (request.method !== 'POST' || new URL(request.url).pathname !== EXECUTE_PATH) return new Response('not found', { status: 404 })
      if (request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') return new Response('content type must be application/json', { status: 415 })
      let body: unknown
      try {
        request.signal.throwIfAborted()
        body = await request.json()
      } catch {
        if (request.signal.aborted) return rejected('invalid-request', 'cancelled', 'Skill request was cancelled before dispatch.')
        return new Response('body is not JSON', { status: 400 })
      }
      const parsed = envelopeSchema.safeParse(body)
      if (!parsed.success) return rejected(correlation(body), 'bad-request', 'Invalid client-request message.')
      const message = parsed.data
      if (message.method !== ENDPOINT) return rejected(message.rpcId, 'bad-request', 'RPC method does not match the skills-manager endpoint.')
      try {
        request.signal.throwIfAborted()
        const value = await manager.execute(message.payload, request.signal)
        return response(message.rpcId, { ok: true, value })
      } catch (error) {
        // Manager owns operation/Fiber lifetime and recovery-required priority.
        // Do not turn cancellation into a claim that a mutation did not commit.
        const code = error instanceof SkillsManagerError ? error.code : request.signal.aborted ? 'cancelled' : 'invalid-or-failed'
        return rejected(message.rpcId, code, errorMessage(error).slice(0, 2000))
      }
    },
  }
}

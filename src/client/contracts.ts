import type { Context } from '@deepseek-ai/cordis'
import type { ComponentType, ReactNode } from 'react'
import type { ManagerRequest, RpcResult } from '../types.js'
import { ENDPOINT } from '../types.js'
import type { Translate } from './messages.js'

export interface ClientLocale {
  register(namespace: string, locale: string, dictionary: Record<string, string>): () => void
  bind(namespace: string): Translate
  getSnapshot(): { active: string; revision: number }
  subscribe(listener: () => void): () => void
}
// Host test dependencies augment Context.connection with the Host face. The
// Client half owns a distinct, inspected face in its separate runtime realm.
export interface ClientContext extends Omit<Context, 'connection'> {
  locale: ClientLocale
  slots: {
    inject(key: string, effect: () => (() => void)): () => void
    register<P>(options: { name: string; id?: string; key?: string; order?: number; label?: string | (() => string) }, component: ComponentType<P> | ((props: P) => ReactNode)): () => void
  }
  connection: { rpc: { call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<RpcResult<unknown>> } }
}
export class ActionError extends Error {
  constructor(readonly code: string, message: string) { super(message); this.name = 'ActionError' }
}
export interface ClientApi { call<T>(request: ManagerRequest, signal?: AbortSignal): Promise<T> }
export function createApi(ctx: ClientContext, lifetime: AbortSignal): ClientApi {
  return {
    async call<T>(request: ManagerRequest, signal?: AbortSignal): Promise<T> {
      const result = await ctx.connection.rpc.call('/api', ENDPOINT, request, AbortSignal.any([lifetime, ...(signal ? [signal] : [])]))
      if (!result || typeof result !== 'object' || !('ok' in result)) throw new ActionError('invalid-response', 'The Host returned an invalid skill-manager response.')
      if (!result.ok) throw new ActionError(result.error.code, result.error.message)
      return result.value as T
    },
  }
}

import { z } from 'zod';
import { errorMessage, SkillsManagerError } from './errors.js';
import { ENDPOINT } from './types.js';
export const EXECUTE_PATH = `/api/${ENDPOINT}`;
// Re-express the inspected JSON unary envelope without a runtime DSH import.
// Connection strips unrelated envelope fields; endpoint payload validation is
// still owned by SkillsManager, not by this transport adapter.
const envelopeSchema = z.object({
    type: z.literal('client-request'),
    rpcId: z.string(),
    method: z.string(),
    payload: z.unknown(),
});
function response(rpcId, result) {
    return Response.json({ type: 'server-response', rpcId, result });
}
function rejected(rpcId, code, message) {
    return response(rpcId, { ok: false, error: { code: `skills-manager/${code}`, message, details: {} } });
}
function correlation(body) {
    return body !== null && typeof body === 'object' && 'rpcId' in body && typeof body.rpcId === 'string' ? body.rpcId : 'invalid-request';
}
/** Exact buffered POST adapter preserving the existing Client RPC path/result. */
export function createExecuteRoute(manager) {
    return {
        path: EXECUTE_PATH,
        methods: ['POST'],
        requestBody: 'buffered',
        async fetch(request) {
            if (request.method !== 'POST' || new URL(request.url).pathname !== EXECUTE_PATH)
                return new Response('not found', { status: 404 });
            if (request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json')
                return new Response('content type must be application/json', { status: 415 });
            let body;
            try {
                request.signal.throwIfAborted();
                body = await request.json();
            }
            catch {
                if (request.signal.aborted)
                    return rejected('invalid-request', 'cancelled', 'Skill request was cancelled before dispatch.');
                return new Response('body is not JSON', { status: 400 });
            }
            const parsed = envelopeSchema.safeParse(body);
            if (!parsed.success)
                return rejected(correlation(body), 'bad-request', 'Invalid client-request message.');
            const message = parsed.data;
            if (message.method !== ENDPOINT)
                return rejected(message.rpcId, 'bad-request', 'RPC method does not match the skills-manager endpoint.');
            try {
                request.signal.throwIfAborted();
                const value = await manager.execute(message.payload, request.signal);
                return response(message.rpcId, { ok: true, value });
            }
            catch (error) {
                // Manager owns operation/Fiber lifetime and recovery-required priority.
                // Do not turn cancellation into a claim that a mutation did not commit.
                const code = error instanceof SkillsManagerError ? error.code : request.signal.aborted ? 'cancelled' : 'invalid-or-failed';
                return rejected(message.rpcId, code, errorMessage(error).slice(0, 2000));
            }
        },
    };
}

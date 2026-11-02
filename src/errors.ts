export class SkillsManagerError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
    this.name = 'SkillsManagerError'
  }
}
export function fail(code: string, message: string): never { throw new SkillsManagerError(code, message) }
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) fail('cancelled', 'The operation was cancelled. Refresh the list before retrying a mutation.')
}
export function hasCode(error: unknown, code: string): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === code
}

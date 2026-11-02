import { lstat, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = fileURLToPath(new URL('../lib', import.meta.url))
if (resolve(target) !== join(repo, 'lib')) throw new Error('Refusing an unexpected clean target')
const info = await lstat(target).catch(error => { if (error.code === 'ENOENT') return null; throw error })
if (info?.isSymbolicLink()) throw new Error('Refusing to clean a symlinked build directory')
await rm(target, { recursive: true, force: true })

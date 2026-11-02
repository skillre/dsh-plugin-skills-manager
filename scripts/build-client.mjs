import { build } from 'esbuild'
import { readFile, writeFile } from 'node:fs/promises'
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const result = await build({
  entryPoints: ['src/client/index.tsx'],
  bundle: true,
  write: false,
  format: 'iife',
  globalName: 'SkillreSkillsManagerClient',
  platform: 'browser',
  target: ['es2022'],
  external: ['react'],
  jsx: 'transform',
  loader: { '.css': 'text' },
  minify: false,
  legalComments: 'inline',
})
const output = result.outputFiles[0]?.text
if (!output) throw new Error('Client build emitted no artifact')
const artifact = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(manifest.name)},\n  factory(require) {\n${output}\n    return SkillreSkillsManagerClient;\n  },\n});\n`
await writeFile(new URL('../lib/client.js', import.meta.url), artifact, 'utf8')

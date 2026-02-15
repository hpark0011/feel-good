import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const shared = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  outdir: path.resolve(root, 'dist-electron'),
  logLevel: 'info',
}

await build({
  ...shared,
  entryPoints: [path.resolve(root, 'electron/main.ts')],
  outExtension: { '.js': '.cjs' },
  format: 'cjs',
})

await build({
  ...shared,
  entryPoints: [path.resolve(root, 'electron/preload.ts')],
  outExtension: { '.js': '.cjs' },
  format: 'cjs',
})

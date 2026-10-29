import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { expect, it } from 'vitest'

const runNode = promisify(execFile)

it('preserves standard interpolation in the production Vite bundle', async () => {
  // Vitest loads dependencies directly and cannot detect lost compiler registration.
  // Build with the application config, then execute the emitted JavaScript in Node.
  const outDir = await mkdtemp(join(tmpdir(), 'uranus-i18n-production-test-'))
  try {
    await runNode(process.execPath, ['--input-type=module', '--eval', `
      import { writeFile } from 'node:fs/promises'
      import { join, resolve } from 'node:path'
      import { pathToFileURL } from 'node:url'
      import { build } from 'vite'

      const outDir = process.argv[1]
      await build({
        configFile: resolve('vite.config.ts'),
        logLevel: 'silent',
        define: { 'process.env.NODE_ENV': JSON.stringify('production') },
        build: {
          outDir,
          copyPublicDir: false,
          lib: { entry: resolve('src/i18n/uranus-i18n-index.ts'), formats: ['es'], fileName: 'i18n' },
        },
      })
      const { uranusI18n } = await import(pathToFileURL(join(outDir, 'i18n.js')).href)
      const results = ['de', 'en', 'da'].map(locale => {
        uranusI18n.global.locale.value = locale
        return {
          locale,
          age: uranusI18n.global.t('from_age_sentence', { age: 18 }),
          position: uranusI18n.global.t('one_of_n', { n: 7, m: 13 }),
        }
      })
      await writeFile(join(outDir, 'results.json'), JSON.stringify(results))
    `, outDir], { cwd: resolve(dirname(fileURLToPath(import.meta.url)), '..') })

    expect(JSON.parse(await readFile(join(outDir, 'results.json'), 'utf8'))).toEqual([
      { locale: 'de', age: 'Ab 18 Jahren', position: '7 von 13' },
      { locale: 'en', age: 'From 18 years', position: '7 of 13' },
      { locale: 'da', age: 'Fra 18 år', position: '7 af 13' },
    ])
  } finally {
    await rm(outDir, { recursive: true, force: true })
  }
}, 30_000)

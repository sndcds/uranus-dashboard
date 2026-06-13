import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface CliOptions {
  siteBase: string
  pagesDir: string
  outputFile: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

async function main() {
  const options = parseCliOptions(process.argv.slice(2))
  const pagesDirExists = await directoryExists(options.pagesDir)

  if (!pagesDirExists) {
    process.stderr.write(
      [
        `Share pages directory not found: ${options.pagesDir}`,
        'Run share page generation first, e.g.:',
        'pnpm generate:share-pages -- --api-base=<api> --site-base=<site> --events-file=tools/share/share-events.json',
      ].join('\n') + '\n',
    )
    process.exit(1)
  }

  const htmlFiles = await findHtmlFiles(options.pagesDir)

  if (!htmlFiles.length) {
    throw new Error(`No share pages found under ${options.pagesDir}`)
  }

  const items = await Promise.all(
    htmlFiles.map(async (filePath) => {
      const relativeToPages = path.relative(options.pagesDir, filePath)
      const urlPath = `/${toPosixPath(path.join(path.basename(options.pagesDir), relativeToPages.replace(/\/index\.html$/, '')))}`
      const stats = await fs.stat(filePath)
      return {
        loc: `${options.siteBase}${urlPath}`,
        lastmod: stats.mtime.toISOString(),
      }
    }),
  )

  const xml = renderSitemapXml(items)
  await fs.mkdir(path.dirname(options.outputFile), { recursive: true })
  await fs.writeFile(options.outputFile, xml, 'utf8')

  process.stdout.write(`Generated ${options.outputFile} with ${items.length} URLs.\n`)
}

async function directoryExists(dirPath: string) {
  try {
    const stats = await fs.stat(dirPath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

function parseCliOptions(argv: string[]): CliOptions {
  const args = new Map<string, string>()

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const [key, value] = arg.slice(2).split('=', 2)
    if (key && value) args.set(key, value)
  }

  const siteBase = stripTrailingSlash(args.get('site-base') ?? process.env.SHARE_SITE_BASE ?? '')
  if (!siteBase) {
    throw new Error('Missing site base URL. Use --site-base=https://example.com or set SHARE_SITE_BASE.')
  }

  const pagesDir = path.resolve(projectRoot, args.get('pages-dir') ?? process.env.SHARE_OUT_DIR ?? 'public/share')
  const outputFile = path.resolve(projectRoot, args.get('output-file') ?? process.env.SHARE_SITEMAP_FILE ?? 'public/sitemap-share.xml')

  return {
    siteBase,
    pagesDir,
    outputFile,
  }
}

async function findHtmlFiles(dirPath: string): Promise<string[]> {
  const dirents = await fs.readdir(dirPath, { withFileTypes: true })
  const results: string[] = []

  for (const dirent of dirents) {
    const fullPath = path.join(dirPath, dirent.name)

    if (dirent.isDirectory()) {
      results.push(...await findHtmlFiles(fullPath))
      continue
    }

    if (dirent.isFile() && dirent.name.toLowerCase() === 'index.html') {
      results.push(fullPath)
    }
  }

  return results
}

function renderSitemapXml(items: Array<{ loc: string; lastmod: string }>) {
  const urls = items
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map((item) => `  <url>\n    <loc>${escapeXml(item.loc)}</loc>\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

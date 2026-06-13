import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import type { PublicEventDTO } from '../../src/api/dto/publicEvent.dto.ts'

type LocaleKey = 'de' | 'en' | 'da'

interface EventTarget {
  eventUuid: string
  eventDateUuid: string
  locales?: LocaleKey[]
}

interface ApiResponse<T> {
  status?: number
  data?: T
  message?: string
}

interface CliOptions {
  apiBase: string
  siteBase: string
  eventsFile: string
  outDir: string
  defaultLocales: LocaleKey[]
  twitterSite?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

const DEFAULT_EVENTS_FILE = 'tools/share/share-events.json'
const DEFAULT_OUT_DIR = 'public/share'
const DEFAULT_LOCALES: LocaleKey[] = ['de', 'en', 'da']

async function main() {
  const options = parseCliOptions(process.argv.slice(2))
  const events = await loadEventTargets(options.eventsFile)

  if (!events.length) {
    process.stderr.write(
      [
        `No event targets found in ${options.eventsFile}`,
        'Add at least one entry with eventUuid and eventDateUuid, e.g.:',
        '[{"eventUuid":"...","eventDateUuid":"...","locales":["de","en"]}]',
      ].join('\n') + '\n',
    )
    process.exit(1)
  }

  let generatedCount = 0

  for (const target of events) {
    const locales = target.locales?.length ? target.locales : options.defaultLocales

    for (const locale of locales) {
      const dto = await fetchEventDetails(options.apiBase, target.eventUuid, target.eventDateUuid, locale)
      const html = renderShareHtml({
        dto,
        locale,
        eventUuid: target.eventUuid,
        eventDateUuid: target.eventDateUuid,
        siteBase: options.siteBase,
        twitterSite: options.twitterSite,
      })

      const relativeDir = path.join(locale, 'event', target.eventUuid, 'date', target.eventDateUuid)
      const outputDir = path.join(options.outDir, relativeDir)
      await fs.mkdir(outputDir, { recursive: true })
      await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8')
      generatedCount += 1
      process.stdout.write(`Generated ${path.join(outputDir, 'index.html')}\n`)
    }
  }

  process.stdout.write(`Done. Generated ${generatedCount} share pages.\n`)
}

function parseCliOptions(argv: string[]): CliOptions {
  const args = new Map<string, string>()

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const [key, value] = arg.slice(2).split('=', 2)
    if (key && value) args.set(key, value)
  }

  const apiBase = stripTrailingSlash(
    args.get('api-base')
      ?? process.env.VITE_API_URL
      ?? process.env.SHARE_API_BASE
      ?? ''
  )

  const siteBase = stripTrailingSlash(
    args.get('site-base')
      ?? process.env.SHARE_SITE_BASE
      ?? ''
  )

  if (!apiBase) {
    throw new Error('Missing API base URL. Use --api-base=https://api.example.com or set VITE_API_URL/SHARE_API_BASE.')
  }

  if (!siteBase) {
    throw new Error('Missing site base URL. Use --site-base=https://example.com or set SHARE_SITE_BASE.')
  }

  const eventsFile = path.resolve(
    projectRoot,
    args.get('events-file') ?? process.env.SHARE_EVENTS_FILE ?? DEFAULT_EVENTS_FILE,
  )

  const outDir = path.resolve(
    projectRoot,
    args.get('out-dir') ?? process.env.SHARE_OUT_DIR ?? DEFAULT_OUT_DIR,
  )

  const defaultLocales = parseLocales(
    args.get('locales')
      ?? process.env.SHARE_LOCALES
      ?? DEFAULT_LOCALES.join(','),
  )

  const twitterSite = args.get('twitter-site') ?? process.env.SHARE_TWITTER_SITE

  return {
    apiBase,
    siteBase,
    eventsFile,
    outDir,
    defaultLocales,
    twitterSite,
  }
}

function parseLocales(input: string): LocaleKey[] {
  const locales = input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  const valid: LocaleKey[] = []

  for (const locale of locales) {
    if (locale === 'de' || locale === 'en' || locale === 'da') {
      valid.push(locale)
    }
  }

  return valid.length ? valid : DEFAULT_LOCALES
}

async function loadEventTargets(filePath: string): Promise<EventTarget[]> {
  const content = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(content) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array in ${filePath}`)
  }

  return parsed
    .map((entry): EventTarget | null => {
      if (!entry || typeof entry !== 'object') return null

      const eventUuid = String((entry as Record<string, unknown>).eventUuid ?? '').trim()
      const eventDateUuid = String((entry as Record<string, unknown>).eventDateUuid ?? '').trim()

      if (!eventUuid || !eventDateUuid) return null

      const rawLocales = (entry as Record<string, unknown>).locales
      const locales = Array.isArray(rawLocales)
        ? parseLocales(rawLocales.map((item) => String(item)).join(','))
        : undefined

      return {
        eventUuid,
        eventDateUuid,
        locales,
      }
    })
    .filter((entry): entry is EventTarget => entry !== null)
}

async function fetchEventDetails(
  apiBase: string,
  eventUuid: string,
  eventDateUuid: string,
  locale: LocaleKey,
): Promise<PublicEventDTO> {
  const apiPath = `/api/event/${encodeURIComponent(eventUuid)}/date/${encodeURIComponent(eventDateUuid)}?lang=${locale}`
  const url = `${apiBase}${apiPath}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`)
  }

  const payload = (await response.json()) as ApiResponse<PublicEventDTO>

  if (!payload?.data) {
    throw new Error(`Missing event data for ${eventUuid}/${eventDateUuid} (${locale})`)
  }

  return payload.data
}

function renderShareHtml(input: {
  dto: PublicEventDTO
  locale: LocaleKey
  eventUuid: string
  eventDateUuid: string
  siteBase: string
  twitterSite?: string
}) {
  const { dto, locale, eventUuid, eventDateUuid, siteBase, twitterSite } = input

  const title = buildTitle(dto)
  const description = buildDescription(dto)
  const imageUrl = resolveImageUrl(dto.image?.url ?? null, siteBase)
  const sharePath = `/share/${locale}/event/${eventUuid}/date/${eventDateUuid}`
  const shareUrl = `${siteBase}${sharePath}`
  const spaPath = `/event/${eventUuid}/date/${eventDateUuid}`
  const spaUrl = `${siteBase}${spaPath}`

  const startsAt = joinDateTime(dto.date?.start_date ?? null, dto.date?.start_time ?? null)
  const endsAt = joinDateTime(dto.date?.end_date ?? null, dto.date?.end_time ?? null)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    description,
    startDate: startsAt ?? undefined,
    endDate: endsAt ?? undefined,
    eventAttendanceMode: dto.online_link ? 'https://schema.org/MixedEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: mapSchemaEventStatus(dto.date?.release_status ?? dto.release_status ?? ''),
    image: imageUrl ? [imageUrl] : undefined,
    url: shareUrl,
    location: buildJsonLdLocation(dto),
    organizer: dto.org_name
      ? {
        '@type': 'Organization',
        name: dto.org_name,
        url: normalizeUrl(dto.org_web_link ?? null),
      }
      : undefined,
  }

  const markdownHtml = sanitizeHtml(String(marked.parse(dto.description ?? dto.summary ?? '')))

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttribute(description)}" />
  <link rel="canonical" href="${escapeAttribute(shareUrl)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttribute(title)}" />
  <meta property="og:description" content="${escapeAttribute(description)}" />
  <meta property="og:url" content="${escapeAttribute(shareUrl)}" />
  <meta property="og:site_name" content="Uranus" />
  ${imageUrl ? `<meta property="og:image" content="${escapeAttribute(imageUrl)}" />` : ''}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttribute(title)}" />
  <meta name="twitter:description" content="${escapeAttribute(description)}" />
  ${imageUrl ? `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}" />` : ''}
  ${twitterSite ? `<meta name="twitter:site" content="${escapeAttribute(twitterSite)}" />` : ''}

  <script type="application/ld+json">${escapeJsonForScript(jsonLd)}</script>

  <style>
    :root {
      color-scheme: light;
      --bg: #ffffff;
      --fg: #10111a;
      --muted: #5b6170;
      --card: #f8f9fc;
      --line: #e4e7ee;
      --accent: #2252e4;
      --radius: 12px;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: Mulish, system-ui, -apple-system, Segoe UI, Arial, sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.5;
    }

    .wrap {
      max-width: 980px;
      margin: 0 auto;
      padding: 24px 18px 44px;
      display: grid;
      gap: 20px;
    }

    .hero {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .hero img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 3.2vw, 2.4rem);
      line-height: 1.18;
    }

    h2 {
      margin: 0;
      font-size: clamp(1rem, 2vw, 1.3rem);
      color: var(--muted);
      font-weight: 600;
    }

    .meta,
    .content,
    .cta {
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #fff;
      padding: 18px;
    }

    .meta {
      display: grid;
      gap: 8px;
      color: var(--muted);
    }

    .pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .pill {
      border-radius: 999px;
      background: #eef2ff;
      color: #2c3f8f;
      padding: 4px 10px;
      font-size: 0.85rem;
    }

    .content p:first-child { margin-top: 0; }
    .content p:last-child { margin-bottom: 0; }

    .cta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      border-radius: 10px;
      border: 1px solid var(--accent);
      background: var(--accent);
      color: #fff;
      padding: 10px 14px;
      font-weight: 700;
    }

    .btn.secondary {
      background: transparent;
      color: var(--accent);
    }

    .hint {
      color: var(--muted);
      font-size: 0.88rem;
    }
  </style>
</head>
<body>
  <main class="wrap">
    ${imageUrl ? `<section class="hero"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(dto.image?.alt_text ?? dto.title ?? '')}" /></section>` : ''}

    <section>
      <h1>${escapeHtml(dto.title ?? '')}</h1>
      ${dto.subtitle ? `<h2>${escapeHtml(dto.subtitle)}</h2>` : ''}
    </section>

    <section class="meta">
      ${renderWhen('Date', formatDateRange(dto.date?.start_date, dto.date?.start_time, dto.date?.end_date, dto.date?.end_time, Boolean(dto.date?.all_day)))}
      ${renderWhen('Venue', buildVenueLine(dto))}
      ${renderWhen('Organizer', dto.org_name ?? null)}

      ${renderTypePills(dto)}
    </section>

    ${markdownHtml ? `<section class="content">${markdownHtml}</section>` : ''}

    <section class="cta">
      <a class="btn" href="${escapeAttribute(spaUrl)}">Open full event page</a>
      ${dto.ticket_link ? `<a class="btn secondary" href="${escapeAttribute(normalizeUrl(dto.ticket_link) ?? dto.ticket_link)}" rel="nofollow noopener" target="_blank">Ticket</a>` : ''}
      ${dto.registration_link ? `<a class="btn secondary" href="${escapeAttribute(normalizeUrl(dto.registration_link) ?? dto.registration_link)}" rel="nofollow noopener" target="_blank">Registration</a>` : ''}
      <span class="hint">Static sharing page with social metadata.</span>
    </section>
  </main>
</body>
</html>`
}

function buildTitle(dto: PublicEventDTO) {
  const title = (dto.title ?? '').trim()
  const city = (dto.date?.venue_city ?? '').trim()
  return city ? `${title} - ${city}` : title || 'Event'
}

function buildDescription(dto: PublicEventDTO) {
  const preferred = dto.summary?.trim() || dto.subtitle?.trim() || dto.description?.trim() || 'Event details'
  const text = preferred.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > 240 ? `${text.slice(0, 237)}...` : text
}

function buildVenueLine(dto: PublicEventDTO) {
  const venueName = dto.date?.venue_name?.trim() || ''
  const city = dto.date?.venue_city?.trim() || ''
  const country = dto.date?.venue_country?.trim() || ''
  return [venueName, city, country].filter(Boolean).join(', ') || null
}

function formatDateRange(
  startDate: string | undefined,
  startTime: string | undefined,
  endDate: string | undefined,
  endTime: string | undefined,
  allDay: boolean,
) {
  const start = [startDate, startTime].filter(Boolean).join(' ')
  const end = [endDate, endTime].filter(Boolean).join(' ')

  if (!start && !end) return null
  if (allDay) return `${startDate ?? ''} (all day)`
  if (start && end) return `${start} - ${end}`
  return start || end
}

function renderTypePills(dto: PublicEventDTO) {
  if (!Array.isArray(dto.event_types) || dto.event_types.length === 0) return ''

  const labels = dto.event_types
    .map((item) => [item.type_name, item.genre_name].filter(Boolean).join(' / '))
    .filter(Boolean)

  if (!labels.length) return ''

  return `<div class="pill-list">${labels.map((label) => `<span class="pill">${escapeHtml(label)}</span>`).join('')}</div>`
}

function renderWhen(label: string, value: string | null) {
  if (!value) return ''
  return `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`
}

function resolveImageUrl(value: string | null, siteBase: string) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `${siteBase}${value}`
  return `${siteBase}/${value}`
}

function normalizeUrl(value: string | null) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value.replace(/^\/+/, '')}`
}

function mapSchemaEventStatus(value: string) {
  switch (value) {
    case 'cancelled':
      return 'https://schema.org/EventCancelled'
    case 'deferred':
    case 'rescheduled':
      return 'https://schema.org/EventRescheduled'
    default:
      return 'https://schema.org/EventScheduled'
  }
}

function joinDateTime(dateValue: string | null, timeValue: string | null) {
  if (!dateValue) return null
  return timeValue ? `${dateValue}T${timeValue}` : dateValue
}

function buildJsonLdLocation(dto: PublicEventDTO) {
  const venueName = dto.date?.venue_name ?? undefined
  const street = [dto.date?.venue_street, dto.date?.venue_house_number].filter(Boolean).join(' ')

  if (!venueName && !street && !dto.date?.venue_city && !dto.date?.venue_country) {
    return undefined
  }

  return {
    '@type': 'Place',
    name: venueName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: street || undefined,
      addressLocality: dto.date?.venue_city ?? undefined,
      addressRegion: dto.date?.venue_state ?? undefined,
      postalCode: dto.date?.venue_postal_code ?? undefined,
      addressCountry: dto.date?.venue_country ?? undefined,
    },
  }
}

function sanitizeHtml(input: string) {
  // Minimal hardening for static generated snippets.
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttribute(value: string) {
  return escapeHtml(value)
}

function escapeJsonForScript(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

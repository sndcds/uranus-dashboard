// Run against `pnpm dev --host 127.0.0.1 --port 5176`.
// Uses an existing Playwright installation; no production dependency is needed.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.URANUS_PLAYWRIGHT_MODULE || '@playwright/test')
const origin = process.env.URANUS_TEST_ORIGIN || 'http://127.0.0.1:5176'
const output = process.env.URANUS_SCREENSHOT_DIR || '/tmp/uranus-event-table-screenshots'
await mkdir(output, { recursive: true })
const base = {
  uuid: 'event-1', date_uuid: 'date-1', release_status: 'released', title: 'Gospelkonzert mit Isaac Cates, Kansas (USA)',
  subtitle: 'Musik in der Christkirche', categories: [1, 2, 3, 4], can_edit_event: true, can_delete_event: true,
  can_release_event: true, can_view_event_insights: true, is_online_event: false, org_uuid: 'org-1', org_name: 'Kulturhaus Nord',
  venue_uuid: 'venue-1', venue_name: 'Christkirche', venue_city: 'Rendsburg', image_url: '/assets/event_placeholder.webp',
  start_date: '2026-10-25', start_time: '10:00', series_index: 2, series_total: 3,
  event_types: [{ type_id: 1, genre_id: 1 }, { type_id: 1, genre_id: 2 }, { type_id: 2, genre_id: null }],
  languages: ['de', 'da'], content_language: 'de', description_length: 1284, summary_length: 200,
  image_count: 4, tag_count: 14, link_count: 3, has_registration: true, has_ticket: true,
  ticket_flags: ['advance_ticket'], price_type: 'regular_price', min_price: 10, max_price: 20, currency: 'EUR',
}
const events = [base,
  { ...base, uuid: 'event-2', date_uuid: null, title: '', release_status: 'draft', start_date: null, start_time: null, series_total: 0, categories: [], description_length: 0, summary_length: 0, image_count: 0, image_url: null, has_registration: false, has_ticket: false, ticket_flags: [], price_type: 'not_specified' },
  { ...base, uuid: 'event-3', title: 'Jazz am Hafen', release_status: 'cancelled', categories: [1], description_length: 0 },
  { ...base, uuid: 'event-4', title: 'Fotografie im Stadtmuseum', release_status: 'review', categories: [2, 7], summary_length: 0, price_type: 'free' },
  { ...base, uuid: 'event-5', title: 'Familientag im Park', release_status: 'deferred', categories: [4, 5], image_url: '/broken-event-image.jpg', languages: [], has_registration: false, price_type: 'donation' },
  { ...base, uuid: 'event-6', title: 'Literaturabend – Geschichten aus dem Norden', release_status: 'rescheduled', categories: [1, 6], subtitle: null },
  ...Array.from({ length: 48 }, (_, i) => ({ ...base, uuid: `more-${i}`, date_uuid: `more-date-${i}`, title: `Weitere Veranstaltung ${i + 1}`, categories: [i % 8 + 1] })),
]
const browser = await chromium.launch({ headless: true, ...(process.env.URANUS_BROWSER_EXECUTABLE ? { executablePath: process.env.URANUS_BROWSER_EXECUTABLE } : {}), args: ['--no-sandbox', '--disable-features=LocalNetworkAccessChecks'] })
try {
  for (const width of (process.env.URANUS_VIEWPORTS || '1440,900,390,320').split(',').map(Number)) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } })
    const errors = []
    const requests = []
    page.on('pageerror', error => { errors.push(error.message); console.error('Page error:', error.message) })
    page.on('console', message => { if(message.type() === 'error') console.error('Browser:', message.text()) })
    await page.route('**/__event-table-preview', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Eventübersicht</title><style>body{margin:0}#app{padding:clamp(12px,3vw,40px);max-width:1600px;box-sizing:border-box;margin:auto}</style></head><body><main id="app"></main><script type="module" src="/tests/browser/adminEventTable.preview.ts"></script></body></html>' }))
    await page.route('**/api/**', async route => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      if (!path.startsWith('/api/')) return route.continue()
      requests.push({ url: request.url(), method: request.method() })
      let data = {}
      let metadata = {}
      if (path === '/api/admin/org/org-1/events') { data = events; metadata = { can_add_event: true } }
      else if (path === '/api/admin/org/list') data = { organizations: [] }
      else if (path === '/api/admin/event/event-1') data = { ...base, description: 'Eine ausführliche Beschreibung.', summary: 'Eine kurze Zusammenfassung.', dates: [], event_links: [], tags: [] }
      else if (path.includes('/api/admin/image/')) data = null
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ service: 'uranus', api_version: '1', response_type: 'success', status: 200, timestamp: '', data, metadata }) })
    })
    await page.goto(`${origin}/__event-table-preview`)
    await page.locator('.admin-event-row').first().waitFor()
    await page.getByLabel('Zeitraum', { exact: true }).selectOption('all')
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `${output}/events-${width}.png`, fullPage: false })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`)
    assert.equal(await page.locator('.admin-event-row').count(), 50)
    assert.equal(await page.locator('.admin-event-row').first().locator('.event-metadata').count(), 17)
    assert.equal(requests.filter(r => /\/api\/admin\/event\//.test(r.url)).length, 0, 'N+1 detail requests')
    assert.equal(await page.locator('.admin-event-title-missing').innerText(), 'Kein Titel')
    const contrast = await page.locator('.event-metadata--date.event-metadata--missing').evaluate(el => {
      const style = getComputedStyle(el)
      const ctx = document.createElement('canvas').getContext('2d')
      const luminance = color => {
        ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1)
        const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 })
        return r * .2126 + g * .7152 + b * .0722
      }
      const values = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a)
      return (values[0] + .05) / (values[1] + .05)
    })
    assert(contrast >= 4.5, `Warning contrast ${contrast}`)
    assert(await page.locator('.admin-event-row').nth(1).locator('.event-metadata--date').evaluate(el => el.classList.contains('event-metadata--missing')))
    assert(await page.locator('.admin-event-row').nth(2).locator('.event-release-bar').evaluate(el => el.style.backgroundColor.includes('cancelled')))
    if (width === 900) assert(await page.locator('.admin-event-table-scroll').evaluate(el => el.scrollWidth > el.clientWidth))
    if (width <= 600) {
      assert.equal(await page.locator('.admin-event-row').first().locator('.event-metadata--summary').isVisible(), false)
      await page.locator('.admin-event-mobile-toggle').first().click()
      assert(await page.locator('.admin-event-row').first().locator('.event-metadata--summary').isVisible())
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: `${output}/events-${width}-expanded.png`, fullPage: false })
    }
    const status = page.locator('.admin-event-row').first().locator('.event-release-bar')
    await status.focus()
    await page.getByRole('tooltip').waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('tooltip').count(), 0)
    const legend = page.locator('.event-column-legend summary')
    await legend.focus()
    await page.keyboard.press('Enter')
    assert(await page.locator('.event-column-legend').evaluate(el => el.open))
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Nächste Seite' }).click()
    assert.equal(await page.locator('.admin-event-row').count(), 4)
    await page.getByLabel('Events durchsuchen').fill('Jazz')
    assert.equal(await page.locator('.admin-event-row').count(), 1)
    await page.getByLabel('Events durchsuchen').fill('')
    await page.getByLabel('Release-Status filtern').selectOption('cancelled')
    assert.equal(await page.locator('.admin-event-row').count(), 1)
    await page.getByLabel('Release-Status filtern').selectOption('')
    await page.getByLabel('Sortierung').selectOption('descending')
    assert((await page.locator('.admin-event-row h2').first().innerText()).includes('Weitere Veranstaltung'))
    await page.getByLabel('Sortierung').selectOption('ascending')
    await page.locator('.admin-event-missing-filter summary').click()
    await page.getByRole('checkbox', { name: 'Beschreibung', exact: true }).check()
    assert.equal(await page.locator('.admin-event-row').count(), 2)
    await page.getByRole('checkbox', { name: 'Beschreibung', exact: true }).uncheck()
    if (width <= 600) await page.locator('.admin-event-mobile-toggle').first().click()
    const info = page.locator('.admin-event-row').first().locator('.event-metadata--info button')
    await info.click()
    await page.getByRole('dialog').waitFor()
    const closeInfo = page.getByRole('button', { name: 'Informationen schließen' })
    await closeInfo.focus()
    await page.keyboard.press('Shift+Tab')
    assert(await page.getByRole('button', { name: 'Löschen', exact: true }).evaluate(el => el === document.activeElement))
    await page.keyboard.press('Tab')
    assert(await closeInfo.evaluate(el => el === document.activeElement))
    assert(await page.getByRole('link', { name: 'Vorschau', exact: true }).count() || await page.getByRole('link', { name: 'Preview', exact: true }).count())
    await page.getByRole('button', { name: 'Löschen', exact: true }).click()
    await page.locator('.uranus-modal__overlay input[type=password]').focus()
    await page.keyboard.press('Escape')
    await page.locator('.uranus-modal__overlay').waitFor({ state: 'hidden' })
    assert.equal(await page.getByRole('dialog').count(), 1)
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    const summary = page.locator('.admin-event-row').first().locator('.event-metadata--summary a')
    await summary.focus()
    await page.keyboard.press('Enter')
    await page.waitForURL('**/admin/event/event-1?tab=base&field=event-summary')
    await page.locator('#event-summary [contenteditable=true]').waitFor()
    await page.waitForFunction(() => document.querySelector('#event-summary [contenteditable=true]') === document.activeElement, null, { timeout: 5000 }).catch(async error => { console.error('Focus diagnostic:', await page.evaluate(() => ({ active: document.activeElement?.outerHTML?.slice(0, 250), target: document.querySelector('#event-summary')?.outerHTML?.slice(0, 400), tabs: [...document.querySelectorAll('.uranus-tabs button')].map(el => [el.textContent, el.className]) }))); await page.screenshot({ path: `${output}/editor-focus.png` }); throw error })
    assert.deepEqual(errors, [])
    assert(requests.every(r => r.method === 'GET'), 'Status or metadata interaction mutated data')
    console.log(`PASS ${width}px: all fields, warnings, status, legend, filters, pagination, dialog, editor navigation; ${requests.length} GET requests`)
    await page.close()
  }
} finally { await browser.close() }

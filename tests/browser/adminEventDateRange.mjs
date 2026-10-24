// Run against a local Vite server with an existing Playwright installation.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.URANUS_PLAYWRIGHT_MODULE || '@playwright/test')
const origin = process.env.URANUS_TEST_ORIGIN || 'http://127.0.0.1:5178'
const output = process.env.URANUS_SCREENSHOT_DIR || '/tmp/uranus-event-date-range-screenshots'
await mkdir(output, { recursive: true })
const base = {
  uuid: 'past', date_uuid: 'past-date', title: 'Archivveranstaltung', start_date: '2026-09-30', start_time: '10:00',
  release_status: 'released', org_uuid: 'org-1', can_edit_event: true, can_delete_event: true, can_view_event_insights: true,
  categories: [1], image_url: '/assets/event_placeholder.webp', series_total: 1, series_index: 1,
  description_length: 120, summary_length: 30, image_count: 1, venue_name: 'Kulturhaus', venue_city: 'Rendsburg',
}
const events = [base,
  { ...base, uuid: 'october', date_uuid: 'october-date', title: 'Oktoberkonzert', start_date: '2026-10-01' },
  { ...base, uuid: 'ongoing', date_uuid: 'ongoing-date', title: 'Laufende Ausstellung', start_date: '2026-10-23', end_date: '2026-10-25' },
  { ...base, uuid: 'future', date_uuid: 'future-date', title: 'Novemberkonzert', start_date: '2026-11-01' },
  { ...base, uuid: 'undated', date_uuid: null, title: 'Noch ohne Datum', start_date: null, series_total: 0 },
]
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-features=LocalNetworkAccessChecks'] })
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } })
    await page.clock.install({ time: new Date('2026-10-24T12:00:00') })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') console.error(message.text()) })
    let listUrl = ''
    await page.route('**/__event-table-preview', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="de"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Eventübersicht</title><style>body{margin:0}#app{padding:16px;max-width:1600px;box-sizing:border-box;margin:auto}</style></head><body><main id="app"></main><script type="module" src="/tests/browser/adminEventTable.preview.ts"></script></body></html>' }))
    await page.route('**/api/**', async route => {
      const url = new URL(route.request().url())
      if (!url.pathname.startsWith('/api/')) return route.continue()
      let data = {}
      if (url.pathname === '/api/admin/org/org-1/events') { listUrl = url.href; data = events }
      else if (url.pathname === '/api/admin/org/list') data = { organizations: [] }
      else if (url.pathname === '/api/admin/event/past') data = { ...base, description: 'Beschreibung der Archivveranstaltung.', summary: 'Zusammenfassung.', dates: [], event_links: [], tags: [] }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: 200, data, metadata: { can_add_event: true } }) })
    })
    await page.goto(`${origin}/__event-table-preview`)
    await page.locator('.admin-event-row').first().waitFor().catch(async error => {
      console.error('Preview failed:', await page.locator('body').innerText(), errors)
      throw error
    })
    assert.equal(new URL(listUrl).searchParams.get('include_past'), 'true')
    const mode = page.getByLabel('Zeitraum', { exact: true })
    assert.equal(await mode.inputValue(), 'current')
    assert.equal(await page.locator('.admin-event-row').count(), 2)
    assert.equal(await page.locator('.admin-event-row--past').count(), 0)
    assert.equal(await page.locator('.admin-event-row h2').first().innerText(), 'Laufende Ausstellung')
    await mode.selectOption('all')
    assert.equal(await page.locator('.admin-event-row').count(), 5)
    assert.equal(await page.locator('.admin-event-row--past').count(), 2)
    assert.equal(await page.locator('.admin-event-past-label').first().innerText(), 'Vergangen')
    await mode.selectOption('month')
    await page.getByLabel('Monat', { exact: true }).fill('2026-10')
    assert.equal(await page.locator('.admin-event-row').count(), 2)
    await mode.selectOption('quarter')
    await page.getByLabel('Jahr', { exact: true }).fill('2026')
    await page.getByLabel('Quartal', { exact: true }).selectOption('3')
    assert.equal(await page.locator('.admin-event-row').count(), 1)
    await mode.selectOption('custom')
    await page.getByLabel('Von', { exact: true }).fill('2026-10-24')
    await page.getByLabel('Bis', { exact: true }).fill('2026-10-24')
    assert.equal(await page.locator('.admin-event-row h2').innerText(), 'Laufende Ausstellung')
    await page.getByLabel('Von', { exact: true }).fill('2026-10-25')
    assert.equal(await page.getByRole('alert').count(), 1)
    assert.equal(await page.locator('.admin-event-row').count(), 0)
    await page.getByLabel('Von', { exact: true }).fill('')
    assert.equal(await page.locator('.admin-event-row').count(), 3)
    await mode.selectOption('all')
    assert.equal(await page.locator('.admin-event-row').count(), 5)
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}px`)
    await page.screenshot({ path: `${output}/events-${width}.png` })
    const past = page.locator('.admin-event-row').filter({ hasText: 'Archivveranstaltung' })
    const dismiss = () => page.once('dialog', async dialog => {
      assert.equal(dialog.message(), 'Möchtest du eine vergangene Veranstaltung wirklich bearbeiten?')
      await dialog.dismiss()
    })
    dismiss()
    await past.locator('h2 a').click()
    assert.equal(new URL(page.url()).pathname, '/__event-table-preview')
    if (width <= 600) await past.locator('.admin-event-mobile-toggle').click()
    dismiss()
    await past.locator('.event-metadata--summary a').click()
    assert.equal(new URL(page.url()).pathname, '/__event-table-preview')
    await past.locator('.event-metadata--info button').click()
    await page.getByRole('dialog').waitFor().catch(async error => {
      console.error('Info dialog failed:', await page.locator('body').innerText(), errors)
      throw error
    })
    dismiss()
    await page.locator('.event-info-dialog a[href="/admin/event/past"]').click()
    assert.equal(new URL(page.url()).pathname, '/__event-table-preview')
    await page.getByRole('button', { name: 'Informationen schließen' }).click()
    page.once('dialog', dialog => dialog.accept())
    await past.locator('.event-metadata--summary a').click()
    await page.waitForURL('**/admin/event/past?tab=base&field=event-summary')
    assert.deepEqual(errors, [])
    console.log(`PASS ${width}px: date filters, historical styling, ongoing dates, confirmations and editor destination`)
    await page.close()
  }
} finally { await browser.close() }

import { expect, test } from '../support/test'

test.describe('Public event discovery', () => {
  test('filters calendar events and opens event details', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('event-calendar')).toBeVisible()
    await expect(page.getByTestId('calendar-card-101-1001')).toBeVisible()
    await expect(page.getByTestId('calendar-card-102-1002')).toBeVisible()

    await page.getByText('Suche').click()
    await page.getByTestId('event-filter-city').fill('Flensburg')

    await expect(page.getByTestId('calendar-card-101-1001')).toBeVisible()
    await expect(page.getByTestId('calendar-card-102-1002')).toHaveCount(0)

    await page.getByTestId('event-type-chip-1').click()
    await expect(page.getByTestId('event-type-chip-1')).toHaveClass(/active/)

    await page.getByTestId('calendar-card-101-1001').click()

    await expect(page).toHaveURL(/\/event\/101\/date\/1001$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Jazz Night Flensburg' })).toBeVisible()
    await expect(page.getByText('Doors open 30 minutes before start.')).toBeVisible()
    await expect(page.locator('button.uranus-public-event-detail-link').first()).toBeVisible()
  })

  test('loads venue details and map page', async ({ page }) => {
    await page.goto('/venue/201')

    await expect(page.getByRole('heading', { level: 1, name: 'Kulturwerft' })).toBeVisible()
    await expect(page.getByText('Historic harbour venue for concerts and talks.')).toBeVisible()
    await expect(page.getByText('Main Hall')).toBeVisible()

    await page.goto('/map')
    await expect(page.locator('.map-container')).toBeVisible()
    await expect(page.locator('.maplibregl-canvas')).toBeVisible()
  })
})

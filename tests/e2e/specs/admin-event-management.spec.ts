import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Admin event management', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('creates an event and saves base, dates, price and participation tabs', async ({ page }) => {
    await page.goto('/admin/organization/77/event/create')

    await expect(page.getByTestId('admin-event-create-view')).toBeVisible()
    await page.getByTestId('admin-event-create-title').fill('Playwright Launch Event')
    await page.getByTestId('admin-event-create-submit').click()

    await expect(page).toHaveURL(/\/admin\/event\/\d+$/)
    await expect(page.getByTestId('admin-event-editor')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Playwright Launch Event' })).toBeVisible()

    await page.locator('#event-title').fill('Playwright Launch Event Updated')
    await page.locator('#event-subtitle').fill('Stable E2E coverage')
    await page.getByTestId('admin-event-base-save').click()
    await expect(page.getByRole('heading', { level: 1, name: 'Playwright Launch Event Updated' })).toBeVisible()

    await page.getByTestId('admin-event-tab-dates').click()
    const firstDateCard = page.locator('.event-date').first()
    await firstDateCard.getByLabel('Beginn').fill('2026-05-01')
    await firstDateCard.getByLabel('Zeit').first().fill('18:00')
    await page.getByTestId('admin-event-dates-save').click()

    await page.getByTestId('admin-event-tab-price').click()
    await page.getByTestId('admin-event-price-currency').locator('select').selectOption('EUR')
    await page.getByTestId('admin-event-price-type').selectOption('free')
    await page.getByTestId('admin-event-price-save').click()

    await page.getByTestId('admin-event-tab-participation').click()
    await page.getByTestId('admin-event-participation-max-attendees').fill('250')
    await page.getByTestId('admin-event-participation-min-age').fill('18')
    await page.getByTestId('admin-event-participation-info').fill('Bring your ticket confirmation.')
    await page.getByTestId('admin-event-participation-save').click()

    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'Playwright Launch Event Updated' })).toBeVisible()
    await page.getByTestId('admin-event-tab-participation').click()
    await expect(page.getByTestId('admin-event-participation-max-attendees')).toHaveValue('250')
    await expect(page.getByTestId('admin-event-participation-min-age')).toHaveValue('18')
    await expect(page.getByTestId('admin-event-participation-info')).toHaveValue('Bring your ticket confirmation.')
  })
})

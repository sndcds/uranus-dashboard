import { expect, test } from '../support/test'

test.describe('Public slideshow', () => {
  test('loads event slides and advances to the next event', async ({ page }) => {
    await page.goto('/slideshow')

    await expect(page.getByTestId('event-slideshow-view')).toBeVisible()
    await expect(page.getByTestId('event-slideshow')).toBeVisible()
    await expect(page.getByTestId('event-slide-title')).toContainText('Jazz Night Flensburg')
    await expect(page.getByTestId('event-slide-subtitle')).toContainText('Late session')
    await expect(page.getByTestId('event-slide-meta')).toContainText('Kulturwerft')

    await page.waitForTimeout(7500)

    await expect(page.getByTestId('event-slide-title')).toContainText('Family Workshop Kiel')
    await expect(page.getByTestId('event-slide-subtitle')).toContainText('Hands-on art')
    await expect(page.getByTestId('event-slide-meta')).toContainText('Atelierhaus')
  })
})

import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Editor error paths', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('shows an error when event base save fails', async ({ page }) => {
    await page.goto('/admin/organization/77/event/create')
    await page.getByTestId('admin-event-create-title').fill('Editor Failure Event')
    await page.getByTestId('admin-event-create-submit').click()

    await expect(page.getByTestId('admin-event-editor')).toBeVisible()
    await page.locator('#event-title').fill('Trigger event save error')
    await page.getByTestId('admin-event-base-save').click()

    await expect(page.getByText('Failed to save base tab')).toBeVisible()
    await expect(page.getByTestId('admin-event-tab-content')).toHaveCount(0)
  })

  test('shows an error when venue base save fails', async ({ page }) => {
    await page.goto('/admin/organization/77/venue/201/edit')

    await expect(page.getByTestId('venue-editor-view')).toBeVisible()
    await page.getByTestId('venue-base-name').fill('Trigger venue save error')
    await page.getByTestId('venue-base-save').click()

    await expect(page.getByTestId('venue-editor-error')).toContainText('Failed to save venue details')
    await expect(page.getByTestId('venue-base-tab')).toHaveCount(0)
  })

  test('shows an error when space base save fails', async ({ page }) => {
    await page.goto('/admin/organization/77/venue/201/space/301/edit')

    await expect(page.getByTestId('space-editor-view')).toBeVisible()
    await page.getByTestId('space-base-description').fill('Trigger space save error')
    await page.getByTestId('space-base-save').click()

    await expect(page.getByTestId('space-editor-error')).toContainText('Failed to save space details')
    await expect(page.getByTestId('space-base-tab')).toHaveCount(0)
  })
})

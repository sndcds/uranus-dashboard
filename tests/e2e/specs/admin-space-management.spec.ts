import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Admin space management', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('creates, edits and deletes a space', async ({ page }) => {
    await page.goto('/admin/organization/77/venues')

    await expect(page.getByTestId('admin-venues-view')).toBeVisible()
    await expect(page.getByTestId('venue-card-201')).toBeVisible()

    await page.getByTestId('venue-add-space-201').click()
    await expect(page).toHaveURL(/\/admin\/organization\/77\/venue\/201\/space\/create$/)
    await expect(page.getByTestId('admin-space-create-view')).toBeVisible()

    await page.getByTestId('admin-space-create-name').fill('Black Box')
    await page.getByTestId('admin-space-create-submit').click()

    await expect(page).toHaveURL(/\/admin\/organization\/77\/venue\/201\/space\/450\/edit$/)
    await expect(page.getByTestId('space-editor-view')).toBeVisible()
    await expect(page.getByText('Space: Black Box / #450')).toBeVisible()

    await page.getByTestId('space-base-description').fill('Flexible rehearsal and showcase room.')
    await page.getByTestId('space-base-building-level').fill('1')
    await page.getByTestId('space-base-area-sqm').fill('85')
    await page.getByTestId('space-base-save').click()

    await page.getByRole('button', { name: 'Capacity' }).click()
    await expect(page.getByTestId('space-capacity-tab')).toBeVisible()
    await page.getByTestId('space-capacity-total').fill('120')
    await page.getByTestId('space-capacity-seating').fill('80')
    await page.getByTestId('space-capacity-save').click()

    await page.reload()

    await expect(page.getByTestId('space-base-description')).toHaveValue('Flexible rehearsal and showcase room.')
    await page.getByRole('button', { name: 'Capacity' }).click()
    await expect(page.getByTestId('space-capacity-total')).toHaveValue('120')
    await expect(page.getByTestId('space-capacity-seating')).toHaveValue('80')

    await page.goto('/admin/organization/77/venues')
    await expect(page.getByTestId('space-row-450')).toBeVisible()
    await expect(page.getByTestId('space-name-450')).toContainText('Black Box')

    await page.getByTestId('space-delete-450').click()
    await page.locator('#password').fill('Password123!')
    await page.getByTestId('password-confirm-submit').click()

    await expect(page.getByTestId('space-row-450')).toHaveCount(0)
  })
})

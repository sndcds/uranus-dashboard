import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Admin organization and venue management', () => {
  test.beforeEach(async ({ page }) => {
    await installAuthenticatedState(page)
  })

  test('creates an organization, activates it, and creates a venue for it', async ({ page }) => {
    await page.goto('/admin/organizations')

    await expect(page.getByTestId('admin-organizations-view')).toBeVisible()
    await expect(page.getByTestId('organization-card-77')).toBeVisible()

    await page.getByTestId('admin-organization-create-button').click()
    await expect(page).toHaveURL(/\/admin\/organization\/create$/)
    await expect(page.getByTestId('admin-organization-create-view')).toBeVisible()

    await page.getByTestId('admin-organization-create-name').fill('Nordwind Produktionen')
    await page.getByTestId('admin-organization-create-submit').click()

    await expect(page).toHaveURL(/\/admin\/organization\/120\/edit$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Organization Editor' })).toBeVisible()
    await expect(page.getByText('Organization: Nordwind Produktionen / #120')).toBeVisible()

    await page.goto('/admin/organizations')
    await expect(page.getByTestId('organization-card-120')).toBeVisible()
    await expect(page.getByTestId('organization-card-title-120')).toContainText('Nordwind Produktionen')

    await page.getByTestId('organization-activate-120').click()
    await expect(page.locator('a[href="/admin/organization/120/venues"]')).toBeVisible()
    await page.locator('a[href="/admin/organization/120/venues"]').click()

    await expect(page.getByTestId('admin-venues-view')).toBeVisible()
    await expect(page.getByTestId('admin-venue-create-button')).toBeVisible()

    await page.getByTestId('admin-venue-create-button').click()
    await expect(page).toHaveURL(/\/admin\/organization\/120\/venue\/create$/)
    await expect(page.getByTestId('admin-venue-create-view')).toBeVisible()

    await page.getByTestId('admin-venue-create-name').fill('Nordwind Studio')
    await page.getByTestId('admin-venue-create-submit').click()

    await expect(page).toHaveURL(/\/admin\/organization\/120\/venue\/320\/edit$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Venue Editor' })).toBeVisible()
    await expect(page.getByText('Venue: Nordwind Studio / #320')).toBeVisible()

    await page.locator('a[href="/admin/organization/120/venues"]').click()
    await expect(page.getByTestId('venue-card-320')).toBeVisible()
    await expect(page.getByTestId('venue-card-title-320')).toContainText('Nordwind Studio')
  })
})

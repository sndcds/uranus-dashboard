import { expect, test } from '../support/test'
import { installAuthenticatedState } from '../support/mockApi'

test.describe('Activation flows and static pages', () => {
  test('renders static pages and follows the first-steps link from about', async ({ page }) => {
    await page.goto('/page/about')

    await expect(page.getByTestId('html-page')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /plattform/i })).toBeVisible()

    await page.getByRole('link', { name: /erste schritte/i }).click()
    await expect(page).toHaveURL(/\/page\/first-steps$/)
    await expect(page.getByRole('heading', { level: 1, name: /erste schritte/i })).toBeVisible()

    await page.goto('/page/privacy')
    await expect(page.getByRole('heading', { level: 1, name: /datenschutzerklaerung|datenschutzerklärung/i })).toBeVisible()
  })

  test('activates an account and shows an error for invalid token', async ({ page }) => {
    await page.goto('/app/activate/account?token=activation-token-123')
    await expect(page.getByTestId('account-activate-success')).toBeVisible()
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible()

    await page.goto('/app/activate/account?token=invalid-token')
    await expect(page.getByTestId('account-activate-error')).toBeVisible()
  })

  test('accepts an invite and routes to the organization team page', async ({ page }) => {
    await installAuthenticatedState(page)
    await page.goto('/admin/invite/accept?token=invite-token-123')

    await expect(page.getByTestId('invite-activate-success')).toBeVisible()
    await expect(page.getByTestId('invite-activate-details')).toContainText('Kulturhaus Nord')
    await expect(page.getByTestId('invite-activate-details')).toContainText('Editor')

    await page.getByTestId('invite-activate-go-team').click()
    await expect(page).toHaveURL(/\/admin\/organization\/77\/team$/)
  })
})
